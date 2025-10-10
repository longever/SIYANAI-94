
'use strict';

const cloudbase = require('@cloudbase/node-sdk');
const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV
});

const models = app.models;

// 平台API配置
const PLATFORM_APIS = {
  runway: {
    baseUrl: 'https://api.runwayml.com/v1',
    queryEndpoint: '/tasks',
    headers: {
      'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
      'Content-Type': 'application/json'
    }
  },
  pika: {
    baseUrl: 'https://api.pika.art/v1',
    queryEndpoint: '/generations',
    headers: {
      'Authorization': `Bearer ${process.env.PIKA_API_KEY}`,
      'Content-Type': 'application/json'
    }
  },
  stablevideo: {
    baseUrl: 'https://api.stablevideo.com/v1',
    queryEndpoint: '/tasks',
    headers: {
      'Authorization': `Bearer ${process.env.STABLEVIDEO_API_KEY}`,
      'Content-Type': 'application/json'
    }
  }
};

/**
 * 查询平台任务状态
 * @param {string} modelType - 平台类型
 * @param {string} platformTaskId - 平台任务ID
 * @returns {Promise<Object>} 平台返回的任务状态
 */
async function queryPlatformStatus(modelType, platformTaskId) {
  const platform = PLATFORM_APIS[modelType.toLowerCase()];
  if (!platform) {
    throw new Error(`不支持的平台类型: ${modelType}`);
  }

  const url = `${platform.baseUrl}${platform.queryEndpoint}/${platformTaskId}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: platform.headers
    });

    if (!response.ok) {
      throw new Error(`平台API调用失败: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw new Error(`查询平台状态失败: ${error.message}`);
  }
}

/**
 * 下载视频到云存储
 * @param {string} videoUrl - 视频下载地址
 * @param {string} taskId - 本地任务ID
 * @returns {Promise<string>} 云存储文件URL
 */
async function downloadAndUploadVideo(videoUrl, taskId) {
  try {
    // 下载视频
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`下载视频失败: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    
    // 上传到云存储
    const cloudPath = `videos/${taskId}.mp4`;
    const uploadResult = await app.uploadFile({
      cloudPath,
      fileContent: Buffer.from(buffer)
    });

    // 获取临时访问URL
    const fileUrl = await app.getTempFileURL({
      fileList: [uploadResult.fileID]
    });

    return fileUrl.fileList[0].tempFileURL;
  } catch (error) {
    throw new Error(`视频处理失败: ${error.message}`);
  }
}

/**
 * 更新任务状态
 * @param {string} taskId - 任务ID
 * @param {Object} updateData - 更新数据
 */
async function updateTaskStatus(taskId, updateData) {
  try {
    await models.generation_tasks.update({
      filter: {
        where: {
          _id: {
            $eq: taskId
          }
        }
      },
      data: {
        ...updateData,
        updatedAt: Date.now()
      }
    });
  } catch (error) {
    throw new Error(`更新任务状态失败: ${error.message}`);
  }
}

exports.main = async (event, context) => {
  try {
    const { taskId } = event;

    // 1. 参数校验
    if (!taskId || typeof taskId !== 'string') {
      return {
        success: false,
        error: 'taskId 不能为空且必须是字符串'
      };
    }

    // 2. 查询本地任务
    const taskResult = await models.generation_tasks.get({
      filter: {
        where: {
          _id: {
            $eq: taskId
          }
        }
      },
      select: {
        _id: true,
        platformTaskId: true,
        modelType: true,
        status: true,
        outputUrl: true
      }
    });

    if (!taskResult.data) {
      return {
        success: false,
        error: '任务不存在'
      };
    }

    const task = taskResult.data;
    
    // 3. 调用平台查询API
    const platformResult = await queryPlatformStatus(
      task.modelType, 
      task.platformTaskId
    );

    // 提取状态（根据不同平台的响应格式）
    let status = 'unknown';
    let videoUrl = null;
    
    // 根据平台类型解析响应
    switch (task.modelType.toLowerCase()) {
      case 'runway':
        status = platformResult.status || 'unknown';
        videoUrl = platformResult.output?.url || platformResult.video_url;
        break;
      case 'pika':
        status = platformResult.status || 'unknown';
        videoUrl = platformResult.video?.url || platformResult.video_url;
        break;
      case 'stablevideo':
        status = platformResult.status || 'unknown';
        videoUrl = platformResult.video_url || platformResult.output?.url;
        break;
      default:
        status = platformResult.status || 'unknown';
        videoUrl = platformResult.video_url || platformResult.output?.url;
    }

    let outputUrl = null;

    // 4. 状态判断和处理
    if (status === 'completed' && videoUrl) {
      try {
        // 下载视频到云存储
        outputUrl = await downloadAndUploadVideo(videoUrl, taskId);
        
        // 更新任务状态
        await updateTaskStatus(taskId, {
          status: 'completed',
          outputUrl: outputUrl
        });
      } catch (downloadError) {
        console.error('视频下载失败:', downloadError);
        
        // 更新为失败状态
        await updateTaskStatus(taskId, {
          status: 'failed',
          outputUrl: null,
          error: downloadError.message
        });
        
        return {
          success: false,
          error: '视频下载失败',
          details: downloadError.message
        };
      }
    } else if (status === 'failed') {
      // 更新失败状态
      await updateTaskStatus(taskId, {
        status: 'failed',
        outputUrl: null,
        error: platformResult.error || '平台任务失败'
      });
    } else {
      // 更新其他状态
      await updateTaskStatus(taskId, {
        status: status,
        outputUrl: null
      });
    }

    // 6. 返回结果
    return {
      success: true,
      data: {
        status,
        outputUrl,
        platformData: platformResult // 透传平台原始数据
      }
    };

  } catch (error) {
    console.error('查询任务状态失败:', error);
    
    return {
      success: false,
      error: '查询任务状态失败',
      details: error.message
    };
  }
};
