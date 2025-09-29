
'use strict';

exports.main = async (event, context) => {
  try {
    // 1. 获取云开发实例（平台内置能力）
    const tcb = await getCloudInstance();
    const storage = tcb.cloud;

    // 2. 参数校验
    const { assetId } = event;
    if (!assetId || typeof assetId !== 'string') {
      return {
        success: false,
        error: 'assetId 不能为空且必须是字符串',
      };
    }

    // 3. 获取临时下载链接
    const result = await storage.getTempFileURL({
      fileList: [{
        fileID: assetId,
        maxAge: 3600 // 1小时有效期
      }]
    });

    // 4. 检查是否成功获取链接
    if (!result.fileList || result.fileList.length === 0) {
      return {
        success: false,
        error: '未找到对应的文件',
      };
    }

    const fileItem = result.fileList[0];

    // 5. 检查是否有错误
    if (fileItem.code && fileItem.code !== 'SUCCESS') {
      return {
        success: false,
        error: fileItem.message || '获取下载链接失败',
      };
    }

    // 6. 返回成功结果
    return {
      success: true,
      downloadUrl: fileItem.tempFileURL,
      expiresIn: 3600,
      fileId: assetId,
    };

  } catch (error) {
    console.error('获取下载链接失败:', error);
    
    // 返回友好的错误信息
    if (error.message && error.message.includes('not found')) {
      return {
        success: false,
        error: '文件不存在',
      };
    }
    
    return {
      success: false,
      error: '获取下载链接失败，请稍后重试',
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
  