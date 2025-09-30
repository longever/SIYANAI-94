
export async function getAssetDownloadUrl(fileId) {
  if (!fileId || typeof fileId !== 'string') {
    throw new Error('assetId 不能为空且必须是字符串');
  }
  
  try {
    const tcb = await window.$w.cloud.getCloudInstance();
    const result = await tcb.getTempFileURL({
      fileList: [fileId]
    });
    
    if (result.fileList && result.fileList.length > 0) {
      return result.fileList[0].tempFileURL;
    } else {
      throw new Error('Failed to get download URL');
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
    font: '🔤',
    model: '🧊',
    other: '📁',
  };
  return icons[type] || icons.other;
}

export function getAssetTypeFromMime(mimeType) {
  if (!mimeType) return 'other';
  
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('font')) return 'font';
  if (mimeType.includes('model') || mimeType.includes('glb') || mimeType.includes('gltf')) return 'model';
  
  return 'document';
}

export function getSubfolderByType(type) {
  const typeMap = {
    image: 'image',
    video: 'video',
    audio: 'audio',
    font: 'font',
    model: 'model',
    document: 'document',
    other: 'other'
  };
  return typeMap[type] || 'other';
}
  