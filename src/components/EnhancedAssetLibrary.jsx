// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Sparkles, X } from 'lucide-react';

import { AssetSearchBar } from './AssetSearchBar';
import { AssetGrid } from './AssetGrid';
import { AssetUploadDialog } from './AssetUploadDialog';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
export default function EnhancedAssetLibrary({
  open,
  onOpenChange,
  onAssetSelect,
  $w
}) {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    toast
  } = useToast();

  // 加载素材
  const loadAssets = useCallback(async () => {
    if (!open) return;
    try {
      setLoading(true);
      setError(null);
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          getCount: true,
          pageSize: 100,
          pageNumber: 1,
          select: {
            $master: true
          }
        }
      });
      if (response.records) {
        // 为每个素材获取下载链接
        const assetsWithUrls = await Promise.all(response.records.map(async asset => {
          try {
            const downloadUrl = await getDownloadUrl(asset);
            return {
              ...asset,
              downloadUrl,
              formattedSize: formatFileSize(asset.size || 0),
              fileId: asset.url || asset.fileId || asset.cloudPath
            };
          } catch (err) {
            console.error(`处理素材 ${asset.name} 失败:`, err);
            return {
              ...asset,
              downloadUrl: null,
              formattedSize: formatFileSize(asset.size || 0),
              fileId: asset.url || asset.fileId || asset.cloudPath,
              error: true
            };
          }
        }));
        setAssets(assetsWithUrls);
      }
    } catch (error) {
      console.error('加载素材库失败:', error);
      setError('无法加载素材库，请稍后重试');
      toast({
        title: '加载失败',
        description: '无法加载素材库，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [open, $w, toast]);

  // 获取下载链接 - 使用 cloudbase 原生方法
  const getDownloadUrl = async asset => {
    try {
      const fileId = asset.url || asset.fileId || asset.cloudPath;
      if (!fileId) {
        throw new Error('无法获取文件ID');
      }
      const tcb = await $w.cloud.getCloudInstance();
      const result = await tcb.getTempFileURL({
        fileList: [fileId]
      });
      if (result.fileList && result.fileList[0] && result.fileList[0].tempFileURL) {
        return result.fileList[0].tempFileURL;
      } else {
        throw new Error('获取下载链接失败');
      }
    } catch (error) {
      console.error('获取下载链接失败:', error);
      throw error;
    }
  };

  // 筛选素材
  const filterAssets = useCallback(() => {
    let filtered = assets;
    if (searchTerm) {
      filtered = filtered.filter(asset => asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) || asset.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    }
    if (selectedType !== 'all') {
      filtered = filtered.filter(asset => asset.type === selectedType);
    }
    setFilteredAssets(filtered);
  }, [assets, searchTerm, selectedType]);
  useEffect(() => {
    loadAssets();
  }, [loadAssets]);
  useEffect(() => {
    filterAssets();
  }, [filterAssets]);

  // 处理上传成功
  const handleUploadSuccess = () => {
    loadAssets();
    setIsUploadOpen(false);
  };

  // 处理刷新
  const handleRefresh = () => {
    loadAssets();
  };
  return <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[85vh] p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>素材库</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="hover:bg-gray-100">
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col h-full">
            {/* 搜索和筛选栏 */}
            <AssetSearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} selectedType={selectedType} onTypeChange={setSelectedType} onUploadClick={() => setIsUploadOpen(true)} onRefresh={handleRefresh} />
            
            {/* 内容区域 */}
            <div className="flex-1 overflow-hidden">
              {loading && <LoadingState />}
              {error && !loading && <ErrorState onRetry={handleRefresh} />}
              {!loading && !error && filteredAssets.length === 0 && <EmptyState onUpload={() => setIsUploadOpen(true)} />}
              {!loading && !error && filteredAssets.length > 0 && <AssetGrid assets={filteredAssets} onAssetSelect={onAssetSelect} onDownload={getDownloadUrl} $w={$w} />}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AssetUploadDialog open={isUploadOpen} onOpenChange={setIsUploadOpen} onSuccess={handleUploadSuccess} $w={$w} />
    </>;
}