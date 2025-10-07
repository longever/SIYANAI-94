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
    // 防止事件未定义
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    // 确保 asset 对象存在
    if (!asset) return;

    // 确保 asset 对象包含必要的字段
    const validAsset = {
      ...asset,
      _id: asset._id || asset.id || '',
      fileId: asset._id || asset.id || asset.cloudPath || '',
      url: asset.url || asset.downloadUrl || asset.file_url || '',
      name: asset.name || '未命名素材',
      type: asset.type || 'unknown',
      size: asset.size || 0,
      thumbnailUrl: asset.thumbnailUrl || asset.thumbnail_url || ''
    };
    if (onAssetSelect && typeof onAssetSelect === 'function') {
      onAssetSelect(validAsset);
    }
  };
  const handleDownload = (asset, e) => {
    // 防止事件未定义
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    // 确保 asset 对象存在
    if (!asset) return;

    // 确保有有效的下载链接
    const downloadUrl = asset.url || asset.downloadUrl || asset.file_url;
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
  const handleDelete = (assetId, assetName, e) => {
    // 防止事件未定义
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    if (!assetId) return;
    if (window.confirm(`确定要删除素材 "${assetName || '未命名素材'}" 吗？`)) {
      if (onAssetDelete && typeof onAssetDelete === 'function') {
        onAssetDelete(assetId);
      }
    }
  };

  // 确保 assets 是数组
  const validAssets = Array.isArray(assets) ? assets : [];
  return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {validAssets.map(asset => {
      // 确保每个 asset 都有有效的 ID
      const assetId = asset._id || asset.id;
      if (!assetId) {
        console.warn('发现无效的素材项，缺少ID:', asset);
        return null;
      }
      const assetName = asset.name || '未命名素材';
      const assetType = asset.type || 'unknown';
      const assetSize = asset.size || 0;
      const thumbnailUrl = asset.thumbnail_url || asset.thumbnailUrl || '';
      const downloadCount = asset.download_count || 0;
      const tags = Array.isArray(asset.tags) ? asset.tags : [];
      return <Card key={assetId} className="group relative overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          {/* 预览区域 - 点击直接预览 */}
          <div className="aspect-square bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors" onClick={e => handlePreview(asset, e)}>
            {thumbnailUrl ? <img src={thumbnailUrl} alt={assetName} className="w-full h-full object-cover" onError={e => {
              e.target.style.display = 'none';
              // 创建备用显示元素
              const fallback = document.createElement('div');
              fallback.className = 'w-full h-full flex items-center justify-center bg-gray-200';
              fallback.innerHTML = React.createElement('div', {}, getAssetIcon(assetType)).props.children;
              e.target.parentElement.appendChild(fallback);
            }} /> : <div className="text-gray-400">
                {getAssetIcon(assetType)}
              </div>}
          </div>

          <div className="p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium truncate flex-1" title={assetName}>
                {assetName}
              </span>
              <Badge variant="secondary" className={cn("text-xs", getAssetTypeColor(assetType))}>
                {assetType}
              </Badge>
            </div>

            <div className="text-xs text-gray-500">
              {formatFileSize(assetSize)}
              {downloadCount > 0 && <span className="ml-2">下载 {downloadCount}</span>}
            </div>

            {tags.length > 0 && <div className="mt-1 flex flex-wrap gap-1">
                {tags.slice(0, 2).map((tag, idx) => <Badge key={idx} variant="outline" className="text-xs">
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

              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm" onClick={e => handleDelete(assetId, assetName, e)} title="删除">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>;
    })}
  </div>;
}