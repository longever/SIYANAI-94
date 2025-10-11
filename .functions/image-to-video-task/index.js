
'use strict';

const cloudbase = require('@cloudbase/node-sdk');
const { v4: uuidv4 } = require('uuid');

// 初始化云开发
const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV,
});

// 平台API配置
const PLATFORM_CONFIGS = {
  'tongyi-wanxiang': {
    url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/generation',
    headers: {
      'Authorization': `Bearer ${process.env.TONGYI_API_KEY || ''}`,
      'Content-Type': 'application/json'
    }
  }
};

/**
 * 参数校验
 */
function validateParams(params) {
  const { imageUrl, model, userId } = params;

  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new Error('imageUrl 不能为空且必须是字符串');
  }

  if (!model || typeof model !== 'string') {
    throw new Error('model 不能为空且必须是字符串');
  }

  if (!userId || typeof userId !== 'string') {
    throw new Error('userId 不能为空且必须是字符串');
  }

  if (!PLATFORM_CONFIGS[model]) {
    throw new Error(`不支持的模型: ${model}`);
  }

  return true;
}

/**
 * 调用通义万相API
 */
async function callTongyiWanxiangAPI(params) {
  const { imageUrl, prompt } = params;
  const config = PLATFORM_CONFIGS['tongyi-wanxiang'];

  const requestBody = {
    model: 'wanx2.1-t2v-turbo',
    input: {
      image_url: imageUrl,
      prompt: prompt || '根据图片生成视频'
    },
    parameters: {
      resolution: '720p',
      duration: 5,
      fps: 24
    }
  };

  console.log('调用通义万相API，请求体:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(config.url, {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify(requestBody),
    timeout: 30000
  });

  if (!response.ok) {
    throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  console.log('通义万相API返回:', JSON.stringify(result, null, 2));

  return result;
}

/**
 * 创建任务记录
 */
async function createTaskRecord(taskData) {
  const models = app.models;

  const task = {
    taskId: taskData.taskId,
    imageUrl: taskData.imageUrl,
    model: taskData.model,
    prompt: taskData.prompt || '',
    userId: taskData.userId,
    callbackUrl: taskData.callbackUrl || '',
    status: 'created',
    createdAt: new Date(),
    updatedAt: new Date(),
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
  const models = app.models;

  const update = {
    ...updateData,
    updatedAt: new Date()
  };

  console.log('更新任务记录:', { taskId, update });

  const result = await models.generation_tasks.update({
    data: update,
    filter: {
      where: {
        taskId: { $eq: taskId }
      }
    }
  });

  return result.data;
}

/**
 * 主函数
 */
exports.main = async (event, context) => {
  console.log('收到请求:', JSON.stringify(event, null, 2));

  try {
    // 1. 参数校验
    validateParams(event);

    const { imageUrl, model, prompt, userId, callbackUrl } = event;

    // 2. 生成任务ID
    const taskId = uuidv4();
    console.log('生成任务ID:', taskId);

    // 3. 创建任务记录
    await createTaskRecord({
      taskId,
      imageUrl,
      model,
      prompt,
      userId,
      callbackUrl
    });

    // 4. 调用对应平台的API
    let apiResult;
    try {
      if (model === 'tongyi-wanxiang') {
        apiResult = await callTongyiWanxiangAPI({ imageUrl, prompt });
      }

      // 5. 更新任务状态为running
      await updateTaskRecord(taskId, {
        status: 'running',
        result: apiResult
      });

      console.log('任务提交成功:', taskId);

      return {
        taskId,
        status: 'running'
      };

    } catch (apiError) {
      // API调用失败
      console.error('API调用失败:', apiError);

      await updateTaskRecord(taskId, {
        status: 'failed',
        result: {
          error: apiError.message,
          timestamp: new Date().toISOString()
        }
      });

      return {
        taskId,
        status: 'failed',
        message: apiError.message
      };
    }

  } catch (error) {
    console.error('处理失败:', error);

    return {
      taskId: null,
      status: 'failed',
      message: error.message
    };
  }
};
  