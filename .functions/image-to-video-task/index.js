
const cloud = require('wx-server-sdk');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 支持的生成类型
const GENERATION_TYPES = {
  IMAGE_TO_VIDEO: 'image_to_video',
  IMAGE_AUDIO_TO_VIDEO: 'image_audio_to_video',
  IMAGE_VIDEO_TO_VIDEO: 'image_video_to_video'
};

// 调用外部AI服务生成视频
async function callVideoGenerationAPI(params) {
  const {
    type,
    imageUrl,
    audioUrl,
    videoUrl,
    settings,
    prompt
  } = params;

  try {
    // 这里应该替换为实际的AI服务API
    const apiEndpoint = process.env.VIDEO_GENERATION_API || 'https://api.example.com/generate-video';
    
    const requestData = {
      type,
      image_url: imageUrl,
      prompt: prompt || 'Generate a smooth video from the given image',
      settings: {
        duration: settings.duration || 5,
        fps: settings.fps || 24,
        resolution: settings.resolution || '720p',
        ...settings
      }
    };

    // 根据类型添加额外参数
    if (type === GENERATION_TYPES.IMAGE_AUDIO_TO_VIDEO) {
      requestData.audio_url = audioUrl;
    } else if (type === GENERATION_TYPES.IMAGE_VIDEO_TO_VIDEO) {
      requestData.video_url = videoUrl;
    }

    console.log('Calling video generation API:', requestData);

    const response = await axios.post(apiEndpoint, requestData, {
      headers: {
        'Authorization': `Bearer ${process.env.AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 300000 // 5分钟超时
    });

    return response.data;
  } catch (error) {
    console.error('Video generation API error:', error);
    throw new Error(`视频生成失败: ${error.message}`);
  }
}

// 更新任务状态
async function updateTaskStatus(taskId, status, result = null, error = null) {
  try {
    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (result) {
      updateData.result = result;
      updateData.videoUrl = result.video_url;
      updateData.thumbnailUrl = result.thumbnail_url;
    }

    if (error) {
      updateData.error = error;
    }

    await db.collection('generation_tasks').doc(taskId).update({
      data: updateData
    });

    console.log(`Task ${taskId} status updated to: ${status}`);
  } catch (error) {
    console.error('Failed to update task status:', error);
  }
}

// 主函数：处理视频生成任务
exports.main = async (event, context) => {
  const { taskId, type, params } = event;

  if (!taskId || !type || !params) {
    throw new Error('缺少必要参数: taskId, type, params');
  }

  if (!Object.values(GENERATION_TYPES).includes(type)) {
    throw new Error(`不支持的生成类型: ${type}`);
  }

  try {
    // 更新任务状态为处理中
    await updateTaskStatus(taskId, 'processing');

    // 调用AI服务生成视频
    const result = await callVideoGenerationAPI({
      type,
      ...params
    });

    // 更新任务状态为完成
    await updateTaskStatus(taskId, 'completed', result);

    return {
      success: true,
      taskId,
      result
    };
  } catch (error) {
    console.error('Video generation failed:', error);
    
    // 更新任务状态为失败
    await updateTaskStatus(taskId, 'failed', null, error.message);

    return {
      success: false,
      taskId,
      error: error.message
    };
  }
};
