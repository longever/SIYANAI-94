
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');
    const { v4: uuidv4 } = require('uuid');

    // 初始化云开发
    const app = cloudbase.init();
    const models = app.models;

    // 平台配置
    const PLATFORM_CONFIG = {
      'tongyi-wanxiang': {
        apiUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/generation',
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
      const { imageUrl, modelType, prompt, userId, projectId, duration, resolution, fps } = params;
      
      if (!imageUrl || typeof imageUrl !== 'string') {
        throw new Error('imageUrl 不能为空且必须是字符串');
      }
      
      if (!modelType || typeof modelType !== 'string') {
        throw new Error('modelType 不能为空且必须是字符串');
      }
      
      if (!prompt || typeof prompt !== 'string') {
        throw new Error('prompt 不能为空且必须是字符串');
      }
      
      if (!userId || typeof userId !== 'string') {
        throw new Error('userId 不能为空且必须是字符串');
      }
      
      if (!projectId || typeof projectId !== 'string') {
        throw new Error('projectId 不能为空且必须是字符串');
      }
      
      if (duration && (typeof duration !== 'number' || duration <= 0)) {
        throw new Error('duration 必须是正数');
      }
      
      if (resolution && typeof resolution !== 'string') {
        throw new Error('resolution 必须是字符串');
      }
      
      if (fps && (typeof fps !== 'number' || fps <= 0)) {
        throw new Error('fps 必须是正数');
      }
      
      if (!PLATFORM_CONFIG[modelType]) {
        throw new Error(`不支持的 modelType: ${modelType}`);
      }
    }

    /**
     * 创建任务记录
     */
    async function createTaskRecord(taskId, params) {
      const now = new Date();
      const taskData = {
        _id: taskId,
        imageUrl: params.imageUrl,
        modelType: params.modelType,
        prompt: params.prompt,
        duration: params.duration,
        resolution: params.resolution,
        fps: params.fps,
        userId: params.userId,
        projectId: params.projectId,
        status: 'pending',
        createTime: now,
        updateTime: now
      };
      
      return await models.generation_tasks.create({
        data: taskData
      });
    }

    /**
     * 调用通义万相API
     */
    async function callTongyiWanxiangAPI(params) {
      const config = PLATFORM_CONFIG['tongyi-wanxiang'];
      
      const requestBody = {
        model: 'wanx2.1-t2v-turbo',
        input: {
          image_url: params.imageUrl,
          prompt: params.prompt,
          duration: params.duration || 5,
          resolution: params.resolution || '720p',
          fps: params.fps || 24
        },
        parameters: {}
      };
      
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.code !== 200) {
        throw new Error(`API返回错误: ${result.message || result.code}`);
      }
      
      return {
        platformTaskId: result.output.task_id,
        status: result.output.task_status || 'submitted',
        submitTime: new Date()
      };
    }

    /**
     * 更新任务记录
     */
    async function updateTaskRecord(taskId, platformResult) {
      const now = new Date();
      
      return await models.generation_tasks.update({
        filter: {
          where: {
            _id: { $eq: taskId }
          }
        },
        data: {
          platformTaskId: platformResult.platformTaskId,
          status: platformResult.status,
          submitTime: platformResult.submitTime,
          updateTime: now
        }
      });
    }

    exports.main = async (event, context) => {
      const taskId = uuidv4();
      
      try {
        // 1. 参数校验
        validateParams(event);
        
        // 2. 创建任务记录
        await createTaskRecord(taskId, event);
        
        // 3. 调用平台API
        let platformResult;
        if (event.modelType === 'tongyi-wanxiang') {
          platformResult = await callTongyiWanxiangAPI(event);
        }
        
        // 4. 更新任务记录
        await updateTaskRecord(taskId, platformResult);
        
        // 5. 返回成功结果
        return {
          success: true,
          taskId: taskId,
          message: '任务已提交'
        };
        
      } catch (error) {
        console.error('创建任务失败:', error);
        
        // 如果任务记录已创建，更新为失败状态
        try {
          await models.generation_tasks.update({
            filter: {
              where: {
                _id: { $eq: taskId }
              }
            },
            data: {
              status: 'failed',
              errorMessage: error.message,
              updateTime: new Date()
            }
          });
        } catch (updateError) {
          console.error('更新失败状态失败:', updateError);
        }
        
        return {
          success: false,
          taskId: taskId,
          message: error.message
        };
      }
    };
  