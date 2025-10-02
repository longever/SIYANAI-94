
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const { assetId } = event;
  
  try {
    const db = cloud.database();
    
    // 获取资产信息
    const assetResult = await db.collection('asset_library')
      .where({ _id: assetId })
      .get();
    
    if (assetResult.data.length === 0) {
      return {
        success: false,
        error: 'Asset not found'
      };
    }
    
    const asset = assetResult.data[0];
    
    // 删除云存储文件
    if (asset.url) {
      await cloud.deleteFile({
        fileList: [asset.url]
      });
    }
    
    // 删除数据库记录
    await db.collection('asset_library')
      .where({ _id: assetId })
      .remove();
    
    return {
      success: true,
      message: 'Asset deleted successfully'
    };
  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
