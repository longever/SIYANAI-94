
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');

    exports.main = async (event, context) => {
      try {
        // 初始化 CloudBase
        const app = cloudbase.init();
        
        // 获取参数
        const { assetId } = event;
        
        // 参数校验
        if (!assetId || typeof assetId !== 'string') {
          return {
            error: 'assetId 不能为空且必须是字符串'
          };
        }
        
        // 获取临时下载链接
        const result = await app.getTempFileURL({
          fileList: [{
            fileID: assetId,
            maxAge: 3600 // 1小时有效期
          }]
        });
        
        // 检查是否成功获取链接
        if (!result.fileList || result.fileList.length === 0) {
          return {
            error: '未找到对应的文件'
          };
        }
        
        const fileItem = result.fileList[0];
        
        // 检查是否有错误
        if (fileItem.code && fileItem.code !== 'SUCCESS') {
          return {
            error: fileItem.message || '获取下载链接失败'
          };
        }
        
        // 返回成功结果
        return {
          downloadUrl: fileItem.tempFileURL,
          expiresIn: 3600
        };
        
      } catch (error) {
        console.error('获取下载链接失败:', error);
        
        // 返回友好的错误信息
        if (error.message && error.message.includes('not found')) {
          return {
            error: '文件不存在'
          };
        }
        
        return {
          error: '获取下载链接失败，请稍后重试'
        };
      }
    };
  