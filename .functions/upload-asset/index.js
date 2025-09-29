
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');
    const Busboy = require('busboy');
    const path = require('path');

    exports.main = async (event, context) => {
      try {
        // 初始化 CloudBase SDK
        const app = cloudbase.init({
          env: cloudbase.SYMBOL_CURRENT_ENV
        });
        const models = app.models;
        const storage = app.storage;

        // 检查是否为 multipart/form-data 请求
        if (!event.headers || !event.headers['content-type'] || !event.headers['content-type'].includes('multipart/form-data')) {
          return {
            code: 400,
            message: 'Content-Type must be multipart/form-data'
          };
        }

        // 解析 multipart/form-data
        const result = await parseMultipartFormData(event);
        
        if (!result.file) {
          return {
            code: 400,
            message: 'No file uploaded'
          };
        }

        // 生成唯一文件名
        const fileExtension = path.extname(result.filename || 'file');
        const uniqueFilename = `assets/${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;
        
        // 上传到云存储
        const uploadResult = await storage.upload({
          cloudPath: uniqueFilename,
          fileContent: result.file
        });

        // 获取文件信息
        const fileInfo = await storage.getFileInfo(uniqueFilename);
        
        // 构造数据模型记录
        const assetData = {
          fileUrl: uploadResult.fileID,
          fileName: result.filename || 'unnamed-file',
          fileSize: result.file.length,
          mimeType: result.mimetype || 'application/octet-stream',
          uploadTime: new Date(),
          description: result.description || '',
          originalName: result.filename || 'unnamed-file'
        };

        // 写入数据模型
        const assetRecord = await models.asset_library.create({
          data: assetData
        });

        return {
          code: 0,
          message: 'Upload successful',
          data: assetRecord.data
        };

      } catch (error) {
        console.error('Upload error:', error);
        
        // 错误处理
        let errorMessage = 'Upload failed';
        let errorCode = 500;
        
        if (error.message.includes('size')) {
          errorMessage = 'File too large';
          errorCode = 413;
        } else if (error.message.includes('upload')) {
          errorMessage = 'File upload failed';
          errorCode = 500;
        } else if (error.message.includes('database')) {
          errorMessage = 'Database operation failed';
          errorCode = 500;
        }

        return {
          code: errorCode,
          message: errorMessage,
          error: error.message
        };
      }
    };

    // 解析 multipart/form-data
    function parseMultipartFormData(event) {
      return new Promise((resolve, reject) => {
        const busboy = Busboy({
          headers: {
            'content-type': event.headers['content-type'] || event.headers['Content-Type']
          },
          limits: {
            fileSize: 10 * 1024 * 1024 // 限制文件大小为10MB
          }
        });

        const result = {
          file: null,
          filename: null,
          mimetype: null,
          description: null
        };

        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
          if (fieldname !== 'file') {
            file.resume();
            return;
          }

          const chunks = [];
          
          file.on('data', (chunk) => {
            chunks.push(chunk);
          });

          file.on('end', () => {
            result.file = Buffer.concat(chunks);
            result.filename = filename;
            result.mimetype = mimetype;
          });

          file.on('limit', () => {
            reject(new Error('File size limit exceeded'));
          });
        });

        busboy.on('field', (fieldname, value) => {
          if (fieldname === 'filename') {
            result.filename = value;
          } else if (fieldname === 'description') {
            result.description = value;
          }
        });

        busboy.on('finish', () => {
          resolve(result);
        });

        busboy.on('error', (error) => {
          reject(error);
        });

        // 处理 base64 编码的 body
        if (event.isBase64Encoded) {
          const buffer = Buffer.from(event.body, 'base64');
          busboy.write(buffer);
        } else {
          busboy.write(event.body);
        }
        
        busboy.end();
      });
    }
  