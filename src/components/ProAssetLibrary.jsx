// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, useToast, Badge } from '@/components/ui';
// @ts-ignore;
import { Upload, Search, Folder, Image, Video, Music, Eye, Download, Trash2 } from 'lucide-react';

// @ts-ignore;
import { AssetPreviewDialog } from './AssetPreviewDialog';
export function ProAssetLibrary({
  project,
  onAssetsChange,
  $w
}) {
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadAssets();
  }, []);
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
          getCount: true,
          pageSize: 100,
          pageNumber: 1,
          orderBy: [{
            createdAt: 'desc'
          }]
        }
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
        createdAt: asset.createdAt || new Date().toISOString(),
        download_count: asset.download_count || 0,
        duration: asset.duration || 0,
        dimensions: asset.dimensions || null,
        tags: asset.tags || []
      }));
      setAssets(normalizedAssets);
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
  const handleFileUpload = async event => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
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
    try {
      const uploadPromises = validFiles.map(async file => {
        const result = await $w.cloud.callFunction({
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
        return result;
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
      createdAt: asset.createdAt || new Date().toISOString(),
      download_count: asset.download_count || 0,
      duration: asset.duration || 0,
      dimensions: asset.dimensions || null,
      tags: asset.tags || []
    };
    setSelectedAsset(normalizedAsset);
    setPreviewOpen(true);
  };
  const handleDeleteAsset = async asset => {
    if (!asset || !asset._id) {
      toast({
        title: "删除失败",
        description: "无效的素材ID",
        variant: "destructive"
      });
      return;
    }
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaDeleteV2',
        params: {
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
  const getAssetIcon = type => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      default:
        return <Folder className="w-4 h-4" />;
    }
  };
  const formatFileSize = bytes => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };
  const filteredAssets = assets.filter(asset => asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || asset.type.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div className="space-y-4">
      <div className="flex gap-2">
        <Input placeholder="搜索素材..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1" />
        <Button size="sm" variant="outline">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <Button className="w-full" size="sm" onClick={() => document.getElementById('pro-asset-upload').click()}>
          <Upload className="w-4 h-4 mr-2" />
          上传素材
        </Button>
        
        <input id="pro-asset-upload" type="file" multiple accept="image/*,video/*,audio/*" className="hidden" onChange={handleFileUpload} />
        
        <div className="text-sm text-slate-500">
          共 {filteredAssets.length} 个素材
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading ? [...Array(6)].map((_, i) => <Card key={i} className="p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
                </div>
              </div>
            </Card>) : filteredAssets.length === 0 ? <div className="text-center py-8">
            <Folder className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">暂无素材</p>
          </div> : filteredAssets.map(asset => <Card key={asset._id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center flex-shrink-0">
                  {getAssetIcon(asset.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{asset.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {asset.type}
                    </Badge>
                    <span>{formatFileSize(asset.size)}</span>
                    {asset.duration > 0 && <span>{Math.floor(asset.duration / 60)}:{(asset.duration % 60).toString().padStart(2, '0')}</span>}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={e => {
              e.stopPropagation();
              handleAssetClick(asset);
            }}>
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={e => {
              e.stopPropagation();
              onAssetsChange(asset);
            }}>
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={e => {
              e.stopPropagation();
              handleDeleteAsset(asset);
            }}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>)}
      </div>

      {/* 使用修复后的 AssetPreviewDialog */}
      <AssetPreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} asset={selectedAsset} $w={$w} onDelete={handleDeleteAsset} />
    </div>;
}