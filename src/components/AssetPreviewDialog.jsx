// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Badge, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { Download, Trash2, X, Play, Pause } from 'lucide-react';

export function AssetPreviewDialog({
  open,
  onOpenChange,
  asset,
  onDownload,
  onDelete
}) {
  const {
    toast
  } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  if (!asset) return null;
  const renderPreview = () => {
    switch (asset.type) {
      case 'image':
        return <img src={asset.previewUrl} alt={asset.name} className="w-full h-full object-contain" />;
      case 'video':
        return <video src={asset.previewUrl} controls className="w-full h-full" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />;
      case 'audio':
        return <div className="flex items-center justify-center h-full">
            <audio src={asset.previewUrl} controls className="w-full" />
          </div>;
      default:
        return <div className="flex items-center justify-center h-full text-gray-500">
            <p>不支持的预览类型</p>
          </div>;
    }
  };
  const handleDelete = async () => {
    if (confirm(`确定要删除素材 "${asset.name}" 吗？`)) {
      try {
        await onDelete(asset);
        onOpenChange(false);
      } catch (error) {
        toast({
          title: '删除失败',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {asset.name}
            <Badge variant="secondary">{asset.type}</Badge>
          </DialogTitle>
          <DialogDescription>
            文件大小: {(asset.size / 1024 / 1024).toFixed(2)} MB
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-[400px] bg-gray-100 rounded-lg overflow-hidden">
          {renderPreview()}
        </div>
        
        {asset.tags && asset.tags.length > 0 && <div className="flex flex-wrap gap-2">
            {asset.tags.map((tag, idx) => <Badge key={idx} variant="outline">
                {tag}
              </Badge>)}
          </div>}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onDownload(asset)}>
            <Download className="w-4 h-4 mr-2" />
            下载
          </Button>
          
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            删除
          </Button>
          
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}