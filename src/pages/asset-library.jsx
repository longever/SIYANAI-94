// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Tabs, TabsContent, TabsList, TabsTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Plus, Search, Filter } from 'lucide-react';

import AssetGrid from '@/components/AssetGrid';
import AssetUploadDialog from '@/components/AssetUploadDialog';
import EnhancedAssetLibrary from '@/components/EnhancedAssetLibrary';

export default function AssetLibrary(props) {
  const {
    $w,
    style
  } = props;
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();

  // 加载素材库数据
  const loadAssets = async () => {
    try {
      setLoading(true);

      // 使用数据源查询素材
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          getCount: true,
          pageSize: 100,
          pageNumber: 1
        }
      });
      if (result.records) {
        setAssets(result.records);
        setFilteredAssets(result.records);
      }
    } catch (error) {
      console.error('加载素材失败:', error);
      toast({
        title: "加载失败",
        description: error.message || "无法加载素材库",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAssets();
  }, []);

  // 搜索和筛选
  useEffect(() => {
    let filtered = assets;
    if (searchTerm) {
      filtered = filtered.filter(asset => asset.fileName?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (selectedType !== 'all') {
      filtered = filtered.filter(asset => asset.fileType?.startsWith(selectedType));
    }
    setFilteredAssets(filtered);
  }, [assets, searchTerm, selectedType]);
  const handleUploadSuccess = uploadedFiles => {
    loadAssets(); // 重新加载素材列表
  };
  const handleDeleteAsset = async assetId => {
    try {
      await $w.cloud.callDataSource({
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
        title: "删除成功",
        description: "素材已删除"
      });
      loadAssets();
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message || "无法删除素材",
        variant: "destructive"
      });
    }
  };
  return <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">素材库</h1>
        <p className="text-gray-600">管理您的图片、视频和音频素材</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="搜索素材..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="image">图片</SelectItem>
                  <SelectItem value="video">视频</SelectItem>
                  <SelectItem value="audio">音频</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={() => setUploadDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                上传素材
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b px-6">
            <TabsTrigger value="grid">网格视图</TabsTrigger>
            <TabsTrigger value="enhanced">高级视图</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="p-6">
            <AssetGrid assets={filteredAssets} loading={loading} onDelete={handleDeleteAsset} onRefresh={loadAssets} />
          </TabsContent>

          <TabsContent value="enhanced" className="p-6">
            <EnhancedAssetLibrary assets={filteredAssets} loading={loading} onDelete={handleDeleteAsset} onRefresh={loadAssets} />
          </TabsContent>
        </Tabs>
      </div>
    </div>

    <AssetUploadDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} onUploadSuccess={handleUploadSuccess} />
  </div>;
}