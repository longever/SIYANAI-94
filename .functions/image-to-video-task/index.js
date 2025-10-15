
'use strict';

const cloudbase = require('@cloudbase/node-sdk');

exports.main = async (event, context) => {
  const app = cloudbase.init({
    env: cloudbase.SYMBOL_CURRENT_ENV
  });
  
  const models = app.models;
  const apis = app.apis;

  try {
    // 1. 参数校验
    const { taskId, imageUrl, prompt, style, duration } = event;
    
    if (!taskId || !imageUrl || !prompt) {
      const errorMessage = 'Missing required fields: taskId, imageUrl, prompt';
      
      // 更新任务状态为 FAILED
      await models['image-to-video-task'].update({
        filter: {
          where: {
            taskId: { $eq: taskId }
          }
        },
        data: {
          status: 'FAILED',
          error: errorMessage,
          updatedAt: new Date()
        }
      });
      
      return {
        success: false,
        errorMessage
      };
    }

    // 2. 构造请求体
    const requestBody = {
      model: 'wanx2.1-video-generation',
      input: {
        image_url: imageUrl,
        prompt: prompt,
        ...(style && { style }),
        ...(duration && { duration })
      }
    };

    // 3. 调用 APIs 连接器
    const connector = apis.aliyun_dashscope_jbn02va;
    
    let response;
    try {
      response = await connector.invoke({
        body: requestBody
      }, {
        timeout: 30000 // 30秒超时
      });
    } catch (apiError) {
      const errorMessage = `API call failed: ${apiError.message}`;
      
      // 更新任务状态为 FAILED
      await models['image-to-video-task'].update({
        filter: {
          where: {
            taskId: { $eq: taskId }
          }
        },
        data: {
          status: 'FAILED',
          error: errorMessage,
          updatedAt: new Date()
        }
      });
      
      return {
        success: false,
        errorMessage
      };
    }

    // 4. 处理响应
    if (!response.data || !response.data.output || !response.data.output.task_id) {
      const errorMessage = 'Invalid API response format';
      
      // 更新任务状态为 FAILED
      await models['image-to-video-task'].update({
        filter: {
          where: {
            taskId: { $eq: taskId }
          }
        },
        data: {
          status: 'FAILED',
          error: errorMessage,
          updatedAt: new Date()
        }
      });
      
      return {
        success: false,
        errorMessage
      };
    }

    const requestId = response.data.output.task_id;

    // 5. 更新任务状态为 SUBMITTED
    await models['image-to-video-task'].update({
      filter: {
        where: {
          taskId: { $eq: taskId }
        }
      },
      data: {
        status: 'SUBMITTED',
        requestId: requestId,
        updatedAt: new Date()
      }
    });

    // 6. 返回成功结果
    return {
      success: true,
      requestId
    };

  } catch (error) {
    console.error('Function error:', error);
    
    // 更新任务状态为 FAILED
    if (event.taskId) {
      try {
        await models['image-to-video-task'].update({
          filter: {
            where: {
              taskId: { $eq: event.taskId }
            }
          },
          data: {
            status: 'FAILED',
            error: 'Internal server error',
            updatedAt: new Date()
          }
        });
      } catch (updateError) {
        console.error('Failed to update task status:', updateError);
      }
    }
    
    return {
      success: false,
      errorMessage: 'Internal server error'
    };
  }
};
