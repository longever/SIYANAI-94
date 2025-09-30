// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { Download, Trash2, Eye, ExternalLink, Image, Video, FileAudio, FileText, Calendar, Tag } from 'lucide-react';

export function AssetGrid({
  assets,
  onDelete,
  onRefresh
}) {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const {
    toast
  } = useToast();
  const getAssetIcon = type => {
    switch (type) {
      case 'image':
        return <Image className="w-8 h-8" />;
      case 'video':
        return <Video className="w-8 h-8" />;
      case 'audio':
        return <FileAudio className="w-8 h-8" />;
      case 'document':
        return <FileText className="w-8 h-8" />;
      default:
        return <FileText className="w-8 h-8" />;
    }
  };
  const formatFileSize = bytes => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const formatDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const handleDeleteClick = asset => {
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = async () => {
    if (!assetToDelete) return;
    try {
      await onDelete(assetToDelete.id || assetToDelete._id);
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
    } catch (error) {
      console.error('删除失败:', error);
    }
  };
  const handleDownload = async asset => {
    if (!asset.downloadUrl) {
      toast({
        title: '下载失败',
        description: '无法获取下载链接',
        variant: 'destructive'
      });
      return;
    }
    try {
      const link = document.createElement('a');
      link.href = asset.downloadUrl;
      link.download = asset.name || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: '下载开始',
        description: '文件下载已开始'
      });
    } catch (error) {
      toast({
        title: '下载失败',
        description: '无法开始下载',
        variant: 'destructive'
      });
    }
  };
  const handlePreview = asset => {
    if (asset.downloadUrl) {
      window.open(asset.downloadUrl, '_blank');
    }
  };
  return <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {assets.map(asset => <Card key={asset.id || asset._id} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              {/* 预览区域 */}
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {asset.thumbnail ? <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" onError={e => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }} /> : <div className="flex items-center justify-center text-slate-400">
                    {getAssetIcon(asset.type)}
                  </div>}
                <div className="hidden items-center justify-center text-slate-400">
                  {getAssetIcon(asset.type)}
                </div>
              </div>

              {/* 信息区域 */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm truncate" title={asset.name}>
                  {asset.name || '未命名素材'}
                </h3>
                
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(asset.createdAt)}</span>
                </div>

                {asset.size && <div className="text-xs text-slate-500">
                    {formatFileSize(asset.size)}
                  </div>}

                {asset.tags && asset.tags.length > 0 && <div className="flex flex-wrap gap-1">
                    {asset.tags.slice(0, 3).map((tag, index) => <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        <Tag className="w-2 h-2 mr-1" />
                        {tag}
                      </span>)}
                    {asset.tags.length > 3 && <span className="text-xs text-slate-500">+{asset.tags.length - 3}</span>}
                  </div>}
              </div>

              {/* 操作按钮 */}
              <div className="mt-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handlePreview(asset)} title="预览">
                  <Eye className="w-3 h-3" />
                </Button>
                
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDownload(asset)} title="下载">
                  <Download className="w-3 h-3" />
                </Button>
                
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600 hover:text-red-700" onClick={() => handleDeleteClick(asset)} title="删除">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>)}
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除素材 "{assetToDelete?.name}" 吗？此操作不可撤销，文件将从云存储中永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>;
}