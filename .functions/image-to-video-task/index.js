
'use strict';

const cloudbase = require('@cloudbase/node-sdk');

exports.main = async (event, context) => {
  const app = cloudbase.init({
    env: cloudbase.SYMBOL_CURRENT_ENV
  });
  
  const models = app.models;

  try {
    // 1. 参数校验
    const { taskId, imageUrl, prompt, style, duration } = event;
    
    if (!taskId || !imageUrl || !prompt) {
      const errorMessage = 'Missing required fields: taskId, imageUrl, prompt';
      
      // 更新任务状态为 FAILED
      await models['image-to-video-task'].update({
        filter: {
          where: {
            taskId: { $eq: taskId }
          }
        },
        data: {
          status: 'FAILED',
          error: errorMessage,
          updatedAt: new Date()
        }
      });
      
      return {
        success: false,
        errorMessage
      };
    }

    // 2. 调用资源连接器 aliyun_dashscope_jbn02va 的 api 方法
    const connector = app.connector('aliyun_dashscope_jbn02va');
    
    // 2.1 调用 aliyun_dashscope_emo_detect_v1 方法进行情感检测
    let detectResult;
    try {
      detectResult = await connector.invoke('aliyun_dashscope_emo_detect_v1', {
        image: imageUrl
      });
    } catch (detectError) {
      const errorMessage = `Emotion detection failed: ${detectError.message}`;
      
      // 更新任务状态为 FAILED
      await models['image-to-video-task'].update({
        filter: {
          where: {
            taskId: { $eq: taskId }
          }
        },
        data: {
          status: 'FAILED',
          error: errorMessage,
          updatedAt: new Date()
        }
      });
      
      return {
        success: false,
        errorMessage
      };
    }

    // 2.2 调用 emo_v1 方法进行视频生成
    let videoResult;
    try {
      videoResult = await connector.invoke('emo_v1', {
        image: imageUrl,
        prompt: prompt,
        ...(style && { style }),
        ...(duration && { duration })
      });
    } catch (videoError) {
      const errorMessage = `Video generation failed: ${videoError.message}`;
      
      // 更新任务状态为 FAILED
      await models['image-to-video-task'].update({
        filter: {
          where: {
            taskId: { $eq: taskId }
          }
        },
        data: {
          status: 'FAILED',
          error: errorMessage,
          updatedAt: new Date()
        }
      });
      
      return {
        success: false,
        errorMessage
      };
    }

    // 3. 处理响应
    if (!videoResult || !videoResult.task_id) {
      const errorMessage = 'Invalid video generation response format';
      
      // 更新任务状态为 FAILED
      await models['image-to-video-task'].update({
        filter: {
          where: {
            taskId: { $eq: taskId }
          }
        },
        data: {
          status: 'FAILED',
          error: errorMessage,
          updatedAt: new Date()
        }
      });
      
      return {
        success: false,
        errorMessage
      };
    }

    const requestId = videoResult.task_id;

    // 4. 更新任务状态为 SUBMITTED
    await models['image-to-video-task'].update({
      filter: {
        where: {
          taskId: { $eq: taskId }
        }
      },
      data: {
        status: 'SUBMITTED',
        requestId: requestId,
        detectResult: detectResult,
        updatedAt: new Date()
      }
    });

    // 5. 返回成功结果
    return {
      success: true,
      requestId,
      detectResult
    };

  } catch (error) {
    console.error('Function error:', error);
    
    // 更新任务状态为 FAILED
    if (event.taskId) {
      try {
        await models['image-to-video-task'].update({
          filter: {
            where: {
              taskId: { $eq: event.taskId }
            }
          },
          data: {
            status: 'FAILED',
            error: 'Internal server error',
            updatedAt: new Date()
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
  