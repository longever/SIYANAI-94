
'use strict';

exports.main = async (event, context) => {
  try {
    // 获取云开发实例
    const tcb = await context.cloud.getCloudInstance();
    
    // 获取上传的文件信息
    const { file, filename, mimeType, description } = event;

    if (!file) {
      return {
        code: 400,
        message: 'No file provided'
      };
    }

    // 处理 base64 文件数据
    let fileBuffer;
    if (typeof file === 'string') {
      // 如果是 base64 字符串
      fileBuffer = Buffer.from(file, 'base64');
    } else if (file instanceof Buffer) {
      // 如果是 Buffer
      fileBuffer = file;
    } else {
      return {
        code: 400,
        message: 'Invalid file format'
      };
    }

    // 根据文件类型确定子文件夹
    let subFolder = 'other';
    const fileExtension = filename ? filename.split('.').pop().toLowerCase() : '';
    
    if (mimeType) {
      if (mimeType.startsWith('image/')) {
        subFolder = 'image';
      } else if (mimeType.startsWith('video/')) {
        subFolder = 'video';
      } else if (mimeType.startsWith('audio/')) {
        subFolder = 'audio';
      } else if (mimeType.includes('font')) {
        subFolder = 'font';
      } else if (['glb', 'gltf', 'obj', 'fbx', 'dae'].includes(fileExtension)) {
        subFolder = 'model';
      } else if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(fileExtension)) {
        subFolder = 'document';
      }
    } else {
      // 根据文件扩展名判断
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)) {
        subFolder = 'image';
      } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(fileExtension)) {
        subFolder = 'video';
      } else if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(fileExtension)) {
        subFolder = 'audio';
      } else if (['ttf', 'otf', 'woff', 'woff2'].includes(fileExtension)) {
        subFolder = 'font';
      } else if (['glb', 'gltf', 'obj', 'fbx', 'dae'].includes(fileExtension)) {
        subFolder = 'model';
      } else if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(fileExtension)) {
        subFolder = 'document';
      }
    }

    // 生成唯一文件名，使用 saas_temp 文件夹结构
    const uniqueFilename = `saas_temp/${subFolder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    // 上传到云存储
    const uploadResult = await tcb.uploadFile({
      cloudPath: uniqueFilename,
      fileContent: fileBuffer
    });

    return {
      code: 0,
      message: 'Upload successful',
      fileID: uploadResult.fileID,
      filename: uniqueFilename,
      originalName: filename || 'unnamed-file',
      mimeType: mimeType || 'application/octet-stream',
      size: fileBuffer.length,
      subFolder: subFolder,
      fullPath: uniqueFilename
    };

  } catch (error) {
    console.error('Upload error:', error);
    
    let errorMessage = 'Upload failed';
    let errorCode = 500;
    
    if (error.message && error.message.includes('size')) {
      errorMessage = 'File too large';
      errorCode = 413;
    } else if (error.message && error.message.includes('upload')) {
      errorMessage = 'File upload failed';
      errorCode = 500;
    }

    return {
      code: errorCode,
      message: errorMessage,
      error: error.message || 'Unknown error'
    };
  }
};
  