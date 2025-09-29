
'use strict';

exports.main = async (event, context) => {
  try {
    // 1. 获取云开发实例（平台内置能力）
    const tcb = await getCloudInstance();
    const db = tcb.database();
    const storage = tcb.cloud;

    // 2. 参数校验
    const { assetId } = event;
    if (!assetId || typeof assetId !== 'string') {
      return {
        success: false,
        error: 'assetId 不能为空且必须为字符串',
      };
    }

    // 3. 查询记录
    const recordRes = await db.collection('asset_library')
      .where({
        _id: assetId
      })
      .get();

    if (!recordRes.data || recordRes.data.length === 0) {
      return {
        success: false,
        error: '记录不存在',
      };
    }

    const record = recordRes.data[0];
    const filePath = record.filePath;

    if (!filePath) {
      return {
        success: false,
        error: '记录中未找到 filePath 字段',
      };
    }

    // 4. 删除云存储文件
    try {
      await storage.deleteFile({
        fileList: [filePath]
      });
    } catch (fileError) {
      console.error('删除文件失败:', fileError);
      // 即使文件删除失败，也继续删除数据库记录
    }

    // 5. 删除数据库记录
    const deleteRes = await db.collection('asset_library')
      .where({
        _id: assetId
      })
      .remove();

    if (deleteRes.deleted === 0) {
      return {
        success: false,
        error: '删除记录失败',
      };
    }

    // 6. 返回成功
    return {
      success: true,
      message: '删除成功',
      deletedFile: filePath,
      deletedRecord: record,
    };
  } catch (error) {
    console.error('删除资产时发生异常:', error);
    return {
      success: false,
      error: error.message || '未知错误',
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
