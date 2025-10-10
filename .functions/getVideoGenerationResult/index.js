
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');
    const https = require('https');
    const http = require('http');
    const { URL } = require('url');

    // 初始化云开发
    const app = cloudbase.init({
      env: cloudbase.SYMBOL_CURRENT_ENV
    });
    const models = app.models;

    /**
     * 从URL下载文件到云存储
     * @param {string} videoUrl - 视频URL
     * @param {string} taskId - 任务ID
     * @returns {Promise<string>} 云存储文件ID
     */
    async function downloadVideoToCloudStorage(videoUrl, taskId) {
      return new Promise((resolve, reject) => {
        const url = new URL(videoUrl);
        const client = url.protocol === 'https:' ? https : http;
        
        client.get(videoUrl, async (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to download video: ${response.statusCode}`));
            return;
          }

          const fileName = `videos/${taskId}_${Date.now()}.mp4`;
          
          try {
            const uploadResult = await app.uploadFile({
              cloudPath: fileName,
              fileContent: response
            });
            resolve(uploadResult.fileID);
          } catch (error) {
            reject(error);
          }
        }).on('error', reject);
      });
    }

    /**
     * 调用视频生成API获取任务结果
     * @param {string} taskId - 任务ID
     * @returns {Promise<Object>} API响应数据
     */
    async function getVideoGenerationStatus(taskId) {
      return new Promise((resolve, reject) => {
        const apiUrl = `https://api.xxx.com/v1/tasks/${taskId}`;
        const url = new URL(apiUrl);
        const client = url.protocol === 'https:' ? https : http;

        const options = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: url.pathname + url.search,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'CloudBase-SCF/1.0'
          }
        };

        const req = client.request(options, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const result = JSON.parse(data);
              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(result);
              } else {
                reject(new Error(`API Error: ${res.statusCode} - ${result.message || data}`));
              }
            } catch (error) {
              reject(new Error(`Invalid JSON response: ${error.message}`));
            }
          });
        });

        req.on('error', (error) => {
          reject(new Error(`Network error: ${error.message}`));
        });

        req.setTimeout(30000, () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });

        req.end();
      });
    }

    exports.main = async (event, context) => {
      try {
        // 1. 参数校验
        const { taskId } = event;
        
        if (!taskId || typeof taskId !== 'string' || taskId.trim() === '') {
          return {
            code: 400,
            message: 'Invalid taskId: taskId is required and must be a non-empty string',
            data: null
          };
        }

        // 2. 查询任务记录
        const taskQuery = await models.generation_tasks.get({
          filter: {
            where: {
              taskId: {
                $eq: taskId
              }
            }
          }
        });

        if (!taskQuery.data || !taskQuery.data.records || taskQuery.data.records.length === 0) {
          return {
            code: 404,
            message: 'Task not found',
            data: null
          };
        }

        const taskRecord = taskQuery.data.records[0];

        // 3. 调用视频生成结果API
        let apiResult;
        try {
          apiResult = await getVideoGenerationStatus(taskId);
        } catch (apiError) {
          console.error('API call failed:', apiError);
          return {
            code: 502,
            message: `Failed to fetch video generation status: ${apiError.message}`,
            data: null
          };
        }

        // 提取API返回的关键字段
        const { status, progress, videoUrl } = apiResult;

        // 4. 更新任务状态与进度
        const updateData = {
          status: status || taskRecord.status,
          progress: progress !== undefined ? progress : taskRecord.progress,
          updatedAt: new Date().toISOString()
        };

        await models.generation_tasks.update({
          data: updateData,
          filter: {
            where: {
              _id: {
                $eq: taskRecord._id
              }
            }
          }
        });

        // 5. 如果状态为completed且有videoUrl，下载视频到云存储
        let cloudStorageUrl = taskRecord.outputUrl;
        
        if (status === 'completed' && videoUrl && !cloudStorageUrl) {
          try {
            console.log('Downloading video to cloud storage...');
            cloudStorageUrl = await downloadVideoToCloudStorage(videoUrl, taskId);
            
            // 6. 更新outputUrl
            await models.generation_tasks.update({
              data: {
                outputUrl: cloudStorageUrl,
                updatedAt: new Date().toISOString()
              },
              filter: {
                where: {
                  _id: {
                    $eq: taskRecord._id
                  }
                }
              }
            });
            
            console.log('Video uploaded to cloud storage:', cloudStorageUrl);
          } catch (downloadError) {
            console.error('Failed to download/upload video:', downloadError);
            // 不中断流程，继续返回任务信息
          }
        }

        // 7. 返回最新任务信息
        const updatedTaskQuery = await models.generation_tasks.get({
          filter: {
            where: {
              _id: {
                $eq: taskRecord._id
              }
            }
          }
        });

        const updatedTask = updatedTaskQuery.data.records[0];

        return {
          code: 200,
          message: 'Success',
          data: {
            taskId: updatedTask.taskId,
            status: updatedTask.status,
            progress: updatedTask.progress,
            outputUrl: updatedTask.outputUrl || null,
            createdAt: updatedTask.createdAt,
            updatedAt: updatedTask.updatedAt,
            ...updatedTask
          }
        };

      } catch (error) {
        console.error('Unexpected error in getVideoGenerationResult:', error);
        return {
          code: 500,
          message: `Internal server error: ${error.message}`,
          data: null
        };
      }
    };
  