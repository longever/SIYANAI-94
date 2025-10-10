
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');
    const crypto = require('crypto');

    // 初始化云开发环境
    const app = cloudbase.init();
    const models = app.models;

    // 生成唯一taskId
    function generateTaskId() {
      const timestamp = Date.now().toString(36);
      const randomStr = crypto.randomBytes(8).toString('hex');
      return `task_${timestamp}_${randomStr}`;
    }

    // 调用通义万相图生视频API
    async function callTongyiWanxiangAPI(inputParams) {
      // 这里需要根据实际的通义万相API文档配置
      // 示例使用fetch调用，实际使用时需要替换为真实的API配置
      const apiUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation';
      
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.TONGYI_API_KEY || ''}`
          },
          body: JSON.stringify({
            model: 'wanx-video-generation-v1',
            input: inputParams
          })
        });

        if (!response.ok) {
          throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        return {
          platformTaskId: result.output?.task_id || '',
          status: result.output?.task_status || 'PROCESSING'
        };
      } catch (error) {
        console.error('通义万相API调用失败:', error);
        throw error;
      }
    }

    // 根据modelType调用对应平台API
    async function callPlatformAPI(modelType, inputParams) {
      switch (modelType) {
        case 'tongyi-wanxiang':
          return await callTongyiWanxiangAPI(inputParams);
        default:
          throw new Error(`不支持的模型类型: ${modelType}`);
      }
    }

    exports.main = async (event, context) => {
      const { userId, modelType, inputParams } = event;

      // 参数验证
      if (!userId || !modelType || !inputParams) {
        return {
          success: false,
          error: '缺少必要参数: userId, modelType, inputParams'
        };
      }

      let taskId;
      try {
        // 生成本地唯一taskId
        taskId = generateTaskId();

        // 创建初始任务记录
        const initialTask = {
          taskId,
          userId,
          modelType,
          inputParams,
          status: 'pending',
          createTime: new Date(),
          updateTime: new Date()
        };

        // 写入数据模型
        await models.generation_tasks.create({
          data: initialTask
        });

        console.log('任务创建成功:', taskId);

        // 调用平台API
        const platformResult = await callPlatformAPI(modelType, inputParams);
        
        // 更新任务状态
        await models.generation_tasks.update({
          data: {
            platformTaskId: platformResult.platformTaskId,
            status: platformResult.status,
            updateTime: new Date()
          },
          filter: {
            where: {
              taskId: { $eq: taskId }
            }
          }
        });

        console.log('任务状态更新成功:', platformResult);

        // 返回本地taskId
        return {
          success: true,
          taskId
        };

      } catch (error) {
        console.error('任务处理失败:', error);
        
        // 如果taskId已生成，更新任务状态为失败
        if (taskId) {
          try {
            await models.generation_tasks.update({
              data: {
                status: 'failed',
                errorMessage: error.message,
                updateTime: new Date()
              },
              filter: {
                where: {
                  taskId: { $eq: taskId }
                }
              }
            });
          } catch (updateError) {
            console.error('更新失败状态失败:', updateError);
          }
        }

        return {
          success: false,
          error: error.message
        };
      }
    };
  