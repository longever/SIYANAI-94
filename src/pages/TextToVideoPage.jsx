// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Music, Tabs, TabsContent, TabsList, TabsTrigger, Card, CardContent, CardDescription, CardHeader, CardTitle, Textarea, useToast, Label, Switch, Upload, Input, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';
// @ts-ignore;
import { Sparkles } from 'lucide-react';

import { SystemSelector } from '@/components/ImageToVideo/SystemSelector';
import { VideoSettings } from '@/components/ImageToVideo/VideoSettings';
import { GenerationModal } from '@/components/ImageToVideo/GenerationModal';
import { WorksList } from '@/components/ImageToVideo/WorksList';
import { ScriptGenerator } from '@/components/ScriptGenerator';
export default function TextToVideoPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('create');
  const [prompt, setPrompt] = useState('');
  const [useAudio, setUseAudio] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [selectedModel, setSelectedModel] = useState('tongyi-wanxiang');
  const [videoSettings, setVideoSettings] = useState({
    resolution: '480P',
    fps: 30,
    quality: 'high',
    duration: 5,
    style: 'realistic'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [showScriptGenerator, setShowScriptGenerator] = useState(false);

  const handleAudioToggle = checked => {
    setUseAudio(checked);
    if (!checked) {
      setAudioFile(null);
    }
  };
  const handleAudioUpload = e => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setAudioFile(file);
        toast({
          title: '音频已选择',
          description: `已选择音频文件: ${file.name}`
        });
      } else {
        toast({
          title: '文件格式错误',
          description: '请选择音频文件',
          variant: 'destructive'
        });
      }
    }
  };
  const handleGenerateVideo = async () => {
    if (!prompt.trim()) {
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

    try {
      // 调用云函数生成视频
      const result = await $w.cloud.callFunction({
        name: 'description-to-video',
        data: {
          prompt: prompt,
          audioUrl: audioFile || '',
          audio: useAudio,
          userId: $w.auth.currentUser?.userId || 'anonymous',
          type: 'description-to-video',
          settings: videoSettings,
          model: selectedModel,
        }
      });
      if (result.success) {
        toast({
          title: '视频任务新建成功',
          description: '视频正在处理中，请到我的作品页面查看生成结果'
        });

      } else {
        throw new Error(result.error || '生成失败');
      }
    } catch (error) {
      console.error('生成视频失败:', error);
      toast({
        title: '生成失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleScriptGenerated = script => {
    // 将生成的脚本转换为文本描述
    const generatedDescription = script.nodes.map(node => node.content).join('；');
    setPrompt(generatedDescription);
    setShowScriptGenerator(false);
    toast({
      title: "描述生成成功",
      description: "AI已为您生成详细的视频描述"
    });
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
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>文本描述</CardTitle>
                      <CardDescription>输入您想要生成的视频描述，越详细效果越好</CardDescription>
                    </div>
                    <Button size="sm" onClick={() => setShowScriptGenerator(true)} className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI生成
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="prompt">视频描述</Label>
                      <Textarea id="prompt" placeholder="例如：一只可爱的橘猫在花园里追逐蝴蝶，阳光明媚，花朵盛开，4K画质，写实风格..." value={prompt} onChange={e => setPrompt(e.target.value)} className="min-h-[120px]" />
                    </div>
                    <div className="text-sm text-gray-500">
                      建议描述包含：主体、动作、场景、光线、风格等要素
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="use-audio" className="flex items-center gap-2">
                        <Music className="w-4 h-4" />
                        使用自定义音频
                      </Label>
                      <Switch id="use-audio" checked={useAudio} onCheckedChange={handleAudioToggle} />
                    </div>

                    {useAudio && <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" id="audio-upload" />
                      <label htmlFor="audio-upload" className="cursor-pointer flex flex-col items-center space-y-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {audioFile ? audioFile.name : '点击上传音频文件'}
                        </span>
                        <span className="text-xs text-gray-500">
                          支持 MP3, WAV, M4A 格式
                        </span>
                      </label>
                    </div>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>高级设置</CardTitle>
                  <CardDescription>调整视频生成参数</CardDescription>
                </CardHeader>
                <CardContent>
                  <VideoSettings settings={videoSettings} onSettingsChange={setVideoSettings} showStyle={true} />
                </CardContent>
              </Card>

              
            </div>

            <div className="space-y-6">
              <SystemSelector selectedModel={selectedModel} onSystemChange={setSelectedModel} />

              <Card>
                <CardHeader>
                  <CardTitle>预览</CardTitle>
                  <CardDescription>基于文本描述预览生成效果</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    {prompt ? <div className="text-center p-4">
                      <div className="text-6xl mb-4">🎬</div>
                      <p className="text-sm text-gray-600">
                        基于您的描述生成视频预览
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {prompt.substring(0, 50)}...
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
              <Card className="mt-6 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">使用提示</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• 文本描述越详细，生成的视频效果越好</li>
                    <li>• 可以添加场景、动作、情感等细节描述</li>
                    <li>• 使用音频选项可以添加背景音乐或旁白</li>
                    <li>• 生成时间根据文本长度和复杂度而定</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-center">
            <Button size="lg" onClick={handleGenerateVideo} disabled={!prompt.trim() || isGenerating} className="px-8">
              {isGenerating ? '生成中...' : '开始生成'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="works">
          <WorksList $w={props.$w} />
        </TabsContent>
      </Tabs>
 
      <Dialog open={showScriptGenerator} onOpenChange={setShowScriptGenerator}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI智能脚本生成</DialogTitle>
          </DialogHeader>
          <ScriptGenerator onGenerate={handleScriptGenerated} />
        </DialogContent>
      </Dialog>
    </div>
  </div>;
}