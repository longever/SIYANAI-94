
'use strict';

exports.main = async (event, context) => {
  try {
    // 使用平台内置的 cloud 对象
    const cloud = context.cloud;
    
    // 获取上传的文件信息
    const { file, filename, description = '' } = event;
    
    if (!file) {
      return {
        code: 400,
        message: 'No file provided'
      };
    }

    // 处理文件数据
    let fileBuffer;
    let fileName = filename || 'unnamed-file';
    
    // 支持 base64 字符串或 Buffer
    if (typeof file === 'string') {
      // base64 字符串
      fileBuffer = Buffer.from(file, 'base64');
    } else if (file instanceof Buffer) {
      // Buffer
      fileBuffer = file;
    } else {
      return {
        code: 400,
        message: 'Invalid file format'
      };
    }

    // 限制文件大小 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (fileBuffer.length > maxSize) {
      return {
        code: 413,
        message: 'File too large (max 10MB)'
      };
    }

    // 生成唯一文件名
    const fileExtension = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')) : '';
    const uniqueFilename = `assets/${Date.now()}-${Math.random().toString(36).substring(2, 15)}${fileExtension}`;
    
    // 上传到云存储
    const uploadResult = await cloud.uploadFile({
      cloudPath: uniqueFilename,
      fileContent: fileBuffer
    });

    // 获取文件信息
    const fileInfo = await cloud.getTempFileURL({
      fileList: [uploadResult.fileID]
    });

    // 构造数据模型记录
    const assetData = {
      fileUrl: uploadResult.fileID,
      fileName: fileName,
      fileSize: fileBuffer.length,
      mimeType: event.mimeType || 'application/octet-stream',
      uploadTime: new Date(),
      description: description,
      originalName: fileName
    };

    // 写入数据模型
    const assetRecord = await cloud.callFunction({
      name: 'weda-datasource',
      data: {
        dataSourceName: 'asset_library',
        methodName: 'wedaCreateV2',
        params: {
          data: assetData
        }
      }
    });

    return {
      code: 0,
      message: 'Upload successful',
      data: {
        id: assetRecord.result.id,
        fileUrl: fileInfo.fileList[0].tempFileURL,
        fileName: fileName,
        fileSize: fileBuffer.length
      }
    };

  } catch (error) {
    console.error('Upload error:', error);
    
    // 错误处理
    let errorMessage = 'Upload failed';
    let errorCode = 500;
    
    if (error.message && error.message.includes('size')) {
      errorMessage = 'File too large';
      errorCode = 413;
    } else if (error.message && error.message.includes('upload')) {
      errorMessage = 'File upload failed';
      errorCode = 500;
    } else if (error.message && error.message.includes('database')) {
      errorMessage = 'Database operation failed';
      errorCode = 500;
    }

    return {
      code: errorCode,
      message: errorMessage,
      error: error.message || 'Unknown error'
    };
  }
};
