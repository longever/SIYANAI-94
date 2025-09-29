
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const { fileId } = event;
  
  if (!fileId) {
    return {
      success: false,
      error: 'fileId is required'
    };
  }

  try {
    const result = await cloud.getTempFileURL({
      fileList: [fileId]
    });

    if (result.fileList && result.fileList.length > 0) {
      return {
        success: true,
        downloadUrl: result.fileList[0].tempFileURL
      };
    } else {
      return {
        success: false,
        error: 'File not found'
      };
    }
  } catch (error) {
    console.error('Error getting download URL:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
