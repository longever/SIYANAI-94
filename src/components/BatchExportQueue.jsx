// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Checkbox, Progress, Badge } from '@/components/ui';
// @ts-ignore;
import { Download, Play, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export function BatchExportQueue({
  projects = [],
  exportTasks = [],
  isGenerating = false,
  generationProgress = 0,
  onBatchGenerate,
  onDownload,
  onRefresh
}) {
  const [selectedProjects, setSelectedProjects] = useState([]);
  const handleProjectToggle = project => {
    setSelectedProjects(prev => {
      if (prev.find(p => p.id === project.id)) {
        return prev.filter(p => p.id !== project.id);
      } else {
        return [...prev, project];
      }
    });
  };
  const handleSelectAll = () => {
    if (selectedProjects.length === (projects?.length || 0)) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects || []);
    }
  };
  const getStatusIcon = status => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };
  const getStatusBadge = status => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">已完成</Badge>;
      case 'processing':
        return <Badge variant="default">处理中</Badge>;
      case 'failed':
        return <Badge variant="destructive">失败</Badge>;
      default:
        return <Badge variant="secondary">等待中</Badge>;
    }
  };
  const formatFileSize = bytes => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const formatDuration = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  return <div className="space-y-6">
      {/* 项目选择 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">选择项目</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={(projects?.length || 0) === 0}>
                {selectedProjects.length === (projects?.length || 0) ? '取消全选' : '全选'}
              </Button>
              <span className="text-sm text-slate-400">
                已选择 {selectedProjects.length} 个项目
              </span>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(projects || []).map(project => <div key={project.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={selectedProjects.find(p => p.id === project.id) !== undefined} onCheckedChange={() => handleProjectToggle(project)} />
                    <div>
                      <p className="text-sm font-medium text-white">{project.name}</p>
                      <p className="text-xs text-slate-400">
                        {project.nodeCount} 节点 • {formatDuration(project.totalDuration)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(project.status)}
                </div>)}
            </div>
            
            <Button className="w-full" onClick={() => onBatchGenerate(selectedProjects)} disabled={selectedProjects.length === 0 || isGenerating}>
              {isGenerating ? <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  生成中 {generationProgress}%
                </> : <>
                  <Play className="w-4 h-4 mr-2" />
                  开始批量生成
                </>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 导出任务列表 */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            导出任务
            <Button size="sm" variant="ghost" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(exportTasks?.length || 0) > 0 ? <div className="space-y-3">
              {(exportTasks || []).map(task => <div key={task.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <p className="text-sm font-medium text-white">{task.projectName}</p>
                      <p className="text-xs text-slate-400">
                        {formatDuration(task.duration)} • {formatFileSize(task.fileSize)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {task.status === 'processing' && <Progress value={task.progress} className="w-20" />}
                    
                    {task.status === 'completed' && <Button size="sm" variant="ghost" onClick={() => onDownload(task.id)}>
                        <Download className="w-4 h-4" />
                      </Button>}
                    
                    {getStatusBadge(task.status)}
                  </div>
                </div>)}
            </div> : <div className="text-center py-8 text-slate-400">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>暂无导出任务</p>
              <p className="text-sm mt-2">选择项目并开始批量生成</p>
            </div>}
        </CardContent>
      </Card>
    </div>;
}