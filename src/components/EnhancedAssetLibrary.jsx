// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Upload, X, Image, Video, Music, FileText, Play, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';

import { AssetUploadDialog } from './AssetUploadDialog';
import { getAssetThumbnailUrl, formatFileSize } from '@/lib/assetUtils';
export default function EnhancedAssetLibrary({
  open,
  onOpenChange,
  onAssetSelect,
  $w
}) {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    toast
  } = useToast();

  // 加载AI素材
  const loadAssets = useCallback(async () => {
    if (!open) return;
    try {
      setLoading(true);
      setError(null);

      // 使用正确的数据源调用方式
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          getCount: true,
          pageSize: 100,
          pageNumber: 1,
          select: {
            $master: true
          }
        }
      });
      if (response.records) {
        // 为每个素材获取缩略图URL
        const assetsWithThumbnails = await Promise.all(response.records.map(async asset => {
          try {
            const thumbnailUrl = await getAssetThumbnailUrl(asset, $w);
            return {
              ...asset,
              thumbnail: thumbnailUrl,
              formattedSize: formatFileSize(asset.size || 0)
            };
          } catch (err) {
            console.error(`获取AI素材 ${asset.name} 的缩略图失败:`, err);
            return {
              ...asset,
              thumbnail: null,
              formattedSize: formatFileSize(asset.size || 0),
              error: true
            };
          }
        }));
        setAssets(assetsWithThumbnails);
      }
    } catch (error) {
      console.error('加载AI素材库失败:', error);
      setError('无法加载AI素材库，请稍后重试');
      toast({
        title: '加载失败',
        description: '无法加载AI素材库，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [open, $w, toast]);

  // 筛选素材
  const filterAssets = useCallback(() => {
    let filtered = assets;
    if (searchTerm) {
      filtered = filtered.filter(asset => asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) || asset.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    }
    if (selectedType !== 'all') {
      filtered = filtered.filter(asset => asset.type === selectedType);
    }
    setFilteredAssets(filtered);
  }, [assets, searchTerm, selectedType]);
  useEffect(() => {
    loadAssets();
  }, [loadAssets]);
  useEffect(() => {
    filterAssets();
  }, [filterAssets]);
  const handleUploadSuccess = () => {
    loadAssets();
    setIsUploadOpen(false);
  };
  const getTypeIcon = type => {
    const icons = {
      image: <Image className="w-4 h-4" />,
      video: <Video className="w-4 h-4" />,
      audio: <Music className="w-4 h-4" />,
      document: <FileText className="w-4 h-4" />
    };
    return icons[type] || <FileText className="w-4 h-4" />;
  };
  const getTypeColor = type => {
    const colors = {
      image: 'bg-green-100 text-green-800',
      video: 'bg-red-100 text-red-800',
      audio: 'bg-blue-100 text-blue-800',
      document: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };
  const assetTypes = [{
    value: 'all',
    label: '全部素材'
  }, {
    value: 'image',
    label: 'AI图片'
  }, {
    value: 'video',
    label: 'AI视频'
  }, {
    value: 'audio',
    label: 'AI音频'
  }, {
    value: 'document',
    label: 'AI文档'
  }];

  // 错误状态组件
  const ErrorState = () => <div className="text-center py-12">
      <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
      <p className="text-gray-600 mb-4">{error}</p>
      <div className="flex gap-2 justify-center">
        <Button onClick={loadAssets} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          重新加载
        </Button>
      </div>
    </div>;

  // 空状态组件
  const EmptyState = () => <div className="text-center py-12">
      <div className="text-purple-300 mb-4">
        <Search className="w-12 h-12 mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {searchTerm || selectedType !== 'all' ? '没有找到匹配的AI素材' : '还没有AI素材'}
      </h3>
      <p className="text-gray-600 mb-4">
        {searchTerm || selectedType !== 'all' ? '尝试调整搜索条件或筛选器' : '开始上传您的第一个AI素材吧'}
      </p>
      <Button onClick={() => setIsUploadOpen(true)}>
        <Upload className="w-4 h-4 mr-2" />
        上传AI素材
      </Button>
    </div>;

  // 加载状态组件
  const LoadingState = () => <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">正在加载AI素材...</p>
      </div>
    </div>;

  // AI素材卡片组件
  const AssetCard = ({
    asset
  }) => <div key={asset._id} className="group cursor-pointer border rounded-lg overflow-hidden hover:shadow-lg transition-all hover:border-purple-300" onClick={() => onAssetSelect(asset)}>
      <div className="aspect-video bg-gray-100 relative">
        {asset.type === 'image' && asset.thumbnail && <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" onError={e => {
        e.target.style.display = 'none';
        e.target.parentElement.innerHTML = `
                <div class="w-full h-full flex items-center justify-center bg-gray-200">
                  <span class="text-gray-400 text-sm">图片加载失败</span>
                </div>
              `;
      }} />}
        
        {asset.type === 'image' && !asset.thumbnail && <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-500">
            <Image className="w-8 h-8 text-white" />
          </div>}

        {asset.type === 'video' && asset.thumbnail && <div className="relative w-full h-full">
            <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" onError={e => {
          e.target.style.display = 'none';
          e.target.parentElement.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-gray-200">
                    <span class="text-gray-400 text-sm">缩略图加载失败</span>
                  </div>
                `;
        }} />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white/90 rounded-full p-2">
                <Play className="w-6 h-6 text-gray-800" />
              </div>
            </div>
          </div>}

        {asset.type === 'video' && !asset.thumbnail && <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-500">
            <Video className="w-8 h-8 text-white" />
          </div>}

        {asset.type === 'audio' && <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500">
            <Music className="w-8 h-8 text-white" />
          </div>}

        {asset.type === 'document' && <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500">
            <FileText className="w-8 h-8 text-white" />
          </div>}
      </div>

      <div className="p-3">
        <h3 className="font-medium text-sm truncate" title={asset.name}>{asset.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(asset.type)}`}>
            {getTypeIcon(asset.type)}
            <span className="ml-1 capitalize">{asset.type}</span>
          </span>
          <span className="text-xs text-gray-500">{asset.formattedSize}</span>
        </div>
        {asset.error && <div className="mt-1 text-xs text-red-500">
            加载失败
          </div>}
      </div>
    </div>;
  return <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>AI素材库</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="hover:bg-gray-100">
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col h-full">
            {/* 搜索和筛选 */}
            <div className="mb-4 flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="搜索AI素材名称或标签..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="选择AI类型" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map(type => <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>)}
                </SelectContent>
              </Select>

              <Button onClick={() => setIsUploadOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                上传AI素材
              </Button>
            </div>

            {/* 素材网格 */}
            <div className="flex-1 overflow-y-auto">
              {loading && <LoadingState />}
              {!loading && error && <ErrorState />}
              {!loading && !error && filteredAssets.length > 0 && <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredAssets.map(asset => <AssetCard key={asset._id} asset={asset} />)}
                </div>}
              {!loading && !error && filteredAssets.length === 0 && <EmptyState />}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AssetUploadDialog open={isUploadOpen} onOpenChange={setIsUploadOpen} onSuccess={handleUploadSuccess} $w={$w} />
    </>;
}