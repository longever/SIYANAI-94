// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, useToast } from '@/components/ui';
// @ts-ignore;
import { Play, Pause, Trash2, Image, Music, Video, Plus, Settings, Download } from 'lucide-react';

import { AssetLibrary } from '@/components/AssetLibrary';
import { TimelineNode } from '@/components/TimelineNode';
import { NodeEditor } from '@/components/NodeEditor';
import { PreviewWindow } from '@/components/PreviewWindow';
import { PropertyPanel } from '@/components/PropertyPanel';
export default function VideoCreatorPro(props) {
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [isAssetLibraryOpen, setIsAssetLibraryOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('timeline');
  const [timelineNodes, setTimelineNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
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
      description: `${asset.name} 已添加到创作中心`
    });
  };

  // 移除素材
  const handleRemoveAsset = assetId => {
    setSelectedAssets(prev => prev.filter(asset => asset.id !== assetId));
    toast({
      title: '素材已移除',
      description: '素材已从创作中心移除'
    });
  };

  // 素材预览组件
  const AssetPreview = ({
    asset
  }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const mediaRef = useRef(null);
    const handlePlayPause = () => {
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
    return <div className="relative group">
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
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
                <Music className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium">{asset.name}</p>
                <audio ref={mediaRef} src={asset.downloadUrl} className="hidden" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white" onClick={handlePlayPause}>
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </Button>
              </div>
            </div>}
        </div>
        
        <div className="mt-2">
          <p className="text-sm font-medium truncate">{asset.name}</p>
          <p className="text-xs text-gray-500 capitalize">{asset.type}</p>
        </div>
        
        <Button size="sm" variant="ghost" className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveAsset(asset.id)}>
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
      properties: {}
    };
    setTimelineNodes(prev => [...prev, newNode]);
    toast({
      title: '节点已添加',
      description: `${type} 节点已添加到时间轴`
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
  const handleExport = async () => {
    try {
      const response = await props.$w.cloud.callFunction({
        name: 'generateVideo',
        data: {
          nodes: timelineNodes,
          assets: selectedAssets
        }
      });
      toast({
        title: '导出成功',
        description: '视频已生成，正在下载...'
      });

      // 触发下载
      if (response.downloadUrl) {
        window.open(response.downloadUrl, '_blank');
      }
    } catch (error) {
      toast({
        title: '导出失败',
        description: error.message || '视频生成失败，请稍后重试',
        variant: 'destructive'
      });
    }
  };
  return <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">视频创作中心 Pro</h1>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" onClick={() => setIsAssetLibraryOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              添加素材
            </Button>
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出视频
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
        {/* 左侧素材预览区 */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-sm">已选素材</h2>
            <p className="text-xs text-gray-500 mt-1">
              {selectedAssets.length} 个素材
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {selectedAssets.length === 0 ? <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <Image className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-sm text-gray-500">暂无素材</p>
                <Button size="sm" variant="outline" className="mt-2" onClick={() => setIsAssetLibraryOpen(true)}>
                  添加素材
                </Button>
              </div> : <div className="grid grid-cols-2 gap-3">
                {selectedAssets.map(asset => <AssetPreview key={asset.id} asset={asset} />)}
              </div>}
          </div>
        </div>

        {/* 中间主工作区 */}
        <div className="flex-1 flex flex-col">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1">
            <TabsList className="w-full justify-start rounded-none border-b">
              <TabsTrigger value="timeline">时间轴</TabsTrigger>
              <TabsTrigger value="preview">预览</TabsTrigger>
              <TabsTrigger value="properties">属性</TabsTrigger>
            </TabsList>
            
            <TabsContent value="timeline" className="flex-1 p-0 m-0">
              <div className="h-full flex">
                <div className="flex-1 p-4">
                  <TimelineNode nodes={timelineNodes} onDeleteNode={handleDeleteNode} onUpdateNode={handleUpdateNode} onAddNode={handleAddNode} selectedAssets={selectedAssets} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="flex-1 p-0 m-0">
              <PreviewWindow ref={videoRef} nodes={timelineNodes} isPlaying={isPlaying} currentTime={currentTime} onTimeUpdate={setCurrentTime} onDurationChange={setDuration} />
            </TabsContent>
            
            <TabsContent value="properties" className="flex-1 p-4">
              <PropertyPanel selectedNode={selectedNode} onUpdateNode={handleUpdateNode} />
            </TabsContent>
          </Tabs>
        </div>

        {/* 右侧节点编辑器 */}
        <div className="w-80 bg-white border-l">
          <NodeEditor selectedNode={selectedNode} onUpdateNode={handleUpdateNode} availableAssets={selectedAssets} />
        </div>
      </div>

      {/* 素材库弹窗 */}
      <AssetLibrary open={isAssetLibraryOpen} onOpenChange={setIsAssetLibraryOpen} onAssetSelect={handleAssetSelect} $w={props.$w} />
    </div>;
}