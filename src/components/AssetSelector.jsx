// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { X, Search, Image, Video, Music, Upload, Eye, Check } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Tabs, TabsContent, TabsList, TabsTrigger, ScrollArea, Dialog, DialogContent, DialogHeader, DialogTitle, Badge, useToast } from '@/components/ui';

// @ts-ignore;
import { AssetPreviewDialog } from './AssetPreviewDialog';
export function AssetSelector({
  onAssetSelect,
  onClose,
  $w
}) {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadAssets();
  }, []);
  const loadAssets = async () => {
    try {
      // 从数据源加载素材
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 50,
          pageNumber: 1,
          orderBy: [{
            createdAt: 'desc'
          }]
        }
      });
      setAssets(result.records || []);
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
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || asset.type === selectedType;
    return matchesSearch && matchesType;
  });
  const getAssetIcon = type => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      default:
        return <Image className="w-4 h-4" />;
    }
  };
  const handleAssetClick = asset => {
    // 确保 asset 对象包含必要的字段
    const validAsset = {
      ...asset,
      _id: asset._id || asset.id,
      fileId: asset.fileId || asset.cloudPath || asset.file_id,
      url: asset.url || asset.downloadUrl || asset.file_url,
      name: asset.name || '未命名素材',
      type: asset.type || 'unknown',
      size: asset.size || 0,
      thumbnailUrl: asset.thumbnailUrl || asset.thumbnail_url
    };
    setSelectedAsset(validAsset);
    setPreviewOpen(true);
  };
  const handleInsert = () => {
    if (selectedAsset) {
      onAssetSelect(selectedAsset);
      setPreviewOpen(false);
      onClose();
    }
  };
  return <div className="w-80 h-full bg-background border-l flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">素材库</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <Input placeholder="搜索素材..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="mb-3" />
        
        <Tabs value={selectedType} onValueChange={setSelectedType}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="text-xs">全部</TabsTrigger>
            <TabsTrigger value="image" className="text-xs">
              <Image className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="video" className="text-xs">
              <Video className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="audio" className="text-xs">
              <Music className="w-3 h-3" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1 p-4">
        {loading ? <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div> : <div className="grid grid-cols-2 gap-2">
            {filteredAssets.map(asset => {
          // 确保每个 asset 都有有效的 ID
          const assetId = asset._id || asset.id;
          if (!assetId) {
            console.warn('发现无效的素材项，缺少ID:', asset);
            return null;
          }
          return <div key={assetId} className="relative group cursor-pointer rounded-lg overflow-hidden border hover:border-primary transition-colors" onClick={() => handleAssetClick(asset)}>
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    {asset.type === 'image' && asset.thumbnailUrl ? <img src={asset.thumbnailUrl} alt={asset.name} className="w-full h-full object-cover" /> : <div className="text-muted-foreground">
                        {getAssetIcon(asset.type)}
                      </div>}
                  </div>
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="absolute top-1 right-1">
                    <Badge variant="secondary" className="text-xs">
                      {asset.type}
                    </Badge>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-white text-xs truncate">{asset.name || '未命名素材'}</p>
                  </div>
                </div>;
        })}
          </div>}
      </ScrollArea>

      <AssetPreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} asset={selectedAsset} $w={$w} />
    </div>;
}