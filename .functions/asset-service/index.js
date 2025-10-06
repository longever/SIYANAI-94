
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');
    const { v4: uuidv4 } = require('uuid');
    const Busboy = require('busboy');

    const app = cloudbase.init();
    const models = app.models;
    const storage = app.storage;

    // 统一响应格式
    function createResponse(code, data, message) {
      return {
        code,
        data,
        message
      };
    }

    // 解析 multipart/form-data
    function parseMultipart(event) {
      return new Promise((resolve, reject) => {
        const busboy = Busboy({
          headers: {
            'content-type': event.headers['content-type'] || event.headers['Content-Type']
          }
        });
        
        const result = {
          file: null,
          fields: {}
        };

        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
          const chunks = [];
          file.on('data', (chunk) => chunks.push(chunk));
          file.on('end', () => {
            result.file = {
              buffer: Buffer.concat(chunks),
              filename,
              mimetype
            };
          });
        });

        busboy.on('field', (fieldname, value) => {
          result.fields[fieldname] = value;
        });

        busboy.on('finish', () => resolve(result));
        busboy.on('error', reject);

        // 处理 base64 编码的 body
        const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;
        busboy.write(body);
        busboy.end();
      });
    }

    // 上传文件
    async function uploadAsset(event, context) {
      try {
        const parsed = await parseMultipart(event);
        const { file, fields } = parsed;
        
        if (!file) {
          return createResponse(400, null, '缺少文件');
        }

        const { type, tags, name } = fields;
        if (!type) {
          return createResponse(400, null, '缺少素材类型');
        }

        const validTypes = ['image', 'video', 'audio', 'document'];
        if (!validTypes.includes(type)) {
          return createResponse(400, null, '无效的素材类型');
        }

        const fileId = uuidv4();
        const fileName = name || file.filename;
        const filePath = `saas_temp/${type}/${fileId}`;

        // 上传到云存储
        const uploadResult = await storage.upload({
          cloudPath: filePath,
          fileContent: file.buffer
        });

        // 获取用户信息
        const userInfo = event.userInfo || {};
        const openId = userInfo.openId || 'anonymous';

        // 保存到数据模型
        const assetData = {
          name: fileName,
          type,
          tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
          url: uploadResult.fileID,
          size: file.buffer.length,
          owner: openId,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await models.asset.create({
          data: assetData
        });

        return createResponse(0, {
          id: result.data._id,
          name: assetData.name,
          type: assetData.type,
          tags: assetData.tags,
          url: assetData.url,
          size: assetData.size,
          owner: assetData.owner,
          createdAt: assetData.createdAt
        });
      } catch (error) {
        console.error('Upload error:', error);
        return createResponse(500, null, error.message);
      }
    }

    // 获取素材列表
    async function listAssets(event, context) {
      try {
        const query = event.queryString || {};
        const page = parseInt(query.page) || 1;
        const size = Math.min(parseInt(query.size) || 20, 100);
        const { type, tags, keyword } = query;

        const where = {};
        
        if (type) {
          where.type = { $eq: type };
        }

        if (tags) {
          const tagList = tags.split(',').map(tag => tag.trim());
          where.tags = { $in: tagList };
        }

        if (keyword) {
          where.$or = [
            { name: { $search: keyword } },
            { tags: { $search: keyword } }
          ];
        }

        const result = await models.asset.list({
          filter: {
            where
          },
          pageSize: size,
          pageNumber: page,
          getCount: true,
          select: {
            $master: true
          },
          orderBy: [{
            field: 'createdAt',
            direction: 'desc'
          }]
        });

        return createResponse(0, {
          list: result.data.records,
          total: result.data.total
        });
      } catch (error) {
        console.error('List error:', error);
        return createResponse(500, null, error.message);
      }
    }

    // 获取下载链接
    async function downloadAsset(event, context) {
      try {
        const { id } = event.queryString || {};
        
        if (!id) {
          return createResponse(400, null, '缺少素材ID');
        }

        const result = await models.asset.get({
          filter: {
            where: { _id: { $eq: id } }
          },
          select: {
            url: true
          }
        });

        if (!result.data.records || result.data.records.length === 0) {
          return createResponse(404, null, '素材不存在');
        }

        const asset = result.data.records[0];
        const downloadUrl = await storage.getTempFileURL({
          fileList: [asset.url]
        });

        return createResponse(0, {
          url: downloadUrl.fileList[0].tempFileURL,
          expiresIn: 900 // 15分钟
        });
      } catch (error) {
        console.error('Download error:', error);
        return createResponse(500, null, error.message);
      }
    }

    // 删除素材
    async function deleteAsset(event, context) {
      try {
        const { id } = event.queryString || {};
        
        if (!id) {
          return createResponse(400, null, '缺少素材ID');
        }

        // 获取用户信息
        const userInfo = event.userInfo || {};
        const openId = userInfo.openId || 'anonymous';

        // 查询素材
        const result = await models.asset.get({
          filter: {
            where: { _id: { $eq: id } }
          },
          select: {
            url: true,
            owner: true
          }
        });

        if (!result.data.records || result.data.records.length === 0) {
          return createResponse(404, null, '素材不存在');
        }

        const asset = result.data.records[0];

        // 权限校验
        if (asset.owner !== openId) {
          return createResponse(403, null, '无权限删除该素材');
        }

        // 删除云存储文件
        await storage.deleteFile({
          fileList: [asset.url]
        });

        // 删除数据记录
        await models.asset.delete({
          filter: {
            where: { _id: { $eq: id } }
          }
        });

        return createResponse(0, { id });
      } catch (error) {
        console.error('Delete error:', error);
        return createResponse(500, null, error.message);
      }
    }

    // 更新素材
    async function updateAsset(event, context) {
      try {
        const body = JSON.parse(event.body || '{}');
        const { id, name, tags } = body;

        if (!id) {
          return createResponse(400, null, '缺少素材ID');
        }

        if (!name && !tags) {
          return createResponse(400, null, '缺少更新内容');
        }

        // 获取用户信息
        const userInfo = event.userInfo || {};
        const openId = userInfo.openId || 'anonymous';

        // 查询素材
        const result = await models.asset.get({
          filter: {
            where: { _id: { $eq: id } }
          },
          select: {
            owner: true
          }
        });

        if (!result.data.records || result.data.records.length === 0) {
          return createResponse(404, null, '素材不存在');
        }

        const asset = result.data.records[0];

        // 权限校验
        if (asset.owner !== openId) {
          return createResponse(403, null, '无权限更新该素材');
        }

        // 构建更新数据
        const updateData = {
          updatedAt: new Date()
        };
        
        if (name) updateData.name = name;
        if (tags) updateData.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());

        // 更新记录
        await models.asset.update({
          data: updateData,
          filter: {
            where: { _id: { $eq: id } }
          }
        });

        return createResponse(0, {
          id,
          name: updateData.name,
          tags: updateData.tags,
          updatedAt: updateData.updatedAt
        });
      } catch (error) {
        console.error('Update error:', error);
        return createResponse(500, null, error.message);
      }
    }

    // 路由分发
    exports.main = async (event, context) => {
      const { httpMethod, path } = event;

      try {
        switch (`${httpMethod} ${path}`) {
          case 'POST /upload':
            return await uploadAsset(event, context);
          case 'GET /list':
            return await listAssets(event, context);
          case 'GET /download':
            return await downloadAsset(event, context);
          case 'DELETE /delete':
            return await deleteAsset(event, context);
          case 'PUT /update':
            return await updateAsset(event, context);
          default:
            return createResponse(404, null, '接口不存在');
        }
      } catch (error) {
        console.error('Router error:', error);
        return createResponse(500, null, '服务器内部错误');
      }
    };
  