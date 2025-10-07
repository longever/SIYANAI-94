// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ChevronLeft, Sparkles, Wand2, Type, Image as ImageIcon, Video, Music, Layers, Settings, Save, Download, Upload } from 'lucide-react';
// @ts-ignore;
import { Button, Card, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, Input, Label, Badge, useToast } from '@/components/ui';

import { ScriptGenerator } from '@/components/ScriptGenerator';
import { Image2VideoPanel } from '@/components/Image2VideoPanel';
import { Text2VideoPanel } from '@/components/Text2VideoPanel';
import { AssetSelector } from '@/components/AssetSelector';
import { VideoPreviewWindow } from '@/components/VideoPreviewWindow';
export default function AIVideoCreatorPage(props) {
  const {
    $w
  } = props;
  const [activeTab, setActiveTab] = useState('text2video');
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const [currentProject, setCurrentProject] = useState({
    id: null,
    title: '',
    description: '',
    type: 'text2video',
    settings: {}
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const {
    toast
  } = useToast();
  const handleAssetSelect = asset => {
    // 根据当前活跃的标签页处理素材
    switch (activeTab) {
      case 'image2video':
        // 将素材传递给 Image2VideoPanel
        if (asset.type === 'image') {
          setCurrentProject(prev => ({
            ...prev,
            imageUrl: asset.url
          }));
        }
        break;
      case 'text2video':
        // 将素材作为参考图
        setCurrentProject(prev => ({
          ...prev,
          referenceImage: asset.url
        }));
        break;
    }
    setShowAssetLibrary(false);
    toast({
      title: "素材已选择",
      description: `${asset.name} 已添加到当前项目`
    });
  };
  const handleGenerate = async () => {
    try {
      if (!$w?.cloud) {
        toast({
          title: "错误",
          description: "云开发环境未初始化，请检查网络连接",
          variant: "destructive"
        });
        return;
      }

      // 调用AI生成视频
      const result = await $w.cloud.callFunction({
        name: 'ai-engine-service',
        data: {
          action: 'generateVideo',
          project: currentProject
        }
      });
      if (result?.videoUrl) {
        setPreviewUrl(result.videoUrl);
        toast({
          title: "生成成功",
          description: "AI视频已生成完成"
        });
      } else {
        throw new Error('生成结果格式错误');
      }
    } catch (error) {
      console.error('AI视频生成失败:', error);
      toast({
        title: "生成失败",
        description: error.message || "AI视频生成失败，请稍后重试",
        variant: "destructive"
      });
    }
  };
  return <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => props.$w.utils.navigateBack()}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            返回
          </Button>
          <h1 className="text-lg font-semibold">AI视频创作</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Save className="w-4 h-4 mr-1" />
            保存
          </Button>
          <Button size="sm" onClick={handleGenerate}>
            <Sparkles className="w-4 h-4 mr-1" />
            生成视频
          </Button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Left Panel - Settings */}
        <aside className="w-96 border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-4">项目设置</h2>
            
            <div className="space-y-4">
              <div>
                <Label>项目名称</Label>
                <Input value={currentProject.title} onChange={e => setCurrentProject(prev => ({
                ...prev,
                title: e.target.value
              }))} placeholder="输入项目名称" />
              </div>
              
              <div>
                <Label>项目描述</Label>
                <Textarea value={currentProject.description} onChange={e => setCurrentProject(prev => ({
                ...prev,
                description: e.target.value
              }))} placeholder="描述你的创作意图" rows={3} />
              </div>
            </div>
          </div>

          <div className="flex-1 p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text2video" className="text-sm">
                  <Type className="w-4 h-4 mr-1" />
                  文生视频
                </TabsTrigger>
                <TabsTrigger value="image2video" className="text-sm">
                  <ImageIcon className="w-4 h-4 mr-1" />
                  图生视频
                </TabsTrigger>
                <TabsTrigger value="script" className="text-sm">
                  <Wand2 className="w-4 h-4 mr-1" />
                  脚本生成
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text2video" className="mt-4">
                <Text2VideoPanel project={currentProject} onUpdate={updates => setCurrentProject(prev => ({
                ...prev,
                ...updates
              }))} onOpenAssetLibrary={() => setShowAssetLibrary(true)} />
              </TabsContent>

              <TabsContent value="image2video" className="mt-4">
                <Image2VideoPanel project={currentProject} onUpdate={updates => setCurrentProject(prev => ({
                ...prev,
                ...updates
              }))} onOpenAssetLibrary={() => setShowAssetLibrary(true)} />
              </TabsContent>

              <TabsContent value="script" className="mt-4">
                <ScriptGenerator project={currentProject} onUpdate={updates => setCurrentProject(prev => ({
                ...prev,
                ...updates
              }))} onOpenAssetLibrary={() => setShowAssetLibrary(true)} />
              </TabsContent>
            </Tabs>
          </div>
        </aside>

        {/* Right Panel - Preview */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-muted flex items-center justify-center">
            {previewUrl ? <VideoPreviewWindow url={previewUrl} title={currentProject.title} /> : <Card className="p-8 text-center">
                <div className="text-muted-foreground mb-4">
                  <Video className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">预览区域</h3>
                <p className="text-sm text-muted-foreground">
                  完成设置后点击"生成视频"查看效果
                </p>
              </Card>}
          </div>
          
          {/* Quick Actions */}
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setShowAssetLibrary(true)}>
                  <Layers className="w-4 h-4 mr-1" />
                  素材库
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-1" />
                  上传素材
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="outline">AI模式</Badge>
                <Badge variant="secondary">高清</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Library */}
      {showAssetLibrary && <div className="fixed inset-0 bg-black/50 z-50 flex">
          <div className="ml-auto">
            <AssetSelector onAssetSelect={handleAssetSelect} onClose={() => setShowAssetLibrary(false)} />
          </div>
        </div>}
    </div>;
}