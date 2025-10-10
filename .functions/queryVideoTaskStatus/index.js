
'use strict';

const cloudbase = require('@cloudbase/node-sdk');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// 初始化云开发
const app = cloudbase.init();
const models = app.models;

// 平台API配置
const PLATFORM_APIS = {
  'runway': {
    url: 'https://api.runwayml.com/v1/tasks',
    headers: {
      'Authorization': 'Bearer YOUR_RUNWAY_API_KEY',
      'Content-Type': 'application/json'
    }
  },
  'pika': {
    url: 'https://api.pika.art/v1/generations',
    headers: {
      'Authorization': 'Bearer YOUR_PIKA_API_KEY',
      'Content-Type': 'application/json'
    }
  },
  'kling': {
    url: 'https://api.klingai.com/v1/videos',
    headers: {
      'Authorization': 'Bearer YOUR_KLING_API_KEY',
      'Content-Type': 'application/json'
    }
  }
};

// 下载文件到Buffer
async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    client.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`下载失败，状态码: ${res.statusCode}`));
        return;
      }
      
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// 查询平台任务状态
async function queryPlatformStatus(modelType, externalTaskId) {
  const config = PLATFORM_APIS[modelType];
  if (!config) {
    throw new Error(`不支持的平台类型: ${modelType}`);
  }

  return new Promise((resolve, reject) => {
    const url = `${config.url}/${externalTaskId}`;
    const client = url.startsWith('https') ? https : http;
    
    const options = {
      method: 'GET',
      headers: config.headers
    };

    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(new Error('解析平台响应失败'));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
    req.end();
  });
}

// 上传文件到云存储
async function uploadToCloudStorage(buffer, filePath) {
  try {
    const result = await app.uploadFile({
      cloudPath: filePath,
      fileContent: buffer
    });
    
    // 获取临时访问URL
    const tempUrlResult = await app.getTempFileURL({
      fileList: [result.fileID]
    });
    
    return tempUrlResult.fileList[0].tempFileURL;
  } catch (error) {
    throw new Error(`上传文件失败: ${error.message}`);
  }
}

exports.main = async (event, context) => {
  try {
    // 1. 校验输入
    if (!event.taskId || typeof event.taskId !== 'string') {
      return {
        code: 400,
        message: 'taskId 不能为空且必须为字符串'
      };
    }

    // 2. 查询任务记录
    const taskResult = await models.generation_tasks.get({
      filter: {
        where: {
          _id: { $eq: event.taskId }
        }
      }
    });

    if (!taskResult.data || !taskResult.data.records || taskResult.data.records.length === 0) {
      return {
        code: 404,
        message: '任务记录不存在'
      };
    }

    const task = taskResult.data.records[0];
    const { externalTaskId, modelType, status: currentStatus } = task;

    if (!externalTaskId || !modelType) {
      return {
        code: 400,
        message: '任务缺少 externalTaskId 或 modelType'
      };
    }

    // 3. 查询平台状态
    let platformResult;
    try {
      platformResult = await queryPlatformStatus(modelType, externalTaskId);
    } catch (error) {
      console.error('查询平台状态失败:', error);
      return {
        code: 500,
        message: `查询平台状态失败: ${error.message}`
      };
    }

    // 4. 解析平台响应
    let newStatus = currentStatus;
    let outputUrl = task.outputUrl || '';
    let errorMsg = task.errorMsg || '';

    // 根据平台类型解析响应
    if (modelType === 'runway') {
      newStatus = platformResult.status || 'unknown';
      if (platformResult.output && platformResult.output[0]) {
        outputUrl = platformResult.output[0];
      }
      if (platformResult.error) {
        errorMsg = platformResult.error;
      }
    } else if (modelType === 'pika') {
      newStatus = platformResult.status || 'unknown';
      if (platformResult.videoUrl) {
        outputUrl = platformResult.videoUrl;
      }
      if (platformResult.errorMessage) {
        errorMsg = platformResult.errorMessage;
      }
    } else if (modelType === 'kling') {
      newStatus = platformResult.task_status || 'unknown';
      if (platformResult.task_result && platformResult.task_result.videos) {
        outputUrl = platformResult.task_result.videos[0]?.url || '';
      }
      if (platformResult.task_message) {
        errorMsg = platformResult.task_message;
      }
    }

    // 5. 更新本地任务
    const updateData = {
      status: newStatus,
      outputUrl: outputUrl,
      errorMsg: errorMsg,
      updatedAt: new Date().toISOString()
    };

    await models.generation_tasks.update({
      data: updateData,
      filter: {
        where: {
          _id: { $eq: event.taskId }
        }
      }
    });

    // 6. 如果状态为success且outputUrl存在，下载并上传到云存储
    if (newStatus === 'success' && outputUrl && !outputUrl.startsWith('cloud://')) {
      try {
        console.log('开始下载视频文件...');
        const videoBuffer = await downloadFile(outputUrl);
        
        const fileName = `${event.taskId}.mp4`;
        const cloudPath = `videos/${fileName}`;
        
        console.log('开始上传到云存储...');
        const cloudStorageUrl = await uploadToCloudStorage(videoBuffer, cloudPath);
        
        // 更新outputUrl为云存储URL
        await models.generation_tasks.update({
          data: {
            outputUrl: cloudStorageUrl,
            updatedAt: new Date().toISOString()
          },
          filter: {
            where: {
              _id: { $eq: event.taskId }
            }
          }
        });
        
        outputUrl = cloudStorageUrl;
        console.log('视频已成功上传到云存储:', cloudStorageUrl);
      } catch (error) {
        console.error('下载或上传视频失败:', error);
        // 不中断主流程，仅记录错误
      }
    }

    // 7. 返回最新任务信息
    const finalResult = await models.generation_tasks.get({
      filter: {
        where: {
          _id: { $eq: event.taskId }
        }
      }
    });

    const finalTask = finalResult.data.records[0];

    return {
      code: 200,
      data: {
        taskId: finalTask._id,
        externalTaskId: finalTask.externalTaskId,
        modelType: finalTask.modelType,
        status: finalTask.status,
        outputUrl: finalTask.outputUrl,
        errorMsg: finalTask.errorMsg,
        updatedAt: finalTask.updatedAt
      }
    };

  } catch (error) {
    console.error('云函数执行错误:', error);
    return {
      code: 500,
      message: `服务器内部错误: ${error.message}`
    };
  }
};
