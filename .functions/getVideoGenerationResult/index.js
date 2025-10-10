
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');
    const https = require('https');
    const fs = require('fs');
    const path = require('path');

    // 初始化云开发
    const app = cloudbase.init({
      env: cloudbase.SYMBOL_CURRENT_ENV
    });

    const models = app.models;
    const storage = app.storage;

    // 视频生成API配置
    const VIDEO_API_CONFIG = {
      baseUrl: process.env.VIDEO_API_BASE_URL || 'https://api.videogen.com',
      apiKey: process.env.VIDEO_API_KEY,
      timeout: 30000
    };

    /**
     * 查询视频生成任务状态
     * @param {string} taskId - 视频生成任务ID
     * @returns {Promise<Object>} 任务状态信息
     */
    async function queryVideoTaskStatus(taskId) {
      return new Promise((resolve, reject) => {
        const url = `${VIDEO_API_CONFIG.baseUrl}/api/v1/tasks/${taskId}`;
        const options = {
          headers: {
            'Authorization': `Bearer ${VIDEO_API_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: VIDEO_API_CONFIG.timeout
        };

        https.get(url, options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const result = JSON.parse(data);
              resolve(result);
            } catch (error) {
              reject(new Error('Invalid response format'));
            }
          });
        }).on('error', reject);
      });
    }

    /**
     * 下载视频文件到临时目录
     * @param {string} videoUrl - 视频文件URL
     * @param {string} taskId - 任务ID
     * @returns {Promise<string>} 本地文件路径
     */
    async function downloadVideo(videoUrl, taskId) {
      return new Promise((resolve, reject) => {
        const tempDir = '/tmp';
        const fileName = `${taskId}.mp4`;
        const filePath = path.join(tempDir, fileName);
        
        const file = fs.createWriteStream(filePath);
        
        https.get(videoUrl, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Download failed with status ${response.statusCode}`));
            return;
          }
          
          response.pipe(file);
          
          file.on('finish', () => {
            file.close();
            resolve(filePath);
          });
          
          file.on('error', (err) => {
            fs.unlink(filePath, () => {});
            reject(err);
          });
        }).on('error', reject);
      });
    }

    /**
     * 上传视频到云存储
     * @param {string} filePath - 本地文件路径
     * @param {string} taskId - 任务ID
     * @returns {Promise<string>} 云存储文件ID
     */
    async function uploadToCloudStorage(filePath, taskId) {
      try {
        const fileName = `videos/${taskId}.mp4`;
        const fileContent = fs.createReadStream(filePath);
        
        const result = await storage.uploadFile({
          cloudPath: fileName,
          fileContent: fileContent
        });
        
        // 清理临时文件
        fs.unlink(filePath, () => {});
        
        return result.fileID;
      } catch (error) {
        // 清理临时文件
        fs.unlink(filePath, () => {});
        throw error;
      }
    }

    /**
     * 更新任务状态
     * @param {string} taskId - 任务ID
     * @param {Object} updateData - 更新数据
     * @returns {Promise<Object>} 更新后的任务
     */
    async function updateTaskStatus(taskId, updateData) {
      const result = await models.generation_tasks.update({
        data: {
          ...updateData,
          updatedAt: new Date().toISOString()
        },
        filter: {
          where: {
            _id: {
              $eq: taskId
            }
          }
        }
      });
      
      if (!result.data || result.data.length === 0) {
        throw new Error('Task not found');
      }
      
      return result.data[0];
    }

    /**
     * 获取需要轮询的任务列表
     * @returns {Promise<Array>} 任务列表
     */
    async function getPendingTasks() {
      const result = await models.generation_tasks.list({
        filter: {
          where: {
            status: {
              $in: ['pending', 'processing']
            }
          }
        },
        select: {
          _id: true,
          externalTaskId: true,
          status: true,
          progress: true
        }
      });
      
      return result.data.records || [];
    }

    /**
     * 处理单个任务
     * @param {string} taskId - 任务ID
     * @returns {Promise<Object>} 处理结果
     */
    async function processTask(taskId) {
      try {
        // 1. 查询任务记录
        const taskResult = await models.generation_tasks.get({
          filter: {
            where: {
              _id: {
                $eq: taskId
              }
            }
          }
        });
        
        if (!taskResult.data || taskResult.data.length === 0) {
          throw new Error('Task not found');
        }
        
        const task = taskResult.data[0];
        
        // 2. 查询视频生成状态
        const videoStatus = await queryVideoTaskStatus(task.externalTaskId);
        
        // 3. 更新任务状态
        const updateData = {
          status: videoStatus.status,
          progress: videoStatus.progress || 0,
          resultUrl: videoStatus.videoUrl || null,
          errorMessage: videoStatus.error || null
        };
        
        // 4. 如果状态为已生成，下载并上传视频
        if (videoStatus.status === 'completed' && videoStatus.videoUrl) {
          console.log(`Downloading video for task ${taskId}...`);
          const localPath = await downloadVideo(videoStatus.videoUrl, taskId);
          
          console.log(`Uploading video to cloud storage...`);
          const fileId = await uploadToCloudStorage(localPath, taskId);
          
          updateData.videoUrl = fileId;
          updateData.status = 'generated';
        }
        
        // 5. 更新数据库
        const updatedTask = await updateTaskStatus(taskId, updateData);
        
        return {
          success: true,
          data: updatedTask
        };
        
      } catch (error) {
        console.error(`Error processing task ${taskId}:`, error);
        
        // 更新错误状态
        try {
          await updateTaskStatus(taskId, {
            status: 'failed',
            errorMessage: error.message
          });
        } catch (updateError) {
          console.error('Failed to update error status:', updateError);
        }
        
        return {
          success: false,
          error: {
            code: 'PROCESS_ERROR',
            message: error.message
          }
        };
      }
    }

    exports.main = async (event, context) => {
      try {
        // 根据触发方式决定处理逻辑
        if (event.taskId) {
          // 单个任务处理（API调用或回调）
          console.log(`Processing single task: ${event.taskId}`);
          return await processTask(event.taskId);
        } else {
          // 定时触发器 - 批量处理待处理任务
          console.log('Processing pending tasks via timer...');
          const pendingTasks = await getPendingTasks();
          
          const results = [];
          for (const task of pendingTasks) {
            console.log(`Processing task: ${task._id}`);
            const result = await processTask(task._id);
            results.push({
              taskId: task._id,
              ...result
            });
          }
          
          return {
            success: true,
            processedCount: results.length,
            results: results
          };
        }
        
      } catch (error) {
        console.error('Function execution error:', error);
        return {
          success: false,
          error: {
            code: 'FUNCTION_ERROR',
            message: error.message
          }
        };
      }
    };
  