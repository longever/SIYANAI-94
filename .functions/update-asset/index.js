
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');

    exports.main = async (event, context) => {
      try {
        // 初始化云开发 SDK
        const app = cloudbase.init({
          env: cloudbase.SYMBOL_CURRENT_ENV
        });
        const models = app.models;

        // 解构输入参数
        const { fileName, fileSize, mimeType, uploader, cloudPath, extra = {} } = event;

        // 参数校验
        if (!fileName || typeof fileName !== 'string') {
          return {
            code: 400,
            message: '参数错误：fileName 不能为空且必须为字符串'
          };
        }

        if (!fileSize || typeof fileSize !== 'number' || fileSize < 0) {
          return {
            code: 400,
            message: '参数错误：fileSize 不能为空且必须为正数'
          };
        }

        if (!mimeType || typeof mimeType !== 'string') {
          return {
            code: 400,
            message: '参数错误：mimeType 不能为空且必须为字符串'
          };
        }

        if (!uploader || typeof uploader !== 'string') {
          return {
            code: 400,
            message: '参数错误：uploader 不能为空且必须为字符串'
          };
        }

        if (!cloudPath || typeof cloudPath !== 'string') {
          return {
            code: 400,
            message: '参数错误：cloudPath 不能为空且必须为字符串'
          };
        }

        // 构造待插入的文档对象
        const assetData = {
          fileName,
          fileSize,
          mimeType,
          uploader,
          cloudPath,
          uploadTime: new Date(),
          ...extra
        };

        // 调用数据模型的创建方法
        const result = await models.asset.create({
          data: assetData
        });

        // 返回成功结果
        return {
          code: 200,
          message: '素材信息保存成功',
          data: {
            _id: result.data._id,
            ...assetData
          }
        };

      } catch (error) {
        console.error('素材信息保存失败:', error);

        // 根据错误类型返回不同的错误码
        if (error.code === 'INVALID_PARAM') {
          return {
            code: 400,
            message: `参数错误：${error.message}`
          };
        }

        if (error.code === 'PERMISSION_DENIED') {
          return {
            code: 403,
            message: '权限不足，无法保存素材信息'
          };
        }

        // 其他错误统一返回 500
        return {
          code: 500,
          message: '服务器内部错误，请稍后重试',
          error: error.message
        };
      }
    };
  