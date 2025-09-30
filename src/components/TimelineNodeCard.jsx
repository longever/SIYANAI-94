// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, Badge, Button } from '@/components/ui';
// @ts-ignore;
import { Play, Copy, Trash2, Eye, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function TimelineNodeCard({
  node,
  index,
  isSelected,
  onSelect,
  onPreview,
  onDuplicate,
  onDelete
}) {
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
  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  const getTypeLabel = type => {
    const typeMap = {
      'text2video': '文本生成',
      'image2video': '图片生成',
      'digitalhuman': '数字人',
      'transition': '转场'
    };
    return typeMap[type] || type;
  };
  return <Card className={`cursor-pointer transition-all hover:shadow-lg ${isSelected ? 'ring-2 ring-blue-500 bg-slate-700' : 'bg-slate-800 border-slate-700'}`} onClick={onSelect}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{index + 1}</span>
            <span className="text-sm text-slate-300 truncate">{node.title}</span>
          </div>
          <Badge variant={getStatusColor(node.status)} className="text-xs">
            {getStatusIcon(node.status)}
            <span className="ml-1">{node.status || 'draft'}</span>
          </Badge>
        </div>
        
        <div className="text-xs text-slate-400 mb-2">
          {getTypeLabel(node.generationType)} • {node.duration || 5}s
        </div>
        
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={e => {
          e.stopPropagation();
          onPreview();
        }} title="预览">
            <Eye className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={e => {
          e.stopPropagation();
          onDuplicate();
        }} title="复制">
            <Copy className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-400 hover:text-red-300" onClick={e => {
          e.stopPropagation();
          onDelete();
        }} title="删除">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>;
}