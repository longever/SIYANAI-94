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
      setError(null);
      setShowErrorAlert(false);

      // 从数据源获取用户信息
      const userData = await $w.cloud.callDataSource({
        dataSourceName: 'users',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              userId: {
                $eq: $w.auth.currentUser?.userId || 'anonymous'
              }
            }
          },
          select: {
            $master: true
          },
          pageSize: 1,
          pageNumber: 1
        }
      });
      if (userData.records && userData.records.length > 0) {
        setUser(userData.records[0]);

        // 获取用户订阅信息
        const subscriptionData = await $w.cloud.callDataSource({
          dataSourceName: 'user_subscriptions',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                userId: {
                  $eq: userData.records[0]._id
                },
                status: {
                  $eq: 'active'
                }
              }
            },
            select: {
              $master: true
            },
            orderBy: [{
              createdAt: 'desc'
            }],
            pageSize: 1,
            pageNumber: 1
          }
        });
        if (subscriptionData.records && subscriptionData.records.length > 0) {
          setUserSubscription(subscriptionData.records[0]);
        }

        // 获取用户素材
        const assetsData = await $w.cloud.callDataSource({
          dataSourceName: 'asset_library',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                userId: {
                  $eq: userData.records[0]._id
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
        setAssets(assetsData.records || []);
      }
    } catch (error) {
      console.error('Failed to load asset library data:', error);
      toast({
        title: "Error",
        description: "Failed to load asset library",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleUploadAsset = async (file, metadata) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user._id);
      formData.append('metadata', JSON.stringify(metadata));
      const result = await $w.cloud.callFunction({
        name: 'upload-asset',
        data: {
          file: formData,
          metadata: {
            ...metadata,
            userId: user._id,
            originalName: file.name,
            size: file.size,
            type: file.type
          }
        }
      });
      if (result.success) {
        toast({
          title: "Success",
          description: "Asset uploaded successfully"
        });
        await loadAssetLibraryData();
        setUploadDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to upload asset:', error);
      toast({
        title: "Error",
        description: "Failed to upload asset",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
        title: "Success",
        description: "Asset deleted successfully"
      });
      await loadAssetLibraryData();
    } catch (error) {
      console.error('Failed to delete asset:', error);
      toast({
        title: "Error",
        description: "Failed to delete asset",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || asset.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
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
    <ProjectHeader user={user} subscription={userSubscription} />

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
                <AssetGrid assets={filteredAssets} onAssetSelect={setSelectedAsset} onAssetDelete={handleDeleteAsset} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>

    <AssetUploadDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} onUpload={handleUploadAsset} />

    <AssetPreviewDialog asset={selectedAsset} open={!!selectedAsset} onOpenChange={open => !open && setSelectedAsset(null)} />
  </div>;
}