// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { X, Search, Image, Video, Music, Upload, Eye, Check } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Tabs, TabsContent, TabsList, TabsTrigger, ScrollArea, Dialog, DialogContent, DialogHeader, DialogTitle, Badge, useToast } from '@/components/ui';

export function AssetSelector({
  onAssetSelect,
  onClose
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
    setSelectedAsset(asset);
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
            {filteredAssets.map(asset => <div key={asset._id} className="relative group cursor-pointer rounded-lg overflow-hidden border hover:border-primary transition-colors" onClick={() => handleAssetClick(asset)}>
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
                  <p className="text-white text-xs truncate">{asset.name}</p>
                </div>
              </div>)}
          </div>}
      </ScrollArea>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>预览素材</DialogTitle>
          </DialogHeader>
          
          {selectedAsset && <div className="space-y-4">
              <div className="bg-muted rounded-lg overflow-hidden">
                {selectedAsset.type === 'image' ? <img src={selectedAsset.url} alt={selectedAsset.name} className="w-full h-auto max-h-[60vh] object-contain" /> : selectedAsset.type === 'video' ? <video src={selectedAsset.url} controls className="w-full max-h-[60vh]" /> : <audio src={selectedAsset.url} controls className="w-full" />}
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{selectedAsset.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    类型: {selectedAsset.type} | 大小: {selectedAsset.size}
                  </p>
                </div>
                
                <Button onClick={handleInsert}>
                  <Check className="w-4 h-4 mr-2" />
                  插入素材
                </Button>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </div>;
}