// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Badge, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { Download, Trash2, X, Play, Pause, ExternalLink, Loader2 } from 'lucide-react';

export function AssetPreviewDialog({
  open,
  onOpenChange,
  asset,
  onDownload,
  onDelete,
  $w
}) {
  const {
    toast
  } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (open && asset) {
      loadPreviewUrl();
    } else {
      setPreviewUrl(null);
      setImageError(false);
    }
  }, [open, asset]);
  const loadPreviewUrl = async () => {
    if (!asset) return;
    setLoading(true);
    try {
      // 获取云开发实例
      const tcb = await $w.cloud.getCloudInstance();

      // 获取临时URL
      const fileID = asset.fileId || asset.cloudPath;
      if (!fileID) {
        throw new Error('无法获取文件ID');
      }
      const res = await tcb.getTempFileURL({
        fileList: [fileID]
      });
      if (res.fileList && res.fileList[0] && res.fileList[0].tempFileURL) {
        setPreviewUrl(res.fileList[0].tempFileURL);
      } else {
        throw new Error('无法获取临时URL');
      }
    } catch (error) {
      console.error('获取临时URL失败:', error);
      toast({
        title: '预览失败',
        description: error.message || '无法获取预览链接',
        variant: 'destructive'
      });

      // 回退到原始URL（如果有）
      if (asset.url) {
        setPreviewUrl(asset.url);
      }
    } finally {
      setLoading(false);
    }
  };
  const handleImageError = () => {
    setImageError(true);
    toast({
      title: '图片加载失败',
      description: '无法加载图片预览，请尝试下载查看',
      variant: 'destructive'
    });
  };
  const renderPreview = () => {
    if (loading) {
      return <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">正在获取预览...</p>
          </div>
        </div>;
    }
    if (!previewUrl) {
      return <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <X className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>无法获取预览链接</p>
          </div>
        </div>;
    }
    switch (asset.type) {
      case 'image':
        if (imageError) {
          return <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <X className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>图片加载失败，请尝试下载查看</p>
              </div>
            </div>;
        }
        return <img src={previewUrl} alt={asset.name} className="w-full h-full object-contain" onError={handleImageError} onLoad={() => setImageError(false)} />;
      case 'video':
        return <video src={previewUrl} controls className="w-full h-full" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />;
      case 'audio':
        return <div className="flex items-center justify-center h-full">
            <div className="w-full max-w-md">
              <audio src={previewUrl} controls className="w-full" />
            </div>
          </div>;
      default:
        return <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <X className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>不支持的预览类型，请下载查看</p>
            </div>
          </div>;
    }
  };
  const handleOpenInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
    }
  };
  const handleDownload = async () => {
    if (!asset) return;
    try {
      // 获取云开发实例
      const tcb = await $w.cloud.getCloudInstance();

      // 获取下载临时URL
      const fileID = asset.fileId || asset.cloudPath;
      if (!fileID) {
        throw new Error('无法获取文件ID');
      }
      const res = await tcb.getTempFileURL({
        fileList: [fileID]
      });
      if (res.fileList && res.fileList[0] && res.fileList[0].tempFileURL) {
        const downloadUrl = res.fileList[0].tempFileURL;

        // 创建下载链接
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = asset.name || 'download';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
          title: '下载开始',
          description: `${asset.name} 下载已开始`
        });
        if (onDownload) {
          onDownload(asset);
        }
      } else {
        throw new Error('无法获取下载URL');
      }
    } catch (error) {
      toast({
        title: '下载失败',
        description: error.message || '无法获取下载链接',
        variant: 'destructive'
      });
    }
  };
  const handleDelete = async () => {
    if (!asset) return;
    if (window.confirm(`确定要删除素材 "${asset.name}" 吗？此操作不可撤销。`)) {
      try {
        if (onDelete) {
          await onDelete(asset);
        }
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
  if (!asset) return null;
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="truncate">{asset.name}</span>
            <Badge variant="secondary" className="capitalize">
              {asset.type}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-4 text-sm">
              <span>文件大小: {(asset.size / 1024 / 1024).toFixed(2)} MB</span>
              {asset.download_count > 0 && <span>下载次数: {asset.download_count}</span>}
              {asset.createdAt && <span>上传时间: {new Date(asset.createdAt).toLocaleString()}</span>}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
          {renderPreview()}
        </div>

        {asset.tags && asset.tags.length > 0 && <div className="flex flex-wrap gap-2">
            {asset.tags.map((tag, idx) => <Badge key={idx} variant="outline" className="text-xs">
                {tag}
              </Badge>)}
          </div>}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleOpenInNewTab} disabled={!previewUrl || loading} size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            新窗口打开
          </Button>

          <Button variant="outline" onClick={handleDownload} disabled={loading} size="sm">
            <Download className="w-4 h-4 mr-2" />
            下载
          </Button>

          <Button variant="destructive" onClick={handleDelete} disabled={loading} size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            删除
          </Button>

          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading} size="sm">
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}