// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Badge, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { Download, Trash2, X, Play, Pause, ExternalLink } from 'lucide-react';

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
    if (!asset || !$w) return;
    setLoading(true);
    try {
      // 优先使用已有的URL
      if (asset.url) {
        setPreviewUrl(asset.url);
        setLoading(false);
        return;
      }

      // 如果需要从云存储获取临时URL
      const fileId = asset.cloudPath || asset.fileId;
      if (fileId) {
        const tcb = await $w.cloud.getCloudInstance();
        const result = await tcb.getTempFileURL({
          fileList: [fileId]
        });
        if (result.fileList && result.fileList[0] && result.fileList[0].tempFileURL) {
          setPreviewUrl(result.fileList[0].tempFileURL);
        } else {
          throw new Error('获取预览链接失败');
        }
      } else {
        // 如果没有云存储路径，直接使用url
        setPreviewUrl(asset.preview_url || asset.url);
      }
    } catch (error) {
      console.error('获取预览链接失败:', error);
      toast({
        title: '预览失败',
        description: error.message || '无法获取预览链接',
        variant: 'destructive'
      });
      // 回退到原始URL
      setPreviewUrl(asset.url || asset.preview_url);
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>;
    }
    if (!previewUrl) {
      return <div className="flex items-center justify-center h-full text-gray-500">
          <p>无法获取预览链接</p>
        </div>;
    }
    switch (asset.type) {
      case 'image':
        if (imageError) {
          return <div className="flex items-center justify-center h-full text-gray-500">
              <p>图片加载失败，请尝试下载查看</p>
            </div>;
        }
        return <img src={previewUrl} alt={asset.name} className="w-full h-full object-contain" onError={handleImageError} onLoad={() => setImageError(false)} />;
      case 'video':
        return <video src={previewUrl} controls className="w-full h-full" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />;
      case 'audio':
        return <div className="flex items-center justify-center h-full">
            <audio src={previewUrl} controls className="w-full" />
          </div>;
      default:
        return <div className="flex items-center justify-center h-full text-gray-500">
            <p>不支持的预览类型，请下载查看</p>
          </div>;
    }
  };
  const handleOpenInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };
  const handleDownload = async () => {
    if (!asset || !$w) return;
    try {
      const fileId = asset.cloudPath || asset.fileId || asset.url;
      if (!fileId) {
        throw new Error('无法获取文件ID');
      }
      let downloadUrl = fileId;

      // 如果是云存储路径，获取临时下载URL
      if (fileId.startsWith('cloud://')) {
        const tcb = await $w.cloud.getCloudInstance();
        const result = await tcb.getTempFileURL({
          fileList: [fileId]
        });
        if (result.fileList && result.fileList[0] && result.fileList[0].tempFileURL) {
          downloadUrl = result.fileList[0].tempFileURL;
        } else {
          throw new Error('获取下载链接失败');
        }
      }

      // 创建下载链接
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = asset.name || 'download';
      link.style.display = 'none';
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
    if (confirm(`确定要删除素材 "${asset.name}" 吗？`)) {
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
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {asset.name}
            <Badge variant="secondary">{asset.type}</Badge>
          </DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-4">
              <span>文件大小: {(asset.size / 1024 / 1024).toFixed(2)} MB</span>
              {asset.download_count > 0 && <span>下载次数: {asset.download_count}</span>}
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-[400px] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
          {renderPreview()}
        </div>
        
        {asset.tags && asset.tags.length > 0 && <div className="flex flex-wrap gap-2">
            {asset.tags.map((tag, idx) => <Badge key={idx} variant="outline">
                {tag}
              </Badge>)}
          </div>}
        
        <DialogFooter>
          <Button variant="outline" onClick={handleOpenInNewTab} disabled={!previewUrl || loading}>
            <ExternalLink className="w-4 h-4 mr-2" />
            新窗口打开
          </Button>
          
          <Button variant="outline" onClick={handleDownload} disabled={loading}>
            <Download className="w-4 h-4 mr-2" />
            下载
          </Button>
          
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            <Trash2 className="w-4 h-4 mr-2" />
            删除
          </Button>
          
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}