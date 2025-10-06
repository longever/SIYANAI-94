
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');
    const Busboy = require('busboy');

    // 初始化 CloudBase
    const app = cloudbase.init();
    const models = app.models;

    // 工具函数：生成唯一ID
    function generateId() {
      return 'asset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 工具函数：解析 multipart/form-data
    function parseMultipart(event) {
      return new Promise((resolve, reject) => {
        const busboy = Busboy({ headers: event.headers });
        const files = [];
        const fields = {};

        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
          const chunks = [];
          file.on('data', (chunk) => chunks.push(chunk));
          file.on('end', () => {
            files.push({
              fieldname,
              filename,
              encoding,
              mimetype,
              buffer: Buffer.concat(chunks)
            });
          });
        });

        busboy.on('field', (fieldname, value) => {
          try {
            fields[fieldname] = JSON.parse(value);
          } catch {
            fields[fieldname] = value;
          }
        });

        busboy.on('finish', () => resolve({ files, fields }));
        busboy.on('error', reject);

        // 处理 base64 编码的 body
        const bodyBuffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
        busboy.write(bodyBuffer);
        busboy.end();
      });
    }

    // 统一错误处理
    function handleError(error, statusCode = 500) {
      console.error('Error:', error);
      return {
        statusCode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: error.message || 'Internal server error' })
      };
    }

    // 成功响应
    function successResponse(data, statusCode = 200) {
      return {
        statusCode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      };
    }

    // 路由处理
    async function handleUpload(event) {
      try {
        const { files, fields } = await parseMultipart(event);
        
        if (!files || files.length === 0) {
          throw new Error('No file uploaded');
        }

        const file = files[0];
        const tags = fields.tags || [];

        // 上传到云存储
        const fileName = file.filename;
        const cloudPath = `saas_temp/${generateId()}_${fileName}`;
        
        const uploadResult = await app.uploadFile({
          cloudPath,
          fileContent: file.buffer
        });

        // 保存到数据模型
        const assetData = {
          _id: generateId(),
          fileName,
          fileID: uploadResult.fileID,
          fileUrl: uploadResult.fileID, // CloudBase 中 fileID 就是访问地址
          tags: Array.isArray(tags) ? tags : [tags],
          createdAt: new Date().toISOString()
        };

        const result = await models.asset.create({
          data: assetData
        });

        return successResponse({
          id: result.data._id,
          fileName: result.data.fileName,
          fileUrl: result.data.fileUrl,
          tags: result.data.tags,
          createdAt: result.data.createdAt
        });
      } catch (error) {
        return handleError(error, 400);
      }
    }

    async function handleList(event) {
      try {
        const query = event.queryString || {};
        const page = parseInt(query.page) || 1;
        const pageSize = parseInt(query.pageSize) || 20;
        const skip = (page - 1) * pageSize;

        const result = await models.asset.list({
          filter: {
            orderBy: [{ field: 'createdAt', direction: 'desc' }],
            limit: pageSize,
            offset: skip
          }
        });

        return successResponse({
          list: result.data.records || [],
          total: result.data.total || 0
        });
      } catch (error) {
        return handleError(error);
      }
    }

    async function handleDelete(event) {
      try {
        const id = event.pathParameters.id;
        if (!id) {
          throw new Error('Asset ID is required');
        }

        // 查询资产信息
        const asset = await models.asset.get({
          filter: { where: { _id: { $eq: id } } }
        });

        if (!asset.data || !asset.data.records || asset.data.records.length === 0) {
          throw new Error('Asset not found');
        }

        const assetData = asset.data.records[0];

        // 删除云存储文件
        try {
          await app.deleteFile({ fileList: [assetData.fileID] });
        } catch (error) {
          console.error('Failed to delete file from storage:', error);
          // 继续删除数据库记录，即使文件删除失败
        }

        // 删除数据库记录
        await models.asset.delete({
          filter: { where: { _id: { $eq: id } } }
        });

        return successResponse({ success: true });
      } catch (error) {
        return handleError(error, 404);
      }
    }

    async function handleUpdateTags(event) {
      try {
        const id = event.pathParameters.id;
        if (!id) {
          throw new Error('Asset ID is required');
        }

        const body = JSON.parse(event.body || '{}');
        const { tags } = body;

        if (!Array.isArray(tags)) {
          throw new Error('Tags must be an array');
        }

        const result = await models.asset.update({
          data: { tags },
          filter: { where: { _id: { $eq: id } } }
        });

        if (!result.data || result.data.total === 0) {
          throw new Error('Asset not found');
        }

        return successResponse({
          id,
          tags
        });
      } catch (error) {
        return handleError(error, 400);
      }
    }

    async function handleDownload(event) {
      try {
        const id = event.pathParameters.id;
        if (!id) {
          throw new Error('Asset ID is required');
        }

        const asset = await models.asset.get({
          filter: { where: { _id: { $eq: id } } }
        });

        if (!asset.data || !asset.data.records || asset.data.records.length === 0) {
          throw new Error('Asset not found');
        }

        const assetData = asset.data.records[0];
        
        // 生成临时下载链接（有效期1小时）
        const downloadUrl = await app.getTempFileURL({
          fileList: [{
            fileID: assetData.fileID,
            maxAge: 3600 // 1小时
          }]
        });

        return successResponse({
          downloadUrl: downloadUrl.fileList[0].tempFileURL,
          expires: Date.now() + 3600 * 1000
        });
      } catch (error) {
        return handleError(error, 404);
      }
    }

    // 主函数
    exports.main = async (event, context) => {
      try {
        const { path, httpMethod } = event;

        // 路由分发
        if (httpMethod === 'POST' && path === '/upload') {
          return await handleUpload(event);
        } else if (httpMethod === 'GET' && path === '/list') {
          return await handleList(event);
        } else if (httpMethod === 'DELETE' && path.startsWith('/')) {
          const id = path.split('/')[1];
          event.pathParameters = { id };
          return await handleDelete(event);
        } else if (httpMethod === 'PUT' && path.startsWith('/')) {
          const id = path.split('/')[1];
          event.pathParameters = { id };
          return await handleUpdateTags(event);
        } else if (httpMethod === 'GET' && path.startsWith('/download/')) {
          const id = path.split('/download/')[1];
          event.pathParameters = { id };
          return await handleDownload(event);
        } else {
          return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Not found' })
          };
        }
      } catch (error) {
        return handleError(error);
      }
    };
  