
    // 获取素材下载URL的工具函数
    export async function getAssetDownloadUrl(assetId, $w) {
      try {
        // 首先获取素材信息
        const assetResult = await $w.cloud.callDataSource({
          dataSourceName: 'asset_library',
          methodName: 'wedaGetItemV2',
          params: {
            filter: {
              where: {
                _id: { $eq: assetId }
              }
            },
            select: { $master: true }
          }
        });

        if (!assetResult || !assetResult.url) {
          throw new Error('素材不存在或URL为空');
        }

        // 获取云存储实例
        const tcb = await $w.cloud.getCloudInstance();
        
        // 获取临时下载URL
        const tempFileResult = await tcb.getTempFileURL({
          fileList: [{
            fileID: assetResult.url,
            maxAge: 3600 // 1小时有效期
          }]
        });

        if (!tempFileResult.fileList || tempFileResult.fileList.length === 0) {
          throw new Error('无法获取临时URL');
        }

        const fileInfo = tempFileResult.fileList[0];
        if (fileInfo.code !== 'SUCCESS') {
          throw new Error(`获取URL失败: ${fileInfo.code}`);
        }

        return fileInfo.tempFileURL;
      } catch (error) {
        console.error('获取素材URL失败:', error);
        throw error;
      }
    }

    // 获取素材缩略图URL
    export async function getAssetThumbnailUrl(asset, $w) {
      try {
        if (!asset || !asset.url) return null;
        
        // 如果是图片类型，直接返回原图URL作为缩略图
        if (asset.type === 'image') {
          return await getAssetDownloadUrl(asset._id, $w);
        }
        
        // 如果是视频类型，检查是否有缩略图
        if (asset.type === 'video' && asset.thumbnail_url) {
          const tcb = await $w.cloud.getCloudInstance();
          const result = await tcb.getTempFileURL({
            fileList: [{
              fileID: asset.thumbnail_url,
              maxAge: 3600
            }]
          });
          
          if (result.fileList && result.fileList[0].code === 'SUCCESS') {
            return result.fileList[0].tempFileURL;
          }
        }
        
        return null;
      } catch (error) {
        console.error('获取缩略图失败:', error);
        return null;
      }
    }

    // 格式化文件大小
    export function formatFileSize(bytes) {
      if (!bytes) return '0 B';
      
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 获取文件类型图标
    export function getFileTypeIcon(type) {
      const iconMap = {
        'image': '🖼️',
        'video': '🎬',
        'audio': '🎵',
        'document': '📄',
        'model': '🎭'
      };
      
      return iconMap[type] || '📁';
    }
  