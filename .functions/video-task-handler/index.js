
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');
    const https = require('https');
    const http = require('http');
    const url = require('url');

    // 初始化 CloudBase SDK
    const app = cloudbase.init();
    const models = app.models;

    /**
     * 下载文件到 Buffer
     * @param {string} downloadUrl - 文件下载地址
     * @returns {Promise<Buffer>} - 文件 Buffer
     */
    async function downloadFile(downloadUrl) {
      return new Promise((resolve, reject) => {
        const parsedUrl = url.parse(downloadUrl);
        const client = parsedUrl.protocol === 'https:' ? https : http;
        
        client.get(downloadUrl, (res) => {
          if (res.statusCode !== 200) {
            reject(new Error(`下载失败，状态码: ${res.statusCode}`));
            return;
          }
          
          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        }).on('error', reject);
      });
    }

    /**
     * 上传文件到云存储
     * @param {Buffer} buffer - 文件 Buffer
     * @param {string} fileName - 文件名
     * @returns {Promise<string>} - 云存储文件 ID
     */
    async function uploadToCloudStorage(buffer, fileName) {
      const cloudPath = `videos/${Date.now()}_${fileName}`;
      const result = await app.uploadFile({
        cloudPath,
        fileContent: buffer
      });
      return result.fileID;
    }

    /**
     * 查询第三方平台任务状态
     * @param {string} taskId - 任务 ID
     * @param {object} authInfo - 鉴权信息
     * @returns {Promise<object>} - 任务状态信息
     */
    async function queryTaskStatus(taskId, authInfo) {
      // 这里需要根据实际第三方平台的 API 进行调整
      // 示例使用 GET 请求查询状态
      const apiUrl = `https://api.example.com/v1/tasks/${taskId}/status`;
      
      return new Promise((resolve, reject) => {
        const options = {
          hostname: url.parse(apiUrl).hostname,
          path: url.parse(apiUrl).path,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authInfo.token}`,
            'Content-Type': 'application/json'
          }
        };

        const client = apiUrl.startsWith('https') ? https : http;
        
        const req = client.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              const result = JSON.parse(data);
              resolve(result);
            } catch (error) {
              reject(new Error('解析响应数据失败'));
            }
          });
        });

        req.on('error', reject);
        req.setTimeout(10000, () => {
          req.destroy();
          reject(new Error('请求超时'));
        });
        req.end();
      });
    }

    exports.main = async (event, context) => {
      const { taskId } = event;

      if (!taskId) {
        return {
          success: false,
          message: '缺少 taskId 参数'
        };
      }

      try {
        // 1. 查询任务记录
        const taskRecord = await models.generation_tasks.get({
          filter: {
            where: {
              taskId: { $eq: taskId }
            }
          }
        });

        if (!taskRecord.data || !taskRecord.data.records || taskRecord.data.records.length === 0) {
          return {
            success: false,
            message: '未找到对应的任务记录'
          };
        }

        const task = taskRecord.data.records[0];
        
        // 2. 查询第三方平台状态
        const statusResult = await queryTaskStatus(taskId, {
          token: task.token,
          projectId: task.projectId
        });

        // 根据实际 API 响应结构调整
        const taskStatus = statusResult.status || statusResult.data?.status;
        const downloadUrl = statusResult.videoUrl || statusResult.data?.videoUrl;

        // 3. 根据状态处理
        let updateData = {
          status: taskStatus,
          updatedAt: new Date().toISOString()
        };

        if (taskStatus === 'completed' && downloadUrl) {
          // 4. 下载并上传视频文件
          try {
            const videoBuffer = await downloadFile(downloadUrl);
            const fileName = `${taskId}.mp4`;
            const fileId = await uploadToCloudStorage(videoBuffer, fileName);
            
            updateData.fileId = fileId;
            updateData.completedAt = new Date().toISOString();
            updateData.message = '视频处理完成并已上传';
          } catch (error) {
            updateData.status = 'failed';
            updateData.error = `文件下载或上传失败: ${error.message}`;
          }
        } else if (taskStatus === 'failed') {
          updateData.error = statusResult.error || statusResult.message || '任务处理失败';
        } else if (taskStatus === 'processing') {
          updateData.message = '任务处理中';
        }

        // 5. 更新任务状态
        await models.generation_tasks.update({
          data: updateData,
          filter: {
            where: {
              _id: { $eq: task._id }
            }
          }
        });

        return {
          success: true,
          message: '任务状态更新成功',
          taskStatus: updateData.status,
          fileId: updateData.fileId || undefined
        };

      } catch (error) {
        console.error('处理任务时发生错误:', error);
        
        // 尝试更新任务状态为失败
        try {
          await models.generation_tasks.update({
            data: {
              status: 'failed',
              error: error.message,
              updatedAt: new Date().toISOString()
            },
            filter: {
              where: {
                taskId: { $eq: taskId }
              }
            }
          });
        } catch (updateError) {
          console.error('更新任务状态失败:', updateError);
        }

        return {
          success: false,
          message: `处理失败: ${error.message}`
        };
      }
    };
  