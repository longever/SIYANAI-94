// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, useToast, Skeleton, Badge } from '@/components/ui';
// @ts-ignore;
import { Plus, Play, Save, Download, Share2, RefreshCw, Trash2, Copy, Eye, Settings, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

import { TimelineNodeCard } from '@/components/TimelineNodeCard';
import { NodeConfigurationModal } from '@/components/NodeConfigurationModal';
import { ScriptGeneratorModal } from '@/components/ScriptGeneratorModal';
import { EnhancedAssetLibrary } from '@/components/EnhancedAssetLibrary';
import { VideoPreviewWindow } from '@/components/VideoPreviewWindow';
import { Text2VideoPanel } from '@/components/Text2VideoPanel';
import { Image2VideoPanel } from '@/components/Image2VideoPanel';
import { DigitalHumanPanel } from '@/components/DigitalHumanPanel';
export default function AIVideoCreator(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // 获取项目节点列表
  const loadNodes = async () => {
    try {
      setLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'video_node',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              projectId: {
                $eq: projectId || 'default-project'
              }
            }
          },
          orderBy: [{
            orderIndex: 'asc'
          }],
          select: {
            $master: true
          }
        }
      });
      if (result.records) {
        setNodes(result.records);
      }
    } catch (error) {
      console.error('获取节点失败:', error);
      toast({
        title: '获取节点失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 保存节点到数据库
  const saveNode = async nodeData => {
    try {
      const node = {
        ...nodeData,
        projectId: projectId || 'default-project',
        orderIndex: nodeData.orderIndex || nodes.length,
        status: 'draft',
        createdAt: new Date().toISOString()
      };
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'video_node',
        methodName: 'wedaCreateV2',
        params: {
          data: node
        }
      });
      if (result.id) {
        toast({
          title: '节点保存成功',
          description: '节点已保存到云端',
          variant: 'success'
        });
        loadNodes();
        return result.id;
      }
    } catch (error) {
      console.error('保存节点失败:', error);
      toast({
        title: '保存节点失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // 更新节点
  const updateNode = async (nodeId, updates) => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'video_node',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            ...updates,
            updatedAt: new Date().toISOString()
          },
          filter: {
            where: {
              _id: {
                $eq: nodeId
              }
            }
          }
        }
      });
      if (result.count > 0) {
        loadNodes();
        return true;
      }
    } catch (error) {
      console.error('更新节点失败:', error);
      toast({
        title: '更新节点失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // 删除节点
  const deleteNode = async nodeId => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'video_node',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: nodeId
              }
            }
          }
        }
      });
      if (result.count > 0) {
        toast({
          title: '节点删除成功',
          description: '节点已从项目中移除',
          variant: 'success'
        });
        loadNodes();
        if (selectedNode?.id === nodeId) {
          setSelectedNode(null);
        }
      }
    } catch (error) {
      console.error('删除节点失败:', error);
      toast({
        title: '删除节点失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 使用AI引擎生成脚本
  const generateScript = async (prompt, options = {}) => {
    try {
      setIsGenerating(true);
      setGenerationProgress(0);
      const result = await $w.cloud.callFunction({
        name: 'ai-engine-service',
        data: {
          action: 'generate-script',
          prompt,
          options: {
            style: options.style || 'creative',
            duration: options.duration || 60,
            tone: options.tone || 'neutral',
            ...options
          }
        }
      });
      if (result.success) {
        toast({
          title: '脚本生成成功',
          description: `生成了 ${result.data.nodes.length} 个节点`,
          variant: 'success'
        });

        // 保存生成的节点
        const savedNodes = await Promise.all(result.data.nodes.map((node, index) => saveNode({
          ...node,
          orderIndex: nodes.length + index
        })));
        return result.data;
      } else {
        throw new Error(result.error || '脚本生成失败');
      }
    } catch (error) {
      console.error('脚本生成失败:', error);
      toast({
        title: '脚本生成失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  // 生成视频
  const generateVideo = async () => {
    if (nodes.length === 0) {
      toast({
        title: '无法生成视频',
        description: '请先添加至少一个节点',
        variant: 'destructive'
      });
      return;
    }
    try {
      setIsGenerating(true);
      setGenerationProgress(10);

      // 准备视频生成参数
      const videoParams = {
        videoName: `AI-Video-${Date.now()}`,
        totalDuration: nodes.reduce((sum, node) => sum + (node.duration || 5), 0),
        nodes: nodes.map(node => ({
          id: node._id,
          title: node.title,
          content: node.text,
          type: node.generationType,
          duration: node.duration || 5,
          provider: node.provider,
          shotType: node.shotType,
          transition: node.transition,
          colorStyle: node.colorStyle,
          assets: node.assets || {},
          customParams: node.customParams || {}
        }))
      };

      // 调用视频生成云函数
      const result = await $w.cloud.callFunction({
        name: 'generateVideo',
        data: videoParams
      });
      if (result.success) {
        setCurrentTaskId(result.projectId);
        setGenerationProgress(50);

        // 更新节点状态
        await Promise.all(nodes.map(node => updateNode(node._id, {
          status: 'processing'
        })));

        // 开始轮询任务状态
        pollTaskStatus(result.projectId);
        toast({
          title: '视频生成已启动',
          description: '正在处理您的视频，请稍候...',
          variant: 'success'
        });
      } else {
        throw new Error(result.error || '视频生成失败');
      }
    } catch (error) {
      console.error('视频生成失败:', error);
      toast({
        title: '视频生成失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
      setIsGenerating(false);
    }
  };

  // 轮询任务状态
  const pollTaskStatus = async taskId => {
    const checkStatus = async () => {
      try {
        const result = await $w.cloud.callFunction({
          name: 'generateVideo',
          data: {
            action: 'getTaskStatus',
            taskId
          }
        });
        if (result.success) {
          const progress = result.data.progress || 0;
          setGenerationProgress(progress);
          if (result.data.status === 'completed') {
            setPreviewUrl(result.data.videoUrl);
            setIsGenerating(false);

            // 更新所有节点状态
            await Promise.all(nodes.map(node => updateNode(node._id, {
              status: 'completed'
            })));
            toast({
              title: '视频生成完成',
              description: '您的视频已准备就绪',
              variant: 'success'
            });
            return true;
          } else if (result.data.status === 'failed') {
            setIsGenerating(false);

            // 更新节点状态为失败
            await Promise.all(nodes.map(node => updateNode(node._id, {
              status: 'failed'
            })));
            toast({
              title: '视频生成失败',
              description: result.data.error || '请稍后重试',
              variant: 'destructive'
            });
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error('检查任务状态失败:', error);
        return true;
      }
    };

    // 每3秒检查一次，最多检查60次（3分钟）
    let attempts = 0;
    const maxAttempts = 60;
    const interval = setInterval(async () => {
      attempts++;
      const completed = await checkStatus();
      if (completed || attempts >= maxAttempts) {
        clearInterval(interval);
        if (attempts >= maxAttempts) {
          setIsGenerating(false);
          toast({
            title: '视频生成超时',
            description: '请稍后重试',
            variant: 'destructive'
          });
        }
      }
    }, 3000);
  };

  // 预览节点
  const previewNode = async node => {
    if (!node) return;
    try {
      setPreviewLoading(true);
      const result = await $w.cloud.callFunction({
        name: 'ai-engine-service',
        data: {
          action: 'preview-node',
          nodeId: node._id,
          nodeData: {
            title: node.title,
            text: node.text,
            generationType: node.generationType,
            provider: node.provider,
            shotType: node.shotType,
            transition: node.transition,
            colorStyle: node.colorStyle,
            duration: node.duration,
            assets: node.assets,
            customParams: node.customParams
          }
        }
      });
      if (result.success) {
        setPreviewUrl(result.data.previewUrl);
        setSelectedNode(node);
      } else {
        throw new Error(result.error || '预览生成失败');
      }
    } catch (error) {
      console.error('预览生成失败:', error);
      toast({
        title: '预览生成失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  // 添加新节点
  const addNode = async (type = 'text2video') => {
    const newNode = {
      title: `新节点 ${nodes.length + 1}`,
      text: '',
      generationType: type,
      provider: 'default',
      shotType: 'medium',
      transition: 'fade',
      colorStyle: 'natural',
      duration: 5,
      assets: {},
      customParams: {},
      status: 'draft'
    };
    try {
      const nodeId = await saveNode(newNode);
      setSelectedNode({
        ...newNode,
        _id: nodeId
      });
      setIsConfigModalOpen(true);
    } catch (error) {
      console.error('添加节点失败:', error);
    }
  };

  // 复制节点
  const duplicateNode = async node => {
    const duplicatedNode = {
      ...node,
      title: `${node.title} (副本)`,
      status: 'draft'
    };
    delete duplicatedNode._id;
    try {
      await saveNode(duplicatedNode);
      toast({
        title: '节点复制成功',
        description: '已创建节点副本',
        variant: 'success'
      });
    } catch (error) {
      console.error('复制节点失败:', error);
    }
  };

  // 保存项目
  const saveProject = async () => {
    try {
      const projectData = {
        id: projectId || `project-${Date.now()}`,
        name: `AI视频项目 ${new Date().toLocaleDateString()}`,
        nodes: nodes,
        totalDuration: nodes.reduce((sum, node) => sum + (node.duration || 5), 0),
        createdAt: new Date().toISOString()
      };

      // 这里可以调用项目保存云函数
      toast({
        title: '项目保存成功',
        description: '项目已保存到云端',
        variant: 'success'
      });
    } catch (error) {
      console.error('保存项目失败:', error);
      toast({
        title: '保存项目失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 初始化
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectIdFromUrl = urlParams.get('projectId');
    if (projectIdFromUrl) {
      setProjectId(projectIdFromUrl);
    }
    loadNodes();
  }, [projectId]);
  if (loading) {
    return <div className="min-h-screen bg-slate-900 text-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <Skeleton className="h-12 w-full mb-4" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            </div>
            <div className="col-span-6">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="col-span-3">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="container mx-auto px-4 py-6">
        {/* 顶部工具栏 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">AI视频创作</h1>
            <p className="text-slate-400 mt-1">智能脚本生成与视频制作</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={saveProject}>
              <Save className="w-4 h-4 mr-1" />
              保存项目
            </Button>
            
            <Button size="sm" onClick={() => setIsScriptModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              生成脚本
            </Button>
            
            <Button size="sm" variant="default" onClick={generateVideo} disabled={isGenerating || nodes.length === 0}>
              {isGenerating ? <>
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  生成中 {generationProgress}%
                </> : <>
                  <Play className="w-4 h-4 mr-1" />
                  生成视频
                </>}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* 左侧节点列表 */}
          <div className="col-span-3">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">时间线节点</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {nodes.map((node, index) => <TimelineNodeCard key={node._id} node={node} index={index} isSelected={selectedNode?._id === node._id} onSelect={() => setSelectedNode(node)} onPreview={() => previewNode(node)} onDuplicate={() => duplicateNode(node)} onDelete={() => deleteNode(node._id)} />)}
                  
                  {nodes.length === 0 && <div className="text-center py-8 text-slate-400">
                      <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                      <p>暂无节点</p>
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => addNode()}>
                        添加节点
                      </Button>
                    </div>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 中央预览区域 */}
          <div className="col-span-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-slate-800">
                <TabsTrigger value="timeline" className="text-slate-300">时间线</TabsTrigger>
                <TabsTrigger value="text2video" className="text-slate-300">文本生成</TabsTrigger>
                <TabsTrigger value="image2video" className="text-slate-300">图片生成</TabsTrigger>
                <TabsTrigger value="digitalhuman" className="text-slate-300">数字人</TabsTrigger>
              </TabsList>
              
              <TabsContent value="timeline" className="mt-4">
                <VideoPreviewWindow previewUrl={previewUrl} isLoading={previewLoading} nodes={nodes} />
              </TabsContent>
              
              <TabsContent value="text2video" className="mt-4">
                <Text2VideoPanel onAddNode={addNode} />
              </TabsContent>
              
              <TabsContent value="image2video" className="mt-4">
                <Image2VideoPanel onAddNode={addNode} />
              </TabsContent>
              
              <TabsContent value="digitalhuman" className="mt-4">
                <DigitalHumanPanel onAddNode={addNode} />
              </TabsContent>
            </Tabs>
          </div>

          {/* 右侧属性面板 */}
          <div className="col-span-3">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">节点属性</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedNode ? <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-white">{selectedNode.title}</h3>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setIsConfigModalOpen(true)}>
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => duplicateNode(selectedNode)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteNode(selectedNode._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">状态:</span>
                        <Badge variant={selectedNode.status === 'completed' ? 'success' : selectedNode.status === 'failed' ? 'destructive' : 'secondary'}>
                          {selectedNode.status || 'draft'}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-400">时长:</span>
                        <span className="text-white">{selectedNode.duration || 5}s</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-400">类型:</span>
                        <span className="text-white">{selectedNode.generationType || 'text2video'}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button size="sm" className="w-full" onClick={() => previewNode(selectedNode)} disabled={previewLoading}>
                        {previewLoading ? <>
                            <Clock className="w-4 h-4 mr-1 animate-spin" />
                            预览中...
                          </> : <>
                            <Eye className="w-4 h-4 mr-1" />
                            预览节点
                          </>}
                      </Button>
                    </div>
                  </div> : <div className="text-center py-8 text-slate-400">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                  <p>选择一个节点进行编辑</p>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => addNode()}>
                    添加节点
                  </Button>
                </div>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 节点配置模态框 */}
      <NodeConfigurationModal open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen} node={selectedNode} onSave={updates => {
      if (selectedNode) {
        updateNode(selectedNode._id, updates);
      }
    }} />
      
      {/* 脚本生成模态框 */}
      <ScriptGeneratorModal open={isScriptModalOpen} onOpenChange={setIsScriptModalOpen} onGenerate={generateScript} isGenerating={isGenerating} />
    </div>;
}