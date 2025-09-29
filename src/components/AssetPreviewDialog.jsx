// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Image, Video, Music, Type, Box, Download, Trash2, ExternalLink } from 'lucide-react';

export function AssetPreviewDialog({
  asset,
  open,
  onOpenChange,
  onDownload,
  onDelete
}) {
  if (!asset) return null;
  const getTypeIcon = type => {
    switch (type) {
      case 'image':
        return Image;
      case 'video':
        return Video;
      case 'audio':
        return Music;
      case 'font':
        return Type;
      case '3d':
        return Box;
      default:
        return null;
    }
  };
  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const formatTime = timestamp => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };
  const Icon = getTypeIcon(asset.type);
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{asset.name}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          {/* 预览区域 */}
          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            {asset.type === 'image' && <img src={asset.url} alt={asset.name} className="w-full h-full object-contain max-h-96" />}
            
            {asset.type === 'video' && <video src={asset.url} controls className="w-full h-full max-h-96" />}
            
            {asset.type === 'audio' && <div className="flex items-center justify-center h-64">
                <audio src={asset.url} controls className="w-full max-w-md" />
              </div>}
            
            {asset.type === '3d' && <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Box className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">3D模型预览</p>
                  <p className="text-sm text-gray-400 mt-2">
                    文件大小: {formatFileSize(asset.size)}
                  </p>
                </div>
              </div>}
          </div>

          {/* 文件信息 */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">文件大小:</span>
              <span className="ml-2">{formatFileSize(asset.size)}</span>
            </div>
            <div>
              <span className="font-medium">上传时间:</span>
              <span className="ml-2">{formatTime(asset.createdAt)}</span>
            </div>
            <div>
              <span className="font-medium">文件类型:</span>
              <span className="ml-2">{asset.mime_type}</span>
            </div>
            <div>
              <span className="font-medium">使用次数:</span>
              <span className="ml-2">{asset.usage_count || 0}</span>
            </div>
          </div>

          {/* 标签 */}
          {asset.tags?.length > 0 && <div>
              <span className="font-medium">标签:</span>
              <div className="flex gap-2 mt-2 flex-wrap">
                {asset.tags.map(tag => <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>)}
              </div>
            </div>}

          {/* 操作按钮 */}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              关闭
            </Button>
            <Button variant="outline" onClick={() => onDownload(asset)}>
              <Download className="w-4 h-4 mr-2" />
              下载
            </Button>
            <Button variant="outline" onClick={() => window.open(asset.url, '_blank')}>
              <ExternalLink className="w-4 h-4 mr-2" />
              打开
            </Button>
            <Button variant="destructive" onClick={() => {
            onDelete(asset);
            onOpenChange(false);
          }}>
              <Trash2 className="w-4 h-4 mr-2" />
              删除
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>;
}