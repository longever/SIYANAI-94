
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');
    const https = require('https');
    const http = require('http');

    // 初始化云开发
    const app = cloudbase.init({
      env: cloudbase.SYMBOL_CURRENT_ENV
    });
    const models = app.models;

    // 原平台配置（请根据实际情况修改）
    const ORIGIN_PLATFORM = {
      baseUrl: 'https://api.example.com', // 替换为实际平台地址
      apiKey: process.env.ORIGIN_API_KEY || 'your-api-key', // 从环境变量获取
      timeout: 30000
    };

    /**
     * 从原平台查询任务状态
     * @param {string} taskId - 任务ID
     * @returns {Promise<{status: string, progress: number, videoUrl?: string}>}
     */
    async function queryOriginPlatformStatus(taskId) {
      return new Promise((resolve, reject) => {
        const url = `${ORIGIN_PLATFORM.baseUrl}/tasks/${taskId}`;
        const options = {
          headers: {
            'Authorization': `Bearer ${ORIGIN_PLATFORM.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: ORIGIN_PLATFORM.timeout
        };

        const client = url.startsWith('https:') ? https : http;
        
        client.get(url, options, (res) => {
          let data = '';
          
          res.on('data', chunk => {
            data += chunk;
          });
          
          res.on('end', () => {
            try {
              const result = JSON.parse(data);
              resolve({
                status: result.status || 'unknown',
                progress: result.progress || 0,
                videoUrl: result.video_url
              });
            } catch (error) {
              reject(new Error('解析原平台响应失败'));
            }
          });
        }).on('error', (error) => {
          reject(new Error(`查询原平台失败: ${error.message}`));
        });
      });
    }

    /**
     * 下载视频到内存
     * @param {string} videoUrl - 视频下载地址
     * @returns {Promise<Buffer>}
     */
    async function downloadVideo(videoUrl) {
      return new Promise((resolve, reject) => {
        const client = videoUrl.startsWith('https:') ? https : http;
        const chunks = [];
        
        client.get(videoUrl, { timeout: 60000 }, (res) => {
          if (res.statusCode !== 200) {
            reject(new Error(`下载失败，状态码: ${res.statusCode}`));
            return;
          }
          
          res.on('data', chunk => {
            chunks.push(chunk);
          });
          
          res.on('end', () => {
            resolve(Buffer.concat(chunks));
          });
          
          res.on('error', (error) => {
            reject(new Error(`下载视频失败: ${error.message}`));
          });
        }).on('error', (error) => {
          reject(new Error(`下载视频失败: ${error.message}`));
        });
      });
    }

    /**
     * 上传视频到云存储
     * @param {Buffer} videoBuffer - 视频Buffer
     * @param {string} taskId - 任务ID
     * @returns {Promise<string>} 云存储地址
     */
    async function uploadToCloudStorage(videoBuffer, taskId) {
      const fileName = `videos/${taskId}.mp4`;
      
      try {
        const result = await app.uploadFile({
          cloudPath: fileName,
          fileContent: videoBuffer
        });
        
        return result.fileID;
      } catch (error) {
        throw new Error(`上传云存储失败: ${error.message}`);
      }
    }

    /**
     * 更新任务记录
     * @param {string} taskId - 任务ID
     * @param {object} updateData - 更新数据
     */
    async function updateTaskRecord(taskId, updateData) {
      try {
        await models.generation_tasks.update({
          data: updateData,
          filter: {
            where: {
              task_id: {
                $eq: taskId
              }
            }
          }
        });
      } catch (error) {
        throw new Error(`更新任务记录失败: ${error.message}`);
      }
    }

    exports.main = async (event, context) => {
      const { task_id } = event;
      
      if (!task_id) {
        return {
          error: '缺少 task_id 参数',
          task_id: null,
          status: null,
          progress: 0
        };
      }

      try {
        // 1. 查询任务记录
        const taskRecord = await models.generation_tasks.get({
          filter: {
            where: {
              task_id: {
                $eq: task_id
              }
            }
          }
        });

        if (!taskRecord.data || !taskRecord.data.records || taskRecord.data.records.length === 0) {
          return {
            error: '任务不存在',
            task_id: task_id,
            status: null,
            progress: 0
          };
        }

        const task = taskRecord.data.records[0];

        // 2. 查询原平台状态
        let platformStatus;
        try {
          platformStatus = await queryOriginPlatformStatus(task_id);
        } catch (error) {
          console.error('查询原平台失败:', error);
          return {
            error: '查询原平台状态失败',
            task_id: task_id,
            status: task.status || 'unknown',
            progress: task.progress || 0,
            video_url: task.video_url || null
          };
        }

        // 3. 准备更新数据
        const updateData = {
          status: platformStatus.status,
          progress: platformStatus.progress,
          updated_at: new Date()
        };

        let videoUrl = null;

        // 4. 如果状态为 completed 且需要下载视频
        if (platformStatus.status === 'completed' && platformStatus.videoUrl && !task.video_url) {
          try {
            console.log('开始下载视频...');
            const videoBuffer = await downloadVideo(platformStatus.videoUrl);
            console.log('视频下载完成，开始上传...');
            
            videoUrl = await uploadToCloudStorage(videoBuffer, task_id);
            updateData.video_url = videoUrl;
            console.log('视频上传完成:', videoUrl);
          } catch (error) {
            console.error('视频处理失败:', error);
            // 不中断流程，继续更新状态
            updateData.video_url = null;
          }
        } else if (task.video_url) {
          videoUrl = task.video_url;
        }

        // 5. 更新任务记录
        await updateTaskRecord(task_id, updateData);

        // 6. 返回结果
        const result = {
          task_id: task_id,
          status: platformStatus.status,
          progress: platformStatus.progress
        };

        if (videoUrl) {
          result.video_url = videoUrl;
        }

        return result;

      } catch (error) {
        console.error('云函数执行错误:', error);
        
        return {
          error: error.message || '查询任务失败',
          task_id: task_id,
          status: null,
          progress: 0
        };
      }
    };
  