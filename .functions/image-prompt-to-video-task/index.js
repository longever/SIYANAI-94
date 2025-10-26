
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');

    // 初始化云开发环境
    const app = cloudbase.init({
      env: cloudbase.SYMBOL_CURRENT_ENV
    });
    const models = app.models;

    // 万相API配置
    const WANXIANG_CONFIG = {
      apiUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/generation',
      apiKey: process.env.WANXIANG_API_KEY // 从环境变量获取API Key
    };

    /**
     * 调用万相2.5 preview接口生成视频
     * @param {string} imageUrl - 图片URL
     * @param {string} prompt - 文字描述
     * @param {number} duration - 视频时长(秒)
     * @param {string} resolution - 分辨率
     * @returns {Promise<string>} 任务ID
     */
    async function callWanxiangAPI(imageUrl, prompt, duration = 5, resolution = '720p') {
      const requestBody = {
        model: 'wan2.5-i2v-preview',
        input: {
          image_url: imageUrl,
          prompt: prompt
        },
        parameters: {
          duration: duration,
          resolution: resolution
        }
      };

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
    async function createVideoTaskRecord(taskId, imageUrl, prompt) {
      try {
        const taskRecord = {
          taskId: taskId,
          imageUrl: imageUrl,
          prompt: prompt,
          status: 'submitted',
          createdAt: new Date().toISOString()
        };

        // 使用数据模型创建记录
        const result = await models.video_tasks.create({
          data: taskRecord
        });

        return result.data;
      } catch (error) {
        console.error('创建任务记录失败:', error);
        throw new Error(`数据库操作失败: ${error.message}`);
      }
    }

    /**
     * 验证输入参数
     * @param {Object} params - 输入参数
     * @throws {Error} 参数验证失败
     */
    function validateInput(params) {
      const { imageUrl, prompt, duration, resolution } = params;

      if (!imageUrl || typeof imageUrl !== 'string') {
        throw new Error('imageUrl不能为空且必须是字符串');
      }

      if (!prompt || typeof prompt !== 'string') {
        throw new Error('prompt不能为空且必须是字符串');
      }

      if (duration !== undefined) {
        if (typeof duration !== 'number' || duration < 1 || duration > 60) {
          throw new Error('duration必须是1-60之间的数字');
        }
      }

      if (resolution !== undefined) {
        const validResolutions = ['480p', '720p', '1080p'];
        if (!validResolutions.includes(resolution)) {
          throw new Error(`resolution必须是以下之一: ${validResolutions.join(', ')}`);
        }
      }
    }

    exports.main = async (event, context) => {
      try {
        // 解析请求参数
        const { imageUrl, prompt, duration = 5, resolution = '720p' } = event;

        // 验证输入参数
        validateInput({ imageUrl, prompt, duration, resolution });

        // 检查API Key配置
        if (!WANXIANG_CONFIG.apiKey) {
          return {
            error: '服务配置错误',
            details: '缺少万相API Key配置，请联系管理员'
          };
        }

        // 调用万相API创建任务
        const taskId = await callWanxiangAPI(imageUrl, prompt, duration, resolution);

        // 创建任务记录
        const taskRecord = await createVideoTaskRecord(taskId, imageUrl, prompt);

        // 返回成功响应
        return {
          taskId: taskId,
          status: 'submitted',
          imageUrl: imageUrl,
          prompt: prompt
        };

      } catch (error) {
        console.error('云函数执行错误:', error);

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
  