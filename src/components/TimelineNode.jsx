// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, Slider, Button } from '@/components/ui';
// @ts-ignore;
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

export function TimelineNode({
  nodes,
  currentTime,
  duration,
  onTimeChange,
  onNodeSelect
}) {
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const handleNodeClick = (node, event) => {
    event.stopPropagation();
    onNodeSelect(node);
  };
  return <div className="h-full">
      <div className="flex items-center space-x-4 mb-3">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <SkipBack className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Play className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <SkipForward className="w-3 h-3" />
          </Button>
        </div>
        
        <div className="flex-1">
          <Slider value={[currentTime]} onValueChange={([value]) => onTimeChange(value)} min={0} max={duration} step={0.1} className="w-full" />
        </div>
        
        <div className="text-xs text-gray-400">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <div className="relative h-20 bg-gray-800 rounded-lg overflow-hidden">
        {/* 时间轴轨道 */}
        <div className="absolute inset-0 flex items-center">
          {Array.from({
          length: Math.floor(duration) + 1
        }).map((_, i) => <div key={i} className="absolute h-full border-l border-gray-700" style={{
          left: `${i / duration * 100}%`
        }} />)}
        </div>

        {/* 节点时间块 */}
        {nodes.map(node => <div key={node.id} className="absolute h-12 bg-blue-600 rounded cursor-pointer hover:bg-blue-500 transition-colors" style={{
        left: `${node.startTime / duration * 100}%`,
        width: `${node.data.duration / duration * 100}%`,
        top: '50%',
        transform: 'translateY(-50%)'
      }} onClick={e => handleNodeClick(node, e)}>
            <div className="px-2 py-1 text-xs text-white truncate">
              {node.data.name || node.type}
            </div>
          </div>)}

        {/* 当前时间指示器 */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-red-500" style={{
        left: `${currentTime / duration * 100}%`
      }} />
      </div>
    </div>;
}