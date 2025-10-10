
'use strict';

const cloudbase = require('@cloudbase/node-sdk');

// 初始化云开发
const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV,
});
const models = app.models;

// 平台API配置
const PLATFORM_CONFIG = {
  'tongyi-wanxiang': {
    apiUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/generation',
    apiKey: process.env.TONGYI_API_KEY || 'your-tongyi-api-key',
  }
};

// 调用通义万相API
async function callTongyiWanxiangAPI(inputParams) {
  const { imageUrl, prompt, ...otherParams } = inputParams;
  
  const requestBody = {
    model: 'wanx2.1-t2v-plus',
    input: {
      prompt: prompt || '生成一个高质量的视频',
      image_url: imageUrl,
      ...otherParams
    },
    parameters: {
      resolution: '720*1280',
      duration: 5,
      ...otherParams.parameters
    }
  };

  try {
    const response = await fetch(PLATFORM_CONFIG['tongyi-wanxiang'].apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PLATFORM_CONFIG['tongyi-wanxiang'].apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.output.task_id || result.output.job_id;
  } catch (error) {
    console.error('通义万相API调用失败:', error);
    throw error;
  }
}

// 参数校验
function validateParams(params) {
  const { userId, modelType, inputParams } = params;
  
  if (!userId || typeof userId !== 'string') {
    throw new Error('userId不能为空且必须是字符串');
  }
  
  if (!modelType || typeof modelType !== 'string') {
    throw new Error('modelType不能为空且必须是字符串');
  }
  
  if (!inputParams || typeof inputParams !== 'object') {
    throw new Error('inputParams不能为空且必须是对象');
  }
  
  if (!PLATFORM_CONFIG[modelType]) {
    throw new Error(`不支持的modelType: ${modelType}`);
  }
}

exports.main = async (event, context) => {
  try {
    const { userId, modelType, inputParams } = event;
    
    // 1. 参数校验
    validateParams({ userId, modelType, inputParams });
    
    // 2. 创建pending状态的任务记录
    const taskRecord = await models.generation_tasks.create({
      data: {
        userId,
        modelType,
        inputParams,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    const localTaskId = taskRecord.data._id;
    console.log('任务记录创建成功:', localTaskId);
    
    try {
      // 3. 根据modelType调用对应平台API
      let externalTaskId;
      
      switch (modelType) {
        case 'tongyi-wanxiang':
          externalTaskId = await callTongyiWanxiangAPI(inputParams);
          break;
        default:
          throw new Error(`不支持的modelType: ${modelType}`);
      }
      
      console.log('平台API调用成功，externalTaskId:', externalTaskId);
      
      // 4. 更新任务状态为running，并记录externalTaskId
      await models.generation_tasks.update({
        data: {
          externalTaskId,
          status: 'running',
          updatedAt: new Date()
        },
        filter: {
          where: {
            _id: { $eq: localTaskId }
          }
        }
      });
      
      // 5. 返回本地taskId
      return {
        success: true,
        taskId: localTaskId
      };
      
    } catch (apiError) {
      // API调用失败，更新任务状态为failed
      console.error('API调用失败:', apiError);
      
      await models.generation_tasks.update({
        data: {
          status: 'failed',
          errorMessage: apiError.message,
          updatedAt: new Date()
        },
        filter: {
          where: {
            _id: { $eq: localTaskId }
          }
        }
      });
      
      return {
        success: false,
        errorCode: 'API_ERROR',
        errorMessage: apiError.message
      };
    }
    
  } catch (error) {
    console.error('云函数执行错误:', error);
    
    return {
      success: false,
      errorCode: 'INTERNAL_ERROR',
      errorMessage: error.message
    };
  }
};
