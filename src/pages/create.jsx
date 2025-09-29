// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, ScrollArea, Separator, Badge, Slider, Switch, Label, Textarea, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, useToast } from '@/components/ui';
// @ts-ignore;
import { Play, Pause, Square, Download, Share2, Settings, Film, Image, Type, Bot, Plus, Trash2, Copy, Layers, Clock, Eye, EyeOff, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';

import { NodeEditor } from '@/components/NodeEditor';
import { AssetLibrary } from '@/components/AssetLibrary';
import { PropertyPanel } from '@/components/PropertyPanel';
import { PreviewWindow } from '@/components/PreviewWindow';
import { TimelineNode } from '@/components/TimelineNode';
export default function CreatePage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [selectedMode, setSelectedMode] = useState('text2video');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [showPreview, setShowPreview] = useState(true);
  const [showTimeline, setShowTimeline] = useState(true);
  const [projectName, setProjectName] = useState('未命名项目');
  const [isSaving, setIsSaving] = useState(false);
  const modes = [{
    id: 'text2video',
    name: '文本转视频',
    icon: Type,
    color: 'text-blue-400'
  }, {
    id: 'image2video',
    name: '图片转视频',
    icon: Image,
    color: 'text-purple-400'
  }, {
    id: 'digitalHuman',
    name: '数字人视频',
    icon: Bot,
    color: 'text-green-400'
  }];
  const handleSaveProject = async () => {
    setIsSaving(true);
    try {
      // 模拟保存项目
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: '项目已保存',
        description: '您的创作项目已成功保存到云端'
      });
    } catch (error) {
      toast({
        title: '保存失败',
        description: '请检查网络连接后重试',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  const handleExport = async () => {
    try {
      // 跳转到导出分享页面
      $w.utils.navigateTo({
        pageId: 'export-share',
        params: {
          projectId: 'current'
        }
      });
    } catch (error) {
      toast({
        title: '导出失败',
        description: '无法跳转到导出页面',
        variant: 'destructive'
      });
    }
  };
  const handleAddNode = type => {
    const newNode = {
      id: Date.now().toString(),
      type,
      position: {
        x: 200,
        y: 200
      },
      data: {
        duration: 5,
        content: ''
      },
      startTime: currentTime
    };
    setNodes([...nodes, newNode]);
  };
  const handleDeleteNode = nodeId => {
    setNodes(nodes.filter(node => node.id !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };
  const handleNodeUpdate = (nodeId, updates) => {
    setNodes(nodes.map(node => node.id === nodeId ? {
      ...node,
      ...updates
    } : node));
  };
  return <div className="h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* 顶部导航栏 */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            专业视频创作中心
          </h1>
          <Input value={projectName} onChange={e => setProjectName(e.target.value)} className="bg-gray-800 border-gray-700 text-sm w-48" placeholder="项目名称" />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={handleSaveProject} disabled={isSaving} className="hover:bg-gray-800">
            {isSaving ? '保存中...' : '保存项目'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="bg-blue-600 hover:bg-blue-700 border-blue-600">
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
          <Button variant="ghost" size="sm" className="hover:bg-gray-800">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧工具栏 */}
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-400 mb-3">创作模式</h2>
            <div className="space-y-2">
              {modes.map(mode => <button key={mode.id} onClick={() => setSelectedMode(mode.id)} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${selectedMode === mode.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-300'}`}>
                  <mode.icon className={`w-4 h-4 ${mode.color}`} />
                  <span className="text-sm">{mode.name}</span>
                </button>)}
            </div>
          </div>

          <Separator className="bg-gray-800" />

          <div className="flex-1 overflow-hidden">
            <AssetLibrary />
          </div>
        </aside>

        {/* 中央画布区域 */}
        <main className="flex-1 flex flex-col bg-gray-950">
          <div className="flex-1 flex">
            {/* 节点编辑区域 */}
            <div className="flex-1 relative">
              <NodeEditor nodes={nodes} selectedNode={selectedNode} onNodeSelect={setSelectedNode} onNodeUpdate={handleNodeUpdate} onNodeDelete={handleDeleteNode} mode={selectedMode} />
              
              {/* 快速添加节点按钮 */}
              <div className="absolute bottom-4 left-4 flex space-x-2">
                <Button size="sm" variant="secondary" onClick={() => handleAddNode('text')} className="bg-gray-800 hover:bg-gray-700">
                  <Plus className="w-4 h-4 mr-1" />
                  文本
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleAddNode('image')} className="bg-gray-800 hover:bg-gray-700">
                  <Plus className="w-4 h-4 mr-1" />
                  图片
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleAddNode('video')} className="bg-gray-800 hover:bg-gray-700">
                  <Plus className="w-4 h-4 mr-1" />
                  视频
                </Button>
              </div>
            </div>

            {/* 右侧属性面板 */}
            {showPreview && <aside className="w-80 bg-gray-900 border-l border-gray-800">
                <div className="p-4 border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">预览与属性</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)} className="h-6 w-6 p-0">
                      <Minimize2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="flex-1">
                  <PreviewWindow mode={selectedMode} nodes={nodes} isPlaying={isPlaying} currentTime={currentTime} />
                  
                  <PropertyPanel selectedNode={selectedNode} onNodeUpdate={handleNodeUpdate} mode={selectedMode} />
                </ScrollArea>
              </aside>}
          </div>

          {/* 底部时间轴 */}
          {showTimeline && <div className="h-48 bg-gray-900 border-t border-gray-800">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">时间轴</h3>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsPlaying(!isPlaying)} className="h-8 w-8 p-0">
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowTimeline(false)} className="h-8 w-8 p-0">
                      <Minimize2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <TimelineNode nodes={nodes} currentTime={currentTime} duration={duration} onTimeChange={setCurrentTime} onNodeSelect={setSelectedNode} />
              </div>
            </div>}
        </main>
      </div>

      {/* 浮动控制按钮 */}
      <div className="fixed bottom-4 right-4 flex flex-col space-y-2">
        {!showPreview && <Button size="sm" variant="secondary" onClick={() => setShowPreview(true)} className="bg-gray-800 hover:bg-gray-700">
            <Eye className="w-4 h-4" />
          </Button>}
        {!showTimeline && <Button size="sm" variant="secondary" onClick={() => setShowTimeline(true)} className="bg-gray-800 hover:bg-gray-700">
            <Layers className="w-4 h-4" />
          </Button>}
      </div>
    </div>;
}