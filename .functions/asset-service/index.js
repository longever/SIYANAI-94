
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');
    const formidable = require('formidable');
    const fs = require('fs');
    const path = require('path');

    // 初始化 CloudBase SDK
    const app = cloudbase.init({
      env: cloudbase.SYMBOL_CURRENT_ENV
    });
    const db = app.database();
    const storage = app.storage();

    // 数据模型名称
    const ASSET_COLLECTION = 'assets';

    /**
     * 解析 multipart/form-data
     */
    async function parseMultipart(event) {
      return new Promise((resolve, reject) => {
        const form = formidable({
          multiples: false,
          keepExtensions: true,
          maxFileSize: 10 * 1024 * 1024 // 10MB
        });

        form.parse(event, (err, fields, files) => {
          if (err) {
            reject(err);
          } else {
            resolve({ fields, files });
          }
        });
      });
    }

    /**
     * 上传文件到云存储
     */
    async function uploadToStorage(file, filename) {
      const fileName = `saas_temp/${Date.now()}_${filename}`;
      const fileContent = fs.readFileSync(file.filepath);
      
      const result = await storage.uploadFile({
        cloudPath: fileName,
        fileContent
      });

      return {
        fileID: result.fileID,
        url: result.fileID
      };
    }

    /**
     * 创建素材记录
     */
    async function createAssetRecord(fileInfo, metadata) {
      const record = {
        fileID: fileInfo.fileID,
        originalName: metadata.originalName,
        size: metadata.size,
        mimetype: metadata.mimetype,
        tags: metadata.tags || [],
        description: metadata.description || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection(ASSET_COLLECTION).add(record);
      return {
        id: result.id,
        ...record
      };
    }

    /**
     * 获取素材列表（分页）
     */
    async function getAssetList(page = 1, pageSize = 20) {
      const skip = (page - 1) * pageSize;
      
      const [listResult, countResult] = await Promise.all([
        db.collection(ASSET_COLLECTION)
          .orderBy('createdAt', 'desc')
          .skip(skip)
          .limit(pageSize)
          .get(),
        db.collection(ASSET_COLLECTION).count()
      ]);

      return {
        list: listResult.data,
        total: countResult.total,
        page,
        pageSize
      };
    }

    /**
     * 删除素材
     */
    async function deleteAsset(id) {
      // 先获取素材信息
      const asset = await db.collection(ASSET_COLLECTION).doc(id).get();
      if (!asset.data) {
        throw new Error('素材不存在');
      }

      // 删除云存储文件
      await storage.deleteFile({
        fileList: [asset.data.fileID]
      });

      // 删除数据库记录
      await db.collection(ASSET_COLLECTION).doc(id).remove();

      return true;
    }

    /**
     * 更新素材信息
     */
    async function updateAsset(id, updateData) {
      const allowedFields = ['tags', 'description'];
      const filteredData = {};
      
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredData[key] = updateData[key];
        }
      });

      if (Object.keys(filteredData).length === 0) {
        throw new Error('没有可更新的字段');
      }

      filteredData.updatedAt = new Date();

      const result = await db.collection(ASSET_COLLECTION).doc(id).update(filteredData);
      
      if (result.updated === 0) {
        throw new Error('素材不存在');
      }

      const updatedAsset = await db.collection(ASSET_COLLECTION).doc(id).get();
      return updatedAsset.data;
    }

    /**
     * 获取带签名的下载链接
     */
    async function getDownloadUrl(id) {
      const asset = await db.collection(ASSET_COLLECTION).doc(id).get();
      if (!asset.data) {
        throw new Error('素材不存在');
      }

      const result = await storage.getTemporaryUrl({
        fileList: [{
          fileID: asset.data.fileID,
          maxAge: 3600 // 1小时有效期
        }]
      });

      return {
        url: result.fileList[0].tempFileURL,
        expires: new Date(Date.now() + 3600 * 1000)
      };
    }

    /**
     * 路由处理
     */
    async function handleRequest(event) {
      const { path, httpMethod, queryStringParameters, body } = event;
      
      try {
        // POST /upload
        if (httpMethod === 'POST' && path === '/upload') {
          const { fields, files } = await parseMultipart(event);
          const file = files.file;
          
          if (!file) {
            throw new Error('缺少文件字段');
          }

          const uploadResult = await uploadToStorage(file, file.originalFilename);
          const assetRecord = await createAssetRecord(uploadResult, {
            originalName: file.originalFilename,
            size: file.size,
            mimetype: file.mimetype,
            tags: fields.tags ? JSON.parse(fields.tags) : [],
            description: fields.description || ''
          });

          return {
            code: 0,
            data: {
              id: assetRecord.id,
              fileId: assetRecord.fileID,
              url: assetRecord.url,
              tags: assetRecord.tags,
              description: assetRecord.description,
              createdAt: assetRecord.createdAt
            }
          };
        }

        // GET /list
        if (httpMethod === 'GET' && path === '/list') {
          const page = parseInt(queryStringParameters?.page) || 1;
          const pageSize = parseInt(queryStringParameters?.pageSize) || 20;
          
          const result = await getAssetList(page, pageSize);
          
          return {
            code: 0,
            data: result
          };
        }

        // DELETE /:id
        if (httpMethod === 'DELETE' && path.startsWith('/')) {
          const id = path.substring(1);
          await deleteAsset(id);
          
          return {
            code: 0,
            message: '删除成功'
          };
        }

        // PUT /:id
        if (httpMethod === 'PUT' && path.startsWith('/')) {
          const id = path.substring(1);
          const updateData = JSON.parse(body || '{}');
          
          const updatedAsset = await updateAsset(id, updateData);
          
          return {
            code: 0,
            data: {
              id: updatedAsset._id,
              tags: updatedAsset.tags,
              description: updatedAsset.description,
              updatedAt: updatedAsset.updatedAt
            }
          };
        }

        // GET /download/:id
        if (httpMethod === 'GET' && path.startsWith('/download/')) {
          const id = path.substring('/download/'.length);
          const downloadInfo = await getDownloadUrl(id);
          
          return {
            code: 0,
            data: {
              url: downloadInfo.url,
              expires: downloadInfo.expires
            }
          };
        }

        throw new Error('不支持的接口');
      } catch (error) {
        console.error('Error:', error);
        return {
          code: 1,
          message: error.message || '服务器内部错误'
        };
      }
    }

    exports.main = async (event, context) => {
      // 兼容云函数调用方式
      if (event.action) {
        switch (event.action) {
          case 'upload':
            return await handleRequest({
              ...event,
              httpMethod: 'POST',
              path: '/upload'
            });
          case 'list':
            return await handleRequest({
              ...event,
              httpMethod: 'GET',
              path: '/list',
              queryStringParameters: event.data
            });
          case 'delete':
            return await handleRequest({
              ...event,
              httpMethod: 'DELETE',
              path: `/${event.id}`
            });
          case 'update':
            return await handleRequest({
              ...event,
              httpMethod: 'PUT',
              path: `/${event.id}`,
              body: JSON.stringify(event.data)
            });
          case 'download':
            return await handleRequest({
              ...event,
              httpMethod: 'GET',
              path: `/download/${event.id}`
            });
          default:
            return { code: 1, message: '不支持的action' };
        }
      }

      // HTTP API 调用方式
      return await handleRequest(event);
    };
  