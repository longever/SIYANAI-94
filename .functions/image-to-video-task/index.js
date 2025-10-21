
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');
    const { v4: uuidv4 } = require('uuid');

    const app = cloudbase.init({
      env: cloudbase.SYMBOL_CURRENT_ENV
    });

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

        // 2. 获取API连接器
        const connector = app.connector('aliyun_dashscope_jbn02va');
        
        // 3. 准备调用参数
        const apiParams = {
          image: imageUrl || imageBase64,
          ...otherParams
        };

        console.log(`[${taskId}] 准备调用阿里云DashScope API`, {
          params: Object.keys(apiParams),
          hasImageUrl: !!imageUrl,
          hasImageBase64: !!imageBase64
        });

        // 4. 调用情绪检测API
        let apiResponse;
        try {
          apiResponse = await connector.call('aliyun_dashscope_emo_detect_v1', apiParams);
          console.log(`[${taskId}] API调用成功`, {
            responseKeys: Object.keys(apiResponse || {}),
            responseType: typeof apiResponse
          });
        } catch (apiError) {
          console.error(`[${taskId}] API调用失败`, {
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

        // 5. 处理响应
        const result = {
          taskId,
          status: 'success',
          data: apiResponse,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime
        };

        console.log(`[${taskId}] 任务处理完成`, {
          duration: result.duration,
          status: result.status
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
  