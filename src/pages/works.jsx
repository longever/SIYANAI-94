// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, useToast } from '@/components/ui';
// @ts-ignore;
import { Plus, Play, Download, Eye, Clock, CheckCircle, XCircle, RefreshCw, Loader2, Image as ImageIcon, Cloud, CloudOff, Share2, Trash2, TrendingUp, Users, Video } from 'lucide-react';

import WorkCard from '@/components/WorkCard';
import StatsCard from '@/components/StatsCard';
import VideoPlayerModal from '@/components/VideoPlayerModal';
export default function DashboardPage(props) {
  const {
    $w,
    style
  } = props;
  const {
    toast
  } = useToast();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState({});
  const [recovering, setRecovering] = useState({});
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    running: 0
  });
  const [pollingIntervals, setPollingIntervals] = useState({});

  // 获取文档型数据库实例
  const getDB = async () => {
    const tcb = await $w.cloud.getCloudInstance();
    return tcb.database();
  };

  // 获取作品列表
  const fetchWorks = async () => {
    try {
      setLoading(true);
      const db = await getDB();
      const result = await db.collection('digital_human_videos').orderBy('created_at', 'desc').limit(50).get();
      const worksData = result.data || [];
      setWorks(worksData);

      // 启动轮询任务状态
      worksData.forEach(work => {
        if (work.task_id && (work.status === 'PENDING' || work.status === 'RUNNING')) {
          startPolling(work.task_id, work._id);
        }
      });

      // 更新统计信息
      const statsData = {
        total: worksData.length,
        completed: worksData.filter(w => w.status === 'SUCCEEDED').length,
        failed: worksData.filter(w => w.status === 'FAILED').length,
        running: worksData.filter(w => w.status === 'RUNNING' || w.status === 'PENDING').length
      };
      setStats(statsData);
    } catch (error) {
      console.error('获取作品失败:', error);
      toast({
        title: "获取失败",
        description: error.message || "无法获取作品列表",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 查询任务状态
  const checkTaskStatus = async (taskId, docId) => {
    try {
      const result = await $w.cloud.callConnector({
        name: 'aliyun_dashscope_jbn02va',
        methodName: 'get_tasks_status',
        params: {
          task_id: taskId
        }
      });
      if (!result.output || !result.output.task_status) {
        throw new Error('无效的响应格式');
      }
      const status = result.output.task_status;
      const videoUrl = result.output.results?.video_url;

      // 更新本地状态
      setWorks(prevWorks => prevWorks.map(work => work._id === docId ? {
        ...work,
        status,
        video_url: videoUrl || work.video_url
      } : work));

      // 更新数据库
      const db = await getDB();
      await db.collection('digital_human_videos').doc(docId).update({
        status,
        video_url: videoUrl || '',
        updated_at: new Date().toISOString()
      });

      // 如果任务完成，停止轮询
      if (status !== 'PENDING' && status !== 'RUNNING') {
        stopPolling(taskId);

        // 如果成功，下载视频到云存储
        if (status === 'SUCCEEDED' && videoUrl) {
          await downloadVideoToCloudStorage(videoUrl, docId);
        }
      }
    } catch (error) {
      console.error('查询任务状态失败:', error);
      stopPolling(taskId);
    }
  };

  // 启动轮询
  const startPolling = (taskId, docId) => {
    if (pollingIntervals[taskId]) return;
    const interval = setInterval(async () => {
      await checkTaskStatus(taskId, docId);
    }, 10000);
    setPollingIntervals(prev => ({
      ...prev,
      [taskId]: interval
    }));
  };

  // 停止轮询
  const stopPolling = taskId => {
    if (pollingIntervals[taskId]) {
      clearInterval(pollingIntervals[taskId]);
      setPollingIntervals(prev => {
        const newIntervals = {
          ...prev
        };
        delete newIntervals[taskId];
        return newIntervals;
      });
    }
  };

  // 使用云函数代理下载视频到云存储
  const downloadVideoToCloudStorage = async (videoUrl, docId) => {
    try {
      // console.log('开始下载视频到云存储:', {
      //   videoUrl,
      //   docId
      // });

      // 使用云函数代理下载
      const { result } = await $w.cloud.callFunction({
        name: 'downloadVideoProxy',
        data: {
          videoUrl: videoUrl,
          fileName: `digital_human_${docId}_${Date.now()}.mp4`
        }
      });
      // console.log('云函数返回结果:', result);

      // 检查返回结果
      if (result && result.success && result.fileID) {
        // 更新数据库中的云存储路径
        const db = await getDB();
        const updateResult = await db.collection('digital_human_videos').doc(docId).update({
          cloud_video_url: result.fileID,
          updated_at: new Date().toISOString()
        });
        // console.log('数据库更新结果:', updateResult);

        // 更新本地状态
        setWorks(prevWorks => prevWorks.map(work => work._id === docId ? {
          ...work,
          cloud_video_url: result.fileID
        } : work));
        toast({
          title: "保存成功",
          description: `视频已成功保存到云存储: ${result.fileID}`,
          variant: "success"
        });
      } else {
        const errorMsg = result?.error || '云函数返回格式错误';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('保存视频失败:', error);
      toast({
        title: "保存失败",
        description: error.message || "无法保存视频到云存储",
        variant: "destructive"
      });
    }
  };

  // 转换云存储URL为临时URL
  const getTempVideoUrl = async cloudUrl => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const result = await tcb.getTempFileURL({
        fileList: [cloudUrl]
      });
      if (result.fileList && result.fileList[0] && result.fileList[0].tempFileURL) {
        return result.fileList[0].tempFileURL;
      }
      throw new Error('无法获取临时URL');
    } catch (error) {
      console.error('获取临时URL失败:', error);
      throw error;
    }
  };

  // 处理视频播放
  const handlePlayVideo = async work => {
    try {
      if (work.cloud_video_url) {
        // 使用云存储地址获取临时URL
        const tempUrl = await getTempVideoUrl(work.cloud_video_url);
        setVideoUrl(tempUrl);
        console.log('播放设置视频url:', tempUrl);
        setSelectedVideo(work);
        setIsVideoModalOpen(true);
      } else if (work.video_url) {
        // 直接使用已有的URL
        setVideoUrl(work.video_url);
        setSelectedVideo(work);
        setIsVideoModalOpen(true);
      } else {
        toast({
          title: "无法播放",
          description: "视频地址不可用",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "播放失败",
        description: error.message || "无法加载视频",
        variant: "destructive"
      });
    }
  };

  // 刷新单个作品状态
  const handleRefresh = async work => {
    try {
      setRefreshing(prev => ({
        ...prev,
        [work._id]: true
      }));
      const result = await $w.cloud.callConnector({
        name: 'aliyun_dashscope_jbn02va',
        methodName: 'get_tasks_status',
        params: {
          task_id: work.task_id
        }
      });
      const status = result.output.task_status;
      const videoUrl = result.output.results?.video_url;

      // 更新本地状态
      setWorks(prevWorks => prevWorks.map(w => w._id === work._id ? {
        ...w,
        status,
        video_url: videoUrl || work.video_url
      } : work));

      // 更新数据库
      const db = await getDB();
      await db.collection('digital_human_videos').doc(work._id).update({
        status,
        video_url: videoUrl || '',
        updated_at: new Date().toISOString()
      });

      // 如果任务完成，停止轮询
      if (status !== 'PENDING' && status !== 'RUNNING') {
        stopPolling(work.task_id);

        // 如果成功，下载视频到云存储
        if (status === 'SUCCEEDED' && videoUrl) {
          await downloadVideoToCloudStorage(videoUrl, work._id);
        }
      }
      toast({
        title: "刷新成功",
        description: "作品状态已更新",
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "刷新失败",
        description: error.message || "无法刷新状态",
        variant: "destructive"
      });
    } finally {
      setRefreshing(prev => ({
        ...prev,
        [work._id]: false
      }));
    }
  };

  // 发布作品
  const handlePublish = async work => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      await db.collection('digital_human_videos').doc(work._id).update({
        is_published: true,
        published_at: new Date().toISOString()
      });
      await fetchWorks();
      toast({
        title: "发布成功",
        description: "作品已发布到画廊",
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "发布失败",
        description: error.message || "无法发布作品",
        variant: "destructive"
      });
    }
  };

  // 分享作品
  const handleShare = async work => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: work.prompt || '数字人视频',
          text: '查看我生成的数字人视频',
          url: work.video_url
        });
      } else {
        // 复制链接到剪贴板
        await navigator.clipboard.writeText(work.video_url);
        toast({
          title: "已复制",
          description: "视频链接已复制到剪贴板",
          variant: "success"
        });
      }
    } catch (error) {
      toast({
        title: "分享失败",
        description: error.message || "无法分享作品",
        variant: "destructive"
      });
    }
  };

  // 删除作品
  const handleDelete = async workId => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      await db.collection('digital_human_videos').doc(workId).remove();
      await fetchWorks();
      toast({
        title: "删除成功",
        description: "作品已删除",
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message || "无法删除作品",
        variant: "destructive"
      });
    }
  };
  useEffect(() => {
    fetchWorks();

    // 清理轮询
    return () => {
      Object.values(pollingIntervals).forEach(interval => clearInterval(interval));
    };
  }, []);
  const filteredWorks = {
    all: works,
    completed: works.filter(w => w.status === 'SUCCEEDED'),
    running: works.filter(w => w.status === 'RUNNING' || w.status === 'PENDING'),
    failed: works.filter(w => ['FAILED', 'UNKNOWN', 'CANCELED'].includes(w.status))
  };
  return <div style={style} className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
    <div className="max-w-7xl mx-auto">
      {/* 页面标题 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">我的作品</h1>
          <p className="text-purple-300">管理您的数字人视频作品</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => $w.utils.navigateTo({
          pageId: 'create'
        })}>
          <Plus className="w-4 h-4 mr-2" />
          创建新作品
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard title="总作品数" value={stats.total} icon={Video} color="text-purple-400" bgColor="bg-purple-600/20" />
        <StatsCard title="已完成" value={stats.completed} icon={CheckCircle} color="text-green-400" bgColor="bg-green-600/20" />
        <StatsCard title="生成中" value={stats.running} icon={Loader2} color="text-blue-400" bgColor="bg-blue-600/20" />
        <StatsCard title="失败" value={stats.failed} icon={XCircle} color="text-red-400" bgColor="bg-red-600/20" />
      </div>

      {/* 作品列表 */}
      <Card className="bg-gray-800/50 border-purple-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">作品列表</CardTitle>
          <CardDescription className="text-gray-300">
            查看和管理您的所有数字人视频作品
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div> : works.length === 0 ? <div className="text-center py-12">
            <Video className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">还没有作品</p>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => $w.utils.navigateTo({
              pageId: 'create'
            })}>
              <Plus className="w-4 h-4 mr-2" />
              创建第一个作品
            </Button>
          </div> : <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-700">
              <TabsTrigger value="all" className="text-gray-300">全部</TabsTrigger>
              <TabsTrigger value="completed" className="text-gray-300">已完成</TabsTrigger>
              <TabsTrigger value="running" className="text-gray-300">进行中</TabsTrigger>
              <TabsTrigger value="failed" className="text-gray-300">失败</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredWorks.all.map(work => <WorkCard key={work._id} work={work} onRefresh={handleRefresh} onRecover={handleRefresh} onPublish={handlePublish} onShare={handleShare} onDelete={handleDelete} recovering={recovering[work._id]} onPlay={handlePlayVideo} />)}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredWorks.completed.map(work => <WorkCard key={work._id} work={work} onRefresh={handleRefresh} onRecover={handleRefresh} onPublish={handlePublish} onShare={handleShare} onDelete={handleDelete} recovering={recovering[work._id]} onPlay={handlePlayVideo} />)}
              </div>
            </TabsContent>

            <TabsContent value="running" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredWorks.running.map(work => <WorkCard key={work._id} work={work} onRefresh={handleRefresh} onRecover={handleRefresh} onPublish={handlePublish} onShare={handleShare} onDelete={handleDelete} recovering={recovering[work._id]} onPlay={handlePlayVideo} />)}
              </div>
            </TabsContent>

            <TabsContent value="failed" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredWorks.failed.map(work => <WorkCard key={work._id} work={work} onRefresh={handleRefresh} onRecover={handleRefresh} onPublish={handlePublish} onShare={handleShare} onDelete={handleDelete} recovering={recovering[work._id]} onPlay={handlePlayVideo} />)}
              </div>
            </TabsContent>
          </Tabs>}
        </CardContent>
      </Card>
    </div>

    {/* 视频播放模态框 */}
    <VideoPlayerModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} videoUrl={videoUrl} videoTitle={selectedVideo?.prompt} />
  </div>;
}