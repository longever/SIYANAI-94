// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Card, CardContent, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, Alert, AlertDescription, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Upload, Download, Trash2, Edit, Eye, X, FileImage, FileVideo, FileAudio, FileText } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

import { AssetUploadDialog } from './AssetUploadDialog';
import { AssetPreviewDialog } from './AssetPreviewDialog';
export function AssetLibrary(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(12);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [editName, setEditName] = useState('');
  const [editTags, setEditTags] = useState('');
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const where = {
        $and: [...(selectedType !== 'all' ? [{
          type: {
            $eq: selectedType
          }
        }] : []), ...(searchTerm ? [{
          name: {
            $search: searchTerm
          }
        }] : [])]
      };
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where
          },
          select: {
            $master: true
          },
          pageSize,
          pageNumber: currentPage,
          getCount: true,
          orderBy: [{
            createdAt: 'desc'
          }]
        }
      });
      setAssets(result.records || []);
      setTotalPages(Math.ceil(result.total / pageSize));
    } catch (error) {
      toast({
        title: '获取素材失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedType, searchTerm, currentPage, pageSize, $w.cloud, toast]);
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);
  const handleUpload = async (file, metadata) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', metadata.type);
      formData.append('category', metadata.category || '');
      const uploadResult = await $w.cloud.callFunction({
        name: 'upload-asset',
        data: {
          file: {
            name: file.name,
            type: file.type,
            size: file.size
          },
          metadata: {
            ...metadata,
            folder: `saas_temp/${metadata.type}s`
          }
        }
      });
      if (uploadResult.success) {
        await $w.cloud.callDataSource({
          dataSourceName: 'asset_library',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              name: metadata.name || file.name,
              type: metadata.type,
              category: metadata.category || '',
              url: uploadResult.fileId,
              folder_path: uploadResult.filePath,
              size: file.size,
              mime_type: file.type,
              tags: metadata.tags || [],
              metadata: metadata.custom || {},
              thumbnail: uploadResult.thumbnailId || null
            }
          }
        });
        toast({
          title: '上传成功',
          description: '素材已添加到库中'
        });
        setUploadDialogOpen(false);
        fetchAssets();
      }
    } catch (error) {
      toast({
        title: '上传失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  const handleDelete = async asset => {
    if (!confirm(`确定要删除素材 "${asset.name}" 吗？`)) return;
    try {
      await $w.cloud.callFunction({
        name: 'deleteAsset',
        data: {
          fileId: asset.url
        }
      });
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
        title: '删除成功',
        description: '素材已从库中移除'
      });
      fetchAssets();
    } catch (error) {
      toast({
        title: '删除失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  const handleUpdate = async () => {
    if (!editingAsset) return;
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            name: editName,
            tags: editTags.split(',').map(tag => tag.trim()).filter(Boolean)
          },
          filter: {
            where: {
              _id: {
                $eq: editingAsset._id
              }
            }
          }
        }
      });
      toast({
        title: '更新成功',
        description: '素材信息已更新'
      });
      setEditingAsset(null);
      setEditName('');
      setEditTags('');
      fetchAssets();
    } catch (error) {
      toast({
        title: '更新失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  const handlePreview = async asset => {
    try {
      const result = await $w.cloud.callFunction({
        name: 'get-asset-download-url',
        data: {
          fileId: asset.url
        }
      });
      setSelectedAsset({
        ...asset,
        previewUrl: result.url
      });
      setPreviewDialogOpen(true);
    } catch (error) {
      toast({
        title: '获取预览失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  const handleDownload = async asset => {
    try {
      const result = await $w.cloud.callFunction({
        name: 'get-asset-download-url',
        data: {
          fileId: asset.url
        }
      });
      const link = document.createElement('a');
      link.href = result.url;
      link.download = asset.name;
      link.click();
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
    } catch (error) {
      toast({
        title: '下载失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  const getAssetIcon = type => {
    switch (type) {
      case 'image':
        return <FileImage className="w-8 h-8" />;
      case 'video':
        return <FileVideo className="w-8 h-8" />;
      case 'audio':
        return <FileAudio className="w-8 h-8" />;
      default:
        return <FileText className="w-8 h-8" />;
    }
  };
  const getAssetTypeColor = type => {
    switch (type) {
      case 'image':
        return 'text-blue-600 bg-blue-100';
      case 'video':
        return 'text-green-600 bg-green-100';
      case 'audio':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  return <div className="h-full flex flex-col">
    <div className="border-b p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">素材库</h1>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="w-4 h-4 mr-2" />
          上传素材
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="搜索素材..." value={searchTerm} onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }} className="pl-10" />
          </div>
        </div>

        <Select value={selectedType} onValueChange={value => {
          setSelectedType(value);
          setCurrentPage(1);
        }}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="image">图片</SelectItem>
            <SelectItem value="video">视频</SelectItem>
            <SelectItem value="audio">音频</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="flex-1 overflow-auto p-4">
      {loading ? <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div> : assets.length === 0 ? <div className="text-center py-12">
        <FileImage className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">暂无素材</p>
        <Button variant="outline" className="mt-4" onClick={() => setUploadDialogOpen(true)}>
          开始上传
        </Button>
      </div> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {assets.map(asset => <Card key={asset._id} className="group relative overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-square bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => handlePreview(asset)}>
              {asset.thumbnail ? <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" /> : <div className="text-gray-400">
                {getAssetIcon(asset.type)}
              </div>}
            </div>

            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium truncate flex-1">
                  {asset.name}
                </span>
                <Badge variant="secondary" className={cn("text-xs", getAssetTypeColor(asset.type))}>
                  {asset.type}
                </Badge>
              </div>

              <div className="text-xs text-gray-500">
                {(asset.size / 1024 / 1024).toFixed(1)} MB
              </div>

              {asset.tags && asset.tags.length > 0 && <div className="mt-1 flex flex-wrap gap-1">
                {asset.tags.slice(0, 2).map((tag, idx) => <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>)}
              </div>}
            </div>

            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-white/90 hover:bg-white" onClick={e => {
                  e.stopPropagation();
                  setEditingAsset(asset);
                  setEditName(asset.name);
                  setEditTags(asset.tags?.join(', ') || '');
                }}>
                  <Edit className="w-3 h-3" />
                </Button>

                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-white/90 hover:bg-white" onClick={e => {
                  e.stopPropagation();
                  handleDelete(asset);
                }}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>)}
      </div>}
    </div>

    {totalPages > 1 && <div className="border-t p-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} />
          </PaginationItem>

          {[...Array(totalPages)].map((_, i) => <PaginationItem key={i}>
            <PaginationLink onClick={() => setCurrentPage(i + 1)} isActive={currentPage === i + 1}>
              {i + 1}
            </PaginationLink>
          </PaginationItem>)}

          <PaginationItem>
            <PaginationNext onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>}

    <AssetUploadDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} onUpload={handleUpload} />

    <AssetPreviewDialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen} asset={selectedAsset} onDownload={handleDownload} onDelete={handleDelete} />

    {editingAsset && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">编辑素材</h3>
            <Button variant="ghost" size="sm" onClick={() => {
              setEditingAsset(null);
              setEditName('');
              setEditTags('');
            }}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">名称</label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="输入素材名称" />
            </div>

            <div>
              <label className="text-sm font-medium">标签</label>
              <Input value={editTags} onChange={e => setEditTags(e.target.value)} placeholder="用逗号分隔多个标签" />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUpdate} className="flex-1">
                保存
              </Button>
              <Button variant="outline" onClick={() => {
                setEditingAsset(null);
                setEditName('');
                setEditTags('');
              }}>
                取消
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>}
  </div>;
}