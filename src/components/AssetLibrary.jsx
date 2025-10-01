// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Upload, X, Image, Video, Music, FileText, Play } from 'lucide-react';

import { AssetUploadDialog } from './AssetUploadDialog';
import { getAssetDownloadUrl } from '@/lib/assetUtils';
export default function AssetLibrary({
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
  const {
    toast
  } = useToast();
  useEffect(() => {
    if (open) {
      loadAssets();
    }
  }, [open]);
  useEffect(() => {
    filterAssets();
  }, [assets, searchTerm, selectedType]);
  const loadAssets = async () => {
    try {
      setLoading(true);
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
        const tcb = await $w.cloud.getCloudInstance();
        const assetsWithUrls = await Promise.all(response.records.map(async asset => {
          try {
            const urlResult = await tcb.getTempFileURL({
              fileList: [asset.url]
            });
            return {
              ...asset,
              thumbnail: asset.type === 'image' ? urlResult.fileList[0].tempFileURL : null,
              downloadUrl: urlResult.fileList[0].tempFileURL
            };
          } catch (error) {
            console.error('获取URL失败:', error);
            return asset;
          }
        }));
        setAssets(assetsWithUrls);
      }
    } catch (error) {
      console.error('Error loading assets:', error);
      toast({
        title: '加载失败',
        description: '无法加载素材库，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const filterAssets = () => {
    let filtered = assets;
    if (searchTerm) {
      filtered = filtered.filter(asset => asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || asset.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    }
    if (selectedType !== 'all') {
      filtered = filtered.filter(asset => asset.type === selectedType);
    }
    setFilteredAssets(filtered);
  };
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
    label: '全部'
  }, {
    value: 'image',
    label: '图片'
  }, {
    value: 'video',
    label: '视频'
  }, {
    value: 'audio',
    label: '音频'
  }, {
    value: 'document',
    label: '文档'
  }];
  return <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>选择素材</span>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-full">
          {/* 搜索和筛选 */}
          <div className="mb-4 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="搜索素材名称或标签..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                {assetTypes.map(type => <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>

            <Button onClick={() => setIsUploadOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              上传素材
            </Button>
          </div>

          {/* 素材网格 */}
          <div className="flex-1 overflow-y-auto">
            {loading ? <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div> : filteredAssets.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredAssets.map(asset => <div key={asset._id} className="group cursor-pointer border rounded-lg overflow-hidden hover:shadow-lg transition-shadow" onClick={() => onAssetSelect(asset)}>
                    <div className="aspect-video bg-gray-100 relative">
                      {asset.type === 'image' && asset.thumbnail && <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" />}
                      
                      {asset.type === 'video' && asset.thumbnail && <div className="relative w-full h-full">
                          <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white/90 rounded-full p-2">
                              <Play className="w-6 h-6 text-gray-800" />
                            </div>
                          </div>
                        </div>}
                      
                      {asset.type === 'audio' && <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                          <Music className="w-8 h-8 text-white" />
                        </div>}
                      
                      {asset.type === 'document' && <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>}
                    </div>
                    
                    <div className="p-3">
                      <h3 className="font-medium text-sm truncate">{asset.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(asset.type)}`}>
                          {getTypeIcon(asset.type)}
                          <span className="ml-1 capitalize">{asset.type}</span>
                        </span>
                        <span className="text-xs text-gray-500">{asset.size}</span>
                      </div>
                    </div>
                  </div>)}
              </div> : <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到素材</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedType !== 'all' ? '尝试调整搜索条件或筛选器' : '开始上传您的第一个素材吧'}
                </p>
                <Button onClick={() => setIsUploadOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  上传素材
                </Button>
              </div>}
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <AssetUploadDialog open={isUploadOpen} onOpenChange={setIsUploadOpen} onSuccess={handleUploadSuccess} $w={$w} />
  </>;
}