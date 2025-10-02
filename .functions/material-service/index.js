
'use strict';

const cloudbase = require('@cloudbase/node-sdk');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');
const FormData = require('form-data');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 初始化 CloudBase
const app = cloudbase.init();
const models = app.models;
const storage = app.storage();

class MaterialService {
  constructor() {
    this.bucket = storage.bucket();
    this.assetModel = models.asset_library;
  }

  // 路由分发
  async handleRequest(event, context) {
    const { httpMethod, path: requestPath, headers, body, queryStringParameters } = event;
    
    try {
      // 获取用户ID（从token或上下文）
      const userId = this.getUserId(event, context);
      
      switch (httpMethod) {
        case 'POST':
          if (requestPath === '/materials') {
            return await this.uploadMaterial(body, headers, userId);
          } else if (requestPath === '/fetch-external') {
            return await this.fetchExternalMaterial(body, userId);
          }
          break;
          
        case 'GET':
          if (requestPath === '/materials') {
            return await this.listMaterials(queryStringParameters, userId);
          } else if (requestPath.startsWith('/materials/') && requestPath.endsWith('/download')) {
            const id = requestPath.split('/')[2];
            return await this.generateDownloadUrl(id, userId);
          }
          break;
          
        case 'DELETE':
          if (requestPath.startsWith('/materials/')) {
            const id = requestPath.split('/')[2];
            return await this.deleteMaterial(id, userId);
          }
          break;
      }
      
      return { error: 'Not Found', statusCode: 404 };
    } catch (error) {
      console.error('Error:', error);
      return { error: error.message || 'Internal Server Error', statusCode: 500 };
    }
  }

  // 获取用户ID
  getUserId(event, context) {
    // 从token或上下文中获取用户ID
    // 这里简化处理，实际应该从JWT token或微信上下文中获取
    return event.headers?.['x-user-id'] || 'default-user';
  }

  // 上传素材
  async uploadMaterial(body, headers, userId) {
    try {
      // 解析multipart/form-data
      const { fields, files } = await this.parseMultipart(body, headers);
      
      if (!files || !files.file) {
        throw new Error('No file uploaded');
      }
      
      const file = files.file;
      const type = fields.type || 'unknown';
      const tags = fields.tags ? JSON.parse(fields.tags) : [];
      
      // 生成唯一文件名
      const fileExtension = path.extname(file.filename);
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = `materials/${userId}/${fileName}`;
      
      // 上传到云存储
      const uploadResult = await this.bucket.upload(filePath, file.content);
      
      // 保存到数据模型
      const assetData = {
        url: uploadResult.fileID,
        type,
        tags,
        userId,
        createdAt: new Date().toISOString(),
        fileName: file.filename,
        fileSize: file.size,
        mimeType: file.mimetype
      };
      
      const result = await this.assetModel.create({
        data: assetData
      });
      
      return {
        id: result.data.id,
        url: uploadResult.fileID
      };
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  // 获取外部素材
  async fetchExternalMaterial(body, userId) {
    try {
      const { url, type, tags = [] } = JSON.parse(body);
      
      if (!url) {
        throw new Error('URL is required');
      }
      
      // 下载文件
      const fileData = await this.downloadFile(url);
      
      // 生成唯一文件名
      const urlPath = new URL(url).pathname;
      const fileExtension = path.extname(urlPath) || '.bin';
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = `materials/${userId}/${fileName}`;
      
      // 上传到云存储
      const uploadResult = await this.bucket.upload(filePath, fileData.buffer);
      
      // 保存到数据模型
      const assetData = {
        url: uploadResult.fileID,
        type: type || this.detectFileType(fileData.contentType, fileExtension),
        tags,
        userId,
        createdAt: new Date().toISOString(),
        fileName: path.basename(urlPath) || fileName,
        fileSize: fileData.buffer.length,
        mimeType: fileData.contentType,
        sourceUrl: url
      };
      
      const result = await this.assetModel.create({
        data: assetData
      });
      
      return {
        id: result.data.id,
        url: uploadResult.fileID
      };
    } catch (error) {
      throw new Error(`Fetch external failed: ${error.message}`);
    }
  }

  // 分页查询素材
  async listMaterials(query, userId) {
    try {
      const page = parseInt(query.page) || 1;
      const pageSize = parseInt(query.pageSize) || 20;
      const type = query.type;
      const tags = query.tags ? JSON.parse(query.tags) : [];
      
      // 构建查询条件
      const where = { userId };
      if (type) {
        where.type = type;
      }
      if (tags && tags.length > 0) {
        where.tags = { $in: tags };
      }
      
      const result = await this.assetModel.list({
        filter: {
          where
        },
        pageSize,
        pageNumber: page,
        getCount: true,
        orderBy: [{
          field: 'createdAt',
          direction: 'desc'
        }]
      });
      
      return {
        list: result.data.records.map(item => ({
          id: item.id,
          url: item.url,
          type: item.type,
          tags: item.tags,
          createdAt: item.createdAt
        })),
        total: result.data.total
      };
    } catch (error) {
      throw new Error(`List materials failed: ${error.message}`);
    }
  }

  // 删除素材
  async deleteMaterial(id, userId) {
    try {
      // 查询素材
      const material = await this.assetModel.get({
        filter: {
          where: {
            id,
            userId
          }
        }
      });
      
      if (!material.data.records || material.data.records.length === 0) {
        throw new Error('Material not found or no permission');
      }
      
      const asset = material.data.records[0];
      
      // 从云存储删除文件
      await this.bucket.delete(asset.url);
      
      // 从数据模型删除记录
      await this.assetModel.delete({
        filter: {
          where: {
            id,
            userId
          }
        }
      });
      
      return { success: true };
    } catch (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  // 生成下载URL
  async generateDownloadUrl(id, userId) {
    try {
      // 查询素材
      const material = await this.assetModel.get({
        filter: {
          where: {
            id,
            userId
          }
        }
      });
      
      if (!material.data.records || material.data.records.length === 0) {
        throw new Error('Material not found or no permission');
      }
      
      const asset = material.data.records[0];
      
      // 生成带签名的临时URL（15分钟有效期）
      const downloadUrl = await this.bucket.getSignedUrl(asset.url, {
        expiresIn: 15 * 60 // 15分钟
      });
      
      return {
        downloadUrl,
        expiresIn: 15 * 60
      };
    } catch (error) {
      throw new Error(`Generate download URL failed: ${error.message}`);
    }
  }

  // 解析multipart/form-data
  async parseMultipart(body, headers) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      
      // 这里简化处理，实际应该使用formidable或multer
      // 由于SCF环境限制，这里假设body已经是解析好的对象
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (error) {
        reject(new Error('Failed to parse multipart data'));
      }
    });
  }

  // 下载文件
  async downloadFile(url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      
      client.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: ${response.statusCode}`));
          return;
        }
        
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            buffer,
            contentType: response.headers['content-type'] || 'application/octet-stream'
          });
        });
      }).on('error', reject);
    });
  }

  // 检测文件类型
  detectFileType(contentType, fileExtension) {
    if (contentType) {
      const type = contentType.split('/')[0];
      return type === 'image' ? 'image' : 
             type === 'video' ? 'video' : 
             type === 'audio' ? 'audio' : 'file';
    }
    
    const ext = fileExtension.toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)) return 'image';
    if (['.mp4', '.avi', '.mov', '.wmv', '.flv'].includes(ext)) return 'video';
    if (['.mp3', '.wav', '.flac', '.aac'].includes(ext)) return 'audio';
    return 'file';
  }
}

// 云函数入口
exports.main = async (event, context) => {
  const service = new MaterialService();
  return await service.handleRequest(event, context);
};
