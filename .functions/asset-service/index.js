
'use strict';

const cloudbase = require('@cloudbase/node-sdk');

// 初始化 CloudBase SDK
const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV
});
const models = app.models;

// 统一响应格式
function successResponse(data, message = 'success') {
  return {
    code: 0,
    data,
    message
  };
}

function errorResponse(error, message = '操作失败') {
  console.error('Asset Service Error:', error);
  return {
    code: -1,
    error: error.message || error,
    message
  };
}

// 参数验证函数
function validateParams(params, requiredFields) {
  const missing = requiredFields.filter(field => !params[field]);
  if (missing.length > 0) {
    throw new Error(`缺少必填参数: ${missing.join(', ')}`);
  }
}

// 创建资产
async function createAsset(assetData) {
  validateParams(assetData, ['name', 'type', 'value']);

  const asset = {
    ...assetData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false
  };

  const result = await models.asset.create({ data: asset });
  return result.data;
}

// 查询资产列表
async function listAssets(params = {}) {
  const { page = 1, limit = 10, type, status, keyword } = params;

  const filter = {
    where: {
      isDeleted: { $eq: false }
    }
  };

  if (type) {
    filter.where.type = { $eq: type };
  }

  if (status) {
    filter.where.status = { $eq: status };
  }

  if (keyword) {
    filter.where.name = { $regex: keyword, $options: 'i' };
  }

  const result = await models.asset.list({
    filter,
    sort: { updatedAt: 'desc' },
    pageSize: limit,
    pageNumber: page
  });

  return {
    list: result.data.records,
    total: result.data.total,
    page,
    limit
  };
}

// 获取资产详情
async function getAsset(assetId) {
  validateParams({ assetId }, ['assetId']);

  const result = await models.asset.get({
    filter: {
      where: {
        _id: { $eq: assetId },
        isDeleted: { $eq: false }
      }
    }
  });

  if (!result.data) {
    throw new Error('Asset not found');
  }

  return result.data;
}

// 更新资产
async function updateAsset(assetId, updateData) {
  validateParams({ assetId }, ['assetId']);

  const updateInfo = {
    ...updateData,
    updatedAt: Date.new()
  };

  const result = await models.asset.update({
    filter: {
      where: {
        _id: { $eq: assetId },
        isDeleted: { $eq: false }
      }
    },
    data: updateInfo
  });

  if (result.data.matchedCount === 0) {
    throw new Error('Asset not found');
  }

  return { matchedCount: result.data.matchedCount };
}

// 删除资产（软删除）
async function deleteAsset(assetId) {
  validateParams({ assetId }, ['assetId']);

  const result = await models.asset.update({
    filter: {
      where: {
        _id: { $eq: assetId },
        isDeleted: { $eq: false }
      }
    },
    data: {
      isDeleted: true,
      deletedAt: Date.new(),
      updatedAt: Date.new()
    }
  });

  if (result.data.matchedCount === 0) {
    throw new Error('Asset not found');
  }

  return { matchedCount: result.data.matchedCount };
}

// 主函数入口
exports.main = async (event, context) => {
  try {
    const { action, data } = event;

    if (!action) {
      return errorResponse(new Error('缺少 action 参数'));
    }

    switch (action) {
      case 'createAsset':
        return successResponse(await createAsset(data));

      case 'listAssets':
        return successResponse(await listAssets(data));

      case 'getAsset':
        return successResponse(await getAsset(data.assetId));

      case 'updateAsset':
        return successResponse(await updateAsset(data.assetId, data.updateData));

      case 'deleteAsset':
        return successResponse(await deleteAsset(data.assetId));

      default:
        return errorResponse(new Error(`不支持的操作: ${action}`));
    }
  } catch (error) {
    return errorResponse(error);
  }
};
