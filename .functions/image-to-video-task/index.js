
'use strict';

const cloudbase = require('@cloudbase/node-sdk');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

const app = cloudbase.init();
const models = app.models;
const storage = app.storage;

// AI 视频合成服务配置
const AI_SERVICE_CONFIG = {
  apiUrl: process.env.AI_VIDEO_API_URL || 'https://api.ti.tencentcloudapi.com',
  secretId: process.env.AI_SECRET_ID,
  secretKey: process.env.AI_SECRET_KEY,
  region: process.env.AI_REGION || 'ap-beijing'
};

// 默认配置
const DEFAULT_OPTIONS = {
  duration: 5,
  fps: 24,
  resolution: [1280, 720]
};

// 创建任务记录
async function createTaskRecord(images, options) {
  const taskId = crypto.randomUUID();
  
  const task = await models['image-to-video-task'].create({
    data: {
      taskId,
      images,
      options: { ...DEFAULT_OPTIONS, ...options },
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
  
  return task.data;
}

// 下载图片到临时目录
async function downloadImages(images) {
  const tempDir = path.join('/tmp', 'images-' + Date.now());
  await fs.ensureDir(tempDir);
  
  const downloadPromises = images.map(async (fileId, index) => {
    try {
      const fileName = `image_${index}.jpg`;
      const localPath = path.join(tempDir, fileName);
      
      const result = await storage.downloadFile({
        fileID: fileId,
        tempFilePath: localPath
      });
      
      return localPath;
    } catch (error) {
      throw new Error(`下载图片失败: ${fileId}, ${error.message}`);
    }
  });
  
  const localPaths = await Promise.all(downloadPromises);
  return { tempDir, localPaths };
}

// 调用 AI 视频合成服务
async function callVideoSynthesis(localPaths, options) {
  // 这里模拟调用 AI 服务，实际使用时替换为真实的 API 调用
  console.log('开始调用 AI 视频合成服务...');
  console.log('图片路径:', localPaths);
  console.log('配置参数:', options);
  
  // 模拟 API 调用延迟
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // 模拟成功响应
  const videoPath = path.join('/tmp', `output_${Date.now()}.mp4`);
  
  // 这里应该调用真实的 AI 服务 API
  // 示例代码：
  /*
  const response = await fetch(`${AI_SERVICE_CONFIG.apiUrl}/video-synthesis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_SERVICE_CONFIG.secretId}`
    },
    body: JSON.stringify({
      images: localPaths,
      duration: options.duration,
      fps: options.fps,
      resolution: options.resolution
    })
  });
  
  const result = await response.json();
  if (result.error) {
    throw new Error(result.error);
  }
  
  return result.videoUrl;
  */
  
  // 模拟创建空视频文件
  await fs.writeFile(videoPath, '');
  
  return videoPath;
}

// 上传视频到云存储
async function uploadVideo(localVideoPath) {
  const fileName = `video_${Date.now()}.mp4`;
  const cloudPath = `videos/${fileName}`;
  
  try {
    const result = await storage.uploadFile({
      cloudPath,
      fileContent: fs.createReadStream(localVideoPath)
    });
    
    return result.fileID;
  } catch (error) {
    throw new Error(`上传视频失败: ${error.message}`);
  }
}

// 更新任务状态
async function updateTaskStatus(taskId, status, videoFileId = null, error = null) {
  const updateData = {
    status,
    updatedAt: new Date()
  };
  
  if (videoFileId) {
    updateData.videoFileId = videoFileId;
  }
  
  if (error) {
    updateData.error = error;
  }
  
  await models['image-to-video-task'].update({
    where: { taskId },
    data: updateData
  });
}

// 发送回调通知
async function sendCallback(callbackFunction, taskData) {
  if (!callbackFunction) return;
  
  try {
    await app.callFunction({
      name: callbackFunction,
      data: {
        taskId: taskData.taskId,
        status: taskData.status,
        videoFileId: taskData.videoFileId,
        error: taskData.error
      }
    });
  } catch (error) {
    console.error('回调通知失败:', error);
  }
}

// 清理临时文件
async function cleanup(tempDir) {
  try {
    await fs.remove(tempDir);
  } catch (error) {
    console.error('清理临时文件失败:', error);
  }
}

exports.main = async (event, context) => {
  const { images, options = {}, callback } = event;
  
  try {
    // 参数校验
    if (!Array.isArray(images) || images.length === 0) {
      throw new Error('images 必须是非空数组');
    }
    
    for (const fileId of images) {
      if (!fileId || typeof fileId !== 'string') {
        throw new Error('每个图片 fileID 必须是有效的字符串');
      }
    }
    
    // 创建任务记录
    const task = await createTaskRecord(images, options);
    const taskId = task.taskId;
    
    // 异步处理任务
    (async () => {
      let tempDir = null;
      try {
        // 更新状态为处理中
        await updateTaskStatus(taskId, 'processing');
        
        // 下载图片
        const { tempDir: dir, localPaths } = await downloadImages(images);
        tempDir = dir;
        
        // 调用 AI 视频合成
        const videoPath = await callVideoSynthesis(localPaths, { ...DEFAULT_OPTIONS, ...options });
        
        // 上传视频
        const videoFileId = await uploadVideo(videoPath);
        
        // 更新任务状态为成功
        await updateTaskStatus(taskId, 'success', videoFileId);
        
        // 发送回调
        await sendCallback(callback, {
          taskId,
          status: 'success',
          videoFileId
        });
        
        // 清理临时文件
        await cleanup(tempDir);
        
      } catch (error) {
        console.error('任务处理失败:', error);
        
        // 更新任务状态为失败
        await updateTaskStatus(taskId, 'failed', null, error.message);
        
        // 发送回调
        await sendCallback(callback, {
          taskId,
          status: 'failed',
          error: error.message
        });
        
        // 清理临时文件
        if (tempDir) {
          await cleanup(tempDir);
        }
      }
    })();
    
    // 同步返回任务 ID
    return {
      taskId,
      status: 'pending'
    };
    
  } catch (error) {
    console.error('创建任务失败:', error);
    throw error;
  }
};
