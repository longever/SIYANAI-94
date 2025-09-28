// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Search, Upload, Folder, Image, Video, Music, Filter } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Tabs, TabsContent, TabsList, TabsTrigger, ScrollArea } from '@/components/ui';

export function AssetLibrary({
  onAssetSelect,
  $w
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const categories = [{
    id: 'all',
    name: '全部',
    icon: Filter
  }, {
    id: 'image',
    name: '图片',
    icon: Image
  }, {
    id: 'video',
    name: '视频',
    icon: Video
  }, {
    id: 'audio',
    name: '音频',
    icon: Music
  }];

  // 加载素材数据
  const loadAssets = async () => {
    try {
      setLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: true
        }
      });
      setAssets(result.records || []);
    } catch (error) {
      console.error('加载素材失败:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAssets();
  }, []);
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name?.toLowerCase().includes(searchQuery.toLowerCase()) || asset.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || asset.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const handleAssetSelect = asset => {
    onAssetSelect({
      id: asset._id,
      name: asset.name,
      type: asset.type,
      url: asset.url,
      thumbnail: asset.thumbnail
    });
  };
  if (loading) {
    return <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">加载中...</div>
      </div>;
  }
  return <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-3">素材库</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="搜索素材..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Tabs defaultValue="personal" className="flex-1">
        <TabsList className="w-full">
          <TabsTrigger value="personal" className="flex-1">个人素材</TabsTrigger>
          <TabsTrigger value="platform" className="flex-1">平台素材</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="flex-1 p-0">
          <ScrollArea className="h-[400px]">
            <div className="p-4">
              <div className="flex gap-2 mb-4">
                {categories.map(category => <Button key={category.id} variant={selectedCategory === category.id ? "default" : "ghost"} size="sm" onClick={() => setSelectedCategory(category.id)} className="flex items-center gap-1">
                    <category.icon className="w-3 h-3" />
                    {category.name}
                  </Button>)}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {filteredAssets.filter(a => a.category === 'personal').map(asset => <div key={asset._id} className="border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleAssetSelect(asset)}>
                      <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded mb-2 flex items-center justify-center">
                        {asset.type === 'image' && <Image className="w-8 h-8 text-gray-400" />}
                        {asset.type === 'video' && <Video className="w-8 h-8 text-gray-400" />}
                        {asset.type === 'audio' && <Music className="w-8 h-8 text-gray-400" />}
                      </div>
                      <p className="text-sm truncate">{asset.name}</p>
                      <div className="flex gap-1 mt-1">
                        {asset.tags?.slice(0, 2).map(tag => <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {tag}
                          </span>)}
                      </div>
                    </div>)}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="platform" className="flex-1 p-0">
          <ScrollArea className="h-[400px]">
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {filteredAssets.filter(a => a.category === 'platform').map(asset => <div key={asset._id} className="border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleAssetSelect(asset)}>
                      <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded mb-2 flex items-center justify-center">
                        {asset.type === 'image' && <Image className="w-8 h-8 text-gray-400" />}
                        {asset.type === 'video' && <Video className="w-8 h-8 text-gray-400" />}
                        {asset.type === 'audio' && <Music className="w-8 h-8 text-gray-400" />}
                      </div>
                      <p className="text-sm truncate">{asset.name}</p>
                      <div className="flex gap-1 mt-1">
                        {asset.tags?.slice(0, 2).map(tag => <span key={tag} className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                            {tag}
                          </span>)}
                      </div>
                    </div>)}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button className="w-full" variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          上传素材
        </Button>
      </div>
    </div>;
}