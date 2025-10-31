// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger, ScrollArea, Collapsible, CollapsibleContent, CollapsibleTrigger, Badge, Slider, Textarea, useToast } from '@/components/ui';
// @ts-ignore;
import { Plus, Trash2, Settings, Play, Pause, Download, Upload, ChevronDown, ChevronUp, Clock, Film, Image, Mic, Sparkles, Save, Eye, EyeOff, Move, Copy } from 'lucide-react';

import { ScriptGenerator } from '@/components/ScriptGenerator';
import { AssetLibrary } from '@/components/AssetLibrary';
import { NodeConfigurationModal } from '@/components/NodeConfigurationModal';
export default function CreatePage(props) {
  const {
    $w
  } = props;
  const [videoName, setVideoName] = useState('未命名视频');
  const [totalDuration, setTotalDuration] = useState(60);
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const [assetLibraryTarget, setAssetLibraryTarget] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState({});
  const {
    toast
  } = useToast();

  // 加载脚本模板
  useEffect(() => {
    loadTemplates();
  }, []);
  const loadTemplates = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'script_template',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: true
        }
      });
      setTemplates(result.records || []);
    } catch (error) {
      console.error('加载模板失败:', error);
    }
  };

  // 添加新节点
  const addNode = (type = 'text2video', position = nodes.length) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: type,
      title: `节点 ${nodes.length + 1}`,
      content: '',
      duration: 5,
      provider: 'tongyi',
      shotType: 'medium',
      transition: 'fade',
      colorStyle: 'natural',
      assets: {
        image: null,
        audio: null,
        subtitle: null
      },
      customParams: {},
      position: position,
      isExpanded: true
    };
    const newNodes = [...nodes];
    newNodes.splice(position, 0, newNode);
    setNodes(newNodes);
    setSelectedNode(newNode);
  };

  // 删除节点
  const deleteNode = nodeId => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  // 更新节点
  const updateNode = (nodeId, updates) => {
    setNodes(nodes.map(n => n.id === nodeId ? {
      ...n,
      ...updates
    } : n));
    if (selectedNode?.id === nodeId) {
      setSelectedNode({
        ...selectedNode,
        ...updates
      });
    }
  };

  // 移动节点
  const moveNode = (fromIndex, toIndex) => {
    const newNodes = [...nodes];
    const [movedNode] = newNodes.splice(fromIndex, 1);
    newNodes.splice(toIndex, 0, movedNode);
    setNodes(newNodes);
  };

  // 复制节点
  const duplicateNode = nodeId => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const newNode = {
        ...node,
        id: `node-${Date.now()}`,
        title: `${node.title} 副本`,
        position: node.position + 1
      };
      const newNodes = [...nodes];
      newNodes.splice(node.position + 1, 0, newNode);
      setNodes(newNodes);
    }
  };

  // 选择模板
  const selectTemplate = async template => {
    setSelectedTemplate(template);
    if (template.nodes) {
      const newNodes = template.nodes.map((node, index) => ({
        ...node,
        id: `node-${Date.now()}-${index}`,
        position: index
      }));
      setNodes(newNodes);
      toast({
        title: "模板已应用",
        description: `已加载 ${template.name} 模板，共 ${newNodes.length} 个节点`
      });
    }
  };

  // 生成脚本
  const handleScriptGenerate = segments => {
    const newNodes = segments.map((segment, index) => ({
      id: segment.id,
      type: segment.type,
      title: segment.title,
      content: segment.description,
      duration: segment.duration,
      provider: segment.provider,
      shotType: segment.cameraAngle,
      transition: segment.transition,
      colorStyle: segment.colorStyle,
      assets: segment.assets,
      customParams: {},
      position: index
    }));
    setNodes(newNodes);
    toast({
      title: "脚本已生成",
      description: `已生成 ${newNodes.length} 个节点`
    });
  };

  // 选择素材
  const handleAssetSelect = asset => {
    if (assetLibraryTarget) {
      const [nodeId, assetType] = assetLibraryTarget.split('-');
      updateNode(nodeId, {
        assets: {
          ...nodes.find(n => n.id === nodeId)?.assets,
          [assetType]: asset
        }
      });
      setShowAssetLibrary(false);
      setAssetLibraryTarget(null);
    }
  };

  // 生成视频
  const generateVideo = async () => {
    if (nodes.length === 0) {
      toast({
        title: "无法生成",
        description: "请先添加视频节点",
        variant: "destructive"
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await $w.cloud.callFunction({
        name: 'generateVideo',
        data: {
          videoName,
          totalDuration,
          nodes: nodes.map(node => ({
            ...node,
            assets: Object.fromEntries(Object.entries(node.assets).filter(([_, v]) => v !== null))
          }))
        }
      });
      toast({
        title: "视频生成成功",
        description: "视频正在后台处理中，请稍后查看"
      });

      // 跳转到导出分享页面
      $w.utils.navigateTo({
        pageId: 'export-share',
        params: {
          projectId: result.projectId
        }
      });
    } catch (error) {
      toast({
        title: "生成失败",
        description: error.message || "视频生成过程中出现错误",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 计算总时长
  useEffect(() => {
    const total = nodes.reduce((sum, node) => sum + (node.duration || 5), 0);
    setTotalDuration(total);
  }, [nodes]);
  const getNodeIcon = type => {
    switch (type) {
      case 'text2video':
        return <Sparkles className="w-4 h-4" />;
      case 'image2video':
        return <Image className="w-4 h-4" />;
      case 'digital_human':
        return <Mic className="w-4 h-4" />;
      default:
        return <Film className="w-4 h-4" />;
    }
  };
  const getProviderName = provider => {
    const providers = {
      tongyi: '阿里云通义万相',
      digital_human: '数字人API',
      minmax: 'MinMax',
      keling: '可灵'
    };
    return providers[provider] || provider;
  };
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    {/* 顶部控制栏 */}
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Input value={videoName} onChange={e => setVideoName(e.target.value)} className="w-64 font-semibold" placeholder="输入视频名称" />
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>总时长: {totalDuration}秒</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => $w.utils.navigateBack()}>
            返回
          </Button>
          <Button onClick={generateVideo} disabled={isGenerating || nodes.length === 0} className="bg-blue-600 hover:bg-blue-700">
            {isGenerating ? <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              生成中...
            </> : <>
              <Play className="w-4 h-4 mr-2" />
              生成视频
            </>}
          </Button>
        </div>
      </div>
    </div>

    <div className="flex h-[calc(100vh-73px)]">
      {/* 左侧脚本和模板区 */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* 脚本模板选择 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">脚本模板</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedTemplate?._id} onValueChange={value => {
                const template = templates.find(t => t._id === value);
                if (template) selectTemplate(template);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="选择模板" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => <SelectItem key={template._id} value={template._id}>
                    {template.name}
                  </SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* 智能脚本生成器 */}
          <ScriptGenerator onGenerate={handleScriptGenerate} />

          {/* 节点操作 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">节点操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={() => addNode('text2video')} className="w-full justify-start" variant="outline">
                <Sparkles className="w-4 h-4 mr-2" />
                添加文生视频节点
              </Button>
              <Button onClick={() => addNode('image2video')} className="w-full justify-start" variant="outline">
                <Image className="w-4 h-4 mr-2" />
                添加图生视频节点
              </Button>
              <Button onClick={() => addNode('digital_human')} className="w-full justify-start" variant="outline">
                <Mic className="w-4 h-4 mr-2" />
                添加数字人节点
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 中间节点编辑区 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {nodes.length === 0 ? <div className="text-center py-12">
            <Film className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              开始创建您的视频
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              从左侧选择一个模板或添加节点开始创作
            </p>
            <Button onClick={() => addNode()}>
              <Plus className="w-4 h-4 mr-2" />
              添加第一个节点
            </Button>
          </div> : nodes.map((node, index) => <Collapsible key={node.id} open={expandedNodes[node.id]} onOpenChange={(open) => setExpandedNodes(prev => ({
            ...prev,
            [node.id]: open
          }))}>
            <Card className="mb-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getNodeIcon(node.type)}
                      <span className="font-medium">{node.title}</span>
                    </div>
                    <Badge variant="outline">{getProviderName(node.provider)}</Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => duplicateNode(node.id)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteNode(node.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {expandedNodes[node.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
              </CardHeader>

              <CollapsibleContent>
                <CardContent className="space-y-4">
                  {/* 基本信息 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">节点标题</label>
                      <Input value={node.title} onChange={e => updateNode(node.id, {
                        title: e.target.value
                      })} placeholder="输入节点标题" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">时长(秒)</label>
                      <Input type="number" value={node.duration} onChange={e => updateNode(node.id, {
                        duration: parseInt(e.target.value) || 5
                      })} min={1} max={60} />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">内容描述</label>
                    <Textarea value={node.content} onChange={e => updateNode(node.id, {
                      content: e.target.value
                    })} placeholder="输入节点内容描述" rows={3} />
                  </div>

                  {/* 生成方式和提供商 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">生成方式</label>
                      <Select value={node.type} onValueChange={value => updateNode(node.id, {
                        type: value
                      })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text2video">文生视频</SelectItem>
                          <SelectItem value="image2video">图生视频</SelectItem>
                          <SelectItem value="digital_human">数字人</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">AI服务商</label>
                      <Select value={node.provider} onValueChange={value => updateNode(node.id, {
                        provider: value
                      })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tongyi">阿里云通义万相</SelectItem>
                          <SelectItem value="digital_human">数字人API</SelectItem>
                          <SelectItem value="minmax">MinMax</SelectItem>
                          <SelectItem value="keling">可灵</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 视频参数 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">镜头景别</label>
                      <Select value={node.shotType} onValueChange={value => updateNode(node.id, {
                        shotType: value
                      })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="close">特写</SelectItem>
                          <SelectItem value="medium">中景</SelectItem>
                          <SelectItem value="long">远景</SelectItem>
                          <SelectItem value="wide">全景</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">转场效果</label>
                      <Select value={node.transition} onValueChange={value => updateNode(node.id, {
                        transition: value
                      })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">无</SelectItem>
                          <SelectItem value="fade">淡入淡出</SelectItem>
                          <SelectItem value="slide">滑动</SelectItem>
                          <SelectItem value="zoom">缩放</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">色彩风格</label>
                      <Select value={node.colorStyle} onValueChange={value => updateNode(node.id, {
                        colorStyle: value
                      })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="natural">自然</SelectItem>
                          <SelectItem value="vivid">鲜艳</SelectItem>
                          <SelectItem value="warm">暖色</SelectItem>
                          <SelectItem value="cool">冷色</SelectItem>
                          <SelectItem value="monochrome">黑白</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 素材区域 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">素材配置</label>
                      <Button size="sm" variant="outline" onClick={() => {
                        setAssetLibraryTarget(`${node.id}-image`);
                        setShowAssetLibrary(true);
                      }}>
                        <Upload className="w-3 h-3 mr-1" />
                        选择素材
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {['image', 'audio', 'subtitle'].map(assetType => <div key={assetType} className="border rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-2">
                          {assetType === 'image' ? '图片' : assetType === 'audio' ? '音频' : '字幕'}
                        </div>
                        {node.assets[assetType] ? <div className="text-center">
                          <div className="text-xs text-green-600 mb-1">
                            已选择
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => {
                            updateNode(node.id, {
                              assets: {
                                ...node.assets,
                                [assetType]: null
                              }
                            });
                          }}>
                            移除
                          </Button>
                        </div> : <Button size="sm" variant="outline" className="w-full" onClick={() => {
                          setAssetLibraryTarget(`${node.id}-${assetType}`);
                          setShowAssetLibrary(true);
                        }}>
                          选择
                        </Button>}
                      </div>)}
                    </div>
                  </div>

                  {/* 自定义参数 */}
                  <div>
                    <label className="text-sm font-medium">自定义参数</label>
                    <Textarea value={JSON.stringify(node.customParams, null, 2)} onChange={e => {
                      try {
                        const params = JSON.parse(e.target.value);
                        updateNode(node.id, {
                          customParams: params
                        });
                      } catch { }
                    }} placeholder="输入JSON格式的自定义参数" rows={3} className="font-mono text-xs" />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>)}
        </div>
      </div>

      {/* 右侧素材库 */}
      {showAssetLibrary && <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold">素材库</h3>
          <Button variant="ghost" size="sm" onClick={() => {
            setShowAssetLibrary(false);
            setAssetLibraryTarget(null);
          }}>
            <EyeOff className="w-4 h-4" />
          </Button>
        </div>
        <AssetLibrary onAssetSelect={handleAssetSelect} $w={$w} />
      </div>}
    </div>

    {/* 节点配置模态框 */}
    {selectedNode && <NodeConfigurationModal node={selectedNode} isOpen={!!selectedNode} onClose={() => setSelectedNode(null)} onUpdate={updateNode} />}
  </div>
};