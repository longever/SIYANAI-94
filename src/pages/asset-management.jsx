// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input, Tabs, TabsContent, TabsList, TabsTrigger, Checkbox, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, Label, Textarea, toast } from '@/components/ui';
// @ts-ignore;
import { Upload, Download, Trash2, Tag, Search, Image, Music, Video, File, X, Plus, Check } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

import { AssetUploader } from '@/components/AssetUploader';
import { AssetFilter } from '@/components/AssetFilter';
export default function AssetManagement(props) {
  const {
    $w
  } = props;
  const [assets, setAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [newTags, setNewTags] = useState('');
  const assetTypes = [{
    value: 'all',
    label: '全部',
    icon: File
  }, {
    value: 'image',
    label: '图片',
    icon: Image
  }, {
    value: 'audio',
    label: '音频',
    icon: Music
  }, {
    value: 'video',
    label: '视频',
    icon: Video
  }, {
    value: 'other',
    label: '其他',
    icon: File
  }];
  const loadAssets = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await $w.cloud.callFunction({
        name: 'asset-service',
        data: {
          path: '/list',
          httpMethod: 'GET',
          queryString: {
            page: '1',
            pageSize: '50'
          }
        }
      });
      if (result.result && result.result.list) {
        // 转换数据结构以匹配前端需求
        const formattedAssets = result.result.list.map(asset => ({
          _id: asset._id,
          name: asset.fileName,
          type: getFileType(asset.fileName),
          tags: asset.tags || [],
          url: asset.fileUrl,
          uploader: '系统用户',
          // 云函数中未存储上传者信息
          size: 0,
          // 云函数中未存储文件大小
          createdAt: new Date(asset.createdAt).getTime(),
          updatedAt: new Date(asset.createdAt).getTime()
        }));
        setAssets(formattedAssets);
      }
    } catch (error) {
      toast({
        title: '加载失败',
        description: error.message || '无法加载素材列表',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [$w.cloud]);
  useEffect(() => {
    loadAssets();
  }, [loadAssets]);
  const handleUploadComplete = async uploadedFiles => {
    try {
      setIsUploading(true);

      // 使用 AssetUploader 上传的文件已经通过云函数处理
      toast({
        title: '上传成功',
        description: `成功上传 ${uploadedFiles.length} 个文件`
      });
      setShowUploadDialog(false);
      loadAssets();
    } catch (error) {
      toast({
        title: '上传失败',
        description: error.message || '上传过程中出现错误',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };
  const handleDelete = async assetIds => {
    try {
      const deletePromises = assetIds.map(id => $w.cloud.callFunction({
        name: 'asset-service',
        data: {
          path: `/${id}`,
          httpMethod: 'DELETE'
        }
      }));
      await Promise.all(deletePromises);
      toast({
        title: '删除成功',
        description: `已删除 ${assetIds.length} 个素材`
      });
      setSelectedAssets([]);
      loadAssets();
    } catch (error) {
      toast({
        title: '删除失败',
        description: error.message || '删除过程中出现错误',
        variant: 'destructive'
      });
    }
  };
  const handleUpdateTags = async (assetId, tags) => {
    try {
      await $w.cloud.callFunction({
        name: 'asset-service',
        data: {
          path: `/${assetId}`,
          httpMethod: 'PUT',
          body: JSON.stringify({
            tags
          })
        }
      });
      toast({
        title: '更新成功',
        description: '标签已更新'
      });
      setEditingAsset(null);
      loadAssets();
    } catch (error) {
      toast({
        title: '更新失败',
        description: error.message || '标签更新失败',
        variant: 'destructive'
      });
    }
  };
  const handleDownload = async assetIds => {
    try {
      const downloadPromises = assetIds.map(async id => {
        const result = await $w.cloud.callFunction({
          name: 'asset-service',
          data: {
            path: `/download/${id}`,
            httpMethod: 'GET'
          }
        });
        if (result.result && result.result.downloadUrl) {
          const asset = assets.find(a => a._id === id);
          if (asset) {
            const link = document.createElement('a');
            link.href = result.result.downloadUrl;
            link.download = asset.name;
            link.click();
          }
        }
      });
      await Promise.all(downloadPromises);
      toast({
        title: '下载开始',
        description: `正在下载 ${assetIds.length} 个文件`
      });
    } catch (error) {
      toast({
        title: '下载失败',
        description: error.message || '下载过程中出现错误',
        variant: 'destructive'
      });
    }
  };
  const toggleAssetSelection = assetId => {
    setSelectedAssets(prev => prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]);
  };
  const getAssetIcon = type => {
    const iconMap = {
      image: Image,
      audio: Music,
      video: Video,
      other: File
    };
    return iconMap[type] || File;
  };
  const getFileType = fileName => {
    const extension = fileName.toLowerCase().split('.').pop();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'aac'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    if (imageExtensions.includes(extension)) return 'image';
    if (audioExtensions.includes(extension)) return 'audio';
    if (videoExtensions.includes(extension)) return 'video';
    return 'other';
  };
  const filteredAssets = assets.filter(asset => {
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesSearch = !searchQuery || asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* 顶部标题栏 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">素材管理</h1>
          <p className="text-slate-600 dark:text-slate-400">管理您的所有媒体素材</p>
        </div>

        {/* 操作栏 */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input placeholder="搜索素材名称或标签..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="筛选类型" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map(type => <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Upload className="w-4 h-4 mr-2" />
                  上传素材
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>上传新素材</DialogTitle>
                  <DialogDescription>
                    拖拽文件到下方区域或点击选择文件上传
                  </DialogDescription>
                </DialogHeader>
                <AssetUploader onUploadComplete={handleUploadComplete} />
              </DialogContent>
            </Dialog>
          </div>

          {/* 批量操作栏 */}
          {selectedAssets.length > 0 && <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  已选择 {selectedAssets.length} 个素材
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDownload(selectedAssets)}>
                    <Download className="w-4 h-4 mr-1" />
                    批量下载
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedAssets)}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    批量删除
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedAssets([])}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>}
        </div>

        {/* 素材网格 */}
        {isLoading ? <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="aspect-square bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                </CardContent>
              </Card>)}
          </div> : filteredAssets.length === 0 ? <div className="text-center py-12">
            <File className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">暂无素材</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">开始上传您的第一个素材吧</p>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="w-4 h-4 mr-2" />
              上传素材
            </Button>
          </div> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAssets.map(asset => {
          const Icon = getAssetIcon(asset.type);
          const isSelected = selectedAssets.includes(asset._id);
          return <Card key={asset._id} className={cn("group relative transition-all duration-200 hover:shadow-lg", isSelected && "ring-2 ring-blue-500")}>
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleAssetSelection(asset._id)} className="bg-white/90 dark:bg-slate-800/90" />
                  </div>
                  
                  <CardHeader className="p-0">
                    <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden">
                      {asset.type === 'image' ? <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" onError={e => {
                  e.target.style.display = 'none';
                }} /> : <div className="w-full h-full flex items-center justify-center">
                          <Icon className="w-12 h-12 text-slate-400" />
                        </div>}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    <CardTitle className="text-sm font-medium mb-1 line-clamp-1">
                      {asset.name}
                    </CardTitle>
                    <CardDescription className="text-xs mb-2">
                      {Math.round(asset.size / 1024)} KB • {new Date(asset.createdAt).toLocaleDateString()}
                    </CardDescription>
                    
                    <div className="flex flex-wrap gap-1">
                      {asset.tags.slice(0, 3).map((tag, index) => <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>)}
                      {asset.tags.length > 3 && <Badge variant="outline" className="text-xs">
                          +{asset.tags.length - 3}
                        </Badge>}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0 flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => {
                    setEditingAsset(asset);
                    setNewTags(asset.tags.join(', '));
                  }}>
                          <Tag className="w-3 h-3 mr-1" />
                          标签
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>编辑标签</DialogTitle>
                          <DialogDescription>
                            为素材添加或修改标签，用逗号分隔多个标签
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>标签</Label>
                            <Textarea value={newTags} onChange={e => setNewTags(e.target.value)} placeholder="例如：风景, 高清, 自然" rows={3} />
                          </div>
                          <Button onClick={() => {
                      const tags = newTags.split(',').map(t => t.trim()).filter(t => t);
                      handleUpdateTags(asset._id, tags);
                    }}>
                            保存标签
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleDownload([asset._id])}>
                      <Download className="w-3 h-3" />
                    </Button>
                  </CardFooter>
                </Card>;
        })}
          </div>}
      </div>
    </div>;
}