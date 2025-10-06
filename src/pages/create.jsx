// @ts-ignore;
import React, { useState, useRef, useEffect } from 'react';
// @ts-ignore;
import { ChevronLeft, Play, Pause, SkipBack, SkipForward, Volume2, Maximize2, Film, Image as ImageIcon, Music, Layers, Settings, Save, Download, Upload } from 'lucide-react';
// @ts-ignore;
import { Button, Slider, Tabs, TabsContent, TabsList, TabsTrigger, Card, Badge, useToast } from '@/components/ui';

import { EnhancedAssetLibrary } from '@/components/EnhancedAssetLibrary';
import { AssetSelector } from '@/components/AssetSelector';
import { TimelineNode } from '@/components/TimelineNode';
import { VideoPreview } from '@/components/VideoPreview';
import { PropertyPanel } from '@/components/PropertyPanel';
export default function CreatePage(props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120);
  const [volume, setVolume] = useState(75);
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const [timelineNodes, setTimelineNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [currentEditType, setCurrentEditType] = useState('video');
  const {
    toast
  } = useToast();
  const handleAssetSelect = asset => {
    const newNode = {
      id: Date.now().toString(),
      type: asset.type,
      name: asset.name,
      url: asset.url,
      duration: asset.duration || 5,
      startTime: currentTime,
      endTime: currentTime + (asset.duration || 5),
      properties: {
        position: {
          x: 0,
          y: 0
        },
        scale: 1,
        opacity: 1,
        rotation: 0
      }
    };
    setTimelineNodes([...timelineNodes, newNode]);
    setSelectedNode(newNode);
    toast({
      title: "素材已添加",
      description: `${asset.name} 已添加到时间轴`
    });
  };
  const handleNodeUpdate = (nodeId, updates) => {
    setTimelineNodes(nodes => nodes.map(node => node.id === nodeId ? {
      ...node,
      ...updates
    } : node));
  };
  const handleNodeDelete = nodeId => {
    setTimelineNodes(nodes => nodes.filter(node => node.id !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };
  return <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => props.$w.utils.navigateBack()}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            返回
          </Button>
          <h1 className="text-lg font-semibold">视频创作</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Save className="w-4 h-4 mr-1" />
            保存草稿
          </Button>
          <Button size="sm">
            <Download className="w-4 h-4 mr-1" />
            导出
          </Button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Left Sidebar - Tools */}
        <aside className="w-16 border-r flex flex-col items-center py-4 space-y-2">
          <Button variant="ghost" size="sm" className="w-10 h-10" onClick={() => setShowAssetLibrary(true)}>
            <Layers className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10">
            <Film className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10">
            <ImageIcon className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10">
            <Music className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10">
            <Settings className="w-5 h-5" />
          </Button>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Preview Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 bg-muted flex items-center justify-center relative">
              <VideoPreview nodes={timelineNodes} currentTime={currentTime} isPlaying={isPlaying} />
              
              {/* Playback Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur rounded-lg p-2 flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setCurrentTime(0)}>
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setCurrentTime(duration)}>
                  <SkipForward className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center space-x-2 ml-4">
                  <span className="text-sm">{Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}</span>
                  <Slider value={[currentTime]} max={duration} step={0.1} className="w-32" onValueChange={([value]) => setCurrentTime(value)} />
                  <span className="text-sm">{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</span>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Volume2 className="w-4 h-4" />
                  <Slider value={[volume]} max={100} step={1} className="w-20" onValueChange={([value]) => setVolume(value)} />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="h-48 border-t bg-background">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">时间轴</h3>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      <Maximize2 className="w-3 h-3 mr-1" />
                      适应
                    </Button>
                  </div>
                </div>
                
                <div className="relative h-24 bg-muted rounded overflow-hidden">
                  {timelineNodes.map(node => <TimelineNode key={node.id} node={node} isSelected={selectedNode?.id === node.id} onClick={() => setSelectedNode(node)} onUpdate={handleNodeUpdate} onDelete={handleNodeDelete} />)}
                  
                  {/* Playhead */}
                  <div className="absolute top-0 bottom-0 w-0.5 bg-primary" style={{
                  left: `${currentTime / duration * 100}%`
                }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Properties */}
          {selectedNode && <aside className="w-80 border-l">
              <PropertyPanel node={selectedNode} onUpdate={updates => handleNodeUpdate(selectedNode.id, updates)} />
            </aside>}
        </div>
      </div>

      {/* Asset Library Sidebar */}
      {showAssetLibrary && <AssetSelector onAssetSelect={handleAssetSelect} onClose={() => setShowAssetLibrary(false)} />}
    </div>;
}