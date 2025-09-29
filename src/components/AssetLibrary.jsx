// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Search, Upload, Grid, List, Filter, X, Download, Trash2, Eye, Play, Volume2, Package, Calendar, FileText, Image as ImageIcon, Video, Music, Box3D, CheckSquare, Square, Loader2 } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, Badge, Tabs, TabsContent, TabsList, TabsTrigger, ScrollArea, Separator, Checkbox, Label, Slider, Popover, PopoverContent, PopoverTrigger, useToast } from '@/components/ui';

const FILE_TYPES = {
  image: {
    icon: ImageIcon,
    label: '图片',
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  },
  video: {
    icon: Video,
    label: '视频',
    extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm']
  },
  audio: {
    icon: Music,
    label: '音频',
    extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg']
  },
  model: {
    icon: Box3D,
    label: '3D模型',
    extensions: ['obj', 'fbx', 'gltf', 'glb', 'stl']
  }
};
const SIZE_UNITS = ['B', 'KB', 'MB', 'GB'];
export function AssetLibrary({
  onAssetSelect,
  onInsertToCreator,
  $w
}) {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [previewAsset, setPreviewAsset] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    tags: [],
    dateRange: 'all',
    sizeRange: [0, 1000]
  });
  const fileInputRef = useRef(null);
  const {
    toast
  } = useToast();

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
          orderBy: [{
            createdAt: 'desc'
          }],
          getCount: true
        }
      });
      setAssets(result.records || []);
      setFilteredAssets(result.records || []);
    } catch (error) {
      toast({
        title: '加载失败',
        description: error.message || '无法加载素材列表',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理文件上传 - 使用云函数
  const handleFileUpload = async files => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();

      // 添加所有文件到FormData
      Array.from(files).forEach((file, index) => {
        formData.append('file', file);
        formData.append(`filename_${index}`, file.name);
      });

      // 调用云函数上传
      const result = await $w.cloud.callFunction({
        name: 'uploadAsset',
        data: formData
      });
      if (result.code === 0) {
        toast({
          title: '上传成功',
          description: `成功上传 ${files.length} 个文件`
        });
        await loadAssets(); // 刷新列表
      } else {
        throw new Error(result.message || '上传失败');
      }
    } catch (error) {
      toast({
        title: '上传失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  // 删除素材 - 使用云函数
  const handleDeleteAsset = async assetId => {
    try {
      const result = await $w.cloud.callFunction({
        name: 'deleteAsset',
        data: {
          assetId
        }
      });
      if (result.success) {
        toast({
          title: '删除成功',
          description: '素材已删除'
        });
        await loadAssets(); // 刷新列表
      } else {
        throw new Error(result.error || '删除失败');
      }
    } catch (error) {
      toast({
        title: '删除失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedAssets.length === 0) return;
    try {
      // 并行删除所有选中的素材
      const deletePromises = selectedAssets.map(assetId => $w.cloud.callFunction({
        name: 'deleteAsset',
        data: {
          assetId
        }
      }));
      const results = await Promise.allSettled(deletePromises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      toast({
        title: '删除完成',
        description: `成功删除 ${successCount}/${selectedAssets.length} 个素材`
      });
      setSelectedAssets([]);
      await loadAssets();
    } catch (error) {
      toast({
        title: '批量删除失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 获取下载URL - 使用云函数
  const handleDownloadAsset = async asset => {
    try {
      const result = await $w.cloud.callFunction({
        name: 'getAssetDownloadUrl',
        data: {
          assetId: asset._id
        }
      });
      if (result.downloadUrl) {
        // 创建下载链接
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = asset.name;
        link.click();

        // 更新下载次数
        await $w.cloud.callDataSource({
          dataSourceName: 'asset_library',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              download_count: (asset.download_count || 0) + 1
            },
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
          title: '下载开始',
          description: '文件下载已开始'
        });
      } else {
        throw new Error(result.error || '获取下载链接失败');
      }
    } catch (error) {
      toast({
        title: '下载失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 批量下载
  const handleBatchDownload = async () => {
    const selectedFiles = assets.filter(asset => selectedAssets.includes(asset._id));
    for (const asset of selectedFiles) {
      try {
        const result = await $w.cloud.callFunction({
          name: 'getAssetDownloadUrl',
          data: {
            assetId: asset._id
          }
        });
        if (result.downloadUrl) {
          const link = document.createElement('a');
          link.href = result.downloadUrl;
          link.download = asset.name;
          link.click();

          // 延迟一下避免浏览器限制
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`下载 ${asset.name} 失败:`, error);
      }
    }
    toast({
      title: '批量下载',
      description: `已启动 ${selectedFiles.length} 个文件的下载`
    });
  };

  // 应用筛选
  const applyFilters = () => {
    let filtered = [...assets];

    // 类型筛选
    if (filters.type !== 'all') {
      filtered = filtered.filter(asset => asset.type === filters.type);
    }

    // 搜索筛选
    if (searchQuery) {
      filtered = filtered.filter(asset => asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || asset.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    }

    // 时间筛选
    const now = new Date();
    if (filters.dateRange !== 'all') {
      const daysMap = {
        today: 1,
        week: 7,
        month: 30,
        year: 365
      };
      const days = daysMap[filters.dateRange];
      if (days) {
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(asset => new Date(asset.createdAt) >= cutoff);
      }
    }

    // 大小筛选
    filtered = filtered.filter(asset => {
      const sizeInMB = asset.size / (1024 * 1024);
      return sizeInMB >= filters.sizeRange[0] && sizeInMB <= filters.sizeRange[1];
    });
    setFilteredAssets(filtered);
  };

  // 切换选择状态
  const toggleAssetSelection = assetId => {
    setSelectedAssets(prev => prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedAssets.length === filteredAssets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(filteredAssets.map(asset => asset._id));
    }
  };

  // 格式化文件大小
  const formatFileSize = bytes => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + SIZE_UNITS[i];
  };

  // 格式化日期
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };
  useEffect(() => {
    loadAssets();
  }, []);
  useEffect(() => {
    applyFilters();
  }, [assets, searchQuery, filters]);
  return <div className="h-full flex bg-gray-50 dark:bg-gray-900">
      {/* 左侧筛选面板 */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold mb-4">筛选条件</h3>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">文件类型</Label>
            <Select value={filters.type} onValueChange={value => setFilters(prev => ({
            ...prev,
            type: value
          }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {Object.entries(FILE_TYPES).map(([key, config]) => <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <config.icon className="w-4 h-4" />
                      {config.label}
                    </div>
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">上传时间</Label>
            <Select value={filters.dateRange} onValueChange={value => setFilters(prev => ({
            ...prev,
            dateRange: value
          }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部时间</SelectItem>
                <SelectItem value="today">今天</SelectItem>
                <SelectItem value="week">本周</SelectItem>
                <SelectItem value="month">本月</SelectItem>
                <SelectItem value="year">今年</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">文件大小</Label>
            <div className="space-y-2">
              <Slider value={filters.sizeRange} onValueChange={value => setFilters(prev => ({
              ...prev,
              sizeRange: value
            }))} max={1000} step={10} className="w-full" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{filters.sizeRange[0]}MB</span>
                <span>{filters.sizeRange[1]}MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部操作栏 */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="搜索文件名或标签..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedAssets.length > 0 && <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleBatchDownload} disabled={selectedAssets.length === 0}>
                    <Download className="w-4 h-4 mr-1" />
                    下载 ({selectedAssets.length})
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleBatchDelete} disabled={selectedAssets.length === 0} className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-1" />
                    删除 ({selectedAssets.length})
                  </Button>
                </div>}

              <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </Button>

              <Button variant="default" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    上传中...
                  </> : <>
                    <Upload className="w-4 h-4 mr-1" />
                    上传素材
                  </>}
              </Button>

              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => handleFileUpload(e.target.files)} accept="image/*,video/*,audio/*,.obj,.fbx,.gltf,.glb,.stl" />
            </div>
          </div>

          {selectedAssets.length > 0 && <div className="mt-3 flex items-center gap-2">
              <Checkbox checked={selectedAssets.length === filteredAssets.length} onCheckedChange={toggleSelectAll} />
              <span className="text-sm text-gray-600">
                已选择 {selectedAssets.length} 个文件
              </span>
            </div>}
        </div>

        {/* 素材展示区 */}
        <ScrollArea className="flex-1 p-4">
          {loading ? <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div> : filteredAssets.length === 0 ? <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Package className="w-12 h-12 mb-4 text-gray-300" />
              <p>暂无素材</p>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="mt-4">
                <Upload className="w-4 h-4 mr-1" />
                上传素材
              </Button>
            </div> : viewMode === 'grid' ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredAssets.map(asset => {
            const FileIcon = FILE_TYPES[asset.type]?.icon || FileText;
            return <div key={asset._id} className={`relative group cursor-pointer rounded-lg border transition-all hover:shadow-lg ${selectedAssets.includes(asset._id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 dark:border-gray-700'}`}>
                    <div className="absolute top-2 left-2 z-10" onClick={e => {
                e.stopPropagation();
                toggleAssetSelection(asset._id);
              }}>
                      <Checkbox checked={selectedAssets.includes(asset._id)} />
                    </div>

                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-t-lg flex items-center justify-center overflow-hidden" onClick={() => setPreviewAsset(asset)}>
                      {asset.type === 'image' && asset.thumbnail ? <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" /> : <FileIcon className="w-12 h-12 text-gray-400" />}
                    </div>

                    <div className="p-3">
                      <p className="text-sm font-medium truncate">{asset.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(asset.size)} · {formatDate(asset.createdAt)}
                      </p>
                      {asset.tags?.length > 0 && <div className="flex gap-1 mt-2 flex-wrap">
                          {asset.tags.slice(0, 2).map(tag => <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>)}
                        </div>}
                    </div>
                  </div>;
          })}
            </div> : <div className="space-y-2">
              {filteredAssets.map(asset => {
            const FileIcon = FILE_TYPES[asset.type]?.icon || FileText;
            return <div key={asset._id} className={`flex items-center gap-4 p-3 rounded-lg border transition-all cursor-pointer ${selectedAssets.includes(asset._id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}>
                    <Checkbox checked={selectedAssets.includes(asset._id)} onCheckedChange={() => toggleAssetSelection(asset._id)} />
                    
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center" onClick={() => setPreviewAsset(asset)}>
                      {asset.type === 'image' && asset.thumbnail ? <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover rounded" /> : <FileIcon className="w-6 h-6 text-gray-400" />}
                    </div>

                    <div className="flex-1 min-w-0" onClick={() => setPreviewAsset(asset)}>
                      <p className="font-medium truncate">{asset.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(asset.size)} · {formatDate(asset.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setPreviewAsset(asset)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadAsset(asset)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteAsset(asset._id)} className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>;
          })}
            </div>}
        </ScrollArea>
      </div>

      {/* 预览弹窗 */}
      <Dialog open={!!previewAsset} onOpenChange={open => !open && setPreviewAsset(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{previewAsset?.name}</DialogTitle>
          </DialogHeader>
          
          {previewAsset && <div className="flex flex-col gap-4">
              <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                {previewAsset.type === 'image' && <img src={previewAsset.url} alt={previewAsset.name} className="w-full h-full object-contain" />}
                
                {previewAsset.type === 'video' && <video src={previewAsset.url} controls className="w-full h-full" />}
                
                {previewAsset.type === 'audio' && <div className="flex items-center justify-center h-64">
                    <audio src={previewAsset.url} controls className="w-full max-w-md" />
                  </div>}
                
                {previewAsset.type === 'model' && <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Box3D className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">3D模型预览</p>
                      <p className="text-sm text-gray-400 mt-2">
                        文件大小: {formatFileSize(previewAsset.size)}
                      </p>
                    </div>
                  </div>}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">文件大小:</span>
                  <span className="ml-2">{formatFileSize(previewAsset.size)}</span>
                </div>
                <div>
                  <span className="font-medium">上传时间:</span>
                  <span className="ml-2">{formatDate(previewAsset.createdAt)}</span>
                </div>
                <div>
                  <span className="font-medium">文件类型:</span>
                  <span className="ml-2">{previewAsset.mime_type}</span>
                </div>
                <div>
                  <span className="font-medium">使用次数:</span>
                  <span className="ml-2">{previewAsset.usage_count || 0}</span>
                </div>
              </div>

              {previewAsset.tags?.length > 0 && <div>
                  <span className="font-medium">标签:</span>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {previewAsset.tags.map(tag => <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>)}
                  </div>
                </div>}

              <div className="flex gap-2 pt-4">
                <Button onClick={() => {
              onInsertToCreator?.(previewAsset);
              setPreviewAsset(null);
            }} className="flex-1">
                  插入到创作中心
                </Button>
                <Button variant="outline" onClick={() => handleDownloadAsset(previewAsset)}>
                  <Download className="w-4 h-4 mr-2" />
                  下载
                </Button>
                <Button variant="outline" onClick={() => {
              handleDeleteAsset(previewAsset._id);
              setPreviewAsset(null);
            }} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除
                </Button>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </div>;
}