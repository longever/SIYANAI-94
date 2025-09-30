// @ts-ignore;
import React, { useState, useEffect, useRef, useCallback } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Slider, Switch, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, Badge, Progress, Alert, AlertDescription, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, ScrollArea, Separator, useToast, TimelineNodeCard } from '@/components/ui';
// @ts-ignore;
import { Play, Pause, Square, RotateCcw, Download, Share2, Settings, Upload, Film, Music, Image as ImageIcon, Type, Sparkles, ChevronLeft, ChevronRight, Plus, Trash2, Copy, Eye, EyeOff, Volume2, VolumeX, Maximize2, Minimize2, Clock, CheckCircle, AlertCircle, Info, Zap, Layers, Palette, FileText, Video } from 'lucide-react';

import { NodeCard } from '@/components/NodeCard';
import { TimelineNode } from '@/components/TimelineNode';
import { NodePropertyPanel } from '@/components/NodePropertyPanel';
import { ScriptGenerator } from '@/components/ScriptGenerator';
import { EnhancedAssetLibrary } from '@/components/EnhancedAssetLibrary';
import { VideoPreviewWindow } from '@/components/VideoPreviewWindow';
import { ModeSelector } from '@/components/ModeSelector';
import { Text2VideoPanel } from '@/components/Text2VideoPanel';
import { Image2VideoPanel } from '@/components/Image2VideoPanel';
import { DigitalHumanPanel } from '@/components/DigitalHumanPanel';
import { AssetUploadDialog } from '@/components/AssetUploadDialog';
import { AssetGrid } from '@/components/AssetGrid';
import { AssetPreviewDialog } from '@/components/AssetPreviewDialog';
// 添加 formatTime 工具函数
const formatTime = seconds => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
// 辅助函数：从脚本生成节点
function generateNodesFromScript(script) {
  // 这里应该实现脚本解析逻辑
  // 暂时返回空数组
  return [];
}
export default function VideoCreatorPro(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();

  // 状态管理
  const [selectedMode, setSelectedMode] = useState('text2video');
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [assets, setAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [exportSettings, setExportSettings] = useState({
    resolution: '1920x1080',
    fps: 30,
    quality: 'high',
    format: 'mp4'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [projectName, setProjectName] = useState('未命名项目');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showScriptGenerator, setShowScriptGenerator] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [selectedTool, setSelectedTool] = useState('select');
  const [clipboard, setClipboard] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(10);
  const [autoSave, setAutoSave] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState(30000);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [renderQueue, setRenderQueue] = useState([]);
  const [activeTab, setActiveTab] = useState('timeline');
  const [showNodeEditor, setShowNodeEditor] = useState(false);
  const [nodeTemplates, setNodeTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [voiceSettings, setVoiceSettings] = useState({
    voice: 'zh-CN-XiaoxiaoNeural',
    speed: 1.0,
    pitch: 1.0,
    volume: 1.0
  });
  const [backgroundSettings, setBackgroundSettings] = useState({
    type: 'solid',
    color: '#000000',
    gradient: {
      from: '#000000',
      to: '#ffffff'
    },
    image: null,
    opacity: 1
  });
  const [textSettings, setTextSettings] = useState({
    font: 'Arial',
    size: 24,
    color: '#ffffff',
    align: 'center',
    weight: 'normal',
    style: 'normal',
    decoration: 'none'
  });
  const [imageSettings, setImageSettings] = useState({
    fit: 'cover',
    position: 'center',
    opacity: 1,
    borderRadius: 0,
    shadow: false
  });
  const [videoSettings, setVideoSettings] = useState({
    fit: 'cover',
    position: 'center',
    opacity: 1,
    volume: 1,
    loop: false,
    autoplay: true
  });
  const [digitalHumanSettings, setDigitalHumanSettings] = useState({
    model: 'default',
    expression: 'neutral',
    gesture: 'none',
    voiceSync: true,
    lipSync: true
  });

  // 自动保存
  useEffect(() => {
    if (autoSave) {
      const interval = setInterval(() => {
        saveProject();
      }, autoSaveInterval);
      return () => clearInterval(interval);
    }
  }, [autoSave, autoSaveInterval, nodes, projectName]);

  // 加载项目
  useEffect(() => {
    loadProject();
    loadAssets();
    loadTemplates();
  }, []);
  const loadProject = async () => {
    try {
      const savedProject = localStorage.getItem('currentProject');
      if (savedProject) {
        const project = JSON.parse(savedProject);
        setNodes(project.nodes || []);
        setProjectName(project.name || '未命名项目');
        setDuration(project.duration || 120);
        setCurrentTime(0);
        setLastSaved(new Date());
      }
    } catch (error) {
      toast({
        title: "加载项目失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const saveProject = async () => {
    try {
      setIsSaving(true);
      const project = {
        name: projectName,
        nodes,
        duration,
        exportSettings,
        voiceSettings,
        backgroundSettings,
        textSettings,
        imageSettings,
        videoSettings,
        digitalHumanSettings,
        lastSaved: new Date()
      };
      localStorage.setItem('currentProject', JSON.stringify(project));
      setLastSaved(new Date());

      // 保存到云端
      await $w.cloud.callDataSource({
        dataSourceName: 'video_node',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            name: projectName,
            nodes: JSON.stringify(nodes),
            duration,
            settings: JSON.stringify({
              export: exportSettings,
              voice: voiceSettings,
              background: backgroundSettings,
              text: textSettings,
              image: imageSettings,
              video: videoSettings,
              digitalHuman: digitalHumanSettings
            }),
            createdAt: new Date()
          }
        }
      });
      toast({
        title: "项目已保存",
        description: "项目已成功保存到云端"
      });
    } catch (error) {
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  const loadAssets = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 100,
          pageNumber: 1
        }
      });
      setAssets(result.records || []);
    } catch (error) {
      toast({
        title: "加载素材失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const loadTemplates = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'script_template',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 50,
          pageNumber: 1
        }
      });
      setNodeTemplates(result.records || []);
    } catch (error) {
      toast({
        title: "加载模板失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const addNode = (type, data = {}) => {
    const newNode = {
      id: Date.now().toString(),
      type,
      data: {
        ...data,
        startTime: currentTime,
        duration: 5,
        layer: 1,
        visible: true,
        locked: false
      },
      position: {
        x: 100,
        y: 100
      },
      size: {
        width: 200,
        height: 150
      }
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode);

    // 添加到历史记录
    addToHistory([...nodes, newNode]);
    toast({
      title: "节点已添加",
      description: `${type} 节点已添加到时间线`
    });
  };
  const updateNode = (nodeId, updates) => {
    setNodes(prev => prev.map(node => node.id === nodeId ? {
      ...node,
      ...updates
    } : node));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(prev => ({
        ...prev,
        ...updates
      }));
    }
  };
  const deleteNode = nodeId => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }

    // 添加到历史记录
    addToHistory(nodes.filter(node => node.id !== nodeId));
    toast({
      title: "节点已删除",
      description: "节点已从时间线中移除"
    });
  };
  const duplicateNode = nodeId => {
    const nodeToDuplicate = nodes.find(node => node.id === nodeId);
    if (nodeToDuplicate) {
      const newNode = {
        ...nodeToDuplicate,
        id: Date.now().toString(),
        data: {
          ...nodeToDuplicate.data,
          startTime: currentTime
        },
        position: {
          x: nodeToDuplicate.position.x + 20,
          y: nodeToDuplicate.position.y + 20
        }
      };
      setNodes(prev => [...prev, newNode]);
      setSelectedNode(newNode);

      // 添加到历史记录
      addToHistory([...nodes, newNode]);
      toast({
        title: "节点已复制",
        description: "节点已复制到时间线"
      });
    }
  };
  const addToHistory = newNodes => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newNodes);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setNodes(history[historyIndex - 1]);
    }
  };
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setNodes(history[historyIndex + 1]);
    }
  };
  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // 开始播放逻辑
      toast({
        title: "开始播放",
        description: "正在预览视频..."
      });
    }
  };
  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };
  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportProgress(0);

      // 模拟导出进度
      const interval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);

      // 调用云函数生成视频
      const result = await $w.cloud.callFunction({
        name: 'generateVideo',
        data: {
          nodes,
          settings: exportSettings,
          projectName
        }
      });
      if (result.success) {
        setPreviewUrl(result.videoUrl);
        setShowPreview(true);
        toast({
          title: "导出成功",
          description: "视频已生成并保存到云端"
        });
      }
    } catch (error) {
      toast({
        title: "导出失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };
  const handleShare = async () => {
    try {
      const shareData = {
        projectName,
        nodes: nodes.length,
        duration,
        previewUrl
      };

      // 保存分享信息
      await $w.cloud.callDataSource({
        dataSourceName: 'video_node',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            type: 'share',
            name: `${projectName}_share`,
            data: JSON.stringify(shareData),
            createdAt: new Date()
          }
        }
      });
      toast({
        title: "分享成功",
        description: "项目已生成分享链接"
      });

      // 复制分享链接到剪贴板
      const shareUrl = `${window.location.origin}/share/${Date.now()}`;
      navigator.clipboard.writeText(shareUrl);
    } catch (error) {
      toast({
        title: "分享失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleKeyPress = useCallback(e => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          saveProject();
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
        case 'c':
          if (selectedNode) {
            e.preventDefault();
            setClipboard(selectedNode);
          }
          break;
        case 'v':
          if (clipboard) {
            e.preventDefault();
            duplicateNode(clipboard.id);
          }
          break;
      }
    }
    if (e.key === ' ') {
      e.preventDefault();
      handlePlay();
    }
    if (e.key === 'Delete' && selectedNode) {
      deleteNode(selectedNode.id);
    }
  }, [selectedNode, clipboard, historyIndex]);
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
  const renderModePanel = () => {
    switch (selectedMode) {
      case 'text2video':
        return <Text2VideoPanel onAddNode={addNode} settings={textSettings} onSettingsChange={setTextSettings} />;
      case 'image2video':
        return <Image2VideoPanel onAddNode={addNode} settings={imageSettings} onSettingsChange={setImageSettings} assets={assets} />;
      case 'digitalHuman':
        return <DigitalHumanPanel onAddNode={addNode} settings={digitalHumanSettings} onSettingsChange={setDigitalHumanSettings} />;
      default:
        return null;
    }
  };
  return <div className="flex h-screen bg-gray-50">
      {/* 左侧工具栏 */}
      <div className="w-16 bg-white border-r flex flex-col items-center py-4 space-y-4">
        <Button variant="ghost" size="icon" onClick={() => setActiveTab('timeline')} className={activeTab === 'timeline' ? 'bg-blue-100 text-blue-600' : ''}>
          <Layers className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setActiveTab('assets')} className={activeTab === 'assets' ? 'bg-blue-100 text-blue-600' : ''}>
          <ImageIcon className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'bg-blue-100 text-blue-600' : ''}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* 左侧面板 */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{projectName}</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowNodeEditor(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsContent value="timeline" className="mt-0 flex-1">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                <ModeSelector selectedMode={selectedMode} onModeChange={setSelectedMode} />
                
                {renderModePanel()}

                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">时间线节点</h3>
                  <div className="space-y-2">
                    {nodes.map(node => <TimelineNode key={node.id} node={node} isSelected={selectedNode?.id === node.id} onSelect={() => setSelectedNode(node)} onUpdate={updates => updateNode(node.id, updates)} onDelete={() => deleteNode(node.id)} onDuplicate={() => duplicateNode(node.id)} />)}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="assets" className="mt-0 flex-1">
            <EnhancedAssetLibrary assets={assets} onAssetSelect={setSelectedAssets} onUpload={() => setShowUploadDialog(true)} />
          </TabsContent>

          <TabsContent value="settings" className="mt-0 flex-1">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                <div>
                  <Label>项目名称</Label>
                  <Input value={projectName} onChange={e => setProjectName(e.target.value)} className="mt-1" />
                </div>
                
                <div>
                  <Label>视频时长 (秒)</Label>
                  <Input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="mt-1" />
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">导出设置</h4>
                  <div className="space-y-2">
                    <div>
                      <Label>分辨率</Label>
                      <Select value={exportSettings.resolution} onValueChange={value => setExportSettings(prev => ({
                      ...prev,
                      resolution: value
                    }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3840x2160">4K (3840x2160)</SelectItem>
                          <SelectItem value="1920x1080">1080p (1920x1080)</SelectItem>
                          <SelectItem value="1280x720">720p (1280x720)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>帧率</Label>
                      <Select value={exportSettings.fps.toString()} onValueChange={value => setExportSettings(prev => ({
                      ...prev,
                      fps: Number(value)
                    }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="60">60 FPS</SelectItem>
                          <SelectItem value="30">30 FPS</SelectItem>
                          <SelectItem value="24">24 FPS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>质量</Label>
                      <Select value={exportSettings.quality} onValueChange={value => setExportSettings(prev => ({
                      ...prev,
                      quality: value
                    }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">高</SelectItem>
                          <SelectItem value="medium">中</SelectItem>
                          <SelectItem value="low">低</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* 主编辑区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏 */}
        <div className="h-14 bg-white border-b flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex <= 0}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
              <RotateCcw className="h-4 w-4 scale-x-[-1]" />
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button variant="ghost" size="sm" onClick={() => setShowGrid(!showGrid)} className={showGrid ? 'bg-gray-100' : ''}>
              <Layers className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSnapToGrid(!snapToGrid)} className={snapToGrid ? 'bg-gray-100' : ''}>
              <Zap className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={saveProject} disabled={isSaving}>
              {isSaving ? "保存中..." : "保存项目"}
            </Button>
            <Button variant="default" size="sm" onClick={handlePlay}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="default" size="sm" onClick={handleExport} disabled={isExporting}>
              {isExporting ? "导出中..." : "导出视频"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 预览区域 */}
        <div className="flex-1 bg-gray-100 relative">
          <VideoPreviewWindow nodes={nodes} currentTime={currentTime} isPlaying={isPlaying} onTimeUpdate={setCurrentTime} onPlay={handlePlay} onStop={handleStop} volume={volume} onVolumeChange={setVolume} isMuted={isMuted} onMuteChange={setIsMuted} isFullscreen={isFullscreen} onFullscreenChange={setIsFullscreen} backgroundSettings={backgroundSettings} />
          
          {isExporting && <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Card className="w-96">
                <CardHeader>
                  <CardTitle>正在导出视频</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={exportProgress} className="mb-2" />
                  <p className="text-sm text-gray-600 text-center">
                    {exportProgress}% 完成
                  </p>
                </CardContent>
              </Card>
            </div>}
        </div>

        {/* 时间线 */}
        <div className="h-48 bg-white border-t">
          <div className="h-full flex">
            <div className="w-48 border-r p-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">时间线</span>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => setTimelineZoom(Math.max(0.5, timelineZoom - 0.1))}>
                    <Minimize2 className="h-3 w-3" />
                  </Button>
                  <span className="text-xs px-1">{Math.round(timelineZoom * 100)}%</span>
                  <Button variant="ghost" size="sm" onClick={() => setTimelineZoom(Math.min(2, timelineZoom + 0.1))}>
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-gray-600">
                <div>总时长: {formatTime(duration)}</div>
                <div>当前: {formatTime(currentTime)}</div>
                <div>节点: {nodes.length}</div>
              </div>
            </div>
            
            <div className="flex-1 relative overflow-x-auto">
              <div className="h-full relative" style={{
              width: `${duration * 10 * timelineZoom}px`
            }}>
                {/* 时间标尺 */}
                <div className="absolute top-0 left-0 right-0 h-6 border-b bg-gray-50">
                  {Array.from({
                  length: Math.ceil(duration / 10)
                }).map((_, i) => <div key={i} className="absolute top-0 h-full border-r text-xs text-gray-600 flex items-center pl-1" style={{
                  left: `${i * 100 * timelineZoom}px`,
                  width: `${100 * timelineZoom}px`
                }}>
                      {formatTime(i * 10)}
                    </div>)}
                </div>
                
                {/* 播放头 */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{
                left: `${currentTime * 10 * timelineZoom}px`
              }} />
                
                {/* 节点轨道 */}
                <div className="absolute top-6 left-0 right-0 bottom-0">
                  {nodes.map(node => <TimelineNodeCard key={node.id} node={node} isSelected={selectedNode?.id === node.id} onSelect={() => setSelectedNode(node)} onUpdate={updates => updateNode(node.id, updates)} zoom={timelineZoom} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧属性面板 */}
      {selectedNode && <div className="w-80 bg-white border-l">
          <NodePropertyPanel node={selectedNode} onUpdate={updates => updateNode(selectedNode.id, updates)} onDelete={() => deleteNode(selectedNode.id)} onClose={() => setSelectedNode(null)} assets={assets} onAssetSelect={() => setShowAssetLibrary(true)} />
        </div>}

      {/* 素材上传对话框 */}
      <AssetUploadDialog open={showUploadDialog} onOpenChange={setShowUploadDialog} onUploadComplete={newAssets => {
      setAssets(prev => [...prev, ...newAssets]);
      setShowUploadDialog(false);
      toast({
        title: "上传成功",
        description: `${newAssets.length} 个素材已上传`
      });
    }} />

      {/* 素材库对话框 */}
      <Dialog open={showAssetLibrary} onOpenChange={setShowAssetLibrary}>
        <DialogContent className="max-w-6xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>素材库</DialogTitle>
          </DialogHeader>
          <AssetGrid assets={assets} onAssetSelect={asset => {
          setSelectedAssets([asset]);
          setShowAssetLibrary(false);
        }} onUpload={() => {
          setShowAssetLibrary(false);
          setShowUploadDialog(true);
        }} />
        </DialogContent>
      </Dialog>

      {/* 脚本生成器对话框 */}
      <ScriptGenerator open={showScriptGenerator} onOpenChange={setShowScriptGenerator} onGenerate={script => {
      setGeneratedScript(script);
      // 根据脚本生成节点
      const scriptNodes = generateNodesFromScript(script);
      setNodes(prev => [...prev, ...scriptNodes]);
      toast({
        title: "脚本已生成",
        description: `${scriptNodes.length} 个节点已添加到时间线`
      });
    }} templates={nodeTemplates} />

      {/* 节点编辑器对话框 */}
      <Dialog open={showNodeEditor} onOpenChange={setShowNodeEditor}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>节点模板库</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4">
            {nodeTemplates.map(template => <Card key={template._id} className="cursor-pointer hover:bg-gray-50" onClick={() => {
            const nodeData = JSON.parse(template.data || '{}');
            addNode(template.type, nodeData);
            setShowNodeEditor(false);
          }}>
                <CardHeader>
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-600">{template.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </DialogContent>
      </Dialog>

      {/* 预览对话框 */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>视频预览</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {previewUrl ? <video src={previewUrl} controls className="w-full h-full" autoPlay /> : <div className="flex items-center justify-center h-full text-white">
                暂无预览
              </div>}
          </div>
        </DialogContent>
      </Dialog>
    </div>;
}