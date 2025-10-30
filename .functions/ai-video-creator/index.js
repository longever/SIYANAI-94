
'use strict';

const cloud = require('@cloudbase/node-sdk');
const app = cloud.init();
const db = app.database();

// 需要图片检测的模型类型
const IMAGE_DETECTION_MODELS = [
  'LivePortrait',
  'WAN_EMO_V1',
  'WAN_2_2_S2V',
  'Animate_Anyone'
];

// 调用图片检测函数
async function callImageDetector(imageData) {
  try {
    const result = await app.callFunction({
      name: 'imageDetector',
      data: imageData
    });
    return result.result;
  } catch (error) {
    console.error('图片检测失败:', error);
    throw new Error(`图片检测失败: ${error.message}`);
  }
}

// 校验图片数据
function validateImageData(data) {
  if (!data) {
    throw new Error('图片数据不能为空');
  }
  
  if (!data.imageUrl && !data.imageBase64) {
    throw new Error('必须提供 imageUrl 或 imageBase64');
  }
  
  return true;
}

// 判断是否需要图片检测
function needImageDetection(modelType) {
  if (!modelType) return false;
  return IMAGE_DETECTION_MODELS.includes(modelType);
}

// 原有的 initProcess 函数
async function initProcess(event) {
  const { modelType, ...otherParams } = event;
  
  // 初始化返回结果
  let result = {
    success: true,
    message: '初始化成功',
    data: {
      modelType,
      ...otherParams
    }
  };

  try {
    // 检查是否需要图片检测
    if (needImageDetection(modelType)) {
      console.log(`模型 ${modelType} 需要图片检测`);
      
      // 校验图片数据
      validateImageData(otherParams);
      
      // 调用图片检测
      const imageCheckResult = await callImageDetector({
        imageUrl: otherParams.imageUrl,
        imageBase64: otherParams.imageBase64,
        modelType: modelType
      });
      
      // 将检测结果添加到返回结果
      result.data.imageCheckResult = imageCheckResult;
      
      console.log('图片检测完成:', imageCheckResult);
    }
    
    // 原有的初始化逻辑可以继续在这里执行
    // ...
    
    return result;
    
  } catch (error) {
    console.error('初始化失败:', error);
    return {
      success: false,
      message: error.message || '初始化失败',
      data: null
    };
  }
}

// 主函数
exports.main = async (event, context) => {
  const { action } = event;
  
  switch (action) {
    case 'initProcess':
      return await initProcess(event);
      
    // 其他 action 保持不变
    case 'createVideo':
      // 原有的视频创建逻辑
      return { success: true, message: '视频创建成功' };
      
    case 'getStatus':
      // 原有的状态查询逻辑
      return { success: true, status: 'processing' };
      
    default:
      return {
        success: false,
        message: '未知的操作类型'
      };
  }
};
