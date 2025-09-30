// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, Badge, Button } from '@/components/ui';
// @ts-ignore;
import { Play, Music, Image, FileText, Download, Eye, Folder } from 'lucide-react';

import { AssetPreviewDialog } from './AssetPreviewDialog';
import { getAssetDownloadUrl } from '@/lib/assetUtils';
export function AssetGrid({
  assets,
  onDelete
}) {
  const [previewAsset, setPreviewAsset] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [downloading, setDownloading] = useState({});
  const handlePreview = asset => {
    setPreviewAsset(asset);
    setIsPreviewOpen(true);
  };
  const handleDownload = async (asset, e) => {
    e.stopPropagation();
    setDownloading(prev => ({
      ...prev,
      [asset._id]: true
    }));
    try {
      const downloadUrl = await getAssetDownloadUrl(asset._id);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = asset.name;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 更新下载次数
      await window.$w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            download_count: (asset.download_count || 0) + 1
          },
          filter: {
            where: {
              _id: {
                $eq: asset._id
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Download failed:', error);
      alert('下载失败，请稍后重试');
    } finally {
      setDownloading(prev => ({
        ...prev,
        [asset._id]: false
      }));
    }
  };
  const getTypeIcon = type => {
    switch (type) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'font':
        return <FileText className="w-4 h-4" />;
      case 'model':
        return <Folder className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };
  const getTypeColor = type => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-800';
      case 'audio':
        return 'bg-blue-100 text-blue-800';
      case 'image':
        return 'bg-green-100 text-green-800';
      case 'document':
        return 'bg-yellow-100 text-yellow-800';
      case 'font':
        return 'bg-purple-100 text-purple-800';
      case 'model':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getAssetIcon = type => {
    const icons = {
      image: '🖼️',
      video: '🎬',
      audio: '🎵',
      document: '📄',
      font: '🔤',
      model: '🧊',
      other: '📁'
    };
    return icons[type] || icons.other;
  };
  const getFolderPath = folderPath => {
    if (!folderPath) return '未知路径';
    const parts = folderPath.split('/');
    if (parts.length >= 2 && parts[0] === 'saas_temp') {
      return `saas_temp/${parts[1]}/`;
    }
    return folderPath;
  };
  return <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {assets.map(asset => <Card key={asset._id} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              {/* 缩略图区域 */}
              <div className="relative aspect-video bg-gray-100 rounded-lg mb-3 overflow-hidden">
                {asset.type === 'image' && asset.thumbnail ? <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" /> : asset.type === 'video' && asset.thumbnail ? <div className="relative w-full h-full">
                    <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div> : asset.type === 'audio' ? <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                    <Music className="w-12 h-12 text-white" />
                  </div> : <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-4xl">{getAssetIcon(asset.type)}</span>
                  </div>}
                
                {/* 悬停操作 */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handlePreview(asset)} className="bg-white/90 hover:bg-white">
                    <Eye className="w-4 h-4 mr-1" />
                    预览
                  </Button>
                  <Button size="sm" variant="secondary" onClick={e => handleDownload(asset, e)} disabled={downloading[asset._id]} className="bg-white/90 hover:bg-white">
                    {downloading[asset._id] ? <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* 文件信息 */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm truncate" title={asset.name}>
                  {asset.name}
                </h3>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={getTypeColor(asset.type)}>
                    {getTypeIcon(asset.type)}
                    <span className="ml-1 capitalize">{asset.type}</span>
                  </Badge>
                  <span className="text-xs text-gray-500">{asset.size}</span>
                </div>

                {/* 显示存储路径 */}
                <div className="text-xs text-gray-500">
                  <span className="font-medium">路径：</span>
                  <span className="text-blue-600">{getFolderPath(asset.folder_path)}</span>
                </div>

                {asset.tags && asset.tags.length > 0 && <div className="flex flex-wrap gap-1">
                    {asset.tags.slice(0, 2).map((tag, index) => <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>)}
                    {asset.tags.length > 2 && <Badge variant="outline" className="text-xs">
                        +{asset.tags.length - 2}
                      </Badge>}
                  </div>}
              </div>

              {/* 操作按钮 */}
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => handlePreview(asset)}>
                  <Eye className="w-3 h-3 mr-1" />
                  预览
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={e => handleDownload(asset, e)} disabled={downloading[asset._id]}>
                  {downloading[asset._id] ? <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" /> : <Download className="w-3 h-3 mr-1" />}
                  下载
                </Button>
              </div>
            </CardContent>
          </Card>)}
      </div>

      <AssetPreviewDialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen} asset={previewAsset} />
    </>;
}