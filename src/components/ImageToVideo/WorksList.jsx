// @ts-ignore;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { cn } from '@/lib/utils';
// @ts-ignore;
import { CalendarIcon, Download, Eye, RefreshCw, Filter, X } from 'lucide-react';

import { VideoPlayerModal } from '@/components/VideoPlayerModal';
import { formatDate } from '@/lib/dateUtils';
const TASK_STATUS = {
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  CANCELED: 'CANCELED',
  UNKNOWN: 'UNKNOWN',
  PENDING: 'PENDING',
  RUNNING: 'RUNNING'
};
const STATUS_LABELS = {
  [TASK_STATUS.SUCCEEDED]: '已完成',
  [TASK_STATUS.FAILED]: '失败',
  [TASK_STATUS.CANCELED]: '已取消',
  [TASK_STATUS.UNKNOWN]: '未知',
  [TASK_STATUS.PENDING]: '待处理',
  [TASK_STATUS.RUNNING]: '处理中'
};
const STATUS_COLORS = {
  [TASK_STATUS.SUCCEEDED]: 'bg-green-500',
  [TASK_STATUS.FAILED]: 'bg-red-500',
  [TASK_STATUS.CANCELED]: 'bg-gray-500',
  [TASK_STATUS.UNKNOWN]: 'bg-yellow-500',
  [TASK_STATUS.PENDING]: 'bg-blue-500',
  [TASK_STATUS.RUNNING]: 'bg-purple-500'
};
const MODEL_TYPES = [{
  value: 'all',
  label: '全部模型'
}, {
  value: 'tongyi-wanxiang',
  label: '通义万相'
}, {
  value: 'keling',
  label: '可灵'
}, {
  value: 'stable-diffusion',
  label: 'Stable Diffusion'
}, {
  value: 'runway',
  label: 'Runway'
}];
export function WorksList(props) {
  const {
    $w
  } = props;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: null,
    to: null
  });
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState('');
  const {
    toast
  } = useToast();

  // 获取当前用户ID
  const currentUserId = $w?.auth?.currentUser?.userId || 'user_123456';

  // 获取任务列表
  const fetchTasks = useCallback(async () => {
    try {
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'generation_tasks',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              userId: {
                $eq: currentUserId
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          getCount: true
        }
      });
      if (response.records) {
        console.log("初始获取task", response.records)
        setTasks(response.records);
      }
    } catch (error) {
      toast({
        title: '获取任务失败',
        description: error.message || '无法获取任务列表',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [currentUserId, $w.cloud, toast]);

  // 轮询需要更新的任务
  const pollPendingTasks = useCallback(async () => {
    const pendingTasks = tasks.filter(task => task.status === TASK_STATUS.PENDING || task.status === TASK_STATUS.RUNNING);
    if (pendingTasks.length === 0) return;
    try {
      // 使用云函数 video-task-handler 获取任务结果
      const promises = pendingTasks.map(async task => {
        const response = await $w.cloud.callFunction({
          name: 'video-task-handler',
          data: {
            action: 'getTaskStatus',
            taskId: task.external_task_id
          }
        });
        return {
          _id: task._id,
          external_task_id: task.external_task_id,
          ...response
        };
      });
      const results = await Promise.allSettled(promises);
      console.log('轮询results', results);
      //返回任务结果
      const updatedTasks = results.filter(result => result.status === 'fulfilled' && result.value?._id).map(result => ({
        ...tasks.find(t => t._id === result.value._id),
        status: result.value.status,
        cloudUrl: result.value.cloudUrl || ''
      }));

      console.log('本地tasks', updatedTasks);
      if (updatedTasks.length > 0) {
        setTasks(prevTasks => prevTasks.map(task => {
          const updated = updatedTasks.find(u => u._id === task._id);
          return updated || task;
        }));
      }
    } catch (error) {
      console.error('轮询任务状态失败:', error);
    }
  }, [tasks, $w.cloud]);

  // 使用 useEffect 实现轮询
  const hasPendingTasks = useMemo(() => tasks.some(task => task.status === TASK_STATUS.PENDING || task.status === TASK_STATUS.RUNNING), [tasks]);
  useEffect(() => {
    if (!hasPendingTasks) return;
    const interval = setInterval(() => {
      pollPendingTasks();
    }, 30000); // 30秒轮询一次

    return () => clearInterval(interval);
  }, [hasPendingTasks, pollPendingTasks]);

  // 应用筛选
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // 按模型类型筛选
    if (selectedModel !== 'all') {
      filtered = filtered.filter(task => task.modelType === selectedModel);
    }

    // 按状态筛选
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }

    // 按日期范围筛选
    if (dateRange.from && dateRange.to) {
      const start = new Date(dateRange.from);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateRange.to);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= start && taskDate <= end;
      });
    }
    return filtered;
  }, [tasks, selectedModel, selectedStatus, dateRange]);

  // 初始化加载
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // 清除筛选
  const clearFilters = () => {
    setSelectedModel('all');
    setSelectedStatus('all');
    setDateRange({
      from: null,
      to: null
    });
  };

  // 预览视频
  const handlePreview = async videoUrl => {
    if (!videoUrl) {
      toast({
        title: '预览失败',
        description: '视频链接无效',
        variant: 'destructive'
      });
      return;
    }
    try {
      // 将 cloudUrl 转换为临时 URL
      const tcb = await $w.cloud.getCloudInstance();
      const tempFileRes = await tcb.getTempFileURL({
        fileList: [videoUrl]
      });
      console.log('获取临时地址', tempFileRes)
      console.log('获取临时地址', tempFileRes.fileList[0].tempFileURL)
      if (tempFileRes.fileList && tempFileRes.fileList[0] && tempFileRes.fileList[0].tempFileURL) {
        const tempUrl = tempFileRes.fileList[0].tempFileURL;
        setSelectedVideoUrl(tempUrl);
        setShowVideoModal(true);
      } else {
        throw new Error('无法获取预览链接');
      }
    } catch (error) {
      console.error('预览失败:', error);
      toast({
        title: '预览失败',
        description: error.message || '无法获取视频预览',
        variant: 'destructive'
      });
    }
  };

  // 下载视频
  const handleDownload = async (videoUrl, filename) => {
    if (!videoUrl) {
      toast({
        title: '下载失败',
        description: '视频链接无效',
        variant: 'destructive'
      });
      return;
    }
    try {
      // 将 cloudUrl 转换为临时 URL
      const tcb = await $w.cloud.getCloudInstance();
      const tempFileRes = await tcb.getTempFileURL({
        fileList: [videoUrl]
      });
      if (tempFileRes.fileList && tempFileRes.fileList[0] && tempFileRes.fileList[0].fileID) {
        const downloadUrl = tempFileRes.fileList[0].fileID;

        // 创建下载链接
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename || 'video.mp4';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast({
          title: '下载成功',
          description: '视频已开始下载'
        });
      } else {
        throw new Error('无法获取下载链接');
      }
    } catch (error) {
      console.error('下载失败:', error);

      // 如果云开发方法失败，尝试直接下载
      try {
        const response = await fetch(videoUrl, {
          mode: 'cors',
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'video.mp4';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast({
          title: '下载成功',
          description: '视频已开始下载'
        });
      } catch (fallbackError) {
        toast({
          title: '下载失败',
          description: fallbackError.message || '无法下载视频，请检查网络连接或稍后重试',
          variant: 'destructive'
        });
      }
    }
  };

  // 刷新任务列表
  const handleRefresh = () => {
    setLoading(true);
    fetchTasks();
  };
  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
    </div>;
  }
  return <div className="space-y-6">
    {/* 筛选栏 */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>作品筛选</span>
          <Button variant="ghost" size="sm" onClick={handleRefresh} className="h-8 w-8 p-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">模型类型</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODEL_TYPES.map(type => <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">任务状态</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {Object.entries(STATUS_LABELS).map(([key, label]) => <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">日期范围</label>
            <input type="date" value={dateRange.from ? formatDate(dateRange.from) : ''} onChange={e => setDateRange(prev => ({
              ...prev,
              from: e.target.value ? new Date(e.target.value) : null
            }))} className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm" />
          </div>

          <div className="flex items-end">
            <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
              <X className="mr-2 h-4 w-4" />
              清除筛选
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* 任务列表 */}
    {filteredTasks.length === 0 ? <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Filter className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">暂无符合条件的作品</p>
      </CardContent>
    </Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTasks.map(task => <Card key={task._id} className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg line-clamp-2">
              {task.inputParams?.prompt || '未命名作品'}
            </CardTitle>
            <Badge className={cn(STATUS_COLORS[task.status], "text-white")}>
              {STATUS_LABELS[task.status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p>模型：{MODEL_TYPES.find(m => m.value === task.modelType)?.label || task.modelType}</p>
              <p>创建时间：{formatDate(task.createdAt, 'yyyy-MM-dd HH:mm')}</p>
              {task.inputParams?.duration && <p>时长：{task.inputParams.duration}秒</p>}
              {task.inputParams?.resolution && <p>分辨率：{task.inputParams.resolution}</p>}
            </div>

            {task.errorMsg && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {task.errorMsg}
            </p>}

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handlePreview(task.cloudUrl)} disabled={!task.cloudUrl || task.status !== TASK_STATUS.SUCCEEDED} className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                预览
              </Button>
              <Button size="sm" onClick={() => handleDownload(task.cloudUrl, `${task._id}.mp4`)} disabled={!task.cloudUrl || task.status !== TASK_STATUS.SUCCEEDED} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                下载
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>)}
    </div>}

    {/* 视频预览模态框 */}
    <VideoPlayerModal isOpen={showVideoModal} onClose={() => setShowVideoModal(false)} videoUrl={selectedVideoUrl} />
  </div>;
}