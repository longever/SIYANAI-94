// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger, ScrollArea, Collapsible, CollapsibleContent, CollapsibleTrigger, Badge, Slider, Textarea, useToast } from '@/components/ui';
// @ts-ignore;
import { Plus, Trash2, Settings, Play, Pause, Download, Upload, ChevronDown, ChevronUp, Clock, Film, Image, Mic, Sparkles, Save, Eye, EyeOff, Move, Copy } from 'lucide-react';

import { ScriptGenerator } from '@/components/ScriptGenerator';
import { AssetLibrary } from '@/components/AssetLibrary';
import { NodeConfigurationModal } from '@/components/NodeConfigurationModal';
import { NodeList } from '@/components/pro/NodeList';
import { NodeActions } from '@/components/pro/NodeActions';
import { TemplateSelector } from '@/components/pro/TemplateSelector';
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
  const handleAssetSelect = target => {
    setAssetLibraryTarget(target);
    setShowAssetLibrary(true);
  };
  const handleAssetChoose = asset => {
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

  // 切换节点展开状态
  const toggleNode = nodeId => {
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
            <TemplateSelector templates={templates} selectedTemplate={selectedTemplate} onSelectTemplate={selectTemplate} />

            {/* 智能脚本生成器 */}
            <ScriptGenerator onGenerate={handleScriptGenerate} />

            {/* 节点操作 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">节点操作</CardTitle>
              </CardHeader>
              <CardContent>
                <NodeActions onAddNode={addNode} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 中间节点编辑区 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <NodeList nodes={nodes} expandedNodes={expandedNodes} onToggleNode={toggleNode} onUpdateNode={updateNode} onDeleteNode={deleteNode} onDuplicateNode={duplicateNode} onAssetSelect={handleAssetSelect} />
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
            <AssetLibrary onAssetSelect={handleAssetChoose} $w={$w} />
          </div>}
      </div>

      {/* 节点配置模态框 */}
      {selectedNode && <NodeConfigurationModal node={selectedNode} isOpen={!!selectedNode} onClose={() => setSelectedNode(null)} onUpdate={updateNode} />}
    </div>;
}