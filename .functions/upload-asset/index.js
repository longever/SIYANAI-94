
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');
    const crypto = require('crypto');

    // 初始化 CloudBase SDK
    const app = cloudbase.init({
      env: cloudbase.SYMBOL_CURRENT_ENV
    });

    // 生成随机文件名
    function generateRandomFilename(originalName) {
      const timestamp = Date.now();
      const randomStr = crypto.randomBytes(8).toString('hex');
      const extension = originalName ? originalName.split('.').pop() : 'bin';
      return `${timestamp}_${randomStr}.${extension}`;
    }

    // 根据文件扩展名推断 MIME 类型
    function inferContentType(filename) {
      const ext = filename.split('.').pop().toLowerCase();
      const mimeTypes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml',
        'pdf': 'application/pdf',
        'txt': 'text/plain',
        'html': 'text/html',
        'css': 'text/css',
        'js': 'application/javascript',
        'json': 'application/json',
        'mp4': 'video/mp4',
        'mp3': 'audio/mpeg',
        'zip': 'application/zip'
      };
      return mimeTypes[ext] || 'application/octet-stream';
    }

    // 构建云路径
    function buildCloudPath(prefix, filename) {
      // 清理路径，确保格式正确
      const cleanPrefix = prefix ? prefix.replace(/^\/+|\/+$/g, '') : '';
      const cleanFilename = filename.replace(/^\/+/g, '');
      
      if (cleanPrefix) {
        return `${cleanPrefix}/${cleanFilename}`;
      }
      return cleanFilename;
    }

    exports.main = async (event, context) => {
      try {
        const { fileBase64, fileBuffer, fileName, contentType, cloudPathPrefix } = event;

        // 参数验证
        if (!fileBase64 && !fileBuffer) {
          return {
            error: '必须提供 fileBase64 或 fileBuffer 参数'
          };
        }

        // 优先使用 fileBuffer
        let buffer;
        if (fileBuffer) {
          buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);
        } else if (fileBase64) {
          buffer = Buffer.from(fileBase64, 'base64');
        }

        if (!buffer || buffer.length === 0) {
          return {
            error: '文件内容不能为空'
          };
        }

        // 生成文件名
        const actualFileName = fileName || generateRandomFilename();
        const cloudPath = buildCloudPath(cloudPathPrefix || '', actualFileName);

        // 确定 MIME 类型
        const actualContentType = contentType || inferContentType(actualFileName);

        // 上传文件
        const uploadResult = await app.uploadFile({
          cloudPath: cloudPath,
          fileContent: buffer
        });

        if (!uploadResult.fileID) {
          return {
            error: '文件上传失败：未获取到文件ID'
          };
        }

        // 获取文件访问URL
        const urlResult = await app.getTempFileURL({
          fileList: [uploadResult.fileID]
        });

        if (!urlResult.fileList || urlResult.fileList.length === 0) {
          return {
            error: '获取文件URL失败'
          };
        }

        const fileInfo = urlResult.fileList[0];
        
        return {
          fileID: uploadResult.fileID,
          fileURL: fileInfo.tempFileURL,
          size: buffer.length,
          contentType: actualContentType
        };

      } catch (error) {
        console.error('上传文件时发生错误:', error);
        
        // 错误分类处理
        let errorMessage = '文件上传失败';
        
        if (error.code === 'LIMIT_EXCEEDED') {
          errorMessage = '文件大小超出限制';
        } else if (error.code === 'PERMISSION_DENIED') {
          errorMessage = '权限不足，无法上传文件';
        } else if (error.code === 'NETWORK_ERROR') {
          errorMessage = '网络错误，请稍后重试';
        } else if (error.message) {
          errorMessage = error.message;
        }

        return {
          error: errorMessage
        };
      }
    };
  