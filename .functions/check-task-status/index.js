
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');
    const fetch = require('node-fetch');

    // 初始化 CloudBase SDK
    const app = cloudbase.init({
      env: cloudbase.SYMBOL_CURRENT_ENV
    });

    // 第三方平台配置（请替换为实际配置）
    const THIRD_PARTY_CONFIG = {
      apiUrl: process.env.THIRD_PARTY_API_URL || 'https://api.example.com/task/status',
      apiKey: process.env.THIRD_PARTY_API_KEY || 'your-api-key'
    };

    /**
     * 查询第三方平台任务状态
     * @param {string} taskId - 任务ID
     * @returns {Promise<Object>} 任务状态信息
     */
    async function queryTaskStatus(taskId) {
      try {
        const response = await fetch(`${THIRD_PARTY_CONFIG.apiUrl}?taskId=${taskId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${THIRD_PARTY_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('查询任务状态失败:', error);
        throw new Error(`查询任务状态失败: ${error.message}`);
      }
    }

    /**
     * 从URL下载视频文件
     * @param {string} downloadUrl - 视频下载URL
     * @returns {Promise<Buffer>} 视频文件Buffer
     */
    async function downloadVideo(downloadUrl) {
      try {
        const response = await fetch(downloadUrl);
        
        if (!response.ok) {
          throw new Error(`下载视频失败: ${response.status}`);
        }

        const buffer = await response.buffer();
        return buffer;
      } catch (error) {
        console.error('下载视频失败:', error);
        throw new Error(`下载视频失败: ${error.message}`);
      }
    }

    /**
     * 上传视频到云存储
     * @param {string} taskId - 任务ID
     * @param {Buffer} videoBuffer - 视频文件Buffer
     * @returns {Promise<string>} 文件访问URL
     */
    async function uploadVideoToCloudStorage(taskId, videoBuffer) {
      try {
        const cloudPath = `videos/${taskId}.mp4`;
        
        // 上传文件
        const uploadResult = await app.uploadFile({
          cloudPath,
          fileContent: videoBuffer
        });

        // 获取临时访问URL
        const tempUrlResult = await app.getTempFileURL({
          fileList: [uploadResult.fileID]
        });

        return tempUrlResult.fileList[0].tempFileURL;
      } catch (error) {
        console.error('上传视频到云存储失败:', error);
        throw new Error(`上传视频到云存储失败: ${error.message}`);
      }
    }

    /**
     * 更新任务记录
     * @param {string} taskId - 任务ID
     * @param {Object} updateData - 要更新的数据
     */
    async function updateTaskRecord(taskId, updateData) {
      try {
        const models = app.models;
        
        await models.generation_tasks.update({
          filter: {
            where: {
              taskId: {
                $eq: taskId
              }
            }
          },
          data: updateData
        });
      } catch (error) {
        console.error('更新任务记录失败:', error);
        throw new Error(`更新任务记录失败: ${error.message}`);
      }
    }

    /**
     * 主函数
     * @param {Object} event - 云函数事件参数
     * @param {Object} context - 云函数上下文
     * @returns {Promise<Object>} 统一格式的返回结果
     */
    exports.main = async (event, context) => {
      try {
        const { taskId } = event;

        // 参数验证
        if (!taskId || typeof taskId !== 'string') {
          return {
            code: 400,
            message: '参数错误：taskId不能为空且必须是字符串'
          };
        }

        // 查询任务状态
        const taskStatus = await queryTaskStatus(taskId);
        
        // 根据状态处理
        if (taskStatus.status === 'completed') {
          // 状态为已完成，下载并上传视频
          const videoBuffer = await downloadVideo(taskStatus.downloadUrl);
          const videoUrl = await uploadVideoToCloudStorage(taskId, videoBuffer);
          
          // 更新任务记录
          const updateData = {
            status: 'completed',
            videoUrl: videoUrl,
            finishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          await updateTaskRecord(taskId, updateData);

          return {
            code: 0,
            message: '任务已完成，视频处理成功',
            data: {
              status: 'completed',
              videoUrl: videoUrl,
              finishedAt: updateData.finishedAt
            }
          };
        } else {
          // 其他状态，仅更新状态
          const updateData = {
            status: taskStatus.status,
            updatedAt: new Date().toISOString()
          };
          
          if (taskStatus.status === 'failed') {
            updateData.errorMessage = taskStatus.errorMessage || '任务执行失败';
          }
          
          await updateTaskRecord(taskId, updateData);

          return {
            code: 0,
            message: `任务状态：${taskStatus.status}`,
            data: {
              status: taskStatus.status
            }
          };
        }
      } catch (error) {
        console.error('云函数执行错误:', error);
        return {
          code: 500,
          message: `服务器错误: ${error.message}`
        };
      }
    };
  