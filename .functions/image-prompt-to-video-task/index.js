
'use strict';

const cloudbase = require('@cloudbase/node-sdk');

// 初始化云开发环境
const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV
});
const models = app.models;

// 万相API配置
const WANXIANG_CONFIG = {
  apiUrl: process.env.TONGYI_API_URL || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis',
  apiKey: process.env.TONGYI_API_KEY || '' // 从环境变量获取API Key
};

const MODEL = {
  WAN_I2V_FLASH: 'wan2.2-i2v-flash',
  WAN_I2V_PREVIEW: 'wan2.5-i2v-preview'
};

/**
 * 调用万相2.5 preview接口生成视频
 * @param {string} imageUrl - 图片URL
 * @param {string} prompt - 文字描述
 * @param {number} duration - 视频时长(秒)
 * @param {string} resolution - 分辨率
 * @returns {Promise<string>} 任务ID
 */
async function callWanxiangAPI(imageUrl, audioUrl, prompt, duration = 5, resolution = '480P') {
  const model = (audioUrl === '') ? MODEL.WAN_I2V_FLASH : MODEL.WAN_I2V_PREVIEW;
  const input = audioUrl === '' ?
    {
      img_url: imageUrl,
      prompt: prompt
    } :
    {
      img_url: imageUrl,
      audio_url: audioUrl,
      prompt: prompt
    };
  const requestBody = {
    model,
    input,
    parameters: {
      duration: duration,
      resolution: resolution
    }
  };
  console.log(requestBody)

  try {
    const response = await fetch(WANXIANG_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WANXIANG_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`万相API调用失败: ${response.status} ${errorData.message || response.statusText}`);
    }

    const result = await response.json();

    if (!result.output || !result.output.task_id) {
      throw new Error('万相API返回格式异常，未找到task_id');
    }

    return result.output.task_id;
  } catch (error) {
    console.error('调用万相API失败:', error);
    throw error;
  }
}

/**
 * 创建视频任务记录
 * @param {string} taskId - 万相返回的任务ID
 * @param {string} imageUrl - 输入图片URL
 * @param {string} prompt - 输入描述
 * @returns {Promise<Object>} 任务记录
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
/**
 * 验证输入参数
 * @param {Object} params - 输入参数
 * @throws {Error} 参数验证失败
 */
function validateInput(params) {
  const { imageUrl, prompt, duration, resolution, userId } = params;

  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new Error('imageUrl不能为空且必须是字符串');
  }

  if (!prompt || typeof prompt !== 'string') {
    throw new Error('prompt不能为空且必须是字符串');
  }
  if (!userId || typeof userId !== 'string') {
    throw new Error('userId不能为空且必须是字符串');
  }

  if (duration !== undefined) {
    if (typeof duration !== 'number' || duration < 1 || duration > 60) {
      throw new Error('duration必须是1-60之间的数字');
    }
  }

  if (resolution !== undefined) {
    const validResolutions = ['480P', '720P', '1080P'];
    if (!validResolutions.includes(resolution)) {
      throw new Error(`resolution必须是以下之一: ${validResolutions.join(', ')}`);
    }
  }
}

exports.main = async (event, context) => {
  try {
    // 解析请求参数
    const { imageUrl, audioUrl = '', prompt, duration = 5, resolution = '480P', userId } = event;

    // 验证输入参数
    validateInput({ imageUrl, prompt, duration, resolution, userId });

    // 检查API Key配置
    if (!WANXIANG_CONFIG.apiKey) {
      return {
        error: '服务配置错误',
        details: '缺少万相API Key配置，请联系管理员'
      };
    }
    // 创建任务记录
    const { id: taskId } = await createTaskRecord({ imageUrl, audioUrl, prompt, userId });


    // 将云存储地址转换为临时URL
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

    // 调用万相API创建任务
    const videoResponse = await callWanxiangAPI(tempImageUrl, tempAudioUrl, prompt, duration, resolution);
    if (!videoResponse.ok) {
      throw new Error(`HTTP ${videoResponse.status}: ${videoResponse.statusText}`);
    }

    const videoResult = await videoResponse.json(); // { output: { status: 'PENDING', task_id: '0001' } }; // 
    const external_task_id = videoResult.output.task_id;
    // 更新任务状态为PENDING
    updateTaskRecord(taskId,
      {
        status: 'PENDING',
        external_task_id: external_task_id,
        videoResult: videoResult.output,
        updatedAt: Date.now()
      }
    );

    // 返回成功响应
    return {
      success: true,
      taskId,
      external_task_id,
      videoResult: videoResult.output
    };

  } catch (error) {
    console.error('云函数执行错误:', error);

    if (typeof taskId !== undefined) {
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
    // 根据错误类型返回不同的状态码
    if (error.message.includes('参数验证失败') || error.message.includes('不能为空')) {
      return {
        error: '参数错误',
        details: error.message
      };
    }

    if (error.message.includes('万相API')) {
      return {
        error: '视频生成服务异常',
        details: error.message
      };
    }

    if (error.message.includes('数据库')) {
      return {
        error: '数据存储异常',
        details: error.message
      };
    }

    // 默认错误响应
    return {
      error: '内部服务错误',
      details: error.message
    };
  }
};
