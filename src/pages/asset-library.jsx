// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Tabs, TabsContent, TabsList, TabsTrigger, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, Search, Image, Video, Music, FileText, Filter } from 'lucide-react';

import { GlobalLoadingOverlay } from '@/components/GlobalLoadingOverlay';
import { ProjectHeader } from '@/components/ProjectHeader';
import { AssetGrid } from '@/components/AssetGrid';
import { AssetUploadDialog } from '@/components/AssetUploadDialog';
import { AssetPreviewDialog } from '@/components/AssetPreviewDialog';
export default function AssetLibraryPage(props) {
  const {
    $w,
    style
  } = props;
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userSubscription, setUserSubscription] = useState(null);
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  useEffect(() => {
    loadAssetLibraryData();
  }, []);
  const loadAssetLibraryData = async () => {
    try {
      setLoading(true);

      // 直接使用当前用户信息
      const currentUser = $w.auth.currentUser;
      if (!currentUser) {
        toast({
          title: "错误",
          description: "请先登录",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      console.log("用户查询结果:", currentUser);
      setUser({
        _id: currentUser.userId,
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl
      });

      // 获取用户素材 - 使用owner字段进行过滤
      const assetsData = await $w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              owner: {
                $eq: currentUser.userId
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 100,
          pageNumber: 1
        }
      });
      console.log("用户素材查询结果:", assetsData);
      setAssets(assetsData.records || []);
    } catch (error) {
      console.error('加载素材库数据失败:', error);
      toast({
        title: "错误",
        description: "加载素材库失败，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleUploadSuccess = async uploadedAssets => {
    await loadAssetLibraryData();
  };
  const handleDeleteAsset = async assetId => {
    try {
      setLoading(true);
      await $w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: assetId
              }
            }
          }
        }
      });
      toast({
        title: "成功",
        description: "素材删除成功"
      });
      await loadAssetLibraryData();
    } catch (error) {
      console.error('删除素材失败:', error);
      toast({
        title: "错误",
        description: "删除素材失败",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || asset.tags && asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || asset.type === selectedType;
    return matchesSearch && matchesType;
  });
  const assetStats = {
    all: assets.length,
    image: assets.filter(a => a.type === 'image').length,
    video: assets.filter(a => a.type === 'video').length,
    audio: assets.filter(a => a.type === 'audio').length,
    document: assets.filter(a => a.type === 'document').length
  };
  if (loading) {
    return <GlobalLoadingOverlay />;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
    <ProjectHeader user={user} subscription={null} />

    <main className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            素材库
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            管理您的所有视频素材、图片、音频等资源
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧筛选栏 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>筛选</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="搜索素材..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full" />

                <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
                  <TabsList className="grid w-full">
                    <TabsTrigger value="all" className="text-sm">
                      全部 ({assetStats.all})
                    </TabsTrigger>
                    <TabsTrigger value="image" className="text-sm">
                      <Image className="w-4 h-4 mr-1" />
                      图片 ({assetStats.image})
                    </TabsTrigger>
                    <TabsTrigger value="video" className="text-sm">
                      <Video className="w-4 h-4 mr-1" />
                      视频 ({assetStats.video})
                    </TabsTrigger>
                    <TabsTrigger value="audio" className="text-sm">
                      <Music className="w-4 h-4 mr-1" />
                      音频 ({assetStats.audio})
                    </TabsTrigger>
                    <TabsTrigger value="document" className="text-sm">
                      <FileText className="w-4 h-4 mr-1" />
                      文档 ({assetStats.document})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <Button className="w-full" onClick={() => setUploadDialogOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  上传素材
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 右侧素材网格 */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>素材列表</CardTitle>
                <CardDescription>
                  共找到 {filteredAssets.length} 个素材
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AssetGrid assets={filteredAssets} onAssetSelect={setSelectedAsset} onAssetDelete={handleDeleteAsset} $w={$w} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>

    <AssetUploadDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} onUploadSuccess={handleUploadSuccess} $w={$w} />

    <AssetPreviewDialog asset={selectedAsset} open={!!selectedAsset} onOpenChange={open => !open && setSelectedAsset(null)} onDelete={handleDeleteAsset} $w={$w} />
  </div>;
}