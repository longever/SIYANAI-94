// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { X, Search, Image, Video, Music, Upload, Eye, Check, Play, Pause, Download, Filter, Grid, List, Layers } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Tabs, TabsContent, TabsList, TabsTrigger, ScrollArea, Dialog, DialogContent, DialogHeader, DialogTitle, Badge, useToast, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui';

// @ts-ignore;
import { AssetPreviewDialog } from './AssetPreviewDialog';
export function EnhancedAssetLibrary({
  onAssetSelect,
  onClose,
  selectedAssets = [],
  mode = 'select',
  multiple = false,
  $w
}) {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const fileInputRef = useRef(null);
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadAssets();
  }, [currentPage, selectedType, sortBy, searchQuery]);
  const loadAssets = async () => {
    try {
      setLoading(true);
      const params = {
        select: {
          $master: true
        },
        getCount: true,
        pageSize: 24,
        pageNumber: currentPage,
        orderBy: [{
          [sortBy]: 'desc'
        }]
      };
      if (searchQuery) {
        params.filter = {
          where: {
            $or: [{
              name: {
                $search: searchQuery
              }
            }, {
              tags: {
                $search: searchQuery
              }
            }]
          }
        };
      }
      if (selectedType !== 'all') {
        if (!params.filter) params.filter = {
          where: {}
        };
        if (!params.filter.where) params.filter.where = {};
        params.filter.where.type = {
          $eq: selectedType
        };
      }
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaGetRecordsV2',
        params
      });

      // 标准化数据格式，确保包含所有必要字段
      const normalizedAssets = (result.records || []).map(asset => ({
        ...asset,
        _id: asset._id || asset.id,
        id: asset._id || asset.id,
        fileId: asset.fileId || asset.cloudPath || asset.file_id,
        url: asset.url || asset.downloadUrl || asset.file_url,
        name: asset.name || '未命名素材',
        type: asset.type || 'unknown',
        size: asset.size || 0,
        thumbnailUrl: asset.thumbnailUrl || asset.thumbnail_url,
        createdAt: asset.createdAt || Date.new(),
        download_count: asset.download_count || 0,
        duration: asset.duration || 0,
        dimensions: asset.dimensions || null,
        tags: asset.tags || []
      }));
      setAssets(normalizedAssets);
      setTotalPages(Math.ceil((result.total || 0) / 24));
    } catch (error) {
      toast({
        title: "加载失败",
        description: error.message || "无法加载素材库",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleFileUpload = async files => {
    const validFiles = Array.from(files).filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mov', 'audio/mp3', 'audio/wav'];
      return validTypes.includes(file.type);
    });
    if (validFiles.length === 0) {
      toast({
        title: "上传失败",
        description: "请选择有效的图片、视频或音频文件",
        variant: "destructive"
      });
      return;
    }
    setUploading(true);
    try {
      const uploadPromises = validFiles.map(async file => {
        const formData = new FormData();
        formData.append('file', file);
        const uploadResult = await $w.cloud.callFunction({
          name: 'asset-service',
          data: {
            action: 'uploadAsset',
            file: {
              name: file.name,
              type: file.type,
              size: file.size
            }
          }
        });
        return uploadResult;
      });
      await Promise.all(uploadPromises);
      toast({
        title: "上传成功",
        description: `已上传 ${validFiles.length} 个文件`
      });
      loadAssets();
    } catch (error) {
      toast({
        title: "上传失败",
        description: error.message || "文件上传失败",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  const handleAssetClick = asset => {
    // 确保传递标准化的 asset 对象
    const normalizedAsset = {
      ...asset,
      _id: asset._id || asset.id,
      id: asset._id || asset.id,
      fileId: asset.fileId || asset.cloudPath || asset.file_id,
      url: asset.url || asset.downloadUrl || asset.file_url,
      name: asset.name || '未命名素材',
      type: asset.type || 'unknown',
      size: asset.size || 0,
      thumbnailUrl: asset.thumbnailUrl || asset.thumbnail_url,
      createdAt: asset.createdAt || Date.new(),
      download_count: asset.download_count || 0,
      duration: asset.duration || 0,
      dimensions: asset.dimensions || null,
      tags: asset.tags || []
    };
    setSelectedAsset(normalizedAsset);
    setPreviewOpen(true);
  };
  const handleInsert = () => {
    if (selectedAsset) {
      onAssetSelect(selectedAsset);
      setPreviewOpen(false);
      if (mode === 'select') {
        onClose();
      }
    }
  };
  const handleMultipleInsert = () => {
    if (selectedAssets.length > 0) {
      selectedAssets.forEach(asset => onAssetSelect(asset));
      onClose();
    }
  };
  const getAssetIcon = type => {
    switch (type) {
      case 'image':
        return <Image className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'audio':
        return <Music className="w-5 h-5" />;
      default:
        return <Image className="w-5 h-5" />;
    }
  };
  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const formatDuration = seconds => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const AssetCard = ({
    asset
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
    return <Card className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-lg" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={() => handleAssetClick(asset)}>
      <div className="aspect-video bg-muted relative">
        {asset.type === 'image' && <>
          {asset.thumbnailUrl ? <img src={asset.thumbnailUrl} alt={asset.name} className="w-full h-full object-cover" onLoad={() => setThumbnailLoaded(true)} /> : <div className="w-full h-full flex items-center justify-center">
            <Image className="w-12 h-12 text-muted-foreground" />
          </div>}
        </>}

        {asset.type === 'video' && <>
          {asset.thumbnailUrl ? <img src={asset.thumbnailUrl} alt={asset.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <Video className="w-12 h-12 text-white" />
          </div>}
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {formatDuration(asset.duration)}
          </div>
        </>}

        {asset.type === 'audio' && <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-teal-600">
          <div className="text-center">
            <Music className="w-12 h-12 text-white mb-2" />
            {asset.waveformUrl && <img src={asset.waveformUrl} alt="waveform" className="w-full h-8 object-contain opacity-80" />}
          </div>
        </div>}

        {isHovered && <div className="absolute inset-0 bg-black/60 flex items-center justify-center space-x-2">
          <Button size="sm" variant="secondary" onClick={e => {
            e.stopPropagation();
            handleAssetClick(asset);
          }}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={e => {
            e.stopPropagation();
            onAssetSelect(asset);
          }}>
            <Check className="w-4 h-4" />
          </Button>
        </div>}
      </div>

      <CardContent className="p-3">
        <h4 className="font-medium text-sm truncate">{asset.name}</h4>
        <div className="flex items-center justify-between mt-1">
          <Badge variant="outline" className="text-xs">
            {asset.type}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatFileSize(asset.size)}
          </span>
        </div>
      </CardContent>
    </Card>;
  };
  return <div className="h-full flex flex-col bg-background">
    {/* Header */}
    <div className="border-b p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">素材库</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <Input placeholder="搜索素材名称或标签..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full" />
        </div>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="image">图片</SelectItem>
            <SelectItem value="video">视频</SelectItem>
            <SelectItem value="audio">音频</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">最新上传</SelectItem>
            <SelectItem value="name">名称</SelectItem>
            <SelectItem value="size">大小</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
          {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
        </Button>

        <Button variant="default" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <Upload className="w-4 h-4 mr-1" />
          上传
        </Button>

        <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,audio/*" className="hidden" onChange={e => handleFileUpload(e.target.files)} />
      </div>
    </div>

    {/* Content */}
    <ScrollArea className="flex-1 p-4">
      {loading ? <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <Card key={i} className="aspect-video">
          <Skeleton className="w-full h-full" />
        </Card>)}
      </div> : <>
        {viewMode === 'grid' ? <div className="grid grid-cols-3 gap-4">
          {assets.map(asset => <AssetCard key={asset._id} asset={asset} />)}
        </div> : <div className="space-y-2">
          {assets.map(asset => <Card key={asset._id} className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                {getAssetIcon(asset.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{asset.name}</h4>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{asset.type}</span>
                  <span>{formatFileSize(asset.size)}</span>
                  {asset.duration && <span>{formatDuration(asset.duration)}</span>}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleAssetClick(asset)}>
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={() => onAssetSelect(asset)}>
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>)}
        </div>}

        {assets.length === 0 && <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Layers className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">暂无素材</h3>
          <p className="text-sm text-muted-foreground mb-4">
            上传您的第一个素材开始创作
          </p>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            上传素材
          </Button>
        </div>}
      </>}
    </ScrollArea>

    {/* Pagination */}
    {totalPages > 1 && <div className="border-t p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          第 {currentPage} 页，共 {totalPages} 页
        </span>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
            上一页
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
            下一页
          </Button>
        </div>
      </div>
    </div>}

    {/* 使用修复后的 AssetPreviewDialog */}
    <AssetPreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} asset={selectedAsset} $w={$w} />
  </div>;
}