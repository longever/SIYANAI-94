// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, useToast } from '@/components/ui';
// @ts-ignore;
import { Play, Pause, Trash2, Image, Music, Video, Plus, Settings, Download, Sparkles } from 'lucide-react';

import { EnhancedAssetLibrary } from '@/components/EnhancedAssetLibrary';
import { TimelineNodeCard } from '@/components/TimelineNodeCard';
import { NodeConfigurationModal } from '@/components/NodeConfigurationModal';
import { ScriptGeneratorModal } from '@/components/ScriptGeneratorModal';
import { VideoPreviewWindow } from '@/components/VideoPreviewWindow';
import { Text2VideoPanel } from '@/components/Text2VideoPanel';
import { Image2VideoPanel } from '@/components/Image2VideoPanel';
import { DigitalHumanPanel } from '@/components/DigitalHumanPanel';
export default function AIVideoCreator(props) {
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [isAssetLibraryOpen, setIsAssetLibraryOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('text2video');
  const [timelineNodes, setTimelineNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isNodeConfigOpen, setIsNodeConfigOpen] = useState(false);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [aiMode, setAiMode] = useState('creative');
  const {
    toast
  } = useToast();
  const videoRef = useRef(null);

  // 素材选择处理
  const handleAssetSelect = asset => {
    const newAsset = {
      ...asset,
      id: `asset_${Date.now()}`,
      selectedAt: new Date().toISOString()
    };
    setSelectedAssets(prev => [...prev, newAsset]);
    setIsAssetLibraryOpen(false);
    toast({
      title: '素材已添加',
      description: `${asset.name} 已添加到AI创作中心`
    });
  };

  // 移除素材
  const handleRemoveAsset = assetId => {
    setSelectedAssets(prev => prev.filter(asset => asset.id !== assetId));
    toast({
      title: '素材已移除',
      description: '素材已从AI创作中心移除'
    });
  };

  // 素材预览组件
  const AssetPreview = ({
    asset
  }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const mediaRef = useRef(null);
    const handlePlayPause = e => {
      e.stopPropagation();
      if (mediaRef.current) {
        if (isPlaying) {
          mediaRef.current.pause();
        } else {
          mediaRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    };
    const formatTime = time => {
      if (!time || isNaN(time)) return '0:00';
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    return <div className="relative group bg-white rounded-lg border p-3 hover:shadow-md transition-all">
        <div className="aspect-video bg-gray-100 rounded-md overflow-hidden mb-2">
          {asset.type === 'image' && asset.thumbnail && <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" />}
          
          {asset.type === 'video' && asset.thumbnail && <div className="relative w-full h-full">
              <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white" onClick={handlePlayPause}>
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </Button>
              </div>
              <video ref={mediaRef} src={asset.downloadUrl} className="hidden" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
            </div>}
          
          {asset.type === 'audio' && <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
              <div className="text-center text-white">
                <Music className="w-8 h-8 mx-auto mb-1" />
                <p className="text-xs font-medium truncate">{asset.name}</p>
              </div>
              <audio ref={mediaRef} src={asset.downloadUrl} className="hidden" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
            </div>}
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium truncate">{asset.name}</p>
          <p className="text-xs text-gray-500 capitalize">{asset.type} • {asset.size}</p>
        </div>
        
        <Button size="sm" variant="ghost" className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-md" onClick={() => handleRemoveAsset(asset.id)}>
          <Trash2 size={14} />
        </Button>
      </div>;
  };

  // 时间轴操作
  const handleAddNode = (type, asset) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type,
      asset,
      startTime: currentTime,
      duration: asset.type === 'video' ? asset.duration || 5 : 3,
      properties: {
        aiMode,
        prompt: '',
        style: 'cinematic'
      }
    };
    setTimelineNodes(prev => [...prev, newNode]);
    toast({
      title: 'AI节点已添加',
      description: `${type} 节点已添加到AI时间轴`
    });
  };
  const handleDeleteNode = nodeId => {
    setTimelineNodes(prev => prev.filter(node => node.id !== nodeId));
  };
  const handleUpdateNode = (nodeId, updates) => {
    setTimelineNodes(prev => prev.map(node => node.id === nodeId ? {
      ...node,
      ...updates
    } : node));
  };

  // 预览控制
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  const handleGenerateVideo = async () => {
    try {
      const response = await props.$w.cloud.callFunction({
        name: 'generateVideo',
        data: {
          nodes: timelineNodes,
          assets: selectedAssets,
          aiMode,
          prompt: 'AI生成的视频内容'
        }
      });
      toast({
        title: 'AI生成成功',
        description: 'AI视频已生成，正在下载...'
      });
      if (response.downloadUrl) {
        window.open(response.downloadUrl, '_blank');
      }
    } catch (error) {
      toast({
        title: 'AI生成失败',
        description: error.message || 'AI视频生成失败，请稍后重试',
        variant: 'destructive'
      });
    }
  };
  const formatTime = time => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  return <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      {/* 顶部AI工具栏 */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI视频创作中心
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" onClick={() => setIsAssetLibraryOpen(true)} className="border-purple-200 text-purple-600 hover:bg-purple-50">
              <Plus className="w-4 h-4 mr-2" />
              添加AI素材
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsScriptModalOpen(true)} className="border-purple-200 text-purple-600 hover:bg-purple-50">
              <Sparkles className="w-4 h-4 mr-2" />
              AI脚本生成
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white" onClick={handleGenerateVideo}>
              <Download className="w-4 h-4 mr-2" />
              AI生成视频
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost" onClick={handlePlayPause}>
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <span className="text-sm text-gray-600">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧AI素材预览区 */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
            <h2 className="font-semibold text-sm text-purple-800">AI素材库</h2>
            <p className="text-xs text-purple-600 mt-1">
              {selectedAssets.length} 个AI素材
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {selectedAssets.length === 0 ? <div className="text-center py-8">
                <div className="text-purple-300 mb-2">
                  <Image className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-sm text-gray-500 mb-2">暂无AI素材</p>
                <Button size="sm" variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50" onClick={() => setIsAssetLibraryOpen(true)}>
                  添加AI素材
                </Button>
              </div> : <div className="grid grid-cols-1 gap-3">
                {selectedAssets.map(asset => <AssetPreview key={asset.id} asset={asset} />)}
              </div>}
          </div>
        </div>

        {/* 中间主工作区 */}
        <div className="flex-1 flex flex-col">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1">
            <TabsList className="w-full justify-start rounded-none border-b bg-white">
              <TabsTrigger value="text2video" className="data-[state=active]:text-purple-600">
                文本生视频
              </TabsTrigger>
              <TabsTrigger value="image2video" className="data-[state=active]:text-purple-600">
                图片生视频
              </TabsTrigger>
              <TabsTrigger value="digitalhuman" className="data-[state=active]:text-purple-600">
                数字人
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:text-purple-600">
                AI时间轴
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="text2video" className="flex-1 p-0 m-0">
              <Text2VideoPanel selectedAssets={selectedAssets} onAddNode={handleAddNode} aiMode={aiMode} onAiModeChange={setAiMode} />
            </TabsContent>
            
            <TabsContent value="image2video" className="flex-1 p-0 m-0">
              <Image2VideoPanel selectedAssets={selectedAssets} onAddNode={handleAddNode} aiMode={aiMode} />
            </TabsContent>
            
            <TabsContent value="digitalhuman" className="flex-1 p-0 m-0">
              <DigitalHumanPanel selectedAssets={selectedAssets} onAddNode={handleAddNode} aiMode={aiMode} />
            </TabsContent>
            
            <TabsContent value="timeline" className="flex-1 p-0 m-0">
              <div className="h-full flex">
                <div className="flex-1 p-4">
                  <TimelineNodeCard nodes={timelineNodes} onDeleteNode={handleDeleteNode} onUpdateNode={handleUpdateNode} onAddNode={handleAddNode} selectedAssets={selectedAssets} onNodeClick={setSelectedNode} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* 右侧AI预览窗口 */}
        <div className="w-96 bg-white border-l">
          <VideoPreviewWindow ref={videoRef} nodes={timelineNodes} isPlaying={isPlaying} currentTime={currentTime} onTimeUpdate={setCurrentTime} onDurationChange={setDuration} aiMode={aiMode} />
        </div>
      </div>

      {/* 素材库弹窗 */}
      <EnhancedAssetLibrary open={isAssetLibraryOpen} onOpenChange={setIsAssetLibraryOpen} onAssetSelect={handleAssetSelect} $w={props.$w} />

      {/* 节点配置弹窗 */}
      <NodeConfigurationModal open={isNodeConfigOpen} onOpenChange={setIsNodeConfigOpen} node={selectedNode} onUpdateNode={handleUpdateNode} availableAssets={selectedAssets} />

      {/* AI脚本生成弹窗 */}
      <ScriptGeneratorModal open={isScriptModalOpen} onOpenChange={setIsScriptModalOpen} onGenerateScript={script => {
      // 处理生成的脚本
      toast({
        title: 'AI脚本已生成',
        description: '脚本已应用到创作中心'
      });
    }} />
    </div>;
}