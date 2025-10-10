
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');
    const crypto = require('crypto');

    // 初始化云开发
    const app = cloudbase.init();
    const models = app.models;

    // 平台配置
    const PLATFORM_CONFIG = {
      'runway': {
        apiUrl: 'https://api.runwayml.com/v1/status',
        authHeader: 'Bearer',
        authKey: process.env.RUNWAY_API_KEY
      },
      'pika': {
        apiUrl: 'https://api.pika.art/v1/jobs',
        authHeader: 'X-API-Key',
        authKey: process.env.PIKA_API_KEY
      },
      'kling': {
        apiUrl: 'https://api.klingai.com/v1/videos',
        authHeader: 'Authorization',
        authKey: process.env.KLING_API_KEY
      }
    };

    // 生成唯一文件名
    function generateUniqueFilename(originalName) {
      const timestamp = Date.now();
      const randomStr = crypto.randomBytes(8).toString('hex');
      const extension = originalName.split('.').pop() || 'mp4';
      return `videos/${timestamp}_${randomStr}.${extension}`;
    }

    // 查询平台状态
    async function queryPlatformStatus(platformTaskId, modelType) {
      const config = PLATFORM_CONFIG[modelType];
      if (!config) {
        throw new Error(`不支持的平台类型: ${modelType}`);
      }

      const url = `${config.apiUrl}/${platformTaskId}`;
      const headers = {
        'Content-Type': 'application/json'
      };
      
      headers[config.authHeader] = config.authKey;

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: headers
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // 根据不同平台解析状态
        let status, videoUrl, errorMessage;
        
        switch (modelType) {
          case 'runway':
            status = data.status;
            videoUrl = data.output?.[0];
            errorMessage = data.error;
            break;
          case 'pika':
            status = data.status;
            videoUrl = data.video_url;
            errorMessage = data.error_message;
            break;
          case 'kling':
            status = data.data?.status;
            videoUrl = data.data?.video_url;
            errorMessage = data.message;
            break;
          default:
            throw new Error(`未知的平台类型: ${modelType}`);
        }

        return {
          status: status?.toLowerCase() || 'processing',
          videoUrl,
          errorMessage
        };
      } catch (error) {
        console.error('查询平台状态失败:', error);
        throw new Error(`查询平台状态失败: ${error.message}`);
      }
    }

    // 下载视频文件
    async function downloadVideo(videoUrl) {
      try {
        const response = await fetch(videoUrl);
        if (!response.ok) {
          throw new Error(`下载失败: HTTP ${response.status}`);
        }
        
        const buffer = await response.arrayBuffer();
        return Buffer.from(buffer);
      } catch (error) {
        console.error('下载视频失败:', error);
        throw new Error(`下载视频失败: ${error.message}`);
      }
    }

    // 上传到云存储
    async function uploadToCloudStorage(buffer, filename) {
      try {
        const uploadResult = await app.uploadFile({
          cloudPath: filename,
          fileContent: buffer
        });
        
        const fileId = uploadResult.fileID;
        const tempUrl = await app.getTempFileURL({
          fileList: [fileId]
        });
        
        return tempUrl.fileList[0].tempFileURL;
      } catch (error) {
        console.error('上传云存储失败:', error);
        throw new Error(`上传云存储失败: ${error.message}`);
      }
    }

    // 主函数
    exports.main = async (event, context) => {
      const { taskId } = event;
      
      if (!taskId) {
        return {
          status: 'failed',
          errorMessage: '缺少 taskId 参数',
          lastQueryTime: new Date().toISOString()
        };
      }

      try {
        // 1. 查询本地任务记录
        const taskRecord = await models.generation_tasks.get({
          filter: {
            where: {
              _id: taskId
            }
          }
        });

        if (!taskRecord.data) {
          return {
            status: 'failed',
            errorMessage: '任务记录不存在',
            lastQueryTime: new Date().toISOString()
          };
        }

        const task = taskRecord.data;
        const { platformTaskId, modelType } = task;

        if (!platformTaskId || !modelType) {
          return {
            status: 'failed',
            errorMessage: '任务信息不完整',
            lastQueryTime: new Date().toISOString()
          };
        }

        // 2. 查询平台状态
        const platformResult = await queryPlatformStatus(platformTaskId, modelType);
        const { status, videoUrl, errorMessage } = platformResult;

        // 3. 根据状态处理
        let updateData = {
          lastQueryTime: new Date().toISOString()
        };

        if (status === 'completed' && videoUrl) {
          // 下载并上传视频
          const videoBuffer = await downloadVideo(videoUrl);
          const filename = generateUniqueFilename(`video_${taskId}.mp4`);
          const cloudUrl = await uploadToCloudStorage(videoBuffer, filename);
          
          updateData = {
            ...updateData,
            status: 'completed',
            videoUrl: cloudUrl,
            finishTime: new Date().toISOString()
          };
        } else if (status === 'failed') {
          updateData = {
            ...updateData,
            status: 'failed',
            errorMessage: errorMessage || '平台处理失败',
            finishTime: new Date().toISOString()
          };
        } else {
          // 仍在处理中，只更新时间戳
          updateData.status = 'processing';
        }

        // 4. 更新本地记录
        await models.generation_tasks.update({
          filter: {
            where: {
              _id: taskId
            }
          },
          data: updateData
        });

        // 5. 返回最新状态
        const updatedTask = await models.generation_tasks.get({
          filter: {
            where: {
              _id: taskId
            }
          }
        });

        const result = {
          status: updatedTask.data.status,
          lastQueryTime: updatedTask.data.lastQueryTime
        };

        if (updatedTask.data.status === 'completed') {
          result.videoUrl = updatedTask.data.videoUrl;
        }

        if (updatedTask.data.status === 'failed') {
          result.errorMessage = updatedTask.data.errorMessage;
        }

        return result;

      } catch (error) {
        console.error('查询任务状态失败:', error);
        return {
          status: 'failed',
          errorMessage: error.message || '查询任务状态失败',
          lastQueryTime: new Date().toISOString()
        };
      }
    };
  