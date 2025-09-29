
export async function getAssetDownloadUrl(fileId) {
  if (!fileId || typeof fileId !== 'string') {
    throw new Error('assetId 不能为空且必须是字符串');
  }
  
  try {
    const tcb = await window.$w.cloud.getCloudInstance();
    const result = await tcb.callFunction({
      name: 'get-asset-download-url',
      data: { fileId }
    });
    
    if (result.result.success) {
      return result.result.downloadUrl;
    } else {
      throw new Error(result.result.error || 'Failed to get download URL');
    }
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw error;
  }
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getAssetIcon(type) {
  const icons = {
    image: '🖼️',
    video: '🎥',
    audio: '🎵',
    document: '📄',
    other: '📁',
  };
  return icons[type] || icons.other;
}
  