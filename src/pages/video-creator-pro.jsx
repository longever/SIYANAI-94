// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, Tabs, TabsContent, TabsList, TabsTrigger, Dialog, DialogContent, DialogHeader, DialogTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Plus, Play, Save, Download, Share2, Settings, Trash2, Copy, ChevronUp, ChevronDown } from 'lucide-react';

import { BasicNodeCard } from '@/components/NodeCard';
import { ProNodeCard } from '@/components/pro/NodeCard';
import { NodeList } from '@/components/pro/NodeList';
import { TemplateSelector } from '@/components/pro/TemplateSelector';
import { AssetLibrary } from '@/components/ProAssetLibrary';
import { ExportPreview } from '@/components/ExportPreview';
export default function VideoCreatorPro(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const [assetSelectTarget, setAssetSelectTarget] = useState(null);
  const [projectName, setProjectName] = useState('未命名项目');
  const [activeTab, setActiveTab] = useState('nodes');
  const [templates, setTemplates] = useState([]);
  useEffect(() => {
    loadProject();
    loadTemplates();
  }, []);
  const loadProject = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'generation_tasks',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              type: {
                $eq: 'pro_project'
              },
              status: {
                $eq: 'draft'
              }
            }
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 1
        }
      });
      if (result.records.length > 0) {
        const project = result.records[0];
        setProjectName(project.name || '未命名项目');
        setNodes(project.nodes || []);
      }
    } catch (error) {
      console.error('加载项目失败:', error);
    }
  };
  const loadTemplates = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'generation_tasks',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              type: {
                $eq: 'template'
              }
            }
          }
        }
      });
      setTemplates(result.records);
    } catch (error) {
      console.error('加载模板失败:', error);
    }
  };
  const addNode = (type = 'text2video') => {
    const newNode = {
      id: `node_${Date.now()}`,
      type,
      title: `新节点 ${nodes.length + 1}`,
      content: '',
      duration: 5,
      provider: 'tongyi',
      shotType: 'medium',
      transition: 'none',
      colorStyle: 'natural',
      assets: {
        image: null,
        audio: null,
        subtitle: null
      },
      customParams: {},
      position: {
        x: 50,
        y: 50 + nodes.length * 100
      },
      order: nodes.length
    };
    setNodes([...nodes, newNode]);
  };
  const updateNode = (nodeId, updates) => {
    setNodes(nodes.map(node => node.id === nodeId ? {
      ...node,
      ...updates
    } : node));
  };
  const deleteNode = nodeId => {
    setNodes(nodes.filter(node => node.id !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };
  const duplicateNode = nodeId => {
    const originalNode = nodes.find(n => n.id === nodeId);
    if (originalNode) {
      const newNode = {
        ...originalNode,
        id: `node_${Date.now()}`,
        title: `${originalNode.title} 副本`,
        order: nodes.length,
        position: {
          x: originalNode.position.x + 20,
          y: originalNode.position.y + 20
        }
      };
      setNodes([...nodes, newNode]);
    }
  };
  const handleAssetSelect = asset => {
    if (assetSelectTarget) {
      const [nodeId, assetType] = assetSelectTarget.split('-');
      updateNode(nodeId, {
        assets: {
          ...nodes.find(n => n.id === nodeId)?.assets,
          [assetType]: asset
        }
      });
      setShowAssetLibrary(false);
      setAssetSelectTarget(null);
    }
  };
  const saveProject = async () => {
    try {
      const projectData = {
        name: projectName,
        type: 'pro_project',
        status: 'draft',
        nodes: nodes,
        updatedAt: new Date()
      };
      await $w.cloud.callDataSource({
        dataSourceName: 'generation_tasks',
        methodName: 'wedaUpsertV2',
        params: {
          filter: {
            where: {
              type: {
                $eq: 'pro_project'
              },
              status: {
                $eq: 'draft'
              }
            }
          },
          update: projectData,
          create: projectData
        }
      });
      toast({
        title: '保存成功',
        description: '项目已保存到云端'
      });
    } catch (error) {
      toast({
        title: '保存失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  const generateVideo = async () => {
    if (nodes.length === 0) {
      toast({
        title: '无法生成',
        description: '请先添加至少一个节点',
        variant: 'destructive'
      });
      return;
    }
    try {
      const result = await $w.cloud.callFunction({
        name: 'ai-engine-service',
        data: {
          action: 'generateProVideo',
          nodes: nodes,
          projectName: projectName
        }
      });
      toast({
        title: '开始生成',
        description: '视频正在后台生成中，请稍后查看'
      });
    } catch (error) {
      toast({
        title: '生成失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  const toggleNodeExpansion = nodeId => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };
  return <div className="h-screen flex flex-col bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold">专业视频创作器</h1>
                <Input value={projectName} onChange={e => setProjectName(e.target.value)} className="w-64" placeholder="项目名称" />
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={saveProject}>
                  <Save className="w-4 h-4 mr-2" />
                  保存项目
                </Button>
                <Button onClick={generateVideo} disabled={nodes.length === 0}>
                  <Play className="w-4 h-4 mr-2" />
                  开始生成
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex">
            {/* Sidebar */}
            <div className="w-80 bg-white border-r flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsList className="w-full">
                  <TabsTrigger value="nodes" className="flex-1">节点列表</TabsTrigger>
                  <TabsTrigger value="templates" className="flex-1">模板库</TabsTrigger>
                </TabsList>
                
                <TabsContent value="nodes" className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    <Button onClick={() => addNode()} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      添加节点
                    </Button>
                    
                    <NodeList nodes={nodes} expandedNodes={expandedNodes} onToggle={toggleNodeExpansion} onUpdate={updateNode} onDelete={deleteNode} onDuplicate={duplicateNode} onAssetSelect={target => {
                setAssetSelectTarget(target);
                setShowAssetLibrary(true);
              }} />
                  </div>
                </TabsContent>
                
                <TabsContent value="templates" className="flex-1 overflow-y-auto p-4">
                  <TemplateSelector templates={templates} onSelectTemplate={template => {
              setNodes(template.nodes || []);
              setProjectName(template.name || '模板项目');
            }} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Main Canvas */}
            <div className="flex-1 relative bg-gray-100">
              <div className="absolute inset-0 overflow-auto">
                {nodes.map(node => <BasicNodeCard key={node.id} node={{
            id: node.id,
            type: node.type,
            data: {
              name: node.title,
              duration: node.duration,
              content: node.content
            },
            position: node.position
          }} isSelected={selectedNode?.id === node.id} onSelect={setSelectedNode} onDrag={(nodeId, position) => updateNode(nodeId, {
            position
          })} onDelete={deleteNode} mode={node.type} />)}
              </div>
            </div>

            {/* Right Panel */}
            <div className="w-96 bg-white border-l">
              <ExportPreview nodes={nodes} />
            </div>
          </div>

          {/* Asset Library Dialog */}
          <Dialog open={showAssetLibrary} onOpenChange={setShowAssetLibrary}>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>选择素材</DialogTitle>
              </DialogHeader>
              <AssetLibrary onSelectAsset={handleAssetSelect} assetType={assetSelectTarget?.split('-')[1] || 'image'} />
            </DialogContent>
          </Dialog>
        </div>;
}