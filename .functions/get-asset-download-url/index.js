
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const { fileId } = event;
  
  try {
    // 获取云存储实例
    const db = cloud.database();
    
    // 从数据库获取文件信息
    const assetResult = await db.collection('asset_library').where({
      fileId: fileId
    }).get();
    
    if (assetResult.data.length === 0) {
      throw new Error('Asset not found');
    }
    
    const asset = assetResult.data[0];
    
    // 获取临时下载URL
    const downloadUrl = await cloud.getTempFileURL({
      fileList: [asset.folder_path]
    });
    
    if (downloadUrl.fileList && downloadUrl.fileList.length > 0) {
      return {
        success: true,
        downloadUrl: downloadUrl.fileList[0].tempFileURL
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
  