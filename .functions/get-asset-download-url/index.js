
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');

    exports.main = async (event, context) => {
      try {
        // 初始化云开发环境
        const app = cloudbase.init();
        
        // 获取参数
        const { assetId } = event;
        
        // 参数校验
        if (!assetId || typeof assetId !== 'string') {
          return {
            code: 400,
            message: '参数错误：assetId 不能为空且必须为字符串',
            data: null
          };
        }
        
        // 获取临时下载链接，有效期1小时（3600秒）
        const result = await app.getTempFileURL({
          fileList: [{
            fileID: assetId,
            maxAge: 3600
          }]
        });
        
        // 检查返回结果
        if (!result.fileList || result.fileList.length === 0) {
          return {
            code: 404,
            message: '未找到指定的资产文件',
            data: null
          };
        }
        
        const fileInfo = result.fileList[0];
        
        // 检查是否有错误
        if (fileInfo.code && fileInfo.code !== 'SUCCESS') {
          return {
            code: 404,
            message: `获取下载链接失败：${fileInfo.message || '文件不存在或权限不足'}`,
            data: null
          };
        }
        
        // 返回成功结果
        return {
          code: 200,
          message: 'success',
          data: {
            downloadUrl: fileInfo.tempFileURL,
            expiresIn: 3600
          }
        };
        
      } catch (error) {
        console.error('获取下载链接时发生错误:', error);
        
        // 根据不同错误类型返回相应信息
        if (error.code === 'STORAGE_FILE_NOT_FOUND') {
          return {
            code: 404,
            message: '指定的资产文件不存在',
            data: null
          };
        }
        
        if (error.code === 'PERMISSION_DENIED') {
          return {
            code: 403,
            message: '权限不足，无法访问该资产文件',
            data: null
          };
        }
        
        // 其他错误返回500
        return {
          code: 500,
          message: `服务器内部错误：${error.message || '未知错误'}`,
          data: null
        };
      }
    };
  