// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, Badge, Button } from '@/components/ui';
// @ts-ignore;
import { Download, Trash2, Eye, FileImage, FileVideo, FileAudio, FileText } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function AssetGrid({
  assets,
  onAssetSelect,
  onAssetDelete,
  $w
}) {
  const getAssetIcon = type => {
    switch (type) {
      case 'image':
        return <FileImage className="w-8 h-8" />;
      case 'video':
        return <FileVideo className="w-8 h-8" />;
      case 'audio':
        return <FileAudio className="w-8 h-8" />;
      default:
        return <FileText className="w-8 h-8" />;
    }
  };
  const getAssetTypeColor = type => {
    switch (type) {
      case 'image':
        return 'text-green-600 bg-green-100';
      case 'video':
        return 'text-red-600 bg-red-100';
      case 'audio':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  const formatFileSize = bytes => {
    if (!bytes) return 'N/A';
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };
  const handlePreview = (asset, e) => {
    e.stopPropagation();
    onAssetSelect(asset);
  };
  const handleDownload = (asset, e) => {
    e.stopPropagation();

    // 直接使用URL进行下载
    const downloadUrl = asset.url || asset.downloadUrl;
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = asset.name || 'download';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {assets.map(asset => <Card key={asset._id} className="group relative overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            {/* 预览区域 - 点击直接预览 */}
            <div className="aspect-square bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => onAssetSelect(asset)}>
              {asset.thumbnail_url ? <img src={asset.thumbnail_url} alt={asset.name} className="w-full h-full object-cover" onError={e => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center bg-gray-200">
                        ${getAssetIcon(asset.type).props.children}
                      </div>
                    `;
          }} /> : <div className="text-gray-400">
                  {getAssetIcon(asset.type)}
                </div>}
            </div>

            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium truncate flex-1" title={asset.name}>
                  {asset.name}
                </span>
                <Badge variant="secondary" className={cn("text-xs", getAssetTypeColor(asset.type))}>
                  {asset.type}
                </Badge>
              </div>

              <div className="text-xs text-gray-500">
                {formatFileSize(asset.size)}
                {asset.download_count > 0 && <span className="ml-2">下载 {asset.download_count}</span>}
              </div>

              {asset.tags && asset.tags.length > 0 && <div className="mt-1 flex flex-wrap gap-1">
                  {asset.tags.slice(0, 2).map((tag, idx) => <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>)}
                </div>}
            </div>

            {/* 操作按钮 */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm" onClick={e => handlePreview(asset, e)} title="预览">
                  <Eye className="w-3 h-3" />
                </Button>

                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm" onClick={e => handleDownload(asset, e)} title="下载">
                  <Download className="w-3 h-3" />
                </Button>

                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm" onClick={e => {
              e.stopPropagation();
              if (window.confirm(`确定要删除素材 "${asset.name}" 吗？`)) {
                onAssetDelete(asset._id);
              }
            }} title="删除">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>)}
    </div>;
}