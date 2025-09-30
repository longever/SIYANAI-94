
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const { filename, fileContent, mimeType, size } = event;
  
  try {
    // 生成唯一文件名
    const fileExtension = filename.split('.').pop();
    const uniqueFilename = `assets/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    
    // 上传文件到云存储
    const uploadResult = await cloud.uploadFile({
      cloudPath: uniqueFilename,
      fileContent: Buffer.from(fileContent, 'base64'),
      contentType: mimeType
    });
    
    return {
      success: true,
      fileID: uploadResult.fileID,
      filePath: uniqueFilename
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
  