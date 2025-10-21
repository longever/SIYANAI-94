
'use strict';

const cloudbase = require('@cloudbase/node-sdk');

exports.main = async (event, context) => {
  const app = cloudbase.init({
    env: cloudbase.SYMBOL_CURRENT_ENV
  });

  const models = app.models;


  try {
    // 1. 参数校验
    const { taskId, imageUrl, prompt, style, duration } = event;

    if (!taskId || !imageUrl || !prompt) {
      //   const errorMessage = 'Missing required fields: taskId, imageUrl, prompt';

      //   // 更新任务状态为 FAILED
      //   await models['generation_tasks'].update({
      //     filter: {
      //       where: {
      //         taskId: { $eq: taskId }
      //       }
      //     },
      //     data: {
      //       status: 'FAILED',
      //       error: errorMessage,
      //       updatedAt: Date.now()
      //     }
      //   });

      //   return {
      //     success: false,
      //     errorMessage
      //   };
    }

    // 2. 调用资源连接器 aliyun_dashscope_jbn02va 的 api 方法

    // 2.1 调用 aliyun_dashscope_emo_detect_v1 方法进行情感检测 
    try {

      const detectResult = await $w.cloud.callDataSource({
        dataSourceName: "aliyun_dashscope_jbn02va",
        methodName: "aliyun_dashscope_emo_detect_v1",
        params: { image: imageUrl }, // 方法入参
      });

    } catch (detectError) {
      const errorMessage = `Emotion detection failed: ${detectError.message}`;

      // 更新任务状态为 FAILED
      await models['generation_tasks'].update({
        filter: {
          where: {
            taskId: { $eq: taskId }
          }
        },
        data: {
          status: 'FAILED',
          error: errorMessage,
          updatedAt: Date.now()
        }
      });

      return {
        success: false,
        errorMessage
      };
    }

    // 2.2 调用 emo_v1 方法进行视频生成 
    try {
      const videoResult = await $w.cloud.callDataSource({
        dataSourceName: "aliyun_dashscope_jbn02va",
        methodName: "emo_v1",
        params: {
          image: imageUrl,
          prompt: prompt,
          ...(style && { style }),
          ...(duration && { duration })
        }, // 方法入参
      });
    } catch (videoError) {
      const errorMessage = `Video generation failed: ${videoError.message}`;

      // 更新任务状态为 FAILED
      await models['generation_tasks'].update({
        filter: {
          where: {
            taskId: { $eq: taskId }
          }
        },
        data: {
          status: 'FAILED',
          error: errorMessage,
          updatedAt: Date.now()
        }
      });

      return {
        success: false,
        errorMessage
      };
    }

    // 3. 处理响应
    if (!videoResult || !videoResult.task_id) {
      const errorMessage = 'Invalid video generation response format';

      // 更新任务状态为 FAILED
      await models['generation_tasks'].update({
        filter: {
          where: {
            taskId: { $eq: taskId }
          }
        },
        data: {
          status: 'FAILED',
          error: errorMessage,
          updatedAt: Date.now()
        }
      });

      return {
        success: false,
        errorMessage
      };
    }

    const requestId = videoResult.task_id;

    // 4. 更新任务状态为 SUBMITTED
    await models['generation_tasks'].update({
      filter: {
        where: {
          taskId: { $eq: taskId }
        }
      },
      data: {
        status: 'SUBMITTED',
        requestId: requestId,
        detectResult: detectResult,
        updatedAt: Date.now()
      }
    });

    // 5. 返回成功结果
    return {
      success: true,
      requestId,
      detectResult
    };

  } catch (error) {
    console.error('Function error:', error);

    // 更新任务状态为 FAILED
    if (event.taskId) {
      try {
        await models['generation_tasks'].update({
          filter: {
            where: {
              taskId: { $eq: event.taskId }
            }
          },
          data: {
            status: 'FAILED',
            error: 'Internal server error',
            updatedAt: Date.now()
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
