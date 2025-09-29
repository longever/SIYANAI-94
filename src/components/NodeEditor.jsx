// @ts-ignore;
import React, { useState, useRef, useEffect } from 'react';
// @ts-ignore;
import { Card, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Trash2, Copy, Move, Settings } from 'lucide-react';

import { NodeCard } from '@/components/NodeCard';
export function NodeEditor({
  nodes,
  selectedNode,
  onNodeSelect,
  onNodeUpdate,
  onNodeDelete,
  mode
}) {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({
    x: 0,
    y: 0
  });
  const handleCanvasClick = e => {
    if (e.target === canvasRef.current) {
      onNodeSelect(null);
    }
  };
  const handleNodeDrag = (nodeId, newPosition) => {
    onNodeUpdate(nodeId, {
      position: newPosition
    });
  };
  return <div className="h-full relative bg-gray-950">
      {/* 网格背景 */}
      <div ref={canvasRef} className="absolute inset-0 bg-grid-pattern" style={{
      backgroundImage: 'radial-gradient(circle, #1a1a1a 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    }} onClick={handleCanvasClick} />
      
      {/* 节点渲染区域 */}
      <div className="relative h-full">
        {nodes.map(node => <NodeCard key={node.id} node={node} isSelected={selectedNode?.id === node.id} onSelect={() => onNodeSelect(node)} onDrag={handleNodeDrag} onDelete={() => onNodeDelete(node.id)} mode={mode} />)}
      </div>

      {/* 画布提示 */}
      {nodes.length === 0 && <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-600 text-lg mb-2">开始创作您的视频</div>
            <div className="text-gray-500 text-sm">点击左侧工具栏添加节点或拖拽素材到画布</div>
          </div>
        </div>}
    </div>;
}