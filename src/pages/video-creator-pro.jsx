// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Card, CardContent, CardHeader, CardTitle, Badge, Tabs, TabsContent, TabsList, TabsTrigger, ScrollArea, Collapsible, CollapsibleContent, CollapsibleTrigger, useToast } from '@/components/ui';
// @ts-ignore;
import { ChevronDown, ChevronUp, Plus, Trash2, Copy, Upload, Film, Image, User, Settings, Play } from 'lucide-react';

import { TimelineNodeCard } from '@/components/TimelineNodeCard';
import { ScriptGenerator } from '@/components/ScriptGenerator';
import { EnhancedAssetLibrary } from '@/components/EnhancedAssetLibrary';
export default function VideoCreatorPro(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [videoName, setVideoName] = useState('未命名视频');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [nodes, setNodes] = useState([]);
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // 脚本模板选项
  const scriptTemplates = [{
    id: 'product-intro',
    name: '产品介绍',
    description: '适合产品展示和推广'
  }, {
    id: 'tutorial',
    name: '教程讲解',
    description: '适合知识分享和教学'
  }, {
    id: 'story',
    name: '故事叙述',
    description: '适合品牌故事和情感营销'
  }, {
    id: 'news',
    name: '新闻播报',
    description: '适合时事报道和资讯'
  }];

  // AI服务商选项
  const aiProviders = [{
    id: 'tongyi',
    name: '阿里云通义万相',
    type: 'text2video'
  }, {
    id: 'keling',
    name: '可灵AI',
    type: 'text2video'
  }, {
    id: 'digital-human',
    name: '数字人API',
    type: 'digital-human'
  }, {
    id: 'image2video',
    name: '图生视频',
    type: 'image2video'
  }];

  // 添加新节点
  const addNode = (type = 'text2video', position = -1) => {
    const newNode = {
      id: Date.now().toString(),
      type: type,
      provider: aiProviders[0].id,
      title: `节点 ${nodes.length + 1}`,
      content: '',
      duration: 5,
      assets: {
        images: [],
        audio: null,
        subtitle: ''
      },
      settings: {
        shotType: 'medium',
        transition: 'fade',
        colorStyle: 'natural',
        cameraMovement: 'static'
      }
    };
    if (position >= 0) {
      const newNodes = [...nodes];
      newNodes.splice(position + 1, 0, newNode);
      setNodes(newNodes);
    } else {
      setNodes([...nodes, newNode]);
    }
  };

  // 更新节点
  const updateNode = (nodeId, updates) => {
    setNodes(nodes.map(node => node.id === nodeId ? {
      ...node,
      ...updates
    } : node));
  };

  // 删除节点
  const deleteNode = nodeId => {
    setNodes(nodes.filter(node => node.id !== nodeId));
    toast({
      title: "节点已删除",
      description: "节点已成功移除"
    });
  };

  // 复制节点
  const duplicateNode = nodeId => {
    const nodeToCopy = nodes.find(node => node.id === nodeId);
    if (nodeToCopy) {
      const newNode = {
        ...nodeToCopy,
        id: Date.now().toString(),
        title: `${nodeToCopy.title} (复制)`
      };
      const index = nodes.findIndex(node => node.id === nodeId);
      const newNodes = [...nodes];
      newNodes.splice(index + 1, 0, newNode);
      setNodes(newNodes);
    }
  };

  // 拖拽排序
  const handleDragEnd = result => {
    if (!result.destination) return;
    const items = Array.from(nodes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setNodes(items);
  };

  // 选择脚本模板
  const handleTemplateSelect = async templateId => {
    setSelectedTemplate(templateId);
    try {
      // 调用云函数获取模板内容
      const result = await $w.cloud.callFunction({
        name: 'ai-engine-service',
        data: {
          action: 'generateScriptFromTemplate',
          templateId: templateId,
          videoName: videoName
        }
      });
      if (result.success) {
        setNodes(result.data.nodes);
        toast({
          title: "脚本已生成",
          description: `已根据${scriptTemplates.find(t => t.id === templateId)?.name}模板生成节点`
        });
      }
    } catch (error) {
      toast({
        title: "生成失败",
        description: error.message || "脚本生成失败，请重试",
        variant: "destructive"
      });
    }
  };

  // 生成视频
  const handleGenerateVideo = async () => {
    if (nodes.length === 0) {
      toast({
        title: "无法生成",
        description: "请至少添加一个节点",
        variant: "destructive"
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await $w.cloud.callFunction({
        name: 'generateVideo',
        data: {
          videoName: videoName,
          nodes: nodes,
          totalDuration: nodes.reduce((sum, node) => sum + node.duration, 0)
        }
      });
      if (result.success) {
        toast({
          title: "生成成功",
          description: "视频正在后台生成中，请稍后查看"
        });

        // 跳转到导出页面
        $w.utils.navigateTo({
          pageId: 'export-share',
          params: {
            taskId: result.taskId
          }
        });
      }
    } catch (error) {
      toast({
        title: "生成失败",
        description: error.message || "视频生成失败，请重试",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 计算总时长
  const totalDuration = nodes.reduce((sum, node) => sum + node.duration, 0);
  return <div className="min-h-screen bg-gray-950 text-white">
      <div className="flex h-screen">
        {/* 主编辑区域 */}
        <div className="flex-1 flex flex-col">
          {/* 顶部控制栏 */}
          <div className="bg-gray-900 border-b border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Input value={videoName} onChange={e => setVideoName(e.target.value)} className="bg-gray-800 border-gray-700 text-white w-64" placeholder="输入视频名称" />
                
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                    <SelectValue placeholder="选择脚本模板" />
                  </SelectTrigger>
                  <SelectContent>
                    {scriptTemplates.map(template => <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="text-sm">
                  总时长: {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')}
                </Badge>
                
                <Button onClick={handleGenerateVideo} disabled={isGenerating || nodes.length === 0} className="bg-blue-600 hover:bg-blue-700">
                  {isGenerating ? <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      生成中...
                    </> : <>
                      <Play className="w-4 h-4 mr-2" />
                      生成视频
                    </>}
                </Button>
              </div>
            </div>
          </div>

          {/* 时间轴编辑区 */}
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              {nodes.length === 0 ? <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Film className="w-12 h-12 text-gray-600 mb-4" />
                    <p className="text-gray-400 mb-4">还没有添加任何节点</p>
                    <Button onClick={() => addNode()} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      添加第一个节点
                    </Button>
                  </CardContent>
                </Card> : nodes.map((node, index) => <TimelineNodeCard key={node.id} node={node} index={index} aiProviders={aiProviders} onUpdate={updateNode} onDelete={deleteNode} onDuplicate={duplicateNode} onAddNode={addNode} onSelectAssets={() => {
              setSelectedNodeId(node.id);
              setShowAssetLibrary(true);
            }} />)}
            </div>
          </ScrollArea>
        </div>

        {/* 素材库侧边栏 */}
        <Collapsible open={showAssetLibrary} onOpenChange={setShowAssetLibrary}>
          <div className={`bg-gray-900 border-l border-gray-800 transition-all duration-300 ${showAssetLibrary ? 'w-96' : 'w-0'}`}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="absolute -left-8 top-4 bg-gray-900 border border-gray-800">
                {showAssetLibrary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="h-full">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-800">
                  <h3 className="font-semibold">素材库</h3>
                </div>
                <EnhancedAssetLibrary onSelectAsset={asset => {
                if (selectedNodeId) {
                  updateNode(selectedNodeId, {
                    assets: {
                      ...nodes.find(n => n.id === selectedNodeId)?.assets,
                      images: [asset]
                    }
                  });
                }
              }} />
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
    </div>;
}