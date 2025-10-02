// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast, Skeleton } from '@/components/ui';
// @ts-ignore;
import { Upload, Search, RefreshCw, AlertCircle } from 'lucide-react';
 
export default function AssetLibrary2(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 获取素材列表
  const loadAssets = async () => {
    try {
      setLoading(true);

      // 调用 material-service 获取素材列表
      const result = await $w.cloud.callFunction({
        name: 'material-service',
        data: {
          action: 'listMaterials',
          params: {
            page: 1,
            pageSize: 100,
            type: selectedType !== 'all' ? selectedType : undefined
          }
        }
      });
      if (result.success) {
        // 获取云存储临时URL
        const tcb = await $w.cloud.getCloudInstance();
        const assetsWithUrls = await Promise.all(result.data.list.map(async asset => {
          try {
            const urlResult = await tcb.getTempFileURL({
              fileList: [asset.url]
            });
            return {
              ...asset,
              id: asset.id || asset._id,
              thumbnail: asset.type === 'image' ? urlResult.fileList[0].tempFileURL : null,
              downloadUrl: urlResult.fileList[0].tempFileURL,
              createdAt: asset.createdAt || asset.created_at
            };
          } catch (error) {
            console.error('获取URL失败:', error);
            return {
              ...asset,
              id: asset.id || asset._id,
              thumbnail: null,
              downloadUrl: null,
              createdAt: asset.createdAt || asset.created_at
            };
          }
        }));
        setAssets(assetsWithUrls);
      } else {
        throw new Error(result.error || '获取素材列表失败');
      }
    } catch (error) {
      console.error('获取素材失败:', error);
      toast({
        title: '获取素材失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 刷新素材列表
  const refreshAssets = async () => {
    setRefreshing(true);
    try {
      await loadAssets();
      toast({
        title: '刷新成功',
        description: '素材列表已更新'
      });
    } catch (error) {
      toast({
        title: '刷新失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setRefreshing(false);
    }
  };

  // 筛选素材
  const filterAssets = () => {
    let filtered = assets;
    if (searchTerm) {
      filtered = filtered.filter(asset => asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) || asset.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    }
    if (selectedType !== 'all') {
      filtered = filtered.filter(asset => asset.type === selectedType);
    }
    setFilteredAssets(filtered);
  };

  // 删除素材
  const handleDelete = async assetId => {
    try {
      const asset = assets.find(a => a.id === assetId || a._id === assetId);
      if (!asset) {
        toast({
          title: '删除失败',
          description: '未找到该素材',
          variant: 'destructive'
        });
        return;
      }

      // 调用 material-service 删除素材
      const result = await $w.cloud.callFunction({
        name: 'material-service',
        data: {
          action: 'deleteMaterial',
          id: assetId
        }
      });
      if (result.success) {
        toast({
          title: '删除成功',
          description: '素材已从云存储删除'
        });
        loadAssets(); // 重新加载列表
      } else {
        throw new Error(result.error || '删除失败');
      }
    } catch (error) {
      console.error('删除素材失败:', error);
      toast({
        title: '删除失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 上传素材
  const handleUpload = async (file, metadata) => {
    try {
      setUploading(true);

      // 读取文件为base64
      const reader = new FileReader();
      reader.onload = async e => {
        try {
          const base64Content = e.target.result.split(',')[1];

          // 调用 upload-asset 云函数上传
          const result = await $w.cloud.callFunction({
            name: 'upload-asset',
            data: {
              filename: file.name,
              fileContent: base64Content,
              mimeType: file.type,
              size: file.size,
              ...metadata
            }
          });
          if (result.success) {
            // 保存到素材库
            const saveResult = await $w.cloud.callDataSource({
              dataSourceName: 'asset_library',
              methodName: 'wedaCreateV2',
              params: {
                data: {
                  name: metadata.name || file.name,
                  type: metadata.type || 'file',
                  category: metadata.category || 'user',
                  url: result.fileID,
                  size: file.size,
                  mime_type: file.type,
                  tags: metadata.tags || [],
                  is_platform: false,
                  createdAt: new Date().toISOString()
                }
              }
            });
            if (saveResult.id) {
              toast({
                title: '上传成功',
                description: '素材已保存到您的素材库'
              });
              loadAssets();
              return {
                success: true,
                id: saveResult.id
              };
            }
          } else {
            throw new Error(result.error || '上传失败');
          }
        } catch (error) {
          console.error('上传失败:', error);
          toast({
            title: '上传失败',
            description: error.message || '请稍后重试',
            variant: 'destructive'
          });
          return {
            success: false,
            error: error.message
          };
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('上传失败:', error);
      toast({
        title: '上传失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
      setUploading(false);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // 处理上传成功
  const handleUploadSuccess = () => {
    setIsUploadOpen(false);
    loadAssets();
  };

  // 使用 effect 进行筛选
  useEffect(() => {
    filterAssets();
  }, [assets, searchTerm, selectedType]);

  // 初始化加载
  useEffect(() => {
    loadAssets();
  }, []);
  const assetTypes = [{
    value: 'all',
    label: '全部'
  }, {
    value: 'image',
    label: '图片'
  }, {
    value: 'video',
    label: '视频'
  }, {
    value: 'audio',
    label: '音频'
  }, {
    value: 'document',
    label: '文档'
  }];
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">素材库</h1>
        <p className="text-slate-600 dark:text-slate-400">管理您的所有媒体素材</p>
      </div>

      {/* 操作栏 */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input placeholder="搜索素材名称或标签..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
        </div>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[180px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <SelectValue placeholder="选择类型" />
          </SelectTrigger>
          <SelectContent>
            {assetTypes.map(type => <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>)}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshAssets} disabled={refreshing} className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? '刷新中...' : '刷新'}
          </Button>

          <Button onClick={() => setIsUploadOpen(true)} disabled={uploading}>
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? '上传中...' : '上传素材'}
          </Button>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        共 {filteredAssets.length} 个素材
      </div>

      {/* 素材网格 */} 
    </div>

     </div>;
}