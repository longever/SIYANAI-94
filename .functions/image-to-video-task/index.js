
'use strict';

const cloudbase = require('@cloudbase/node-sdk');

// 阿里云 DashScope 配置
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || '';
const DASHSCOPE_BASE_URL = process.env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/api/v1';
const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV
});
const models = app.models;

/**
 * 将云存储地址转换为临时URL
 * @param {string} cloudPath 云存储路径，如 cloud://env-id/path/to/file
 * @returns {Promise<string>} 临时URL
 */
async function getTempFileURL(cloudPath) {
  if (!cloudPath || !cloudPath.startsWith('cloud://')) {
    // 如果不是云存储地址，直接返回
    return cloudPath;
  }

  try {
    const res = await app.getTempFileURL({
      fileList: [cloudPath]
    });

    if (res.fileList && res.fileList[0] && res.fileList[0].tempFileURL) {
      return res.fileList[0].tempFileURL;
    }

    throw new Error('Failed to get temp file URL');
  } catch (error) {
    console.error('获取临时URL失败:', error);
    throw error;
  }
}

/**
 * 创建任务记录
 */
async function createTaskRecord(taskData) {
  const task = {
    input_assets: {
      imageUrl: taskData.imageUrl,
      audioUrl: taskData.audioUrl,
    },
    model: taskData.model,
    input_text: taskData.prompt || '',
    userId: taskData.userId,
    project_id: taskData.project_id,
    callbackUrl: taskData.callbackUrl || '',
    status: 'CREATED',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    result: null
  };

  console.log('创建任务记录:', task);

  const result = await models.generation_tasks.create({
    data: task
  });

  return result.data;
}

/**
 * 更新任务记录
 */
async function updateTaskRecord(taskId, updateData) {
  const update = {
    ...updateData,
    updatedAt: Date.now()
  };

  console.log('更新任务记录:', { taskId, update });

  const result = await models.generation_tasks.update({
    data: update,
    filter: {
      where: {
        _id: { $eq: taskId }
      }
    }
  });

  return result.data;
}

exports.main = async (event, context) => {

  try {
    // 1. 参数校验
    const { imageUrl, audioUrl, prompt, settings, userId, project_id } = event;
    const { ratio, style } = settings;
    console.log('input', event)
    if (!imageUrl || !audioUrl || !ratio || !style) {
      const errorMessage = 'Missing required fields: audioUrl, imageUrl, ratio, style';

      return {
        success: false,
        errorMessage
      };
    }

    // 2. 将云存储地址转换为临时URL
    let tempImageUrl, tempAudioUrl;
    try {
      tempImageUrl = await getTempFileURL(imageUrl);
      tempAudioUrl = await getTempFileURL(audioUrl);
      console.log('转换后的临时URL:', { tempImageUrl, tempAudioUrl });
    } catch (urlError) {
      const errorMessage = `Failed to convert cloud storage URLs: ${urlError.message}`;

      return {
        success: false,
        errorMessage
      };
    }

    // 3. 创建任务记录
    const model = 'emo-v1';
    const { id: taskId } = await createTaskRecord({
      imageUrl: tempImageUrl,
      audioUrl: tempAudioUrl,
      model,
      prompt,
      userId,
      project_id
    });

    // 4. 调用阿里云 DashScope API
    // 4.1 调用情绪检测 API
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
            "image_url": tempImageUrl
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
      updateTaskRecord(taskId,
        {
          status: 'FAILED',
          error: errorMessage,
          updatedAt: Date.now()
        }
      )

      return {
        success: false,
        errorMessage
      };
    }
    // 4.2 调用视频生成 API
    const { check_pass, humanoid, ext_bbox, face_bbox } = detectResult.output;
    if (!check_pass) {
      throw new Error(`HTTP 图片检查出错`);
    }

    let videoResult;
    try {
      console.log("start to generate video")
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
            "image_url": tempImageUrl,
            "audio_url": tempAudioUrl,
            "face_bbox": face_bbox,
            "ext_bbox": ext_bbox
          },
          parameters: {
            "style_level": style
          }
        })
      });

      if (!videoResponse.ok) {
        throw new Error(`HTTP ${videoResponse.status}: ${videoResponse.statusText}`);
      }

      videoResult = await videoResponse.json();

      console.log("end to generate video", videoResult)
    } catch (videoError) {
      const errorMessage = `Video generation failed: ${videoError.message}`;
      updateTaskRecord(taskId,
        {
          status: 'FAILED',
          error: videoError.message,
          updatedAt: Date.now()
        }
      )

      return {
        success: false,
        errorMessage
      };
    }

    // 5. 处理响应
    if (!videoResult || !videoResult.output || !videoResult.output.task_id) {
      const errorMessage = 'Invalid video generation response format';

      updateTaskRecord(taskId,
        {
          status: 'FAILED',
          error: errorMessage,
          updatedAt: Date.now()
        }
      )

      return {
        success: false,
        errorMessage
      };
    }
c

    // 6. 更新任务状态为 PENDING

    updateTaskRecord(taskId,
      {
        status: 'PENDING',
        external_task_id: external_task_id,
        videoResult: videoResult.output,
        updatedAt: Date.now()
      }
    );

    // 7. 返回成功结果
    return {
      success: true,
      taskId,
      external_task_id,
      videoResult: videoResult.output
    };

  } catch (error) {
    console.error('Function error:', error);

    if (taskId) {
      try {

        updateTaskRecord(taskId,
          {
            status: 'FAILED',
            error: error,
            updatedAt: Date.now()
          }
        )
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
