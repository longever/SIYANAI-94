
'use strict';

const cloudbase = require('@cloudbase/node-sdk');

// 初始化云开发
const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV
});

// 获取 APIs 资源连接器实例
const aliyunDashscope = app.connector('aliyun_dashscope_jbn02va');

// 工具函数：将云存储文件 ID 转换为临时 URL
async function getTempUrl(fileId) {
  if (!fileId) return null;
  
  // 如果是 HTTP URL，直接返回
  if (fileId.startsWith('http')) {
    return fileId;
  }
  
  // 如果是云存储文件 ID，获取临时 URL
  const res = await app.getTempFileURL({
    fileList: [fileId]
  });
  
  if (!res.fileList || res.fileList.length === 0 || !res.fileList[0].tempFileURL) {
    throw new Error(`无法获取文件临时链接: ${fileId}`);
  }
  
  return res.fileList[0].tempFileURL;
}

// 工具函数：获取图片临时 URL
async function getImageTempUrl(imageUrl, imageFileId) {
  if (imageUrl) {
    return await getTempUrl(imageUrl);
  }
  
  if (imageFileId) {
    return await getTempUrl(imageFileId);
  }
  
  throw new Error('必须提供 imageUrl 或 imageFileId');
}

// 工具函数：获取音频临时 URL
async function getAudioTempUrl(audioUrl, audioFileId) {
  if (audioUrl) {
    return await getTempUrl(audioUrl);
  }
  
  if (audioFileId) {
    return await getTempUrl(audioFileId);
  }
  
  throw new Error('必须提供 audioUrl 或 audioFileId');
}

// 图片检测阶段
async function detectImage(imageTempUrl) {
  console.log('开始图片检测...');
  console.log('图片临时URL:', imageTempUrl);
  
  const detectResult = await aliyunDashscope.invoke('aliyun_dashscope_emo_detect_v1', {
    image: imageTempUrl
  });
  
  if (detectResult.code !== 0) {
    throw new Error(`检测失败: ${detectResult.message || '未知错误'}`);
  }
  
  console.log('图片检测完成:', detectResult.data);
  return detectResult.data;
}

// 视频生成阶段
async function generateVideo(imageTempUrl, audioTempUrl, detectResult, callbackUrl, userContext) {
  console.log('开始视频生成...');
  console.log('图片临时URL:', imageTempUrl);
  console.log('音频临时URL:', audioTempUrl);
  
  const params = {
    image: imageTempUrl,
    audio: audioTempUrl,
    detectResult: detectResult,
    callbackUrl,
    userContext
  };
  
  const videoResult = await aliyunDashscope.invoke('emo_v1', params);
  
  if (videoResult.code !== 0) {
    throw new Error(`视频生成失败: ${videoResult.message || '未知错误'}`);
  }
  
  console.log('视频任务创建完成:', videoResult.data);
  return videoResult.data;
}

exports.main = async (event, context) => {
  try {
    console.log('收到请求:', JSON.stringify(event, null, 2));
    
    // 解析输入参数
    const { 
      imageUrl, 
      imageFileId, 
      audioUrl, 
      audioFileId, 
      callbackUrl, 
      userContext 
    } = event;
    
    // 参数校验
    if (!imageUrl && !imageFileId) {
      return {
        status: 'FAIL',
        error: '必须提供 imageUrl 或 imageFileId'
      };
    }
    
    if (!audioUrl && !audioFileId) {
      return {
        status: 'FAIL',
        error: '必须提供 audioUrl 或 audioFileId'
      };
    }
    
    // 获取图片和音频的临时 URL
    const imageTempUrl = await getImageTempUrl(imageUrl, imageFileId);
    const audioTempUrl = await getAudioTempUrl(audioUrl, audioFileId);
    
    console.log('成功获取临时URL');
    
    // 第一步：图片检测
    let detectResult;
    try {
      detectResult = await detectImage(imageTempUrl);
    } catch (error) {
      console.error('图片检测失败:', error);
      return {
        status: 'DETECT_FAIL',
        error: error.message
      };
    }
    
    // 第二步：视频生成
    let videoResult;
    try {
      videoResult = await generateVideo(
        imageTempUrl, 
        audioTempUrl, 
        detectResult, 
        callbackUrl, 
        userContext
      );
    } catch (error) {
      console.error('视频生成失败:', error);
      return {
        status: 'FAIL',
        error: error.message
      };
    }
    
    // 成功返回
    const response = {
      taskId: videoResult.taskId,
      status: 'GENERATING',
      detectResult: detectResult,
      tempUrls: {
        image: imageTempUrl,
        audio: audioTempUrl
      }
    };
    
    console.log('返回结果:', response);
    return response;
    
  } catch (error) {
    console.error('函数执行错误:', error);
    return {
      status: 'FAIL',
      error: error.message || '内部错误'
    };
  }
};
  