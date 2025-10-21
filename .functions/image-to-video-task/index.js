
'use strict';

const cloudbase = require('@cloudbase/node-sdk');
const { v4: uuidv4 } = require('uuid');

const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV
});

// 阿里云 DashScope 配置
const DASHSCOPE_CONFIG = {
  baseUrl: 'https://dashscope.aliyuncs.com',
  apiKey: process.env.DASHSCOPE_API_KEY || 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // 建议从环境变量读取
  endpoint: '/api/v1/services/aigc/emo/emo',
  model: 'emo-v1'
};

exports.main = async (event, context) => {
  const startTime = Date.now();
  const taskId = uuidv4();
  
  try {
    // 记录请求日志
    console.log(`[${taskId}] 开始处理图片情绪检测任务`, {
      event: JSON.stringify(event),
      timestamp: new Date().toISOString()
    });

    // 1. 参数验证
    const { imageUrl, imageBase64, ...otherParams } = event;
    
    if (!imageUrl && !imageBase64) {
      const error = {
        taskId,
        status: 'error',
        message: '缺少必需参数：imageUrl 或 imageBase64 必须提供其中一个'
      };
      console.error(`[${taskId}] 参数验证失败`, error);
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error)
      };
    }

    // 验证图片格式
    if (imageUrl && !isValidImageUrl(imageUrl)) {
      const error = {
        taskId,
        status: 'error',
        message: '无效的图片URL格式'
      };
      console.error(`[${taskId}] URL格式验证失败`, error);
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error)
      };
    }

    if (imageBase64 && !isValidBase64Image(imageBase64)) {
      const error = {
        taskId,
        status: 'error',
        message: '无效的图片Base64格式'
      };
      console.error(`[${taskId}] Base64格式验证失败`, error);
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error)
      };
    }

    // 2. 准备请求数据
    const requestData = {
      model: DASHSCOPE_CONFIG.model,
      input: {
        image: imageUrl || imageBase64
      },
      parameters: {
        ...otherParams
      }
    };

    console.log(`[${taskId}] 准备调用阿里云DashScope HTTP API`, {
      url: DASHSCOPE_CONFIG.baseUrl + DASHSCOPE_CONFIG.endpoint,
      hasImageUrl: !!imageUrl,
      hasImageBase64: !!imageBase64
    });

    // 3. 发起 HTTP 请求
    let apiResponse;
    try {
      const response = await app.callFunction({
        name: 'http-request',
        data: {
          type: 'cloudrun',
          method: 'POST',
          path: DASHSCOPE_CONFIG.endpoint,
          headers: {
            'Authorization': `Bearer ${DASHSCOPE_CONFIG.apiKey}`,
            'Content-Type': 'application/json',
            'X-DashScope-Async': 'enable' // 启用异步调用
          },
          data: requestData
        }
      });

      if (response.statusCode !== 200) {
        throw new Error(`HTTP ${response.statusCode}: ${response.body}`);
      }

      apiResponse = JSON.parse(response.body);
      console.log(`[${taskId}] HTTP API调用成功`, {
        responseKeys: Object.keys(apiResponse || {}),
        taskStatus: apiResponse?.output?.task_status
      });
    } catch (apiError) {
      console.error(`[${taskId}] HTTP API调用失败`, {
        error: apiError.message,
        stack: apiError.stack,
        response: apiError.response
      });
      
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          status: 'error',
          message: '调用情绪检测服务失败',
          error: apiError.message || '未知错误',
          data: apiError.response || null
        })
      };
    }

    // 4. 处理响应
    const result = {
      taskId,
      status: 'success',
      data: {
        task_id: apiResponse.output?.task_id,
        task_status: apiResponse.output?.task_status,
        task_metrics: apiResponse.usage,
        ...apiResponse
      },
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime
    };

    console.log(`[${taskId}] 任务处理完成`, {
      duration: result.duration,
      status: result.status,
      taskStatus: result.data.task_status
    });

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error(`[${taskId}] 未捕获的异常`, {
      error: error.message,
      stack: error.stack
    });
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId,
        status: 'error',
        message: '服务器内部错误',
        error: error.message || '未知错误'
      })
    };
  }
};

// 工具函数：验证图片URL格式
function isValidImageUrl(url) {
  if (typeof url !== 'string') return false;
  
  try {
    const parsedUrl = new URL(url);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const pathname = parsedUrl.pathname.toLowerCase();
    
    return imageExtensions.some(ext => pathname.endsWith(ext));
  } catch {
    return false;
  }
}

// 工具函数：验证Base64图片格式
function isValidBase64Image(base64) {
  if (typeof base64 !== 'string') return false;
  
  // 检查是否为有效的Base64字符串
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  const cleanBase64 = base64.split(',')[1] || base64;
  
  if (!base64Regex.test(cleanBase64.replace(/\s/g, ''))) {
    return false;
  }
  
  // 检查是否包含图片格式标识
  const imagePrefixes = ['data:image/', '/9j/', 'iVBORw0KGgo']; // JPEG, PNG
  return imagePrefixes.some(prefix => base64.includes(prefix));
}
  