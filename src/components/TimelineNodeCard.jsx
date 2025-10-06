// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Play, Image as ImageIcon, Video, Music, Trash2, Settings, Eye } from 'lucide-react';
// @ts-ignore;
import { Card, Badge, Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function TimelineNodeCard({
  node,
  isSelected,
  onClick,
  onUpdate,
  onDelete,
  onPreview
}) {
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const getNodeIcon = type => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      default:
        return <ImageIcon className="w-4 h-4" />;
    }
  };
  const formatDuration = seconds => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  return <TooltipProvider>
      <Card className={cn("relative cursor-pointer transition-all hover:shadow-md", isSelected && "ring-2 ring-primary", "group")} onClick={onClick} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <div className="flex items-center p-2 space-x-2">
          {/* 缩略图 */}
          <div className="relative w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
            {node.thumbnailUrl ? <img src={node.thumbnailUrl} alt={node.name} className="w-full h-full object-cover" onLoad={() => setThumbnailLoaded(true)} onError={e => {
            e.target.style.display = 'none';
          }} /> : <div className="w-full h-full flex items-center justify-center">
                {getNodeIcon(node.type)}
              </div>}
            
            {/* 悬停预览按钮 */}
            {isHovered && <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-white hover:text-white" onClick={e => {
              e.stopPropagation();
              onPreview?.(node);
            }}>
                  <Eye className="w-3 h-3" />
                </Button>
              </div>}
          </div>

          {/* 内容信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium truncate">{node.name}</h4>
              <Badge variant="outline" className="text-xs">
                {formatDuration(node.duration || 0)}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {getNodeIcon(node.type)}
                <span className="ml-1">{node.type}</span>
              </Badge>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={e => {
                e.stopPropagation();
                onUpdate?.(node);
              }}>
                  <Settings className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>编辑</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={e => {
                e.stopPropagation();
                onDelete?.(node.id);
              }}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>删除</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* 悬停预览大图 */}
        {isHovered && node.thumbnailUrl && <div className="absolute z-10 -top-2 left-full ml-2 w-48 h-32 bg-background border rounded-lg shadow-lg p-1">
            <img src={node.thumbnailUrl} alt={node.name} className="w-full h-full object-cover rounded" />
          </div>}
      </Card>
    </TooltipProvider>;
}