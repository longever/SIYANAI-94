// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, useToast, Badge } from '@/components/ui';
// @ts-ignore;
import { Search, Upload, Image, Video, Music, Type, Box, Trash2, X, File, Loader2 } from 'lucide-react';

export default function AssetLibraryPage(props) {
  const {
    $w,
    style
  } = props;
  const {
    toast
  } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // 获取素材列表
  const fetchAssets = useCallback(async () => {
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
          orderBy: [{
            createdAt: 'desc'
          }]
        }
      });
      if (result.records) {
        setAssets(result.records);
      }
    } catch (error) {
      toast({
        title: "获取素材失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [$w.cloud, toast]);
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // 筛选逻辑
  useEffect(() => {
    let filtered = assets;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(asset => asset.type === selectedCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter(asset => asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || asset.tags && asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    }
    setFilteredAssets(filtered);
  }, [assets, selectedCategory, searchQuery]);

  // 上传素材
  const handleUpload = async () => {
    if (!uploadedFile) return;
    try {
      setUploading(true);

      // 这里应该调用云存储上传文件，然后保存素材信息
      // 为了演示，我们直接创建素材记录
      const fileType = uploadedFile.type.startsWith('image/') ? 'image' : uploadedFile.type.startsWith('video/') ? 'video' : uploadedFile.type.startsWith('audio/') ? 'audio' : uploadedFile.type.includes('font') ? 'font' : 'other';
      const newAsset = {
        name: uploadedFile.name,
        type: fileType,
        category: 'personal',
        size: uploadedFile.size,
        mime_type: uploadedFile.type,
        tags: [],
        usage_count: 0,
        download_count: 0,
        is_platform: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaCreateV2',
        params: {
          data: newAsset
        }
      });
      if (result.id) {
        await fetchAssets(); // 重新获取列表
        setShowUploadDialog(false);
        setUploadedFile(null);
        toast({
          title: "上传成功",
          description: `${uploadedFile.name} 已添加到素材库`
        });
      }
    } catch (error) {
      toast({
        title: "上传失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  // 删除素材
  const handleDelete = asset => {
    setAssetToDelete(asset);
    setShowDeleteDialog(true);
  };
  const confirmDelete = async () => {
    if (!assetToDelete) return;
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: assetToDelete._id
              }
            }
          }
        }
      });
      await fetchAssets(); // 重新获取列表
      setShowDeleteDialog(false);
      setAssetToDelete(null);
      toast({
        title: "删除成功",
        description: `${assetToDelete.name} 已从素材库移除`,
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    }
  };

  // 格式化文件大小
  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化时间
  const formatTime = timestamp => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  // 获取素材类型图标
  const getTypeIcon = type => {
    switch (type) {
      case 'image':
        return Image;
      case 'video':
        return Video;
      case 'audio':
        return Music;
      case 'font':
        return Type;
      case '3d':
        return Box;
      case 'subtitle':
        return Type;
      default:
        return File;
    }
  };

  // 获取素材类型中文名
  const getTypeName = type => {
    const typeMap = {
      'image': '图片',
      'video': '视频',
      'audio': '音频',
      'font': '字体',
      '3d': '3D模型',
      'subtitle': '字幕'
    };
    return typeMap[type] || '其他';
  };

  // 分类统计
  const categories = [{
    id: 'all',
    name: '全部',
    icon: File,
    count: assets.length
  }, {
    id: 'image',
    name: '图片',
    icon: Image,
    count: assets.filter(a => a.type === 'image').length
  }, {
    id: 'video',
    name: '视频',
    icon: Video,
    count: assets.filter(a => a.type === 'video').length
  }, {
    id: 'audio',
    name: '音频',
    icon: Music,
    count: assets.filter(a => a.type === 'audio').length
  }, {
    id: 'font',
    name: '字体',
    icon: Type,
    count: assets.filter(a => a.type === 'font').length
  }, {
    id: '3d',
    name: '3D模型',
    icon: Box,
    count: assets.filter(a => a.type === '3d').length
  }, {
    id: 'subtitle',
    name: '字幕',
    icon: Type,
    count: assets.filter(a => a.type === 'subtitle').length
  }];

  // 拖拽处理
  const handleDragOver = e => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = e => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = e => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setUploadedFile(files[0]);
    }
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>;
  }
  return <div style={style} className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* 左侧分类导航 */}
        <div className="w-64 bg-card border-r border-border p-4">
          <h2 className="text-lg font-semibold mb-4">分类</h2>
          <nav className="space-y-1">
            {categories.map(category => {
            const Icon = category.icon;
            return <button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === category.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{category.name}</span>
                  </div>
                  <Badge variant={selectedCategory === category.id ? "secondary" : "outline"}>
                    {category.count}
                  </Badge>
                </button>;
          })}
          </nav>
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 flex flex-col">
          {/* 顶部工具栏 */}
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">素材库</h1>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input type="text" placeholder="搜索素材..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 w-64" />
                </div>
                <Button onClick={() => setShowUploadDialog(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  上传素材
                </Button>
              </div>
            </div>
          </div>

          {/* 素材网格 */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredAssets.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAssets.map(asset => {
              const TypeIcon = getTypeIcon(asset.type);
              return <Card key={asset._id} className="group relative overflow-hidden hover:shadow-lg transition-shadow">
                      <button onClick={() => handleDelete(asset)} className="absolute top-2 right-2 z-10 p-1.5 bg-destructive/90 text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="aspect-video relative">
                        <img src={asset.thumbnail || 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=300&h=200&fit=crop'} alt={asset.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-2 left-2">
                          <TypeIcon className="w-5 h-5 text-white drop-shadow-lg" />
                        </div>
                        {asset.is_platform && <Badge className="absolute top-2 left-2 bg-primary/90 text-primary-foreground">
                            平台
                          </Badge>}
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-medium text-sm truncate mb-1">{asset.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <span>{getTypeName(asset.type)}</span>
                          <span>•</span>
                          <span>{formatFileSize(asset.size)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{formatTime(asset.createdAt)}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>使用 {asset.usage_count || 0} 次</span>
                          <span>下载 {asset.download_count || 0} 次</span>
                        </div>
                      </CardContent>
                    </Card>;
            })}
              </div> : <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <File className="w-12 h-12 mb-4" />
                <p className="text-lg mb-2">暂无素材</p>
                <p className="text-sm mb-4">上传您的第一个素材开始创作</p>
                <Button onClick={() => setShowUploadDialog(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  上传素材
                </Button>
              </div>}
          </div>
        </div>
      </div>

      {/* 上传对话框 */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>上传素材</DialogTitle>
          </DialogHeader>
          
          <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              拖拽文件到此处或
              <label className="text-primary cursor-pointer hover:underline ml-1">
                选择文件
                <input type="file" className="hidden" onChange={e => setUploadedFile(e.target.files[0])} accept="image/*,video/*,audio/*,font/*,.obj,.fbx,.gltf" />
              </label>
            </p>
            <p className="text-xs text-muted-foreground">
              支持图片、视频、音频、字体、3D模型文件
            </p>
            
            {uploadedFile && <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(uploadedFile.size)}
                </p>
              </div>}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
            setShowUploadDialog(false);
            setUploadedFile(null);
          }}>
              取消
            </Button>
            <Button onClick={handleUpload} disabled={!uploadedFile || uploading}>
              {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              上传
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            确定要删除素材 "{assetToDelete?.name}" 吗？此操作不可撤销。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
            setShowDeleteDialog(false);
            setAssetToDelete(null);
          }}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}