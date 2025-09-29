
'use strict';

exports.main = async (event, context) => {
  try {
    // 1. 获取云开发实例（平台内置能力）
    const tcb = await getCloudInstance();
    const storage = tcb.cloud;
    const db = tcb.database();

    // 2. 参数校验
    const { file, filename, description = '', mimeType = 'application/octet-stream' } = event;
    
    if (!file) {
      return {
        success: false,
        error: '未提供文件数据',
        code: 400
      };
    }

    // 3. 处理文件数据
    let fileBuffer;
    let fileName = filename || '未命名文件';
    
    // 支持 base64 字符串或 Buffer
    if (typeof file === 'string') {
      // base64 字符串
      fileBuffer = Buffer.from(file, 'base64');
    } else if (file instanceof Buffer) {
      // Buffer
      fileBuffer = file;
    } else {
      return {
        success: false,
        error: '无效的文件格式',
        code: 400
      };
    }

    // 4. 限制文件大小 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (fileBuffer.length > maxSize) {
      return {
        success: false,
        error: '文件过大（最大支持10MB）',
        code: 413
      };
    }

    // 5. 生成唯一文件名
    const fileExtension = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')) : '';
    const uniqueFilename = `assets/${Date.now()}-${Math.random().toString(36).substring(2, 15)}${fileExtension}`;
    
    // 6. 上传到云存储
    const uploadResult = await storage.uploadFile({
      cloudPath: uniqueFilename,
      fileContent: fileBuffer
    });

    // 7. 获取临时访问URL
    const fileInfo = await storage.getTempFileURL({
      fileList: [{
        fileID: uploadResult.fileID,
        maxAge: 3600 // 1小时有效期
      }]
    });

    // 8. 构造数据模型记录
    const assetData = {
      fileUrl: uploadResult.fileID,
      fileName: fileName,
      fileSize: fileBuffer.length,
      mimeType: mimeType,
      uploadTime: new Date(),
      description: description,
      originalName: fileName
    };

    // 9. 写入数据模型
    const assetRecord = await db.collection('asset_library').add({
      data: assetData
    });

    // 10. 返回成功结果
    return {
      success: true,
      message: '上传成功',
      data: {
        id: assetRecord._id,
        fileUrl: fileInfo.fileList[0].tempFileURL,
        fileName: fileName,
        fileSize: fileBuffer.length,
        cloudPath: uploadResult.fileID
      }
    };

  } catch (error) {
    console.error('上传失败:', error);
    
    // 错误处理
    let errorMessage = '上传失败';
    let errorCode = 500;
    
    if (error.message && error.message.includes('size')) {
      errorMessage = '文件过大';
      errorCode = 413;
    } else if (error.message && error.message.includes('upload')) {
      errorMessage = '文件上传失败';
      errorCode = 500;
    } else if (error.message && error.message.includes('database')) {
      errorMessage = '数据库操作失败';
      errorCode = 500;
    }

    return {
      success: false,
      error: errorMessage,
      code: errorCode,
      details: error.message || '未知错误'
    };
  }
};

// 获取云开发实例的辅助函数（平台内置）
async function getCloudInstance() {
  const cloud = require('wx-server-sdk');
  cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
  });
  return cloud;
}
  