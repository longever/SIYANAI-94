// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Upload, Search, Filter, Grid3X3, List, Download, Trash2, Tag, MoreVertical, Image as ImageIcon, Music, Video, File, Check, X, Copy, Edit3, Eye } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Badge, Checkbox, Progress, ScrollArea, Separator, useToast } from '@/components/ui';
// @ts-ignore;
import { cn } from '@/lib/utils';

// 素材类型图标映射
const typeIcons = {
  image: ImageIcon,
  audio: Music,
  video: Video,
  other: File
};

// 素材卡片组件
function AssetCard({
  asset,
  isSelected,
  onSelect,
  onContextMenu,
  formatFileSize,
  formatDate
}) {
  const Icon = typeIcons[asset.type];
  return <div className={cn("relative group border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg", isSelected && "ring-2 ring-primary")} onContextMenu={e => onContextMenu(e, asset)}>
      <div className="absolute top-2 left-2 z-10">
        <Checkbox checked={isSelected} onCheckedChange={onSelect} onClick={e => e.stopPropagation()} />
      </div>
      
      <div className="aspect-square relative">
        {asset.type === 'image' ? <img src={asset.thumbnail || asset.url} alt={asset.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-muted">
            <Icon className="w-12 h-12 text-muted-foreground" />
          </div>}
      </div>
      
      <div className="p-3">
        <h3 className="text-sm font-medium truncate">{asset.name}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {formatFileSize(asset.size)} · {formatDate(asset.createdAt)}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {asset.tags.slice(0, 2).map(tag => <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>)}
          {asset.tags.length > 2 && <Badge variant="outline" className="text-xs">
              +{asset.tags.length - 2}
            </Badge>}
        </div>
      </div>
    </div>;
}

// 列表项组件
function AssetListItem({
  asset,
  isSelected,
  onSelect,
  onContextMenu,
  formatFileSize,
  formatDate
}) {
  const Icon = typeIcons[asset.type];
  return <div className={cn("flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted/50", isSelected && "bg-muted")} onContextMenu={e => onContextMenu(e, asset)}>
      <Checkbox checked={isSelected} onCheckedChange={onSelect} onClick={e => e.stopPropagation()} />
      
      <div className="w-16 h-16 flex-shrink-0">
        {asset.type === 'image' ? <img src={asset.thumbnail || asset.url} alt={asset.name} className="w-full h-full object-cover rounded" /> : <div className="w-full h-full flex items-center justify-center bg-muted rounded">
            <Icon className="w-8 h-8 text-muted-foreground" />
          </div>}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{asset.name}</h3>
        <p className="text-sm text-muted-foreground">
          {formatFileSize(asset.size)} · {asset.owner} · {formatDate(asset.createdAt)}
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          {asset.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>)}
        </div>
      </div>
      
      <Button variant="ghost" size="sm" onClick={e => {
      e.stopPropagation();
      onContextMenu(e, asset);
    }}>
        <MoreVertical className="w-4 h-4" />
      </Button>
    </div>;
}

// 右键菜单组件
function ContextMenu({
  contextMenu,
  onClose,
  onAction
}) {
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  return <div ref={menuRef} className="fixed z-50 bg-popover border rounded-md shadow-lg py-1 min-w-[160px]" style={{
    left: contextMenu.x,
    top: contextMenu.y
  }}>
      <button className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2" onClick={() => onAction('preview')}>
        <Eye className="w-4 h-4" />
        预览
      </button>
      <button className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2" onClick={() => onAction('rename')}>
        <Edit3 className="w-4 h-4" />
        重命名
      </button>
      <button className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex items-center gap-2" onClick={() => onAction('copy')}>
        <Copy className="w-4 h-4" />
        复制链接
      </button>
      <Separator />
      <button className="w-full px-3 py-2 text-sm text-left hover:bg-accent text-destructive flex items-center gap-2" onClick={() => onAction('delete')}>
        <Trash2 className="w-4 h-4" />
        删除
      </button>
    </div>;
}
export default function AssetManagement(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // 获取所有素材
  const fetchAssets = async () => {
    try {
      setLoading(true);
      const result = await $w.cloud.callFunction({
        name: 'asset-service',
        data: {
          httpMethod: 'GET',
          path: '/list',
          queryString: {
            page: '1',
            size: '100'
          }
        }
      });
      if (result.code === 0) {
        setAssets(result.data.list);
        setFilteredAssets(result.data.list);
      } else {
        toast({
          title: '获取素材失败',
          description: result.message || '请稍后重试',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: '获取素材失败',
        description: error.message || '网络错误，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchAssets();
  }, []);

  // 筛选逻辑
  useEffect(() => {
    let filtered = assets;

    // 类型筛选
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(asset => selectedTypes.includes(asset.type));
    }

    // 标签筛选
    if (selectedTags.length > 0) {
      filtered = filtered.filter(asset => selectedTags.some(tag => asset.tags.includes(tag)));
    }

    // 搜索筛选
    if (searchQuery) {
      filtered = filtered.filter(asset => asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    }
    setFilteredAssets(filtered);
  }, [assets, selectedTypes, selectedTags, searchQuery]);

  // 获取所有标签
  const allTags = Array.from(new Set(assets.flatMap(asset => asset.tags)));

  // 处理文件上传
  const handleFileUpload = async files => {
    const newUploadingFiles = Array.from(files).map(file => ({
      id: `upload-${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      type: getFileType(file.type),
      progress: 0
    }));
    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // 逐个上传文件
    for (const uploadFile of newUploadingFiles) {
      await uploadSingleFile(uploadFile);
    }
  };
  const getFileType = mimeType => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    return 'other';
  };
  const uploadSingleFile = async uploadFile => {
    try {
      // 创建 FormData
      const formData = new FormData();
      formData.append('file', uploadFile.file);
      formData.append('type', uploadFile.type);
      formData.append('name', uploadFile.name);

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[uploadFile.id] || 0;
          const newProgress = Math.min(current + Math.random() * 20, 90);
          return {
            ...prev,
            [uploadFile.id]: newProgress
          };
        });
      }, 500);

      // 调用云函数上传
      const result = await $w.cloud.callFunction({
        name: 'asset-service',
        data: {
          httpMethod: 'POST',
          path: '/upload',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      });
      clearInterval(progressInterval);
      if (result.code === 0) {
        setUploadProgress(prev => ({
          ...prev,
          [uploadFile.id]: 100
        }));

        // 添加到素材列表
        setAssets(prev => [result.data, ...prev]);
        toast({
          title: '上传成功',
          description: `${uploadFile.name} 已上传完成`
        });
      } else {
        throw new Error(result.message || '上传失败');
      }
    } catch (error) {
      toast({
        title: '上传失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setUploadingFiles(prev => prev.filter(f => f.id !== uploadFile.id));
      setUploadProgress(prev => {
        const newProgress = {
          ...prev
        };
        delete newProgress[uploadFile.id];
        return newProgress;
      });
    }
  };

  // 拖拽上传
  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // 类型筛选切换
  const toggleType = type => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  // 标签筛选切换
  const toggleTag = tag => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  // 选择素材
  const toggleAssetSelection = assetId => {
    setSelectedAssets(prev => prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]);
  };

  // 全选
  const selectAll = () => {
    if (selectedAssets.length === filteredAssets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(filteredAssets.map(asset => asset._id));
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    try {
      const deletePromises = selectedAssets.map(async id => {
        const result = await $w.cloud.callFunction({
          name: 'asset-service',
          data: {
            httpMethod: 'DELETE',
            path: '/delete',
            queryString: {
              id
            }
          }
        });
        return result;
      });
      const results = await Promise.all(deletePromises);
      const successCount = results.filter(r => r.code === 0).length;
      if (successCount > 0) {
        setAssets(prev => prev.filter(asset => !selectedAssets.includes(asset._id)));
        setSelectedAssets([]);
        toast({
          title: '删除成功',
          description: `已删除 ${successCount} 个素材`
        });
        fetchAssets(); // 重新获取列表
      } else {
        toast({
          title: '删除失败',
          description: '部分素材删除失败，请稍后重试',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: '删除失败',
        description: error.message || '网络错误，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 下载素材
  const handleDownload = async assetId => {
    try {
      const result = await $w.cloud.callFunction({
        name: 'asset-service',
        data: {
          httpMethod: 'GET',
          path: '/download',
          queryString: {
            id: assetId
          }
        }
      });
      if (result.code === 0) {
        // 创建下载链接
        const link = document.createElement('a');
        link.href = result.data.url;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast({
          title: '获取下载链接失败',
          description: result.message || '请稍后重试',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: '下载失败',
        description: error.message || '网络错误，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 批量下载
  const handleBatchDownload = async () => {
    for (const assetId of selectedAssets) {
      await handleDownload(assetId);
      // 添加延迟避免触发浏览器限制
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  // 右键菜单
  const handleContextMenu = (e, asset) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      asset
    });
  };

  // 格式化文件大小
  const formatFileSize = bytes => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化日期
  const formatDate = date => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };
  return <div className="h-screen flex flex-col bg-background">
      {/* 顶部上传区 */}
      <div className="border-b bg-card">
        <div ref={dropZoneRef} className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg m-4 transition-colors hover:border-muted-foreground/50" onDragOver={handleDragOver} onDrop={handleDrop}>
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              拖拽文件到此处上传，或
              <Button variant="link" className="p-0 h-auto" onClick={() => fileInputRef.current?.click()}>
                选择文件
              </Button>
            </p>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => e.target.files && handleFileUpload(e.target.files)} />
          </div>
          
          {/* 上传进度 */}
          {uploadingFiles.length > 0 && <div className="mt-4 space-y-2">
              {uploadingFiles.map(file => <div key={file.id} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 truncate">{file.name}</span>
                  <Progress value={uploadProgress[file.id] || 0} className="w-32" />
                  <span className="text-xs text-muted-foreground">
                    {Math.round(uploadProgress[file.id] || 0)}%
                  </span>
                </div>)}
            </div>}
        </div>
      </div>

      {/* 批量操作栏 */}
      {selectedAssets.length > 0 && <div className="bg-primary/10 border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Checkbox checked={selectedAssets.length === filteredAssets.length} onCheckedChange={selectAll} />
            <span className="text-sm">
              已选择 {selectedAssets.length} 个素材
            </span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleBatchDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              批量删除
            </Button>
            <Button size="sm" variant="outline" onClick={handleBatchDownload}>
              <Download className="w-4 h-4 mr-2" />
              批量下载
            </Button>
            <Button size="sm" variant="outline">
              <Tag className="w-4 h-4 mr-2" />
              批量打标签
            </Button>
          </div>
        </div>}

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧筛选面板 */}
        <div className="w-64 border-r bg-muted/30">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
              {/* 搜索框 */}
              <div>
                <label className="text-sm font-medium mb-2 block">搜索</label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="搜索素材..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8" />
                </div>
              </div>

              {/* 类型筛选 */}
              <div>
                <label className="text-sm font-medium mb-2 block">类型筛选</label>
                <div className="space-y-2">
                  {['image', 'audio', 'video', 'other'].map(type => {
                  const Icon = typeIcons[type];
                  return <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={selectedTypes.includes(type)} onCheckedChange={() => toggleType(type)} />
                        <Icon className="w-4 h-4" />
                        <span className="text-sm capitalize">
                          {type === 'other' ? '其他' : type === 'image' ? '图片' : type === 'audio' ? '音频' : '视频'}
                        </span>
                      </label>;
                })}
                </div>
              </div>

              {/* 标签筛选 */}
              <div>
                <label className="text-sm font-medium mb-2 block">标签筛选</label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => <Badge key={tag} variant={selectedTags.includes(tag) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleTag(tag)}>
                      {tag}
                    </Badge>)}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 overflow-hidden">
          {/* 工具栏 */}
          <div className="border-b px-4 py-2 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              共 {filteredAssets.length} 个素材
            </div>
            <div className="flex items-center gap-2">
              <Button variant={viewMode === 'grid' ? "default" : "ghost"} size="sm" onClick={() => setViewMode('grid')}>
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === 'list' ? "default" : "ghost"} size="sm" onClick={() => setViewMode('list')}>
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 素材展示 */}
          <ScrollArea className="h-full p-4">
            {loading ? <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
                </div>
              </div> : filteredAssets.length === 0 ? <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <File className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">暂无素材</p>
                </div>
              </div> : viewMode === 'grid' ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredAssets.map(asset => <AssetCard key={asset._id} asset={asset} isSelected={selectedAssets.includes(asset._id)} onSelect={() => toggleAssetSelection(asset._id)} onContextMenu={handleContextMenu} formatFileSize={formatFileSize} formatDate={formatDate} />)}
              </div> : <div className="space-y-2">
                {filteredAssets.map(asset => <AssetListItem key={asset._id} asset={asset} isSelected={selectedAssets.includes(asset._id)} onSelect={() => toggleAssetSelection(asset._id)} onContextMenu={handleContextMenu} formatFileSize={formatFileSize} formatDate={formatDate} />)}
              </div>}
          </ScrollArea>
        </div>
      </div>

      {/* 右键菜单 */}
      {contextMenu && <ContextMenu contextMenu={contextMenu} onClose={() => setContextMenu(null)} onAction={async action => {
      const asset = contextMenu.asset;
      switch (action) {
        case 'preview':
          window.open(asset.url, '_blank');
          break;
        case 'rename':
          const newName = prompt('请输入新名称:', asset.name);
          if (newName && newName !== asset.name) {
            try {
              const result = await $w.cloud.callFunction({
                name: 'asset-service',
                data: {
                  httpMethod: 'PUT',
                  path: '/update',
                  body: JSON.stringify({
                    id: asset._id,
                    name: newName
                  })
                }
              });
              if (result.code === 0) {
                setAssets(prev => prev.map(a => a._id === asset._id ? {
                  ...a,
                  name: newName
                } : a));
                toast({
                  title: '重命名成功',
                  description: '素材名称已更新'
                });
              } else {
                toast({
                  title: '重命名失败',
                  description: result.message || '请稍后重试',
                  variant: 'destructive'
                });
              }
            } catch (error) {
              toast({
                title: '重命名失败',
                description: error.message || '网络错误，请稍后重试',
                variant: 'destructive'
              });
            }
          }
          break;
        case 'copy':
          navigator.clipboard.writeText(asset.url);
          toast({
            title: '已复制',
            description: '链接已复制到剪贴板'
          });
          break;
        case 'delete':
          if (confirm(`确定要删除 "${asset.name}" 吗？`)) {
            try {
              const result = await $w.cloud.callFunction({
                name: 'asset-service',
                data: {
                  httpMethod: 'DELETE',
                  path: '/delete',
                  queryString: {
                    id: asset._id
                  }
                }
              });
              if (result.code === 0) {
                setAssets(prev => prev.filter(a => a._id !== asset._id));
                toast({
                  title: '删除成功',
                  description: '素材已删除'
                });
              } else {
                toast({
                  title: '删除失败',
                  description: result.message || '请稍后重试',
                  variant: 'destructive'
                });
              }
            } catch (error) {
              toast({
                title: '删除失败',
                description: error.message || '网络错误，请稍后重试',
                variant: 'destructive'
              });
            }
          }
          break;
      }
      setContextMenu(null);
    }} />}
  </div>;
}