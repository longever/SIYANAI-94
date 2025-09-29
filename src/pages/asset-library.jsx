// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, Input, Badge, useToast, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui';
// @ts-ignore;
import { Search, Upload, Image, Video, Music, Type, Box, Trash2, File, Loader2, X } from 'lucide-react';

import { AssetUploadDialog } from '@/components/AssetUploadDialog';
import { AssetGrid } from '@/components/AssetGrid';
import { AssetPreviewDialog } from '@/components/AssetPreviewDialog';
export default function AssetLibraryPage(props) {
  const {
    $w,
    style
  } = props;
  const {
    toast
  } = useToast();

  // 状态管理
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [previewAsset, setPreviewAsset] = useState(null);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 获取素材列表
  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: true,
          orderBy: [{
            createdAt: 'desc'
          }]
        }
      });
      if (result.records) {
        // 获取下载URL
        const assetsWithUrls = await Promise.all(result.records.map(async asset => {
          try {
            const urlResult = await $w.cloud.callFunction({
              name: 'get-asset-download-url',
              data: {
                assetId: asset._id
              }
            });
            return {
              ...asset,
              url: urlResult.downloadUrl || asset.fileUrl,
              thumbnail: asset.type === 'image' ? urlResult.downloadUrl || asset.fileUrl : null
            };
          } catch (error) {
            console.error('获取URL失败:', error);
            return asset;
          }
        }));
        setAssets(assetsWithUrls);
      }
    } catch (error) {
      toast({
        title: "获取素材失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [$w.cloud, toast]);
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // 筛选逻辑
  useEffect(() => {
    let filtered = assets;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(asset => asset.type === selectedCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter(asset => asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || asset.tags && asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    }
    setFilteredAssets(filtered);
  }, [assets, selectedCategory, searchQuery]);

  // 下载素材
  const handleDownloadAsset = async asset => {
    try {
      const result = await $w.cloud.callFunction({
        name: 'get-asset-download-url',
        data: {
          assetId: asset._id
        }
      });
      if (result.downloadUrl) {
        // 创建下载链接
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = asset.name;
        link.click();

        // 更新下载次数
        await $w.cloud.callDataSource({
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
        toast({
          title: "下载开始",
          description: `${asset.name} 下载已开始`
        });
      }
    } catch (error) {
      toast({
        title: "下载失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    }
  };

  // 删除素材
  const handleDeleteAsset = asset => {
    setAssetToDelete(asset);
    setShowDeleteDialog(true);
  };
  const confirmDelete = async () => {
    if (!assetToDelete) return;
    try {
      // 先删除云存储文件
      if (assetToDelete.fileUrl) {
        await $w.cloud.callFunction({
          name: 'deleteAsset',
          data: {
            assetId: assetToDelete._id
          }
        });
      }

      // 再删除数据库记录
      await $w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: assetToDelete._id
              }
            }
          }
        }
      });
      await fetchAssets();
      setShowDeleteDialog(false);
      setAssetToDelete(null);
      toast({
        title: "删除成功",
        description: `${assetToDelete.name} 已从素材库和云存储移除`,
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    }
  };

  // 获取素材类型图标
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
      case 'subtitle':
        return Type;
      default:
        return File;
    }
  };

  // 获取素材类型中文名
  const getTypeName = type => {
    const typeMap = {
      'image': '图片',
      'video': '视频',
      'audio': '音频',
      'font': '字体',
      '3d': '3D模型',
      'subtitle': '字幕'
    };
    return typeMap[type] || '其他';
  };

  // 分类统计
  const categories = [{
    id: 'all',
    name: '全部',
    icon: File,
    count: assets.length
  }, {
    id: 'image',
    name: '图片',
    icon: Image,
    count: assets.filter(a => a.type === 'image').length
  }, {
    id: 'video',
    name: '视频',
    icon: Video,
    count: assets.filter(a => a.type === 'video').length
  }, {
    id: 'audio',
    name: '音频',
    icon: Music,
    count: assets.filter(a => a.type === 'audio').length
  }, {
    id: 'font',
    name: '字体',
    icon: Type,
    count: assets.filter(a => a.type === 'font').length
  }, {
    id: '3d',
    name: '3D模型',
    icon: Box,
    count: assets.filter(a => a.type === '3d').length
  }, {
    id: 'subtitle',
    name: '字幕',
    icon: Type,
    count: assets.filter(a => a.type === 'subtitle').length
  }];
  if (loading) {
    return <div style={style} className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>;
  }
  return <div style={style} className="min-h-screen bg-background">
    <div className="flex h-screen">
      {/* 左侧分类导航 */}
      <div className="w-64 bg-card border-r border-border p-4">
        <h2 className="text-lg font-semibold mb-4">分类</h2>
        <nav className="space-y-1">
          {categories.map(category => {
            const Icon = category.icon;
            return <button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === category.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}>
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
              </div>
              <Badge variant={selectedCategory === category.id ? "secondary" : "outline"}>
                {category.count}
              </Badge>
            </button>;
          })}
        </nav>
      </div>

      {/* 右侧内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏 */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">素材库</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input type="text" placeholder="搜索素材..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 w-64" />
              </div>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="w-4 h-4 mr-2" />
                上传素材
              </Button>
            </div>
          </div>
        </div>

        {/* 素材网格 */}
        <div className="flex-1 overflow-auto p-6">
          {filteredAssets.length === 0 ? <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <File className="w-16 h-16 mb-4" />
            <p className="text-lg mb-2">暂无素材</p>
            <p className="text-sm mb-4">开始上传您的第一个素材吧</p>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="w-4 h-4 mr-2" />
              上传素材
            </Button>
          </div> : <AssetGrid assets={filteredAssets} onPreview={setPreviewAsset} onDelete={handleDeleteAsset} onDownload={handleDownloadAsset} />}
        </div>
      </div>
    </div>

    {/* 上传对话框 */}
    <AssetUploadDialog open={showUploadDialog} onOpenChange={setShowUploadDialog} onUploadComplete={fetchAssets} $w={$w} />

    {/* 预览对话框 */}
    <AssetPreviewDialog asset={previewAsset} open={!!previewAsset} onOpenChange={open => !open && setPreviewAsset(null)} onDownload={handleDownloadAsset} onDelete={handleDeleteAsset} />

    {/* 删除确认对话框 */}
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          确定要删除素材 "{assetToDelete?.name}" 吗？此操作将同时删除云存储中的文件，且无法恢复。
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
            取消
          </Button>
          <Button variant="destructive" onClick={confirmDelete}>
            确认删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
}