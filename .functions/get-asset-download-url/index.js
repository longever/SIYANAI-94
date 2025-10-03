
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const { fileId } = event;
  
  try {
    // 直接使用fileId作为云存储文件ID
    if (!fileId) {
      throw new Error('fileId is required');
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
