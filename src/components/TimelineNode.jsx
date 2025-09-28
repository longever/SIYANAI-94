// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { cn } from '@/lib/utils';
// @ts-ignore;
import { GripVertical, Image, FileText, User, Play, Settings, Trash2, Clock } from 'lucide-react';

export function TimelineNode({
  node,
  index,
  isSelected,
  onSelect,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop
}) {
  const getNodeIcon = type => {
    switch (type) {
      case 'text2video':
        return <FileText className="w-4 h-4" />;
      case 'image2video':
        return <Image className="w-4 h-4" />;
      case 'digital_human':
        return <User className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };
  const getNodeColor = type => {
    switch (type) {
      case 'text2video':
        return 'text-blue-400';
      case 'image2video':
        return 'text-purple-400';
      case 'digital_human':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };
  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };
  return <Card className={cn("mb-3 transition-all cursor-pointer", isSelected ? "ring-2 ring-sky-500" : "hover:ring-1 hover:ring-slate-600")} draggable onDragStart={e => onDragStart(e, index)} onDragOver={onDragOver} onDrop={e => onDrop(e, index)} onClick={() => onSelect(node.id)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="cursor-move" onMouseDown={e => e.stopPropagation()}>
            <GripVertical className="w-4 h-4 text-slate-500" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={getNodeColor(node.type)}>
                  {getNodeIcon(node.type)}
                </div>
                <span className="font-medium text-sm">{node.title}</span>
                <Badge variant="outline" className="text-xs">
                  {node.provider}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", getStatusColor(node.status))} />
                <span className="text-xs text-slate-400">{node.duration}s</span>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 mb-2">{node.description}</p>
            
            <div className="flex items-center gap-2">
              {node.assets.image && <Badge variant="secondary" className="text-xs">
                  <Image className="w-3 h-3 mr-1" />
                  图片
                </Badge>}
              {node.assets.audio && <Badge variant="secondary" className="text-xs">
                  <Play className="w-3 h-3 mr-1" />
                  音频
                </Badge>}
              {node.assets.subtitle && <Badge variant="secondary" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  字幕
                </Badge>}
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={e => {
            e.stopPropagation();
            onDelete(node.id);
          }}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>;
}