// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Tabs, TabsContent, TabsList, TabsTrigger, Card, CardContent, CardDescription, CardHeader, CardTitle, Textarea, useToast, Label, Input } from '@/components/ui';

import { GenerationModal } from '@/components/ImageToVideo/GenerationModal';
import { WorksList } from '@/components/ImageToVideo/WorksList';
export default function TextToVideoPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('create');
  const [textPrompt, setTextPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('tongyi-wanxiang');
  const [videoSettings, setVideoSettings] = useState({
    resolution: '1080p',
    fps: 30,
    quality: 'high',
    duration: 30,
    style: 'realistic'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const handleGenerateVideo = async () => {
    if (!textPrompt.trim()) {
      toast({
        title: "缺少文本描述",
        description: "请输入视频描述文本",
        variant: "destructive"
      });
      return;
    }
    setIsGenerating(true);
    setShowGenerationModal(true);
    setGenerationProgress(0);

    // 模拟生成过程
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setGeneratedVideo({
            url: 'https://example.com/generated-text-video.mp4',
            thumbnail: 'https://example.com/text-video-thumbnail.jpg',
            duration: videoSettings.duration,
            size: '32.8 MB',
            prompt: textPrompt
          });
          return 100;
        }
        return prev + 12;
      });
    }, 500);
  };
  const handleSaveToDatabase = async videoData => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'digital_human_videos',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            title: `文本生成视频 - ${textPrompt.substring(0, 30)}...`,
            videoUrl: videoData.url,
            thumbnailUrl: videoData.thumbnail,
            duration: videoData.duration,
            fileSize: videoData.size,
            settings: videoSettings,
            model: selectedModel,
            type: 'text-to-video',
            prompt: textPrompt,
            createdAt: new Date().toISOString()
          }
        }
      });
      toast({
        title: "保存成功",
        description: "视频已保存到作品库"
      });
      setActiveTab('works');
    } catch (error) {
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
    <div className="max-w-7xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">创建视频</TabsTrigger>
          <TabsTrigger value="works">我的作品</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>文本描述</CardTitle>
                  <CardDescription>输入您想要生成的视频描述，越详细效果越好</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="prompt">视频描述</Label>
                      <Textarea id="prompt" placeholder="例如：一只可爱的橘猫在花园里追逐蝴蝶，阳光明媚，花朵盛开，4K画质，写实风格..." value={textPrompt} onChange={e => setTextPrompt(e.target.value)} className="min-h-[120px]" />
                    </div>
                    <div className="text-sm text-gray-500">
                      建议描述包含：主体、动作、场景、光线、风格等要素
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>预览</CardTitle>
                  <CardDescription>基于文本描述预览生成效果</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    {textPrompt ? <div className="text-center p-4">
                      <div className="text-6xl mb-4">🎬</div>
                      <p className="text-sm text-gray-600">
                        基于您的描述生成视频预览
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {textPrompt.substring(0, 50)}...
                      </p>
                    </div> : <div className="text-gray-400">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4" />
                      </svg>
                      <p>输入文本描述后预览</p>
                    </div>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-center">
            <Button size="lg" onClick={handleGenerateVideo} disabled={!textPrompt.trim() || isGenerating} className="px-8">
              {isGenerating ? '生成中...' : '开始生成'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="works">
          <WorksList type="text-to-video" />
        </TabsContent>
      </Tabs>

      <GenerationModal open={showGenerationModal} onOpenChange={setShowGenerationModal} progress={generationProgress} isGenerating={isGenerating} generatedVideo={generatedVideo} onSave={() => generatedVideo && handleSaveToDatabase(generatedVideo)} />
    </div>
  </div>;
}