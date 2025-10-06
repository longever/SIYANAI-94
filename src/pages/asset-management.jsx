// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, Input, Card, CardContent, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Label, Textarea, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Upload, Download, Trash2, Tag, Grid, List, X, Plus, FileImage, FileAudio, FileVideo, FileText, Calendar, User, HardDrive, Edit3, Eye } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

import { AssetUploader } from '@/components/AssetUploader';
import { AssetFilter } from '@/components/AssetFilter';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
export default function AssetManagement(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(20);

  // 获取素材列表
  const fetchAssets = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const result = await $w.cloud.callFunction({
        name: 'asset-service',
        data: {
          action: 'list',
          data: {
            page,
            pageSize
          }
        }
      });
      if (result.code === 0) {
        setAssets(result.data.list);
        setFilteredAssets(result.data.list);
        setTotalCount(result.data.total);
        setCurrentPage(page);

        // 提取所有标签
        const tags = new Set();
        result.data.list.forEach(asset => {
          if (asset.tags) {
            asset.tags.forEach(tag => tags.add(tag));
          }
        });
        setAllTags(Array.from(tags));
      } else {
        throw new Error(result.message || '获取素材失败');
      }
    } catch (err) {
      setError(err.message);
      toast({
        title: "获取素材失败",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [$w, toast, pageSize]);
  useEffect(() => {
    fetchAssets(currentPage);
  }, [fetchAssets, currentPage]);

  // 筛选逻辑
  useEffect(() => {
    let filtered = assets;

    // 按类型筛选
    if (selectedType !== 'all') {
      filtered = filtered.filter(asset => asset.type === selectedType);
    }

    // 按标签筛选
    if (selectedTags.length > 0) {
      filtered = filtered.filter(asset => asset.tags && selectedTags.some(tag => asset.tags.includes(tag)));
    }

    // 按搜索关键词筛选
    if (searchQuery) {
      filtered = filtered.filter(asset => asset.originalName.toLowerCase().includes(searchQuery.toLowerCase()) || asset.description && asset.description.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setFilteredAssets(filtered);
  }, [assets, selectedType, selectedTags, searchQuery]);
  const handleTypeChange = type => {
    setSelectedType(type);
  };
  const handleTagToggle = tag => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };
  const handleAssetSelect = assetId => {
    setSelectedAssets(prev => prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]);
  };
  const handleSelectAll = () => {
    if (selectedAssets.length === filteredAssets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(filteredAssets.map(asset => asset._id));
    }
  };

  // 删除素材
  const handleDelete = async assetIds => {
    try {
      let successCount = 0;
      for (const id of assetIds) {
        const result = await $w.cloud.callFunction({
          name: 'asset-service',
          data: {
            action: 'delete',
            id
          }
        });
        if (result.code === 0) {
          successCount++;
        }
      }
      if (successCount > 0) {
        toast({
          title: "删除成功",
          description: `已删除 ${successCount} 个素材`,
          variant: "default"
        });
        setSelectedAssets([]);
        fetchAssets(currentPage);
      }
    } catch (err) {
      toast({
        title: "删除失败",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  // 批量下载
  const handleDownload = async assetIds => {
    try {
      for (const id of assetIds) {
        const result = await $w.cloud.callFunction({
          name: 'asset-service',
          data: {
            action: 'download',
            id
          }
        });
        if (result.code === 0) {
          const a = document.createElement('a');
          a.href = result.data.url;
          a.download = '';
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      }
      toast({
        title: "下载开始",
        description: `正在下载 ${assetIds.length} 个素材`,
        variant: "default"
      });
    } catch (err) {
      toast({
        title: "下载失败",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  // 更新素材信息
  const handleUpdateAsset = async (id, updateData) => {
    try {
      const result = await $w.cloud.callFunction({
        name: 'asset-service',
        data: {
          action: 'update',
          id,
          data: updateData
        }
      });
      if (result.code === 0) {
        toast({
          title: "更新成功",
          description: "素材信息已更新",
          variant: "default"
        });
        fetchAssets(currentPage);
        setShowEditDialog(false);
        setEditingAsset(null);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      toast({
        title: "更新失败",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  // 处理文件上传
  const handleFileUpload = async (file, metadata) => {
    try {
      setUploading(true);

      // 上传到云存储
      const tcb = await $w.cloud.getCloudInstance();
      const fileName = `saas_temp/${Date.now()}_${file.name}`;
      const uploadResult = await tcb.uploadFile({
        cloudPath: fileName,
        filePath: file.path || file
      });

      // 创建素材记录
      const assetData = {
        fileID: uploadResult.fileID,
        originalName: file.name,
        type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'other',
        size: file.size,
        mimetype: file.type,
        url: uploadResult.fileID,
        thumbnail: file.type.startsWith('image/') ? uploadResult.fileID : null,
        uploader: $w.auth.currentUser?.name || '匿名用户',
        uploadTime: Date.now(),
        tags: metadata.tags || [],
        description: metadata.description || '',
        downloadCount: 0,
        usageCount: 0,
        isPlatform: false
      };

      // 保存到数据源
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaCreateV2',
        params: {
          data: assetData
        }
      });
      if (result.id) {
        toast({
          title: "上传成功",
          description: `文件 ${file.name} 已上传`,
          variant: "default"
        });
        fetchAssets(currentPage);
        return true;
      }
      return false;
    } catch (err) {
      toast({
        title: "上传失败",
        description: err.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setUploading(false);
    }
  };
  const handleUploadComplete = () => {
    setShowUploadDialog(false);
    fetchAssets(1);
  };
  const getFileIcon = type => {
    switch (type) {
      case 'image':
        return <FileImage className="w-4 h-4" />;
      case 'audio':
        return <FileAudio className="w-4 h-4" />;
      case 'video':
        return <FileVideo className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };
  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const formatDate = timestamp => {
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };

  // 编辑素材
  const handleEditAsset = asset => {
    setEditingAsset(asset);
    setShowEditDialog(true);
  };
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={() => fetchAssets(currentPage)} />;
  return <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 顶部操作栏 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="搜索素材名称或描述..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </Button>
              
              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    上传素材
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>上传素材</DialogTitle>
                  </DialogHeader>
                  <AssetUploader onUploadComplete={handleUploadComplete} uploading={uploading} setUploading={setUploading} onFileUpload={handleFileUpload} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* 批量操作栏 */}
          {selectedAssets.length > 0 && <div className="mt-4 pt-4 border-t flex items-center gap-4">
              <Checkbox checked={selectedAssets.length === filteredAssets.length} onCheckedChange={handleSelectAll} />
              <span className="text-sm text-gray-600">
                已选择 {selectedAssets.length} 个素材
              </span>
              <Button variant="outline" size="sm" onClick={() => handleDownload(selectedAssets)}>
                <Download className="w-4 h-4 mr-2" />
                批量下载
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(selectedAssets)}>
                <Trash2 className="w-4 h-4 mr-2" />
                批量删除
              </Button>
            </div>}
        </div>

        <div className="flex gap-6">
          {/* 左侧筛选栏 */}
          <div className="hidden lg:block w-64">
            <AssetFilter selectedType={selectedType} onTypeChange={handleTypeChange} selectedTags={selectedTags} onTagToggle={handleTagToggle} allTags={allTags} />
          </div>

          {/* 主内容区 */}
          <div className="flex-1">
            {filteredAssets.length === 0 ? <EmptyState title="暂无素材" description="上传您的第一个素材开始管理" action={<Button onClick={() => setShowUploadDialog(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    上传素材
                  </Button>} /> : <>
                {viewMode === 'grid' ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredAssets.map(asset => <Card key={asset._id} className="group hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="relative">
                            <Checkbox checked={selectedAssets.includes(asset._id)} onCheckedChange={() => handleAssetSelect(asset._id)} className="absolute top-2 left-2 z-10" />
                            
                            {asset.type === 'image' && asset.thumbnail ? <img src={asset.thumbnail} alt={asset.originalName} className="w-full h-32 object-cover rounded-md" /> : <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
                                {getFileIcon(asset.type)}
                              </div>}
                          </div>
                          
                          <div className="mt-3">
                            <h3 className="font-medium text-sm truncate">{asset.originalName}</h3>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              {getFileIcon(asset.type)}
                              <span>{formatFileSize(asset.size)}</span>
                            </div>
                            
                            {asset.tags && asset.tags.length > 0 && <div className="flex flex-wrap gap-1 mt-2">
                                {asset.tags.slice(0, 2).map(tag => <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>)}
                                {asset.tags.length > 2 && <Badge variant="outline" className="text-xs">
                                    +{asset.tags.length - 2}
                                  </Badge>}
                              </div>}
                            
                            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {asset.uploader}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(asset.uploadTime)}
                              </span>
                            </div>
                            
                            <div className="flex gap-1 mt-2">
                              <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => handleEditAsset(asset)}>
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => handleDownload([asset._id])}>
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>)}
                  </div> : <div className="bg-white rounded-lg shadow-sm">
                    <div className="divide-y">
                      {filteredAssets.map(asset => <div key={asset._id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-center gap-4">
                            <Checkbox checked={selectedAssets.includes(asset._id)} onCheckedChange={() => handleAssetSelect(asset._id)} />
                            
                            <div className="flex-shrink-0">
                              {asset.type === 'image' && asset.thumbnail ? <img src={asset.thumbnail} alt={asset.originalName} className="w-12 h-12 object-cover rounded" /> : <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                  {getFileIcon(asset.type)}
                                </div>}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium truncate">{asset.originalName}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {asset.type}
                                </Badge>
                              </div>
                              
                              {asset.description && <p className="text-sm text-gray-600 mt-1 truncate">
                                  {asset.description}
                                </p>}
                              
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {asset.uploader}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(asset.uploadTime)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <HardDrive className="w-3 h-3" />
                                  {formatFileSize(asset.size)}
                                </span>
                              </div>
                              
                              {asset.tags && asset.tags.length > 0 && <div className="flex flex-wrap gap-1 mt-2">
                                  {asset.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>)}
                                </div>}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditAsset(asset)}>
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDownload([asset._id])}>
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete([asset._id])}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>)}
                    </div>
                  </div>}
                
                {/* 分页 */}
                {totalCount > pageSize && <div className="flex justify-center mt-6">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                        上一页
                      </Button>
                      <span className="px-3 py-1 text-sm">
                        第 {currentPage} 页 / 共 {Math.ceil(totalCount / pageSize)} 页
                      </span>
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(Math.ceil(totalCount / pageSize), currentPage + 1))} disabled={currentPage >= Math.ceil(totalCount / pageSize)}>
                        下一页
                      </Button>
                    </div>
                  </div>}
              </>}
          </div>
        </div>
      </div>

      {/* 编辑素材对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑素材信息</DialogTitle>
          </DialogHeader>
          {editingAsset && <div className="space-y-4">
              <div>
                <Label>素材名称</Label>
                <Input value={editingAsset.originalName} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>标签</Label>
                <Input placeholder="输入标签，用逗号分隔" defaultValue={editingAsset.tags?.join(', ') || ''} onChange={e => {
              const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
              setEditingAsset({
                ...editingAsset,
                tags
              });
            }} />
              </div>
              <div>
                <Label>描述</Label>
                <Textarea placeholder="输入素材描述" defaultValue={editingAsset.description || ''} onChange={e => {
              setEditingAsset({
                ...editingAsset,
                description: e.target.value
              });
            }} />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleUpdateAsset(editingAsset._id, {
              tags: editingAsset.tags || [],
              description: editingAsset.description || ''
            })}>
                  保存
                </Button>
                <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setEditingAsset(null);
            }}>
                  取消
                </Button>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </div>;
}