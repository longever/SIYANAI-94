
// @ts-ignore;
import { format } from 'date-fns';

// 格式化文件大小
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 获取素材缩略图URL
export async function getAssetThumbnailUrl(asset, $w) {
  if (asset.type === 'image' && (asset.url || asset.fileId || asset.cloudPath)) {
    try {
      const fileId = asset.url || asset.fileId || asset.cloudPath;
      const tcb = await $w.cloud.getCloudInstance();
      const result = await tcb.getTempFileURL({
        fileList: [fileId]
      });
      if (result.fileList && result.fileList[0] && result.fileList[0].tempFileURL) {
        return result.fileList[0].tempFileURL;
      }
    } catch (error) {
      console.error('获取缩略图失败:', error);
    }
  }
  return null;
}

// 获取素材下载URL
export async function getAssetDownloadUrl(asset, $w) {
  try {
    const fileId = asset.url || asset.fileId || asset.cloudPath;
    if (!fileId) {
      throw new Error('无法获取文件ID');
    }
    
    const tcb = await $w.cloud.getCloudInstance();
    const result = await tcb.getTempFileURL({
      fileList: [fileId]
    });
    
    if (result.fileList && result.fileList[0] && result.fileList[0].tempFileURL) {
      return result.fileList[0].tempFileURL;
    } else {
      throw new Error('获取下载链接失败');
    }
  } catch (error) {
    console.error('获取下载链接失败:', error);
    throw error;
  }
}

// 格式化日期
export function formatDate(date) {
  if (!date) return '';
  return format(new Date(date), 'yyyy-MM-dd HH:mm');
}

// 获取文件类型图标
export function getFileIcon(type) {
  const icons = {
    image: '🖼️',
    video: '🎥',
    audio: '🎵',
    document: '📄'
  };
  return icons[type] || '📁';
}

// 获取文件类型颜色
export function getFileTypeColor(type) {
  const colors = {
    image: 'text-green-600 bg-green-100',
    video: 'text-red-600 bg-red-100',
    audio: 'text-blue-600 bg-blue-100',
    document: 'text-yellow-600 bg-yellow-100'
  };
  return colors[type] || 'text-gray-600 bg-gray-100';
}
