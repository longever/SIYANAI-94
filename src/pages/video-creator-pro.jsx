// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger, ScrollArea, useToast } from '@/components/ui';
// @ts-ignore;
import { Plus, Clock, Film, Play, Sparkles, Eye, EyeOff, Image, Mic } from 'lucide-react';

import { ScriptGenerator } from '@/components/ScriptGenerator';
import { AssetLibrary } from '@/components/AssetLibrary';
import { VideoNode } from '@/components/pro/VideoNode';
export default function CreatePage(props) {
  const {
    $w
  } = props;
  const [videoName, setVideoName] = useState('未命名视频');
  const [totalDuration, setTotalDuration] = useState(60);
  const [nodes, setNodes] = useState([]);
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
  };

  // 删除节点
  const deleteNode = nodeId => {
    setNodes(nodes.filter(n => n.id !== nodeId));
  };

  // 更新节点
  const updateNode = (nodeId, updates) => {
    setNodes(nodes.map(n => n.id === nodeId ? {
      ...n,
      ...updates
    } : n));
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
  const handleNodeToggle = nodeId => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
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
              </div> : nodes.map((node, index) => <VideoNode key={node.id} node={node} isExpanded={expandedNodes[node.id]} onToggle={() => handleNodeToggle(node.id)} onUpdate={updates => updateNode(node.id, updates)} onDelete={() => deleteNode(node.id)} onDuplicate={() => duplicateNode(node.id)} />)}
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
    </div>;
}