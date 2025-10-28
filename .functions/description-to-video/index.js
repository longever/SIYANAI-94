
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');
    const axios = require('axios');

    // 初始化云开发
    const app = cloudbase.init();
    const models = app.models;

    // 常量定义
    const ALLOWED_MODELS = ['wan2.5-t2v-preview', 'wan2.2-t2v-plus'];
    const MAX_PROMPT_LENGTH = 500;
    const PROMPT_REGEX = /^[a-zA-Z0-9\u4e00-\u9fa5\s，。！？、：""''（）【】《》\-,.!?:"'()[\]<>]+$/;

    // 工具函数：参数校验
    function validateParams(prompt, model) {
      const errors = [];

      if (!prompt || typeof prompt !== 'string') {
        errors.push('prompt 不能为空且必须是字符串');
      } else {
        if (prompt.length > MAX_PROMPT_LENGTH) {
          errors.push(`prompt 长度不能超过 ${MAX_PROMPT_LENGTH} 字符`);
        }
        if (!PROMPT_REGEX.test(prompt)) {
          errors.push('prompt 包含非法字符');
        }
      }

      if (model && !ALLOWED_MODELS.includes(model)) {
        errors.push(`model 必须是 ${ALLOWED_MODELS.join(' 或 ')}`);
      }

      return errors;
    }

    // 工具函数：创建任务记录
    async function createTaskRecord(prompt, model, callbackUrl) {
      try {
        const result = await models.video_tasks.create({
          data: {
            prompt: prompt.trim(),
            model: model || 'wan2.5-t2v-preview',
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
            wanTaskId: '',
            callbackUrl: callbackUrl || '',
            errorMsg: ''
          }
        });
        return result.data;
      } catch (error) {
        console.error('创建任务记录失败:', error);
        throw new Error('创建任务记录失败');
      }
    }

    // 工具函数：更新任务状态
    async function updateTaskStatus(taskId, updates) {
      try {
        await models.video_tasks.update({
          where: { _id: taskId },
          data: {
            ...updates,
            updatedAt: new Date()
          }
        });
      } catch (error) {
        console.error('更新任务状态失败:', error);
      }
    }

    // 工具函数：调用通义万相API
    async function callWanXiangAPI(prompt, model, callbackUrl) {
      const apiKey = process.env.WANXIANG_API_KEY;
      const apiEndpoint = process.env.WANXIANG_API_ENDPOINT || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2video/video-synthesis';

      if (!apiKey) {
        throw new Error('未配置通义万相API密钥');
      }

      const requestBody = {
        model: model || 'wan2.5-t2v-preview',
        input: {
          prompt: prompt.trim()
        },
        parameters: {}
      };

      // 如果有回调URL，添加到请求中
      if (callbackUrl) {
        requestBody.callback_url = callbackUrl;
      }

      console.log('调用通义万相API，请求体:', JSON.stringify(requestBody, null, 2));

      try {
        const response = await axios.post(apiEndpoint, requestBody, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'X-DashScope-Async': 'enable'
          },
          timeout: 10000
        });

        console.log('通义万相API响应:', response.data);
        return response.data;
      } catch (error) {
        console.error('调用通义万相API失败:', error.message);
        if (error.response) {
          console.error('API响应错误:', error.response.data);
          throw new Error(`API调用失败: ${error.response.data?.message || error.response.statusText}`);
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('API调用超时');
        } else {
          throw new Error(`网络错误: ${error.message}`);
        }
      }
    }

    // 主函数
    exports.main = async (event, context) => {
      console.log('收到请求:', JSON.stringify(event, null, 2));

      try {
        const { prompt, model = 'wan2.5-t2v-preview', callbackUrl } = event;

        // 1. 参数校验
        const validationErrors = validateParams(prompt, model);
        if (validationErrors.length > 0) {
          return {
            error: '参数校验失败',
            details: { errors: validationErrors }
          };
        }

        // 2. 创建任务记录
        const taskRecord = await createTaskRecord(prompt, model, callbackUrl);
        console.log('创建任务记录成功:', taskRecord);

        try {
          // 3. 调用通义万相API
          const apiResponse = await callWanXiangAPI(prompt, model, callbackUrl);
          
          if (!apiResponse.output || !apiResponse.output.task_id) {
            throw new Error('API响应格式错误：缺少task_id');
          }

          const wanTaskId = apiResponse.output.task_id;

          // 4. 更新任务状态为已提交
          await updateTaskStatus(taskRecord._id, {
            status: 'submitted',
            wanTaskId: wanTaskId
          });

          console.log('任务提交成功，万相任务ID:', wanTaskId);

          // 5. 返回成功结果
          return {
            taskId: wanTaskId,
            status: 'submitted',
            model: model,
            prompt: prompt.trim(),
            localTaskId: taskRecord._id
          };

        } catch (apiError) {
          // API调用失败，更新任务状态为失败
          await updateTaskStatus(taskRecord._id, {
            status: 'failed',
            errorMsg: apiError.message
          });

          return {
            error: '视频生成任务提交失败',
            details: { 
              message: apiError.message,
              localTaskId: taskRecord._id
            }
          };
        }

      } catch (error) {
        console.error('云函数执行错误:', error);
        return {
          error: '服务器内部错误',
          details: { message: error.message }
        };
      }
    };
  