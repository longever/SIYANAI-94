// @ts-ignore;
import React, { useState, useRef, useEffect } from 'react';
// @ts-ignore;
import { Play, Pause, SkipBack, SkipForward, Plus, Trash2 } from 'lucide-react';
// @ts-ignore;
import { Button, Card } from '@/components/ui';

export function NodeEditor({
  selectedNode,
  onNodeUpdate,
  onNodeDelete
}) {
  const [nodes, setNodes] = useState([{
    id: 1,
    type: 'text-to-video',
    x: 100,
    y: 100,
    title: '文生视频',
    color: '#165DFF'
  }, {
    id: 2,
    type: 'image-to-video',
    x: 300,
    y: 100,
    title: '图生视频',
    color: '#8B5CF6'
  }, {
    id: 3,
    type: 'digital-human',
    x: 500,
    y: 100,
    title: '数字人',
    color: '#10B981'
  }]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({
    x: 0,
    y: 0
  });
  const canvasRef = useRef(null);
  const handleNodeClick = node => {
    setSelectedNodeId(node.id);
    if (selectedNode) {
      selectedNode(node);
    }
  };
  const handleMouseDown = (e, nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    setSelectedNodeId(nodeId);
  };
  const handleMouseMove = e => {
    if (!isDragging || !selectedNodeId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;
    setNodes(prevNodes => prevNodes.map(node => node.id === selectedNodeId ? {
      ...node,
      x: Math.max(0, newX),
      y: Math.max(0, newY)
    } : node));
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, selectedNodeId, dragOffset]);
  const addNode = type => {
    const newNode = {
      id: Date.now(),
      type,
      x: 200,
      y: 200,
      title: type === 'text-to-video' ? '文生视频' : type === 'image-to-video' ? '图生视频' : '数字人',
      color: type === 'text-to-video' ? '#165DFF' : type === 'image-to-video' ? '#8B5CF6' : '#10B981'
    };
    setNodes([...nodes, newNode]);
  };
  const deleteNode = nodeId => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    if (onNodeDelete) {
      onNodeDelete(nodeId);
    }
  };
  return <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 relative overflow-hidden">
        <div ref={canvasRef} className="absolute inset-0" style={{
        cursor: isDragging ? 'grabbing' : 'grab'
      }}>
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          
          {nodes.map(node => <div key={node.id} className={`absolute cursor-move transition-all duration-200 ${selectedNodeId === node.id ? 'ring-2 ring-blue-500' : ''}`} style={{
          left: node.x,
          top: node.y,
          transform: 'translate(-50%, -50%)'
        }} onMouseDown={e => handleMouseDown(e, node.id)} onClick={() => handleNodeClick(node)}>
              <Card className="w-32 h-20 flex items-center justify-center" style={{
            backgroundColor: node.color
          }}>
                <div className="text-white text-center">
                  <p className="text-sm font-medium">{node.title}</p>
                </div>
              </Card>
              {selectedNodeId === node.id && <Button size="sm" variant="destructive" className="absolute -top-2 -right-2 w-6 h-6 p-0" onClick={e => {
            e.stopPropagation();
            deleteNode(node.id);
          }}>
                  <Trash2 className="w-3 h-3" />
                </Button>}
            </div>)}
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-2">
          <Button size="sm" onClick={() => addNode('text-to-video')} style={{
          backgroundColor: '#165DFF'
        }}>
            添加文生视频
          </Button>
          <Button size="sm" onClick={() => addNode('image-to-video')} style={{
          backgroundColor: '#8B5CF6'
        }}>
            添加图生视频
          </Button>
          <Button size="sm" onClick={() => addNode('digital-human')} style={{
          backgroundColor: '#10B981'
        }}>
            添加数字人
          </Button>
        </div>
      </div>
    </div>;
}