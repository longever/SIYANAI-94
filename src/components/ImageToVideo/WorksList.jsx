// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Calendar, Popover, PopoverContent, PopoverTrigger, useToast } from '@/components/ui';
// @ts-ignore;
import { cn } from '@/lib/utils';
// @ts-ignore;
import { CalendarIcon, Download, Eye, RefreshCw, Filter, X } from 'lucide-react';

import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { VideoPlayerModal } from '@/components/VideoPlayerModal';
const TASK_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELED: 'canceled',
  UNKNOWN: 'unknown',
  PENDING: 'pending',
  RUNNING: 'running'
};
const STATUS_LABELS = {
  [TASK_STATUS.SUCCESS]: '已完成',
  [TASK_STATUS.FAILED]: '失败',
  [TASK_STATUS.CANCELED]: '已取消',
  [TASK_STATUS.UNKNOWN]: '未知',
  [TASK_STATUS.PENDING]: '待处理',
  [TASK_STATUS.RUNNING]: '处理中'
};
const STATUS_COLORS = {
  [TASK_STATUS.SUCCESS]: 'bg-green-500',
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
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: null,
    to: null
  });
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState('');
  const [pollingTasks, setPollingTasks] = useState(new Set());
  const {
    toast
  } = useToast();

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
                $eq: $w.auth.currentUser?.userId || 'user_123456'
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
        setTasks(response.records);
        setFilteredTasks(response.records);

        // 检查是否有需要轮询的任务
        const pendingTasks = response.records.filter(task => task.status === TASK_STATUS.PENDING || task.status === TASK_STATUS.RUNNING);
        if (pendingTasks.length > 0) {
          const newPollingTasks = new Set(pollingTasks);
          pendingTasks.forEach(task => newPollingTasks.add(task.taskId));
          setPollingTasks(newPollingTasks);
        }
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
  }, [$w.auth.currentUser?.userId, pollingTasks]);

  // 轮询任务状态
  const pollTaskStatus = useCallback(async taskId => {
    try {
      const response = await $w.cloud.callFunction({
        name: 'aliyun_dashscope_jbn02va',
        data: {
          action: 'get_tasks_status',
          taskId: taskId
        }
      });
      if (response && response.status) {
        // 更新任务状态
        await $w.cloud.callDataSource({
          dataSourceName: 'generation_tasks',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              status: response.status.toLowerCase(),
              outputUrl: response.outputUrl || '',
              errorMsg: response.errorMsg || ''
            },
            filter: {
              where: {
                taskId: {
                  $eq: taskId
                }
              }
            }
          }
        });

        // 重新获取任务列表
        await fetchTasks();

        // 如果任务完成，从轮询列表中移除
        if (response.status !== 'PENDING' && response.status !== 'RUNNING') {
          const newPollingTasks = new Set(pollingTasks);
          newPollingTasks.delete(taskId);
          setPollingTasks(newPollingTasks);
        }
      }
    } catch (error) {
      console.error('轮询任务状态失败:', error);
    }
  }, [fetchTasks, pollingTasks]);

  // 应用筛选
  const applyFilters = useCallback(() => {
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
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= dateRange.from && taskDate <= dateRange.to;
      });
    }
    setFilteredTasks(filtered);
  }, [tasks, selectedModel, selectedStatus, dateRange]);

  // 初始化加载
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // 应用筛选器
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // 轮询机制
  useEffect(() => {
    if (pollingTasks.size === 0) return;
    const interval = setInterval(async () => {
      for (const taskId of pollingTasks) {
        await pollTaskStatus(taskId);
      }
    }, 30000); // 30秒轮询一次

    return () => clearInterval(interval);
  }, [pollingTasks, pollTaskStatus]);

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
  const handlePreview = videoUrl => {
    if (videoUrl) {
      setSelectedVideoUrl(videoUrl);
      setShowVideoModal(true);
    }
  };

  // 下载视频
  const handleDownload = async (videoUrl, filename) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'video.mp4';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: '下载成功',
        description: '视频已开始下载'
      });
    } catch (error) {
      toast({
        title: '下载失败',
        description: error.message || '无法下载视频',
        variant: 'destructive'
      });
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? dateRange.to ? <>
                          {format(dateRange.from, "yyyy-MM-dd", {
                      locale: zhCN
                    })} -{" "}
                          {format(dateRange.to, "yyyy-MM-dd", {
                      locale: zhCN
                    })}
                        </> : format(dateRange.from, "yyyy-MM-dd", {
                    locale: zhCN
                  }) : <span>选择日期</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar initialFocus mode="range" defaultMonth={dateRange.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={zhCN} />
                </PopoverContent>
              </Popover>
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
                    <p>创建时间：{format(new Date(task.createdAt), "yyyy-MM-dd HH:mm", {
                  locale: zhCN
                })}</p>
                    {task.inputParams?.duration && <p>时长：{task.inputParams.duration}秒</p>}
                    {task.inputParams?.resolution && <p>分辨率：{task.inputParams.resolution}</p>}
                  </div>

                  {task.errorMsg && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {task.errorMsg}
                    </p>}

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handlePreview(task.outputUrl)} disabled={!task.outputUrl || task.status !== TASK_STATUS.SUCCESS} className="flex-1">
                      <Eye className="mr-2 h-4 w-4" />
                      预览
                    </Button>
                    <Button size="sm" onClick={() => handleDownload(task.outputUrl, `${task.taskId}.mp4`)} disabled={!task.outputUrl || task.status !== TASK_STATUS.SUCCESS} className="flex-1">
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