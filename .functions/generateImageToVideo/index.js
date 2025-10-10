
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');
    const https = require('https');

    // 初始化云开发环境
    const app = cloudbase.init({
      env: cloudbase.SYMBOL_CURRENT_ENV,
    });

    // 视频生成模型API配置
    const MODEL_API_CONFIG = {
      host: 'api.example.com', // 请替换为实际的API域名
      path: '/v1/video/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY' // 请替换为实际的API密钥
      }
    };

    /**
     * 验证输入参数
     * @param {Object} params - 输入参数
     * @throws {Error} 参数验证失败时抛出错误
     */
    function validateParams(params) {
      const { userId, inputType, imageUrl, modelParams, text, audioUrl, videoUrl } = params;

      // 检查必填参数
      if (!userId) {
        throw new Error('userId 不能为空');
      }
      if (!inputType) {
        throw new Error('inputType 不能为空');
      }
      if (!imageUrl) {
        throw new Error('imageUrl 不能为空');
      }
      if (!modelParams || typeof modelParams !== 'object') {
        throw new Error('modelParams 不能为空且必须是对象');
      }

      // 检查inputType的有效性
      const validInputTypes = ['text', 'audio', 'video'];
      if (!validInputTypes.includes(inputType)) {
        throw new Error('inputType 必须是 text、audio 或 video 之一');
      }

      // 根据inputType检查对应的附加参数
      if (inputType === 'text' && !text) {
        throw new Error('当 inputType 为 text 时，text 不能为空');
      }
      if (inputType === 'audio' && !audioUrl) {
        throw new Error('当 inputType 为 audio 时，audioUrl 不能为空');
      }
      if (inputType === 'video' && !videoUrl) {
        throw new Error('当 inputType 为 video 时，videoUrl 不能为空');
      }

      // 检查多余的参数
      if (inputType !== 'text' && text) {
        throw new Error('当 inputType 不为 text 时，不能提供 text 参数');
      }
      if (inputType !== 'audio' && audioUrl) {
        throw new Error('当 inputType 不为 audio 时，不能提供 audioUrl 参数');
      }
      if (inputType !== 'video' && videoUrl) {
        throw new Error('当 inputType 不为 video 时，不能提供 videoUrl 参数');
      }
    }

    /**
     * 调用视频生成模型API
     * @param {Object} requestData - 请求数据
     * @returns {Promise<string>} 返回任务ID
     */
    async function callVideoGenerationAPI(requestData) {
      return new Promise((resolve, reject) => {
        const postData = JSON.stringify(requestData);
        
        const options = {
          ...MODEL_API_CONFIG,
          headers: {
            ...MODEL_API_CONFIG.headers,
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const req = https.request(options, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              if (res.statusCode === 200 && response.taskId) {
                resolve(response.taskId);
              } else {
                reject(new Error(`API调用失败: ${response.message || data}`));
              }
            } catch (error) {
              reject(new Error(`API响应解析失败: ${error.message}`));
            }
          });
        });

        req.on('error', (error) => {
          reject(new Error(`网络请求失败: ${error.message}`));
        });

        req.write(postData);
        req.end();
      });
    }

    /**
     * 保存任务信息到数据模型
     * @param {Object} taskInfo - 任务信息
     * @returns {Promise<Object>} 保存结果
     */
    async function saveTaskToDatabase(taskInfo) {
      const models = app.models;
      
      try {
        const result = await models.generation_tasks.create({
          data: {
            ...taskInfo,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'pending'
          }
        });
        
        return result;
      } catch (error) {
        throw new Error(`数据库写入失败: ${error.message}`);
      }
    }

    exports.main = async (event, context) => {
      try {
        console.log('收到请求:', JSON.stringify(event));
        
        // 参数验证
        validateParams(event);
        
        const { userId, inputType, imageUrl, text, audioUrl, videoUrl, modelParams } = event;
        
        // 构造API请求数据
        const apiRequestData = {
          imageUrl,
          inputType,
          modelParams
        };
        
        // 根据inputType添加对应的附加字段
        if (inputType === 'text') {
          apiRequestData.text = text;
        } else if (inputType === 'audio') {
          apiRequestData.audioUrl = audioUrl;
        } else if (inputType === 'video') {
          apiRequestData.videoUrl = videoUrl;
        }
        
        // 调用视频生成模型API
        console.log('调用视频生成API:', JSON.stringify(apiRequestData));
        const taskId = await callVideoGenerationAPI(apiRequestData);
        console.log('获取到任务ID:', taskId);
        
        // 保存任务信息到数据库
        const taskInfo = {
          taskId,
          userId,
          inputType,
          imageUrl,
          modelParams: JSON.stringify(modelParams),
          status: 'pending'
        };
        
        // 添加对应的附加字段
        if (inputType === 'text') {
          taskInfo.text = text;
        } else if (inputType === 'audio') {
          taskInfo.audioUrl = audioUrl;
        } else if (inputType === 'video') {
          taskInfo.videoUrl = videoUrl;
        }
        
        await saveTaskToDatabase(taskInfo);
        console.log('任务信息已保存到数据库');
        
        // 返回成功结果
        return {
          taskId
        };
        
      } catch (error) {
        console.error('处理请求时发生错误:', error);
        
        // 返回错误信息
        return {
          error: error.message
        };
      }
    };
  