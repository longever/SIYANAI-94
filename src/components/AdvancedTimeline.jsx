// @ts-ignore;
import React, { useState, useRef, useEffect } from 'react';
// @ts-ignore;
import { Play, Pause, SkipBack, SkipForward, Plus, ZoomIn, ZoomOut, Layers } from 'lucide-react';
// @ts-ignore;
import { Button, Slider } from '@/components/ui';

import { TimelineNode } from './TimelineNode';
import { EnhancedAssetLibrary } from './EnhancedAssetLibrary';
export function AdvancedTimeline({
  nodes,
  currentTime,
  duration,
  onNodeUpdate,
  onNodeDelete,
  onTimeChange,
  onNodesChange
}) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState(0);
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const timelineRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const handleAssetSelect = asset => {
    const newNode = {
      id: Date.now().toString(),
      type: asset.type,
      name: asset.name,
      url: asset.url,
      thumbnailUrl: asset.thumbnailUrl,
      duration: asset.duration || 5,
      startTime: currentTime,
      endTime: currentTime + (asset.duration || 5),
      layer: 1,
      properties: {
        position: {
          x: 0,
          y: 0
        },
        scale: 1,
        opacity: 1,
        rotation: 0,
        effects: []
      }
    };
    onNodesChange?.([...nodes, newNode]);
    setShowAssetLibrary(false);
  };
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 5));
  };
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.5));
  };
  const handleTimelineClick = e => {
    if (e.target === timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = (x - offset) / (50 * scale);
      onTimeChange(Math.max(0, Math.min(time, duration)));
    }
  };
  return <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="border-b p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={() => setShowAssetLibrary(true)}>
            <Plus className="w-4 h-4 mr-1" />
            添加素材
          </Button>
          
          <div className="flex items-center space-x-1">
            <Button size="sm" variant="ghost" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {Math.round(scale * 100)}%
            </span>
            <Button size="sm" variant="ghost" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm">
            {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* 时间轴内容 */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div ref={timelineRef} className="relative h-full bg-gray-50 cursor-crosshair" style={{
        width: `${duration * 50 * scale + 200}px`
      }} onClick={handleTimelineClick}>
          {/* 时间刻度 */}
          <div className="absolute top-0 left-0 right-0 h-8 border-b bg-white">
            {Array.from({
            length: Math.ceil(duration) + 1
          }, (_, i) => <div key={i} className="absolute h-full border-r border-gray-300" style={{
            left: `${i * 50 * scale}px`
          }}>
                <span className="text-xs text-gray-600 ml-1">{i}s</span>
              </div>)}
          </div>

          {/* 播放头 */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20" style={{
          left: `${currentTime * 50 * scale + offset}px`
        }} />

          {/* 图层 */}
          <div className="absolute top-8 left-0 right-0 bottom-0">
            {[1, 2, 3, 4, 5].map(layer => <div key={layer} className="h-12 border-b border-gray-200" style={{
            top: `${(layer - 1) * 48}px`
          }}>
                <div className="absolute left-0 w-8 h-full bg-gray-100 border-r flex items-center justify-center">
                  <Layers className="w-3 h-3 text-gray-600" />
                </div>
              </div>)}
          </div>

          {/* 节点 */}
          {nodes.map(node => <TimelineNode key={node.id} node={node} isSelected={selectedNode?.id === node.id} scale={scale} offset={offset} onClick={() => setSelectedNode(node)} onUpdate={updates => onNodeUpdate(node.id, updates)} onDelete={() => onNodeDelete(node.id)} />)}
        </div>
      </div>

      {/* 素材库 */}
      {showAssetLibrary && <div className="fixed inset-0 bg-black/50 z-50 flex">
          <div className="ml-auto">
            <EnhancedAssetLibrary onAssetSelect={handleAssetSelect} onClose={() => setShowAssetLibrary(false)} />
          </div>
        </div>}
    </div>;
}