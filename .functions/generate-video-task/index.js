
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');
    
    // 平台API配置
    const PLATFORM_CONFIGS = {
      'tongyi-wanxiang': {
        url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/generation',
        headers: {
          'Authorization': `Bearer ${process.env.TONGYI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    };

    const app = cloudbase.init({
      env: cloudbase.SYMBOL_CURRENT_ENV
    });

    exports.main = async (event, context) => {
      try {
        console.log('开始处理视频生成任务', event);
        
        // 1. 参数校验
        const { video_model, ...taskParams } = event;
        
        if (!video_model) {
          return {
            code: 400,
            message: '缺少必要参数: video_model'
          };
        }

        if (!PLATFORM_CONFIGS[video_model]) {
          return {
            code: 400,
            message: `不支持的视频模型: ${video_model}`
          };
        }

        // 2. 创建任务记录
        const models = app.models;
        const taskRecord = await models.generation_tasks.create({
          data: {
            video_model,
            task_params: taskParams,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        });

        const taskId = taskRecord.data._id;
        console.log('任务记录创建成功:', taskId);

        // 3. 调用平台API
        const platformConfig = PLATFORM_CONFIGS[video_model];
        
        // 构造请求数据
        const requestData = {
          model: "wanx2.1-t2v",
          input: {
            prompt: taskParams.prompt || '',
            image_url: taskParams.image_url || ''
          },
          parameters: {
            resolution: taskParams.resolution || '720p',
            duration: taskParams.duration || 2,
            ...taskParams.parameters
          }
        };

        console.log('调用API:', platformConfig.url, requestData);

        const response = await fetch(platformConfig.url, {
          method: 'POST',
          headers: platformConfig.headers,
          body: JSON.stringify(requestData)
        });

        const apiResult = await response.json();
        console.log('API响应:', apiResult);

        if (!response.ok) {
          throw new Error(`API调用失败: ${apiResult.message || response.statusText}`);
        }

        // 4. 更新任务记录
        const updateData = {
          task_id: apiResult.output?.task_id || apiResult.task_id,
          status: apiResult.output?.task_status || 'submitted',
          created_at: apiResult.output?.submit_time || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          api_response: apiResult
        };

        await models.generation_tasks.update({
          data: updateData,
          filter: {
            where: {
              _id: {
                $eq: taskId
              }
            }
          }
        });

        console.log('任务记录更新成功');

        // 5. 返回结果
        return {
          code: 200,
          data: {
            task_id: updateData.task_id,
            status: updateData.status,
            created_at: updateData.created_at,
            local_task_id: taskId
          }
        };

      } catch (error) {
        console.error('处理视频生成任务失败:', error);
        
        // 更新任务状态为失败
        if (event && event._id) {
          try {
            await app.models.generation_tasks.update({
              data: {
                status: 'failed',
                error_msg: error.message,
                updated_at: new Date().toISOString()
              },
              filter: {
                where: {
                  _id: {
                    $eq: event._id
                  }
                }
              }
            });
          } catch (updateError) {
            console.error('更新失败状态失败:', updateError);
          }
        }

        return {
          code: 500,
          message: error.message || '处理视频生成任务失败'
        };
      }
    };
  