// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, Button } from '@/components/ui';
// @ts-ignore;
import { Trash2, Copy, Move } from 'lucide-react';

export function BasicNodeCard({
  node,
  isSelected,
  onSelect,
  onDrag,
  onDelete,
  mode
}) {
  const [isDragging, setIsDragging] = useState(false);
  const handleMouseDown = e => {
    if (e.target.closest('.node-controls')) return;
    setIsDragging(true);
    const startX = e.clientX - node.position.x;
    const startY = e.clientY - node.position.y;
    const handleMouseMove = e => {
      const newX = e.clientX - startX;
      const newY = e.clientY - startY;
      onDrag(node.id, {
        x: newX,
        y: newY
      });
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  const getNodeIcon = () => {
    switch (node.type) {
      case 'text':
        return 'T';
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎵';
      default:
        return '📄';
    }
  };
  const getNodeColor = () => {
    switch (mode) {
      case 'text2video':
        return 'border-blue-500 bg-blue-500/10';
      case 'image2video':
        return 'border-purple-500 bg-purple-500/10';
      case 'digitalHuman':
        return 'border-green-500 bg-green-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };
  return <Card className={`absolute w-48 cursor-move transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-400 shadow-lg' : ''} ${getNodeColor()} border-2`} style={{
    left: node.position.x,
    top: node.position.y,
    transform: isDragging ? 'scale(1.05)' : 'scale(1)'
  }} onClick={() => onSelect(node)} onMouseDown={handleMouseDown}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getNodeIcon()}</span>
                <span className="text-sm font-medium truncate">
                  {node.data.name || node.type}
                </span>
              </div>
              
              <div className="node-controls flex space-x-1">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-500/20" onClick={e => {
            e.stopPropagation();
            onDelete(node.id);
          }}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="text-xs text-gray-400">
              时长: {node.data.duration || 5}s
            </div>
            
            {node.data.content && <div className="mt-1 text-xs text-gray-500 truncate">
                {node.data.content.substring(0, 30)}...
              </div>}
          </CardContent>
        </Card>;
}