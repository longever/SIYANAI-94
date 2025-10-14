
'use strict';

const cloudbase = require('@cloudbase/node-sdk');

// 初始化云开发
let app;
try {
  app = cloudbase.init({
    env: cloudbase.SYMBOL_CURRENT_ENV
  });
  console.log('云开发初始化成功');
} catch (error) {
  console.error('云开发初始化失败:', error);
  throw error;
}

// 获取 APIs 资源连接器实例
let aliyunDashscope;
try {
  // 修复：使用正确的连接器名称格式
  aliyunDashscope = app.connector('aliyun_dashscope_jbn02va');
  console.log('API连接器初始化成功');
} catch (error) {
  console.error('API连接器初始化失败:', error);
  // 如果连接器不存在，尝试使用备用方式
  try {
    aliyunDashscope = app.connector('aliyun_dashscope');
    console.log('使用备用连接器名称初始化成功');
  } catch (backupError) {
    console.error('备用连接器初始化也失败:', backupError);
    throw error;
  }
}

// 工具函数：将云存储文件 ID 转换为临时 URL
async function getTempUrl(fileId) {
  if (!fileId) return null;

  // 如果是 HTTP URL，直接返回
  if (typeof fileId === 'string' && fileId.startsWith('http')) {
    return fileId;
  }

  // 如果是云存储文件 ID，获取临时 URL
  try {
    const res = await app.getTempFileURL({
      fileList: [fileId]
    });

    if (!res || !res.fileList || res.fileList.length === 0 || !res.fileList[0].tempFileURL) {
      console.error('获取临时URL失败:', res);
      throw new Error(`无法获取文件临时链接: ${fileId}`);
    }

    return res.fileList[0].tempFileURL;
  } catch (error) {
    console.error('获取临时URL出错:', error);
    throw error;
  }
}

// 工具函数：获取图片临时 URL
async function getImageTempUrl(imageUrl, imageFileId) {
  if (imageUrl && typeof imageUrl === 'string') {
    return await getTempUrl(imageUrl);
  }

  if (imageFileId && typeof imageFileId === 'string') {
    return await getTempUrl(imageFileId);
  }

  throw new Error('必须提供 imageUrl 或 imageFileId');
}

// 工具函数：获取音频临时 URL
async function getAudioTempUrl(audioUrl, audioFileId) {
  if (audioUrl && typeof audioUrl === 'string') {
    return await getTempUrl(audioUrl);
  }

  if (audioFileId && typeof audioFileId === 'string') {
    return await getTempUrl(audioFileId);
  }

  throw new Error('必须提供 audioUrl 或 audioFileId');
}

// 图片检测阶段
async function detectImage(imageTempUrl) {
  console.log('开始图片检测...');
  console.log('图片临时URL:', imageTempUrl);

  if (!imageTempUrl) {
    throw new Error('图片URL不能为空');
  }

  try {
    const detectResult = await aliyunDashscope.invoke('aliyun_dashscope_emo_detect_v1', {
      image: imageTempUrl
    });

    if (!detectResult) {
      throw new Error('检测接口返回空结果');
    }

    if (detectResult.code !== 0) {
      throw new Error(`检测失败: ${detectResult.message || '未知错误'}`);
    }

    console.log('图片检测完成:', detectResult.data);
    return detectResult.data;
  } catch (error) {
    console.error('图片检测出错:', error);
    throw error;
  }
}

// 视频生成阶段
async function generateVideo(imageTempUrl, audioTempUrl, detectResult, callbackUrl, userContext) {
  console.log('开始视频生成...');
  console.log('图片临时URL:', imageTempUrl);
  console.log('音频临时URL:', audioTempUrl);

  if (!imageTempUrl || !audioTempUrl) {
    throw new Error('图片和音频URL都不能为空');
  }

  const params = {
    image: imageTempUrl,
    audio: audioTempUrl,
    detectResult: detectResult || {},
    callbackUrl: callbackUrl || '',
    userContext: userContext || {}
  };

  try {
    const videoResult = await aliyunDashscope.invoke('emo_v1', params);

    if (!videoResult) {
      throw new Error('视频生成接口返回空结果');
    }

    if (videoResult.code !== 0) {
      throw new Error(`视频生成失败: ${videoResult.message || '未知错误'}`);
    }

    console.log('视频任务创建完成:', videoResult.data);
    return videoResult.data;
  } catch (error) {
    console.error('视频生成出错:', error);
    throw error;
  }
}

exports.main = async (event, context) => {
  console.log('收到请求:', JSON.stringify(event, null, 2));

  try {
    // 参数验证
    if (!event || typeof event !== 'object') {
      return {
        status: 'FAIL',
        error: '请求参数格式错误'
      };
    }

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
    let imageTempUrl, audioTempUrl;
    try {
      imageTempUrl = await getImageTempUrl(imageUrl, imageFileId);
      audioTempUrl = await getAudioTempUrl(audioUrl, audioFileId);
    } catch (error) {
      console.error('获取临时URL失败:', error);
      return {
        status: 'FAIL',
        error: `获取文件失败: ${error.message}`
      };
    }

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
