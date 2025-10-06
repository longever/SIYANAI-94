// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ChevronLeft, Play, Pause, SkipBack, SkipForward, Volume2, Layers, Save, Download, Settings, Maximize2 } from 'lucide-react';
// @ts-ignore;
import { Button, Slider, Card, Badge, useToast } from '@/components/ui';

import { AssetSelector } from '@/components/AssetSelector';
import { AdvancedTimeline } from '@/components/AdvancedTimeline';
import { DigitalHumanPanel } from '@/components/DigitalHumanPanel';
import { ExportConfigPanel } from '@/components/ExportConfigPanel';
import { VideoPreview } from '@/components/VideoPreview';
import { NodeEditor } from '@/components/NodeEditor';
export default function VideoCreatorProPage(props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120);
  const [volume, setVolume] = useState(75);
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const [activePanel, setActivePanel] = useState('timeline');
  const [project, setProject] = useState({
    id: null,
    title: '未命名项目',
    nodes: [],
    settings: {
      resolution: '1920x1080',
      fps: 30,
      quality: 'high'
    }
  });
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
    setProject(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
    setShowAssetLibrary(false);
    toast({
      title: "素材已添加",
      description: `${asset.name} 已添加到时间轴`
    });
  };
  const handleNodeUpdate = (nodeId, updates) => {
    setProject(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => node.id === nodeId ? {
        ...node,
        ...updates
      } : node)
    }));
  };
  const handleNodeDelete = nodeId => {
    setProject(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId)
    }));
  };
  const handleExport = async () => {
    try {
      const result = await $w.cloud.callFunction({
        name: 'generateVideo',
        data: {
          action: 'exportProject',
          project: project
        }
      });
      toast({
        title: "导出成功",
        description: "视频已导出完成"
      });
    } catch (error) {
      toast({
        title: "导出失败",
        description: error.message || "视频导出失败",
        variant: "destructive"
      });
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
          <h1 className="text-lg font-semibold">{project.title}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Save className="w-4 h-4 mr-1" />
            保存
          </Button>
          <Button size="sm" onClick={handleExport}>
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
          <Button variant={activePanel === 'timeline' ? 'default' : 'ghost'} size="sm" className="w-10 h-10" onClick={() => setActivePanel('timeline')}>
            <Play className="w-5 h-5" />
          </Button>
          <Button variant={activePanel === 'digital-human' ? 'default' : 'ghost'} size="sm" className="w-10 h-10" onClick={() => setActivePanel('digital-human')}>
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant={activePanel === 'export' ? 'default' : 'ghost'} size="sm" className="w-10 h-10" onClick={() => setActivePanel('export')}>
            <Download className="w-5 h-5" />
          </Button>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Preview Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 bg-muted flex items-center justify-center relative">
              <VideoPreview nodes={project.nodes} currentTime={currentTime} isPlaying={isPlaying} settings={project.settings} />
              
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

            {/* Bottom Panel */}
            <div className="h-64 border-t">
              {activePanel === 'timeline' && <AdvancedTimeline nodes={project.nodes} currentTime={currentTime} duration={duration} onNodeUpdate={handleNodeUpdate} onNodeDelete={handleNodeDelete} onTimeChange={setCurrentTime} />}
              
              {activePanel === 'digital-human' && <DigitalHumanPanel project={project} onUpdate={updates => setProject(prev => ({
              ...prev,
              ...updates
            }))} />}
              
              {activePanel === 'export' && <ExportConfigPanel project={project} onUpdate={updates => setProject(prev => ({
              ...prev,
              ...updates
            }))} />}
            </div>
          </div>

          {/* Right Sidebar - Node Editor */}
          {project.nodes.length > 0 && <aside className="w-80 border-l">
              <NodeEditor nodes={project.nodes} selectedNode={project.nodes.find(n => n.startTime <= currentTime && n.endTime >= currentTime)} onNodeUpdate={handleNodeUpdate} />
            </aside>}
        </div>
      </div>

      {/* Asset Library */}
      {showAssetLibrary && <div className="fixed inset-0 bg-black/50 z-50 flex">
          <div className="ml-auto">
            <AssetSelector onAssetSelect={handleAssetSelect} onClose={() => setShowAssetLibrary(false)} />
          </div>
        </div>}
    </div>;
}