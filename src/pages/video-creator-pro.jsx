// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Play, Download, Share2, Settings, Plus } from 'lucide-react';

import { Text2VideoPanel } from '@/components/Text2VideoPanel';
import { Image2VideoPanel } from '@/components/Image2VideoPanel';
import { DigitalHumanPanel } from '@/components/DigitalHumanPanel';
import { VideoPreviewWindow } from '@/components/VideoPreviewWindow';
import { TimelineNodeCard } from '@/components/TimelineNodeCard';
import { NodeConfigurationModal } from '@/components/NodeConfigurationModal';
import { ScriptGeneratorModal } from '@/components/ScriptGeneratorModal';
export default function AIVideoCreator(props) {
  const {
    $w
  } = props;
  const [activeTab, setActiveTab] = useState('text2video');
  const [timelineNodes, setTimelineNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNodeConfig, setShowNodeConfig] = useState(false);
  const [showScriptGenerator, setShowScriptGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const {
    toast
  } = useToast();

  // 添加时间线节点
  const addTimelineNode = nodeData => {
    const newNode = {
      id: Date.now().toString(),
      type: activeTab,
      data: nodeData,
      duration: nodeData.duration || 5,
      position: timelineNodes.length
    };
    setTimelineNodes([...timelineNodes, newNode]);
    toast({
      title: '节点已添加',
      description: `${nodeData.title || '新节点'} 已添加到时间线`
    });
  };

  // 更新节点
  const updateTimelineNode = (nodeId, updatedData) => {
    setTimelineNodes(prev => prev.map(node => node.id === nodeId ? {
      ...node,
      data: {
        ...node.data,
        ...updatedData
      }
    } : node));
  };

  // 删除节点
  const deleteTimelineNode = nodeId => {
    setTimelineNodes(prev => prev.filter(node => node.id !== nodeId));
    toast({
      title: '节点已删除',
      description: '时间线节点已移除'
    });
  };

  // 生成视频
  const generateVideo = async () => {
    if (timelineNodes.length === 0) {
      toast({
        title: '无法生成',
        description: '请先添加至少一个创作节点',
        variant: 'destructive'
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await $w.cloud.callFunction({
        name: 'generateVideo',
        data: {
          nodes: timelineNodes,
          config: {
            resolution: '1920x1080',
            fps: 30,
            quality: 'high'
          }
        }
      });
      if (result.success) {
        toast({
          title: '生成成功',
          description: '视频已生成，可在导出分享页面查看'
        });

        // 跳转到导出分享页面
        $w.utils.navigateTo({
          pageId: 'export-share',
          params: {
            videoId: result.videoId
          }
        });
      }
    } catch (error) {
      toast({
        title: '生成失败',
        description: error.message || '视频生成过程中出现错误',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  return <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* 顶部工具栏 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">AI 视频创作中心</h1>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowScriptGenerator(true)}>
              <Settings className="w-4 h-4 mr-2" />
              脚本生成器
            </Button>
            <Button variant="default" size="sm" onClick={generateVideo} disabled={isGenerating || timelineNodes.length === 0}>
              {isGenerating ? '生成中...' : '生成视频'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧创作面板 */}
        <div className="w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="text2video">文本转视频</TabsTrigger>
              <TabsTrigger value="image2video">图片转视频</TabsTrigger>
              <TabsTrigger value="digitalhuman">数字人</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="text2video" className="mt-0">
                <Text2VideoPanel onAddToTimeline={addTimelineNode} $w={$w} />
              </TabsContent>

              <TabsContent value="image2video" className="mt-0">
                <Image2VideoPanel onAddToTimeline={addTimelineNode} $w={$w} />
              </TabsContent>

              <TabsContent value="digitalhuman" className="mt-0">
                <DigitalHumanPanel onAddToTimeline={addTimelineNode} $w={$w} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* 中间时间线区域 */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h2 className="text-lg font-semibold">时间线</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {timelineNodes.length === 0 ? <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Plus className="w-12 h-12 mb-4 text-gray-300" />
                <p>从左侧添加创作节点</p>
              </div> : <div className="space-y-4">
                {timelineNodes.map((node, index) => <TimelineNodeCard key={node.id} node={node} index={index} onEdit={() => {
              setSelectedNode(node);
              setShowNodeConfig(true);
            }} onDelete={() => deleteTimelineNode(node.id)} />)}
              </div>}
          </div>
        </div>

        {/* 右侧预览区域 */}
        <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
          <VideoPreviewWindow nodes={timelineNodes} onNodeSelect={setSelectedNode} />
        </div>
      </div>

      {/* 节点配置弹窗 */}
      <NodeConfigurationModal isOpen={showNodeConfig} onClose={() => {
      setShowNodeConfig(false);
      setSelectedNode(null);
    }} node={selectedNode} onSave={updateTimelineNode} />

      {/* 脚本生成器弹窗 */}
      <ScriptGeneratorModal isOpen={showScriptGenerator} onClose={() => setShowScriptGenerator(false)} onGenerate={addTimelineNode} $w={$w} />
    </div>;
}