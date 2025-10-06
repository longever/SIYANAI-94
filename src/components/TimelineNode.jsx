// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Play, Image as ImageIcon, Video, Music, Trash2, Settings } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function TimelineNode({
  node,
  isSelected,
  onClick,
  onUpdate,
  onDelete,
  scale = 1,
  offset = 0
}) {
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const getNodeColor = type => {
    switch (type) {
      case 'image':
        return 'bg-blue-500';
      case 'video':
        return 'bg-purple-500';
      case 'audio':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };
  const getNodeIcon = type => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-3 h-3" />;
      case 'video':
        return <Video className="w-3 h-3" />;
      case 'audio':
        return <Music className="w-3 h-3" />;
      default:
        return <ImageIcon className="w-3 h-3" />;
    }
  };
  const nodeWidth = (node.endTime - node.startTime) * 50 * scale;
  const nodeLeft = node.startTime * 50 * scale + offset;
  return <div className={cn("absolute h-12 rounded cursor-pointer transition-all group", getNodeColor(node.type), isSelected && "ring-2 ring-white ring-offset-2 ring-offset-gray-800")} style={{
    left: `${nodeLeft}px`,
    width: `${Math.max(nodeWidth, 40)}px`,
    top: `${(node.layer || 1) * 48}px`
  }} onClick={onClick}>
      <div className="h-full flex items-center px-2 space-x-1 overflow-hidden">
        {/* 缩略图 */}
        {node.thumbnailUrl && <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
            <img src={node.thumbnailUrl} alt={node.name} className="w-full h-full object-cover" onLoad={() => setThumbnailLoaded(true)} onError={e => {
          e.target.style.display = 'none';
        }} />
          </div>}
        
        {/* 图标 */}
        {!node.thumbnailUrl && <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center flex-shrink-0">
            {getNodeIcon(node.type)}
          </div>}
        
        {/* 名称 */}
        <span className="text-white text-xs truncate flex-1">
          {node.name}
        </span>
      </div>

      {/* 悬停工具提示 */}
      <div className="absolute -top-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
        {node.name} ({node.endTime - node.startTime}s)
      </div>
    </div>;
}