// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress } from '@/components/ui';
// @ts-ignore;
import { Play, Settings, Clock, Film, Layers, ExternalLink } from 'lucide-react';

export function AdvancedTimeline({
  projects,
  selectedProject,
  onProjectSelect,
  onRefresh
}) {
  const [timelineScale, setTimelineScale] = useState(1);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const formatDuration = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'processing':
        return 'text-blue-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-slate-400';
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
        return <Badge variant="secondary">草稿</Badge>;
    }
  };
  const handleNodeSelect = node => {
    setSelectedNodes(prev => {
      if (prev.find(n => n._id === node._id)) {
        return prev.filter(n => n._id !== node._id);
      } else {
        return [...prev, node];
      }
    });
  };
  const renderTimeline = project => {
    if (!project || !project.nodes) return null;
    const totalDuration = project.totalDuration || 0;
    const pixelsPerSecond = 10 * timelineScale;
    return <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{project.name}</h3>
            <p className="text-sm text-slate-400">
              {project.nodeCount} 个节点 • 总时长: {formatDuration(totalDuration)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onProjectSelect(project)}>
              <Settings className="w-4 h-4 mr-1" />
              编辑
            </Button>
          </div>
        </div>

        {/* 时间线轨道 */}
        <div className="relative h-20 bg-slate-800 rounded-lg overflow-hidden">
          {/* 时间刻度 */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-slate-700 text-xs text-slate-400 flex items-center px-2">
            {Array.from({
            length: Math.ceil(totalDuration / 10) + 1
          }, (_, i) => <span key={i} style={{
            left: `${i * 10 * pixelsPerSecond}px`
          }} className="absolute">
                {formatDuration(i * 10)}
              </span>)}
          </div>

          {/* 节点轨道 */}
          <div className="absolute top-6 left-0 right-0 bottom-0">
            {project.nodes.map((node, index) => {
            const startTime = project.nodes.slice(0, index).reduce((sum, n) => sum + (n.duration || 5), 0);
            const width = (node.duration || 5) * pixelsPerSecond;
            const left = startTime * pixelsPerSecond;
            return <div key={node._id} className={`absolute h-8 rounded cursor-pointer transition-all hover:opacity-80 ${selectedNodes.find(n => n._id === node._id) ? 'ring-2 ring-blue-500' : ''} ${node.status === 'completed' ? 'bg-green-600' : node.status === 'processing' ? 'bg-blue-600' : node.status === 'failed' ? 'bg-red-600' : 'bg-slate-600'}`} style={{
              left: `${left}px`,
              width: `${width}px`
            }} onClick={() => handleNodeSelect(node)} title={`${node.title} (${formatDuration(node.duration || 5)}s)`}>
                  <div className="px-2 py-1 text-xs text-white truncate">
                    {node.title}
                  </div>
                </div>;
          })}
          </div>
        </div>

        {/* 节点详情 */}
        <div className="mt-4 space-y-2">
          {project.nodes.map((node, index) => <div key={node._id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-400">{index + 1}</span>
                <div>
                  <p className="text-sm font-medium text-white">{node.title}</p>
                  <p className="text-xs text-slate-400">{formatDuration(node.duration || 5)}s • {node.generationType}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(node.status)}
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>)}
        </div>
      </div>;
  };
  return <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Layers className="w-5 h-5" />
          高级时间线
        </CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length > 0 ? <div className="space-y-6">
            {projects.map(project => <div key={project.id} className="border-b border-slate-700 last:border-b-0 pb-6 last:pb-0">
                {renderTimeline(project)}
              </div>)}
          </div> : <div className="text-center py-12 text-slate-400">
            <Film className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>暂无项目</p>
            <p className="text-sm mt-2">创建项目后可以在时间线中查看和管理</p>
          </div>}
      </CardContent>
    </Card>;
}