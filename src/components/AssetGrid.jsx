// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Image, Video, Music, FileText, Download, ExternalLink } from 'lucide-react';

export function AssetGrid({
  assets,
  onAssetSelect,
  onDownload,
  $w
}) {
  const [downloading, setDownloading] = useState({});

  // 获取类型图标
  const getTypeIcon = type => {
    const icons = {
      image: <Image className="w-5 h-5" />,
      video: <Video className="w-5 h-5" />,
      audio: <Music className="w-5 h-5" />,
      document: <FileText className="w-5 h-5" />
    };
    return icons[type] || <FileText className="w-5 h-5" />;
  };

  // 获取类型颜色
  const getTypeColor = type => {
    const colors = {
      image: 'bg-green-100 text-green-800',
      video: 'bg-red-100 text-red-800',
      audio: 'bg-blue-100 text-blue-800',
      document: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // 获取缩略图URL
  const getThumbnailUrl = asset => {
    if (asset.type === 'image' && asset.downloadUrl) {
      return asset.downloadUrl;
    }
    return null;
  };

  // 处理下载
  const handleDownload = async (asset, e) => {
    e.stopPropagation();
    const assetId = asset._id;
    if (downloading[assetId]) return;
    setDownloading(prev => ({
      ...prev,
      [assetId]: true
    }));
    try {
      const downloadUrl = await onDownload(asset);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = asset.name || 'download';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('下载失败:', error);
    } finally {
      setDownloading(prev => ({
        ...prev,
        [assetId]: false
      }));
    }
  };

  // 处理新窗口打开
  const handleOpenInNewTab = (asset, e) => {
    e.stopPropagation();
    if (asset.downloadUrl) {
      window.open(asset.downloadUrl, '_blank');
    }
  };
  return <div className="p-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {assets.map(asset => {
        const isDownloading = downloading[asset._id];
        const thumbnailUrl = getThumbnailUrl(asset);
        return <div key={asset._id} className="group relative cursor-pointer border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:border-purple-300" onClick={() => onAssetSelect(asset)}>
              <div className="aspect-video bg-gray-100 relative">
                {asset.type === 'image' && thumbnailUrl && <img src={thumbnailUrl} alt={asset.name} className="w-full h-full object-cover" onError={e => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-gray-200">
                          <span class="text-gray-400 text-sm">图片加载失败</span>
                        </div>
                      `;
            }} />}

                {asset.type === 'image' && !thumbnailUrl && <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-500">
                    {getTypeIcon('image')}
                  </div>}

                {asset.type === 'video' && <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-500">
                    {getTypeIcon('video')}
                  </div>}

                {asset.type === 'audio' && <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500">
                    {getTypeIcon('audio')}
                  </div>}

                {asset.type === 'document' && <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500">
                    {getTypeIcon('document')}
                  </div>}

                {/* 悬停遮罩 */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0" onClick={e => handleOpenInNewTab(asset, e)} disabled={!asset.downloadUrl}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0" onClick={e => handleDownload(asset, e)} disabled={isDownloading || !asset.downloadUrl}>
                      {isDownloading ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <Download className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-3">
                <h3 className="font-medium text-sm truncate" title={asset.name}>
                  {asset.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-xs ${getTypeColor(asset.type)}`}>
                    {getTypeIcon(asset.type)}
                    <span className="ml-1 capitalize">{asset.type}</span>
                  </Badge>
                  <span className="text-xs text-gray-500">{asset.formattedSize}</span>
                </div>
                {asset.tags && asset.tags.length > 0 && <div className="mt-1 flex flex-wrap gap-1">
                    {asset.tags.slice(0, 2).map((tag, idx) => <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>)}
                  </div>}
              </div>
            </div>;
      })}
      </div>
    </div>;
}