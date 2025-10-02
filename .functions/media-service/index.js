
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');
    
    // 初始化 CloudBase
    const app = cloudbase.init({
      env: cloudbase.SYMBOL_CURRENT_ENV
    });

    // 文件操作类型定义
    const OPERATIONS = {
      UPLOAD: 'upload',
      DOWNLOAD: 'download',
      DELETE: 'delete',
      GET_TEMP_URL: 'getTempUrl'
    };

    /**
     * 主函数入口
     * @param {Object} event - 事件参数
     * @param {Object} context - 上下文
     * @returns {Promise<Object>} 返回结果
     */
    exports.main = async (event, context) => {
      const { action, ...params } = event;
      
      try {
        switch (action) {
          case OPERATIONS.UPLOAD:
            return await handleUpload(params);
          case OPERATIONS.DOWNLOAD:
            return await handleDownload(params);
          case OPERATIONS.DELETE:
            return await handleDelete(params);
          case OPERATIONS.GET_TEMP_URL:
            return await handleGetTempUrl(params);
          default:
            return {
              success: false,
              error: `Unsupported action: ${action}`
            };
        }
      } catch (error) {
        console.error('Media service error:', error);
        return {
          success: false,
          error: error.message || 'Internal server error'
        };
      }
    };

    /**
     * 处理文件上传
     * @param {Object} params - 上传参数
     * @param {Buffer|string} params.file - 文件内容
     * @param {string} params.fileName - 文件名
     * @param {string} params.contentType - 文件类型
     * @param {string} params.folder - 上传目录
     * @returns {Promise<Object>} 上传结果
     */
    async function handleUpload(params) {
      const { file, fileName, contentType, folder = 'uploads' } = params;
      
      if (!file || !fileName) {
        throw new Error('File and fileName are required');
      }

      // 构建云存储路径
      const timestamp = Date.now();
      const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const cloudPath = `${folder}/${timestamp}_${safeFileName}`;

      // 处理文件内容
      let fileContent;
      if (Buffer.isBuffer(file)) {
        fileContent = file;
      } else if (typeof file === 'string') {
        // 处理 base64 字符串
        const base64Data = file.replace(/^data:.*;base64,/, '');
        fileContent = Buffer.from(base64Data, 'base64');
      } else {
        throw new Error('Invalid file format');
      }

      // 上传到云存储
      const result = await app.uploadFile({
        cloudPath,
        fileContent
      });

      if (result.code) {
        throw new Error(result.message || 'Upload failed');
      }

      // 获取临时访问URL
      const tempUrlResult = await app.getTempFileURL({
        fileList: [result.fileID]
      });

      const fileUrl = tempUrlResult.fileList[0]?.tempFileURL;

      return {
        success: true,
        fileId: result.fileID,
        url: fileUrl,
        fileName: safeFileName,
        cloudPath
      };
    }

    /**
     * 处理文件下载
     * @param {Object} params - 下载参数
     * @param {string} params.fileKey - 文件ID或路径
     * @param {boolean} params.returnBuffer - 是否返回Buffer
     * @returns {Promise<Object>} 下载结果
     */
    async function handleDownload(params) {
      const { fileKey, returnBuffer = true } = params;
      
      if (!fileKey) {
        throw new Error('fileKey is required');
      }

      if (returnBuffer) {
        // 直接下载文件内容
        const result = await app.downloadFile({
          fileID: fileKey
        });

        if (result.code) {
          throw new Error(result.message || 'Download failed');
        }

        return {
          success: true,
          buffer: result.fileContent,
          contentType: 'application/octet-stream'
        };
      } else {
        // 返回临时URL
        const tempUrlResult = await app.getTempFileURL({
          fileList: [fileKey]
        });

        const fileUrl = tempUrlResult.fileList[0]?.tempFileURL;
        
        if (!fileUrl) {
          throw new Error('Failed to get file URL');
        }

        return {
          success: true,
          url: fileUrl,
          redirect: true
        };
      }
    }

    /**
     * 处理文件删除
     * @param {Object} params - 删除参数
     * @param {string|string[]} params.fileKey - 文件ID或文件ID数组
     * @returns {Promise<Object>} 删除结果
     */
    async function handleDelete(params) {
      const { fileKey } = params;
      
      if (!fileKey) {
        throw new Error('fileKey is required');
      }

      const fileList = Array.isArray(fileKey) ? fileKey : [fileKey];

      const result = await app.deleteFile({
        fileList
      });

      if (result.code) {
        throw new Error(result.message || 'Delete failed');
      }

      const successList = result.fileList.filter(item => item.code === 'SUCCESS');
      const failedList = result.fileList.filter(item => item.code !== 'SUCCESS');

      return {
        success: true,
        deletedCount: successList.length,
        failedCount: failedList.length,
        details: result.fileList
      };
    }

    /**
     * 获取文件临时访问URL
     * @param {Object} params - 参数
     * @param {string|string[]} params.fileKey - 文件ID或文件ID数组
     * @param {number} params.expiresIn - 过期时间（秒）
     * @returns {Promise<Object>} URL结果
     */
    async function handleGetTempUrl(params) {
      const { fileKey, expiresIn = 3600 } = params;
      
      if (!fileKey) {
        throw new Error('fileKey is required');
      }

      const fileList = Array.isArray(fileKey) ? fileKey : [fileKey];

      const result = await app.getTempFileURL({
        fileList: fileList.map(fileID => ({
          fileID,
          maxAge: expiresIn
        }))
      });

      if (result.code) {
        throw new Error(result.message || 'Failed to get temp URL');
      }

      return {
        success: true,
        urls: result.fileList.map(item => ({
          fileId: item.fileID,
          url: item.tempFileURL
        }))
      };
    }
  