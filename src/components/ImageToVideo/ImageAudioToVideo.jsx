// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Tabs, TabsContent, TabsList, TabsHeader, TabsTrigger, Card, CardContent, CardDescription, CardHeader, CardTitle, useToast } from '@/components/ui';

import { FileUploadSection } from './FileUploadSection';
import { AvatarPreview } from './AvatarPreview';
import { VideoSettings } from './VideoSettings';
import { SystemSelector } from './SystemSelector';
import { GenerationModal } from './GenerationModal';
import { WorksList } from './WorksList';
import { SaveToDatabase } from './SaveToDatabase';
import { ImageDescriptionMode } from './ImageDescriptionMode';
export default function ImageAudioToVideo(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('create');
  const [createMode, setCreateMode] = useState('avatar'); // 'avatar' or 'description'
  const [uploadedFiles, setUploadedFiles] = useState({
    avatar: null,
    audio: null
  });
  const [selectedModel, setSelectedModel] = useState('tongyi-wanxiang');
  const [videoSettings, setVideoSettings] = useState({
    resolution: '1080p',
    fps: 30,
    quality: 'high',
    duration: 30
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const handleFileUpload = (type, file) => {
    setUploadedFiles(prev => ({
      ...prev,
      [type]: file
    }));
  };
  const handleGenerateVideo = async () => {
    if (createMode === 'avatar' && (!uploadedFiles.avatar || !uploadedFiles.audio)) {
      toast({
        title: "缺少文件",
        description: "请上传头像和音频文件",
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
            url: 'https://example.com/generated-video.mp4',
            thumbnail: 'https://example.com/thumbnail.jpg',
            duration: videoSettings.duration,
            size: '25.6 MB'
          });
          return 100;
        }
        return prev + 10;
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
            title: `数字人视频 - ${new Date().toLocaleString()}`,
            videoUrl: videoData.url,
            thumbnailUrl: videoData.thumbnail,
            duration: videoData.duration,
            fileSize: videoData.size,
            settings: videoSettings,
            model: selectedModel,
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
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-lg border p-1">
              <button onClick={() => setCreateMode('avatar')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${createMode === 'avatar' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                头像驱动
              </button>
              <button onClick={() => setCreateMode('description')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${createMode === 'description' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                图片描述
              </button>
            </div>
          </div>

          {createMode === 'avatar' ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <FileUploadSection type="avatar" title="上传头像" description="支持 JPG、PNG 格式，建议尺寸 512x512" accept="image/*" onFileUpload={file => handleFileUpload('avatar', file)} uploadedFile={uploadedFiles.avatar} />

                <FileUploadSection type="audio" title="上传音频" description="支持 MP3、WAV 格式，最大 50MB" accept="audio/*" onFileUpload={file => handleFileUpload('audio', file)} uploadedFile={uploadedFiles.audio} />
              </div>

              <div className="space-y-6">
                <SystemSelector selectedModel={selectedModel} onSystemChange={setSelectedModel} />

                <VideoSettings settings={videoSettings} onSettingsChange={setVideoSettings} />

                <Card>
                  <CardHeader>
                    <CardTitle>预览</CardTitle>
                    <CardDescription>预览数字人效果</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AvatarPreview avatarFile={uploadedFiles.avatar} audioFile={uploadedFiles.audio} />
                  </CardContent>
                </Card>
              </div>
            </div> : <ImageDescriptionMode selectedModel={selectedModel} onSystemChange={setSelectedModel} videoSettings={videoSettings} onSettingsChange={setVideoSettings} uploadedFiles={uploadedFiles} onFileUpload={handleFileUpload} onGenerate={handleGenerateVideo} isGenerating={isGenerating} />}

          {createMode === 'avatar' && <div className="flex justify-center">
              <Button size="lg" onClick={handleGenerateVideo} disabled={!uploadedFiles.avatar || !uploadedFiles.audio || isGenerating} className="px-8">
                {isGenerating ? '生成中...' : '开始生成'}
              </Button>
            </div>}
        </TabsContent>

        <TabsContent value="works">
          <WorksList />
        </TabsContent>
      </Tabs>

      <GenerationModal open={showGenerationModal} onOpenChange={setShowGenerationModal} progress={generationProgress} isGenerating={isGenerating} generatedVideo={generatedVideo} onSave={() => generatedVideo && handleSaveToDatabase(generatedVideo)} />
    </div>
  </div>;
}