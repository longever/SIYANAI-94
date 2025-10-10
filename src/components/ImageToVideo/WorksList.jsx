// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Skeleton, useToast } from '@/components/ui';
// @ts-ignore;
import { Play, Download, Share2, Trash2, Clock, Eye, Video } from 'lucide-react';

import { VideoPlayerModal } from '@/components/VideoPlayerModal';
export function WorksList({
  type = 'all'
}) {
  const {
    toast
  } = useToast();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  useEffect(() => {
    fetchWorks();
  }, [type]);
  const fetchWorks = async () => {
    try {
      setLoading(true);
      const dataSourceName = type === 'image_video' ? 'video_generation_tasks' : 'digital_human_videos';
      const result = await $w.cloud.callDataSource({
        dataSourceName,
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 20,
          getCount: true
        }
      });
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
      const dataSourceName = type === 'image_video' ? 'video_generation_tasks' : 'digital_human_videos';
      await $w.cloud.callDataSource({
        dataSourceName,
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
        description: "作品已从列表中移除"
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
  const formatDuration = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const formatDate = dateString => {
    return new Date(dateString).toLocaleString('zh-CN');
  };
  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-video" />
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2 mt-2" />
            </CardHeader>
          </Card>)}
      </div>;
  }
  if (works.length === 0) {
    return <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Video className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无作品</h3>
        <p className="text-gray-500">开始创建你的第一个视频作品吧</p>
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">我的作品</h2>
        <Badge variant="secondary">{works.length} 个作品</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {works.map(work => <Card key={work._id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gray-100 relative group">
              {work.thumbnailUrl ? <img src={work.thumbnailUrl} alt={work.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">
                  <Video className="w-12 h-12 text-gray-400" />
                </div>}
              
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-white" onClick={() => {
              setSelectedVideo(work);
              setShowPlayer(true);
            }}>
                  <Play className="w-6 h-6" />
                </Button>
              </div>
            </div>

            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-1">{work.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(work.duration || 0)}</span>
                    <span>•</span>
                    <span>{work.fileSize || '0 MB'}</span>
                  </CardDescription>
                </div>
                <Badge variant={work.status === 'completed' ? 'default' : 'secondary'}>
                  {work.status === 'completed' ? '已完成' : '处理中'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <span>{formatDate(work.createdAt)}</span>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{work.views || 0}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => {
              setSelectedVideo(work);
              setShowPlayer(true);
            }}>
                  <Play className="w-4 h-4 mr-1" />
                  播放
                </Button>
                
                <Button size="sm" variant="outline" onClick={() => window.open(work.outputUrl || work.videoUrl, '_blank')}>
                  <Download className="w-4 h-4" />
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
      </div>

      <VideoPlayerModal video={selectedVideo} open={showPlayer} onOpenChange={setShowPlayer} />
    </div>;
}