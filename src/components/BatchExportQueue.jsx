// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { Play, Pause, X, Clock } from 'lucide-react';

export function BatchExportQueue({
  tasks,
  onTaskAction
}) {
  const mockTasks = [{
    id: 1,
    name: '产品宣传片.mp4',
    progress: 75,
    status: 'processing',
    format: 'mp4',
    resolution: '1080p',
    estimatedTime: '2:30',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=80&h=60&fit=crop'
  }, {
    id: 2,
    name: '企业介绍.mov',
    progress: 100,
    status: 'completed',
    format: 'mov',
    resolution: '4k',
    estimatedTime: '完成',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=80&h=60&fit=crop'
  }, {
    id: 3,
    name: '教学视频.webm',
    progress: 0,
    status: 'queued',
    format: 'webm',
    resolution: '720p',
    estimatedTime: '等待中',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=80&h=60&fit=crop'
  }];
  const getStatusColor = status => {
    switch (status) {
      case 'processing':
        return 'text-blue-500';
      case 'completed':
        return 'text-green-500';
      case 'queued':
        return 'text-gray-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };
  const getStatusText = status => {
    switch (status) {
      case 'processing':
        return '处理中';
      case 'completed':
        return '已完成';
      case 'queued':
        return '等待中';
      case 'failed':
        return '失败';
      default:
        return '未知';
    }
  };
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>批量导出队列</span>
          <span className="text-sm font-normal text-gray-500">{mockTasks.length} 个任务</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockTasks.map(task => <div key={task.id} className="border rounded-lg p-3">
              <div className="flex items-center gap-3">
                <img src={task.thumbnail} alt={task.name} className="w-16 h-12 object-cover rounded" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{task.name}</h4>
                    <span className={`text-xs ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span>{task.format.toUpperCase()}</span>
                    <span>•</span>
                    <span>{task.resolution}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3" />
                    <span>{task.estimatedTime}</span>
                  </div>
                  {task.status === 'processing' && <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-[#165DFF] h-1.5 rounded-full transition-all duration-300" style={{
                    width: `${task.progress}%`
                  }} />
                      </div>
                      <span className="text-xs text-gray-500">{task.progress}%</span>
                    </div>}
                </div>
                <div className="flex gap-1">
                  {task.status === 'processing' && <button onClick={() => onTaskAction(task.id, 'pause')} className="p-1 hover:bg-gray-100 rounded">
                      <Pause className="w-4 h-4" />
                    </button>}
                  {task.status === 'queued' && <button onClick={() => onTaskAction(task.id, 'start')} className="p-1 hover:bg-gray-100 rounded">
                      <Play className="w-4 h-4" />
                    </button>}
                  <button onClick={() => onTaskAction(task.id, 'cancel')} className="p-1 hover:bg-gray-100 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>)}
        </div>
      </CardContent>
    </Card>;
}