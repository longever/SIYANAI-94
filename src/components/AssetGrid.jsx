// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { Download, Trash2, Eye, ExternalLink, Image, Video, FileAudio, FileText, Calendar, Tag } from 'lucide-react';

export function AssetGrid({
  assets,
  onDelete,
  onRefresh,
  $w
}) {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [downloading, setDownloading] = useState({});
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
  const getDownloadUrl = async asset => {
    try {
      const response = await $w.cloud.callFunction({
        name: 'get-asset-download-url',
        data: {
          filePath: asset.cloudPath || asset.path || `saas_temp/${asset.type}/${asset.name}`,
          assetId: asset.id || asset._id
        }
      });
      if (response.success && response.data) {
        return response.data.downloadUrl;
      } else {
        throw new Error(response.message || '获取下载链接失败');
      }
    } catch (error) {
      console.error('获取下载链接失败:', error);
      throw error;
    }
  };
  const handleDownload = async asset => {
    const assetId = asset.id || asset._id;
    if (downloading[assetId]) return;
    setDownloading(prev => ({
      ...prev,
      [assetId]: true
    }));
    try {
      const downloadUrl = await getDownloadUrl(asset);

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

      // 更新下载次数
      if (onRefresh) {
        setTimeout(onRefresh, 1000);
      }
    } catch (error) {
      toast({
        title: '下载失败',
        description: error.message || '无法获取下载链接',
        variant: 'destructive'
      });
    } finally {
      setDownloading(prev => ({
        ...prev,
        [assetId]: false
      }));
    }
  };
  const handlePreview = async asset => {
    try {
      const previewUrl = await getDownloadUrl(asset);

      // 根据文件类型决定预览方式
      if (asset.type === 'image') {
        window.open(previewUrl, '_blank');
      } else if (asset.type === 'video' || asset.type === 'audio') {
        // 对于音视频，使用预览对话框
        setSelectedAsset({
          ...asset,
          previewUrl: previewUrl
        });
      } else {
        // 其他类型直接下载
        handleDownload(asset);
      }
    } catch (error) {
      toast({
        title: '预览失败',
        description: error.message || '无法获取预览链接',
        variant: 'destructive'
      });
    }
  };
  return <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {assets.map(asset => {
        const assetId = asset.id || asset._id;
        const isDownloading = downloading[assetId];
        return <Card key={assetId} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {/* 预览区域 */}
                <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {asset.thumbnail ? <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" onError={e => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }} /> : null}
                  <div className={`${asset.thumbnail ? 'hidden' : 'flex'} items-center justify-center text-slate-400`}>
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
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handlePreview(asset)} title="预览" disabled={isDownloading}>
                    <Eye className="w-3 h-3" />
                  </Button>

                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDownload(asset)} title={isDownloading ? "下载中..." : "下载"} disabled={isDownloading}>
                    {isDownloading ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <Download className="w-3 h-3" />}
                  </Button>

                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600 hover:text-red-700" onClick={() => handleDeleteClick(asset)} title="删除" disabled={isDownloading}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>;
      })}
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