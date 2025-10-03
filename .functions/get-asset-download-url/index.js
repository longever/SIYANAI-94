
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const { fileId } = event;
  
  try {
    // 增强的入参校验
    if (!fileId) {
      throw new Error('fileId is required');
    }
    
    // 校验 fileId 格式
    if (typeof fileId !== 'string') {
      throw new Error('fileId must be a string');
    }
    
    // 校验 fileId 是否符合云存储格式
    if (!fileId.startsWith('cloud://')) {
      throw new Error('Invalid fileId format, must start with cloud://');
    }
    
    // 获取临时下载URL
    const downloadUrl = await cloud.getTempFileURL({
      fileList: [{
        fileID: fileId,
        maxAge: 60 * 60 * 24 // 24小时有效期
      }]
    });
    
    if (downloadUrl.fileList && downloadUrl.fileList.length > 0 && downloadUrl.fileList[0].tempFileURL) {
      return {
        success: true,
        url: downloadUrl.fileList[0].tempFileURL,
        fileID: fileId
      };
    } else {
      throw new Error('Failed to generate download URL');
    }
  } catch (error) {
    console.error('Error in get-asset-download-url:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
