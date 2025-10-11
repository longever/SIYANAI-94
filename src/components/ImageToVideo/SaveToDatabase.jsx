// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';

export function SaveToDatabase() {
  // 这个组件提供保存功能，不包含UI
  return null;
}
export async function saveDigitalHumanVideo(data, $w) {
  const requiredFields = ['prompt', 'voice_url', 'voice_type', 'avatar_url', 'avatar_type', 'resolution', 'aspect_ratio', 'duration', 'fps', 'quality', 'video_url', 'status', 'task_id'];

  // 验证必填字段
  const missingFields = requiredFields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    throw new Error(`缺少必填字段: ${missingFields.join(', ')}`);
  }
  try {
    const result = await $w.cloud.callDataSource({
      dataSourceName: 'digital_human_videos',
      methodName: 'wedaCreateV2',
      params: {
        data: {
          prompt: data.prompt,
          voice_url: data.voice_url,
          voice_type: data.voice_type,
          avatar_url: data.avatar_url,
          avatar_type: data.avatar_type,
          resolution: data.resolution,
          aspect_ratio: data.aspect_ratio,
          duration: data.duration,
          fps: data.fps,
          quality: data.quality,
          video_url: data.video_url,
          status: data.status,
          task_id: data.task_id,
          aliyun_task_id: data.aliyun_task_id || '',
          seed: data.seed || 0,
          generation_params: data.generation_params || {},
          callback_config: data.callback_config || {},
          estimated_time_seconds: data.estimated_time_seconds || 0,
          progress_details: data.progress_details || {},
          error_code: data.error_code || '',
          error_message: data.error_message || '',
          usage_stats: data.usage_stats || {},
          retry_count: data.retry_count || 0,
          created_from: data.created_from || 'web',
          createdAt: Date.now(),
          // 修改为数字类型时间戳
          updatedAt: Date.now() // 修改为数字类型时间戳
        }
      }
    });
    return result;
  } catch (error) {
    console.error('保存数字人视频记录失败:', error);
    throw error;
  }
}
export async function updateDigitalHumanVideo(taskId, updateData, $w) {
  try {
    const result = await $w.cloud.callDataSource({
      dataSourceName: 'digital_human_videos',
      methodName: 'wedaUpdateV2',
      params: {
        data: {
          ...updateData,
          updatedAt: Date.now() // 确保更新时也使用数字类型时间戳
        },
        filter: {
          where: {
            task_id: {
              $eq: taskId
            }
          }
        }
      }
    });
    return result;
  } catch (error) {
    console.error('更新数字人视频记录失败:', error);
    throw error;
  }
}
export async function getDigitalHumanVideos($w, limit = 50) {
  try {
    const result = await $w.cloud.callDataSource({
      dataSourceName: 'digital_human_videos',
      methodName: 'wedaGetRecordsV2',
      params: {
        orderBy: [{
          createdAt: 'desc'
        }],
        pageSize: limit,
        pageNumber: 1,
        getCount: true,
        select: {
          $master: true
        }
      }
    });
    return result;
  } catch (error) {
    console.error('获取数字人视频列表失败:', error);
    throw error;
  }
}