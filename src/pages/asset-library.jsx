// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, Search } from 'lucide-react';

import { AssetGrid } from '@/components/AssetGrid';
import { AssetUploadDialog } from '@/components/AssetUploadDialog';
export default function AssetLibrary(props) {
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
    loadAssets();
  }, []);
  useEffect(() => {
    filterAssets();
  }, [assets, searchTerm, selectedType]);
  const loadAssets = async () => {
    try {
      setLoading(true);
      const response = await props.$w.cloud.callDataSource({
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
        // 获取云存储临时URL
        const tcb = await props.$w.cloud.getCloudInstance();
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
  const handleDelete = async assetId => {
    try {
      // 先获取文件信息
      const asset = assets.find(a => a._id === assetId);
      if (!asset) return;

      // 删除云存储文件
      const tcb = await props.$w.cloud.getCloudInstance();
      await tcb.deleteFile({
        fileList: [asset.url]
      });

      // 删除数据库记录
      await props.$w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: assetId
              }
            }
          }
        }
      });
      toast({
        title: '删除成功',
        description: '素材已从云存储删除'
      });
      loadAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast({
        title: '删除失败',
        description: '无法删除素材，请稍后重试',
        variant: 'destructive'
      });
    }
  };
  const handleUploadSuccess = () => {
    loadAssets();
    setIsUploadOpen(false);
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
  return <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">素材库</h1>
          <p className="text-gray-600">管理您的所有媒体素材</p>
        </div>

        {/* 搜索和筛选 */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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

        {/* 统计信息 */}
        <div className="mb-4 text-sm text-gray-600">
          共 {filteredAssets.length} 个素材
        </div>

        {/* 素材网格 */}
        {loading ? <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div> : filteredAssets.length > 0 ? <AssetGrid assets={filteredAssets} onDelete={handleDelete} /> : <div className="text-center py-12">
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

      <AssetUploadDialog open={isUploadOpen} onOpenChange={setIsUploadOpen} onSuccess={handleUploadSuccess} $w={props.$w} />
    </div>;
}