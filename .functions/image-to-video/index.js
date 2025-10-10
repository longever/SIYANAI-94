
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');
    
    // 初始化云开发
    const app = cloudbase.init({
      env: cloudbase.SYMBOL_CURRENT_ENV,
    });
    const models = app.models;

    // 平台API配置
    const PLATFORM_CONFIGS = {
      wanxiang: {
        apiUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/generation',
        apiKey: process.env.WANXIANG_API_KEY, // 从环境变量获取
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WANXIANG_API_KEY}`
        }
      }
    };

    /**
     * 调用通义万相API生成视频
     * @param {Object} params - 生成参数
     * @returns {Promise<Object>} API响应
     */
    async function callWanxiangAPI(params) {
      const { imageUrl, prompt, duration, resolution } = params;
      
      const requestBody = {
        model: 'wanx2.1-t2v-turbo',
        input: {
          image_url: imageUrl,
          prompt: prompt,
          duration: duration,
          resolution: resolution
        },
        parameters: {
          seed: Math.floor(Math.random() * 1000000),
          cfg_scale: 5.0,
          num_inference_steps: 50
        }
      };

      const response = await fetch(PLATFORM_CONFIGS.wanxiang.apiUrl, {
        method: 'POST',
        headers: PLATFORM_CONFIGS.wanxiang.headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    }

    /**
     * 根据模型名称调用对应的视频生成API
     * @param {Object} params - 生成参数
     * @returns {Promise<Object>} 平台返回的任务信息
     */
    async function callVideoGenerationAPI(params) {
      const { model } = params;
      
      switch (model) {
        case 'wanxiang':
          return await callWanxiangAPI(params);
        default:
          throw new Error(`不支持的模型: ${model}`);
      }
    }

    /**
     * 验证输入参数
     * @param {Object} params - 输入参数
     * @throws {Error} 参数验证失败
     */
    function validateParams(params) {
      const requiredFields = ['imageUrl', 'prompt', 'model', 'duration', 'resolution', 'userId'];
      
      for (const field of requiredFields) {
        if (!params[field]) {
          throw new Error(`缺少必填参数: ${field}`);
        }
      }

      if (typeof params.duration !== 'number' || params.duration <= 0) {
        throw new Error('duration必须是正数');
      }

      if (!['wanxiang'].includes(params.model)) {
        throw new Error('model必须是支持的模型名称');
      }
    }

    exports.main = async (event, context) => {
      try {
        // 1. 验证输入参数
        const params = event;
        validateParams(params);

        // 2. 创建任务记录
        const taskRecord = await models.generation_tasks.create({
          data: {
            imageUrl: params.imageUrl,
            prompt: params.prompt,
            model: params.model,
            duration: params.duration,
            resolution: params.resolution,
            userId: params.userId,
            status: 'PENDING',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        const taskId = taskRecord.data._id;

        try {
          // 3. 调用平台API
          const apiResponse = await callVideoGenerationAPI(params);
          
          // 4. 更新任务记录
          await models.generation_tasks.update({
            filter: {
              where: {
                _id: { $eq: taskId }
              }
            },
            data: {
              platformTaskId: apiResponse.output?.task_id || apiResponse.task_id,
              status: apiResponse.output?.task_status || 'PROCESSING',
              estimatedFinishTime: apiResponse.output?.estimated_finish_time || new Date(Date.now() + 5 * 60 * 1000),
              platformResponse: apiResponse,
              updatedAt: new Date()
            }
          });

          // 5. 返回成功响应
          return {
            success: true,
            taskId: apiResponse.output?.task_id || apiResponse.task_id,
            message: '任务创建成功'
          };

        } catch (apiError) {
          // API调用失败，更新任务状态为FAILED
          await models.generation_tasks.update({
            filter: {
              where: {
                _id: { $eq: taskId }
              }
            },
            data: {
              status: 'FAILED',
              errorMessage: apiError.message,
              updatedAt: new Date()
            }
          });

          throw apiError;
        }

      } catch (error) {
        console.error('图生视频任务处理失败:', error);
        
        return {
          success: false,
          taskId: null,
          message: error.message || '处理失败，请稍后重试'
        };
      }
    };
  