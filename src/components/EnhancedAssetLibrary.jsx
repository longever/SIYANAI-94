// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Input, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Search, Upload, Image, Music, FileText, Video } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function EnhancedAssetLibrary({
  onAssetSelect
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 模拟素材数据
  const assets = {
    images: [{
      id: 'img1',
      name: '科技背景',
      url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
      type: 'image',
      tags: ['科技', '背景']
    }, {
      id: 'img2',
      name: '商务场景',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      type: 'image',
      tags: ['商务', '人物']
    }, {
      id: 'img3',
      name: '自然风光',
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
      type: 'image',
      tags: ['自然', '风景']
    }],
    audio: [{
      id: 'aud1',
      name: '轻快背景音乐',
      url: '#',
      type: 'audio',
      duration: '2:30',
      tags: ['轻快', '背景']
    }, {
      id: 'aud2',
      name: '科技音效',
      url: '#',
      type: 'audio',
      duration: '0:15',
      tags: ['科技', '音效']
    }, {
      id: 'aud3',
      name: '舒缓音乐',
      url: '#',
      type: 'audio',
      duration: '3:45',
      tags: ['舒缓', '背景']
    }],
    subtitles: [{
      id: 'sub1',
      name: '开场字幕',
      content: '欢迎来到我们的频道',
      type: 'subtitle',
      tags: ['开场']
    }, {
      id: 'sub2',
      name: '产品介绍',
      content: '这是一款革命性的产品',
      type: 'subtitle',
      tags: ['产品']
    }],
    videos: [{
      id: 'vid1',
      name: '示例视频1',
      url: '#',
      type: 'video',
      duration: '0:30',
      tags: ['示例']
    }, {
      id: 'vid2',
      name: '片头动画',
      url: '#',
      type: 'video',
      duration: '0:05',
      tags: ['片头']
    }]
  };
  const categories = [{
    id: 'all',
    name: '全部',
    icon: Video
  }, {
    id: 'images',
    name: '图片',
    icon: Image
  }, {
    id: 'audio',
    name: '音频',
    icon: Music
  }, {
    id: 'subtitles',
    name: '字幕',
    icon: FileText
  }, {
    id: 'videos',
    name: '视频',
    icon: Video
  }];
  const getFilteredAssets = () => {
    let allAssets = [];
    Object.entries(assets).forEach(([category, items]) => {
      items.forEach(item => {
        allAssets.push({
          ...item,
          category
        });
      });
    });
    return allAssets.filter(asset => {
      const matchesSearch = searchTerm === '' || asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };
  const filteredAssets = getFilteredAssets();
  return <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">素材库</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
            <Input placeholder="搜索素材..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5">
              {categories.map(category => <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  <category.icon className="w-3 h-3 mr-1" />
                  {category.name}
                </TabsTrigger>)}
            </TabsList>
            
            <TabsContent value={selectedCategory} className="mt-4">
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {filteredAssets.map(asset => <div key={asset.id} className="border rounded-lg p-3 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => onAssetSelect(asset)}>
                    {asset.type === 'image' && <img src={asset.url} alt={asset.name} className="w-full h-20 object-cover rounded mb-2" />}
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium truncate">{asset.name}</p>
                      
                      {asset.duration && <p className="text-xs text-slate-500">{asset.duration}</p>}
                      
                      <div className="flex flex-wrap gap-1">
                        {asset.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>)}
                      </div>
                    </div>
                  </div>)}
              </div>
            </TabsContent>
          </Tabs>
          
          <Button className="w-full" variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            上传新素材
          </Button>
        </div>
      </CardContent>
    </Card>;
}