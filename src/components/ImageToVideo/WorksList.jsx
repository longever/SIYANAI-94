// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Play, Download, Share2, Trash2 } from 'lucide-react';

export function WorksList({
  type = 'all'
}) {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    fetchWorks();
  }, [type]);
  const fetchWorks = async () => {
    try {
      const params = {
        dataSourceName: 'generation_tasks',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: type === 'all' ? {} : {
              type: {
                $eq: type
              }
            }
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 20,
          pageNumber: 1
        }
      };
      const result = await $w.cloud.callDataSource(params);
      setWorks(result.records || []);
    } catch (error) {
      toast({
        title: "获取作品失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async id => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'generation_tasks',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: id
              }
            }
          }
        }
      });
      toast({
        title: "删除成功",
        description: "作品已从作品库移除"
      });
      fetchWorks();
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const getModelLabel = model => {
    const modelMap = {
      'tongyi-wanxiang': '通义万相',
      'keling': '可灵AI',
      'sora': 'Sora',
      'runway': 'Runway',
      'pika': 'Pika',
      'stable-video': 'Stable Video',
      'luma-dream-machine': 'Luma Dream Machine',
      'krea': 'Krea AI'
    };
    return modelMap[model] || model;
  };
  const getTypeLabel = type => {
    const typeMap = {
      'image-description-to-video': '图+描述',
      'image-audio-to-video': '图+音频',
      'video-to-video': '图+视频'
    };
    return typeMap[type] || type;
  };
  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="aspect-video bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>)}
      </div>;
  }
  if (works.length === 0) {
    return <div className="text-center py-12">
        <div className="text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4" />
          </svg>
          <p className="text-lg">暂无作品</p>
          <p className="text-sm mt-2">开始创建你的第一个作品吧</p>
        </div>
      </div>;
  }
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {works.map(work => <Card key={work._id} className="group">
          <CardHeader className="p-0">
            <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
              {work.thumbnailUrl ? <img src={work.thumbnailUrl} alt={work.title} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button size="sm" variant="secondary" className="mr-2">
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <CardTitle className="text-lg mb-2">{work.title}</CardTitle>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">{getModelLabel(work.model)}</Badge>
              <Badge variant="outline">{work.duration}s</Badge>
              {work.type && <Badge variant="outline">{getTypeLabel(work.type)}</Badge>}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{new Date(work.createdAt).toLocaleDateString()}</span>
              <span>{work.fileSize}</span>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-1" />
                下载
              </Button>
              <Button size="sm" variant="outline">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(work._id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>)}
    </div>;
}