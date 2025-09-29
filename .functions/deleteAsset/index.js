
'use strict';

const cloudbase = require('@cloudbase/node-sdk');

exports.main = async (event, context) => {
  try {
    // 1. 初始化 SDK
    const app = cloudbase.init({
      env: cloudbase.SYMBOL_CURRENT_ENV,
    });
    const models = app.models;
    const storage = app.storage;

    // 2. 参数校验
    const { assetId } = event;
    if (!assetId || typeof assetId !== 'string') {
      return {
        success: false,
        error: 'assetId 不能为空且必须为字符串',
      };
    }

    // 3. 查询记录
    const recordRes = await models.asset_library.get({
      filter: {
        where: {
          _id: {
            $eq: assetId,
          },
        },
      },
    });

    if (!recordRes.data || !recordRes.data.records || recordRes.data.records.length === 0) {
      return {
        success: false,
        error: '记录不存在',
      };
    }

    const record = recordRes.data.records[0];
    const filePath = record.filePath;

    if (!filePath) {
      return {
        success: false,
        error: '记录中未找到 filePath 字段',
      };
    }

    // 5. 并行删除
    const [deleteFileRes, deleteRecordRes] = await Promise.allSettled([
      storage.deleteFile({
        fileList: [filePath],
      }),
      models.asset_library.delete({
        filter: {
          where: {
            _id: {
              $eq: assetId,
            },
          },
        },
      }),
    ]);

    // 检查删除结果
    if (deleteFileRes.status === 'rejected') {
      console.error('删除文件失败:', deleteFileRes.reason);
      return {
        success: false,
        error: `删除文件失败: ${deleteFileRes.reason.message || deleteFileRes.reason}`,
      };
    }

    if (deleteRecordRes.status === 'rejected') {
      console.error('删除记录失败:', deleteRecordRes.reason);
      return {
        success: false,
        error: `删除记录失败: ${deleteRecordRes.reason.message || deleteRecordRes.reason}`,
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
