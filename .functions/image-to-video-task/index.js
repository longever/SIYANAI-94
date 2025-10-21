
'use strict';

const cloudbase = require('@cloudbase/node-sdk');
const fetch = require('node-fetch');

// 阿里云 DashScope 配置
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || '';
const DASHSCOPE_BASE_URL = process.env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/api/v1';

exports.main = async (event, context) => {
  const app = cloudbase.init({
    env: cloudbase.SYMBOL_CURRENT_ENV
  });
  const models = app.models;

  try {
    // 1. 参数校验
    const { imageUrl, audioUrl, prompt, settings } = event;
    const { ratio, style } = settings;
    const taskId = ''; //使用uuidv4()

    if (!taskId || !imageUrl || !audioUrl || !ratio || !style) {
      const errorMessage = 'Missing required fields: taskId, imageUrl, prompt';

      // 更新任务状态为 FAILED
      await models['generation_tasks'].update({
        filter: {
          where: {
            taskId: { $eq: taskId }
          }
        },
        data: {
          status: 'FAILED',
          error: errorMessage,
          updatedAt: Date.now()
        }
      });

      return {
        success: false,
        errorMessage
      };
    }

    // 2. 调用阿里云 DashScope API

    // 2.1 调用情绪检测 API
    let detectResult;
    try {
      const detectResponse = await fetch(`${DASHSCOPE_BASE_URL}/services/aigc/image2video/face-detect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "model": 'emo-detect-v1',
          "input": {
            "image_url": imageUrl
          },
          "parameters": {
            "ratio": ratio
          }
        })
      });

      if (!detectResponse.ok) {
        throw new Error(`HTTP ${detectResponse.status}: ${detectResponse.statusText}`);
      }

      detectResult = await detectResponse.json();
    } catch (detectError) {
      const errorMessage = `Emotion detection failed: ${detectError.message}`;

      // 更新任务状态为 FAILED
      await models['generation_tasks'].update({
        filter: {
          where: {
            taskId: { $eq: taskId }
          }
        },
        data: {
          status: 'FAILED',
          error: errorMessage,
          updatedAt: Date.now()
        }
      });

      return {
        success: false,
        errorMessage
      };
    }

    // 2.2 调用视频生成 API
    const { check_pass, humanoid, ext_bbox, face_bbox } = detectResult.output;
    if (!check_pass) {
      throw new Error(`HTTP 图片检查出错`);
    }
    console.log("go to generate")
    let videoResult;
    try {
      const videoResponse = await fetch(`${DASHSCOPE_BASE_URL}/services/aigc/image2video/video-synthesis`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable'
        },
        body: JSON.stringify({
          model: 'emo-v1',
          input: {
            "image_url": imageUrl,
            "audio_url": audioUrl,
            "face_bbox": face_bbox,
            "ext_bbox": ext_bbox
          },
          parameters: {
            "style_level": style
          }
        })
      });

      console.log("go to generate2", videoResponse)
      if (!videoResponse.ok) {
        throw new Error(`HTTP ${videoResponse.status}: ${videoResponse.statusText}`);
      }

      videoResult = await videoResponse.json();

      console.log("go to generate3", videoResult)
    } catch (videoError) {
      const errorMessage = `Video generation failed: ${videoError.message}`;

      // 更新任务状态为 FAILED
      await models['generation_tasks'].update({
        filter: {
          where: {
            taskId: { $eq: taskId }
          }
        },
        data: {
          status: 'FAILED',
          error: errorMessage,
          updatedAt: Date.now()
        }
      });

      return {
        success: false,
        errorMessage
      };
    }

    // 3. 处理响应
    if (!videoResult || !videoResult.output || !videoResult.output.task_id) {
      const errorMessage = 'Invalid video generation response format';

      // 更新任务状态为 FAILED
      await models['generation_tasks'].update({
        filter: {
          where: {
            taskId: { $eq: taskId }
          }
        },
        data: {
          status: 'FAILED',
          error: errorMessage,
          updatedAt: Date.now()
        }
      });

      return {
        success: false,
        errorMessage
      };
    }

    const requestId = videoResult.output.task_id;

    // 4. 更新任务状态为 SUBMITTED
    await models['generation_tasks'].update({
      filter: {
        where: {
          taskId: { $eq: taskId }
        }
      },
      data: {
        status: 'SUBMITTED',
        requestId: requestId,
        detectResult: detectResult.output,
        updatedAt: Date.now()
      }
    });

    // 5. 返回成功结果
    return {
      success: true,
      requestId,
      detectResult: detectResult.output
    };

  } catch (error) {
    console.error('Function error:', error);

    // 更新任务状态为 FAILED
    if (event.taskId) {
      try {
        await models['generation_tasks'].update({
          filter: {
            where: {
              taskId: { $eq: event.taskId }
            }
          },
          data: {
            status: 'FAILED',
            error: 'Internal server error',
            updatedAt: Date.now()
          }
        });
      } catch (updateError) {
        console.error('Failed to update task status:', updateError);
      }
    }

    return {
      success: false,
      errorMessage: 'Internal server error'
    };
  }
};
