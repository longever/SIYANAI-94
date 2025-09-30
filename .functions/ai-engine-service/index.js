
'use strict';

const cloudbase = require('@cloudbase/node-sdk');
const { v4: uuidv4 } = require('uuid');

// 初始化云开发
const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV
});
const models = app.models;

// 模拟 generateVideo 函数（实际项目中应替换为真实实现）
async function generateVideo(params) {
  console.log('开始生成视频:', params);
  // 模拟视频生成耗时
  await new Promise(resolve => setTimeout(resolve, 3000));
  return `https://example.com/videos/${uuidv4()}.mp4`;
}

// HTTP 响应工具函数
function createResponse(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers
    },
    body: JSON.stringify(body)
  };
}

// 创建任务
async function createVideoTask(event) {
  try {
    const { prompt, materialId, avatarId, duration, resolution } = JSON.parse(event.body || '{}');
    
    // 参数校验
    if (!prompt || !materialId || !avatarId || !duration || !resolution) {
      return createResponse(400, { error: '缺少必要参数' });
    }

    const taskId = uuidv4();
    const now = new Date();

    // 创建任务记录
    await models.video_node.create({
      data: {
        id: taskId,
        prompt,
        materialId,
        avatarId,
        duration,
        resolution,
        status: 'pending',
        createdAt: now,
        updatedAt: now
      }
    });

    return createResponse(200, { taskId });
  } catch (error) {
    console.error('创建任务失败:', error);
    return createResponse(500, { error: '创建任务失败' });
  }
}

// 查询任务状态
async function getVideoTask(event) {
  try {
    const taskId = event.pathParameters?.id;
    
    if (!taskId) {
      return createResponse(400, { error: '缺少任务ID' });
    }

    const result = await models.video_node.get({
      filter: {
        where: {
          id: { $eq: taskId }
        }
      }
    });

    if (!result.data || !result.data.records || result.data.records.length === 0) {
      return createResponse(404, { error: '任务不存在' });
    }

    const task = result.data.records[0];
    return createResponse(200, {
      id: task.id,
      status: task.status,
      resultUrl: task.resultUrl || null,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    });
  } catch (error) {
    console.error('查询任务失败:', error);
    return createResponse(500, { error: '查询任务失败' });
  }
}

// 生成视频
async function generateVideoHandler(event) {
  try {
    const { taskId } = JSON.parse(event.body || '{}');
    
    if (!taskId) {
      return createResponse(400, { success: false, message: '缺少任务ID' });
    }

    // 查询任务
    const taskResult = await models.video_node.get({
      filter: {
        where: {
          id: { $eq: taskId }
        }
      }
    });

    if (!taskResult.data || !taskResult.data.records || taskResult.data.records.length === 0) {
      return createResponse(404, { success: false, message: '任务不存在' });
    }

    const task = taskResult.data.records[0];
    if (task.status !== 'pending') {
      return createResponse(400, { success: false, message: '任务状态不正确' });
    }

    // 更新状态为处理中
    await models.video_node.update({
      data: {
        status: 'processing',
        updatedAt: new Date()
      },
      filter: {
        where: {
          id: { $eq: taskId }
        }
      }
    });

    // 调用视频生成
    const resultUrl = await generateVideo({
      prompt: task.prompt,
      materialId: task.materialId,
      avatarId: task.avatarId,
      duration: task.duration,
      resolution: task.resolution
    });

    // 更新任务状态
    await models.video_node.update({
      data: {
        status: 'completed',
        resultUrl,
        updatedAt: new Date()
      },
      filter: {
        where: {
          id: { $eq: taskId }
        }
      }
    });

    // 调用计费接口
    try {
      const LAGO_API_KEY = process.env.LAGO_API_KEY;
      const LAGO_BASE_URL = process.env.LAGO_BASE_URL || 'https://api.getlago.com';
      
      if (LAGO_API_KEY) {
        const fetch = require('node-fetch');
        await fetch(`${LAGO_BASE_URL}/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${LAGO_API_KEY}`
          },
          body: JSON.stringify({
            type: 'video_generation',
            taskId,
            duration: task.duration,
            resolution: task.resolution
          })
        });
      }
    } catch (billingError) {
      console.error('计费接口调用失败:', billingError);
    }

    return createResponse(200, { success: true });
  } catch (error) {
    console.error('生成视频失败:', error);
    
    // 更新任务状态为失败
    if (taskId) {
      try {
        await models.video_node.update({
          data: {
            status: 'failed',
            updatedAt: new Date()
          },
          filter: {
            where: {
              id: { $eq: taskId }
            }
          }
        });
      } catch (updateError) {
        console.error('更新失败状态失败:', updateError);
      }
    }
    
    return createResponse(500, { success: false, message: '生成视频失败' });
  }
}

// 处理回调
async function handleWebhook(event) {
  try {
    const { taskId, status, resultUrl } = JSON.parse(event.body || '{}');
    
    if (!taskId || !status) {
      return createResponse(400, { success: false, message: '缺少必要参数' });
    }

    // 更新任务状态
    const updateData = {
      status,
      updatedAt: new Date()
    };
    
    if (resultUrl) {
      updateData.resultUrl = resultUrl;
    }

    await models.video_node.update({
      data: updateData,
      filter: {
        where: {
          id: { $eq: taskId }
        }
      }
    });

    // 这里可以添加通知逻辑
    console.log(`任务 ${taskId} 状态更新为 ${status}`);

    return createResponse(200, { success: true });
  } catch (error) {
    console.error('处理回调失败:', error);
    return createResponse(500, { success: false, message: '处理回调失败' });
  }
}

// 路由分发
exports.main = async (event, context) => {
  const { httpMethod, path } = event;
  
  // 处理预检请求
  if (httpMethod === 'OPTIONS') {
    return createResponse(200, {});
  }

  try {
    switch (`${httpMethod} ${path}`) {
      case 'POST /video-tasks':
        return await createVideoTask(event);
      
      case 'GET /video-tasks/{id}':
        return await getVideoTask(event);
      
      case 'POST /generate-video':
        return await generateVideoHandler(event);
      
      case 'POST /webhook/video-callback':
        return await handleWebhook(event);
      
      default:
        return createResponse(404, { error: '接口不存在' });
    }
  } catch (error) {
    console.error('请求处理失败:', error);
    return createResponse(500, { error: '服务器内部错误' });
  }
};
