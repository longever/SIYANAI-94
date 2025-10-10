// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Tabs, TabsContent, TabsList, TabsTrigger, Card, CardContent, CardDescription, CardHeader, CardTitle, useToast } from '@/components/ui';

import { FileUploadSection } from './FileUploadSection';
import { VideoSettings } from './VideoSettings';
import { SystemSelector } from './SystemSelector';
import { GenerationModal } from './GenerationModal';
import { WorksList } from './WorksList';
import { SaveToDatabase } from './SaveToDatabase';
export default function ImageVideoToVideo(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('create');
  const [uploadedFiles, setUploadedFiles] = useState({
    video: null,
    reference: null
  });
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
  const handleFileUpload = (type, file) => {
    setUploadedFiles(prev => ({
      ...prev,
      [type]: file
    }));
  };
  const handleGenerateVideo = async () => {
    if (!uploadedFiles.video) {
      toast({
        title: "缺少文件",
        description: "请上传视频文件",
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
            size: '45.2 MB'
          });
          return 100;
        }
        return prev + 8;
      });
    }, 600);
  };
  const handleSaveToDatabase = async videoData => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'digital_human_videos',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            title: `视频生成 - ${new Date().toLocaleString()}`,
            videoUrl: videoData.url,
            thumbnailUrl: videoData.thumbnail,
            duration: videoData.duration,
            fileSize: videoData.size,
            settings: videoSettings,
            model: selectedModel,
            type: 'video-to-video',
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
              <FileUploadSection type="video" title="上传视频" description="支持 MP4、MOV、AVI 格式，最大 100MB" accept="video/*" onFileUpload={file => handleFileUpload('video', file)} uploadedFile={uploadedFiles.video} />

              <FileUploadSection type="reference" title="上传参考图（可选）" description="支持 JPG、PNG 格式，用于风格参考" accept="image/*" onFileUpload={file => handleFileUpload('reference', file)} uploadedFile={uploadedFiles.reference} />
            </div>

            <div className="space-y-6">
              <SystemSelector value={selectedModel} onChange={setSelectedModel} />

              <VideoSettings settings={videoSettings} onChange={setVideoSettings} />

              <Card>
                <CardHeader>
                  <CardTitle>预览</CardTitle>
                  <CardDescription>预览视频效果</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    {uploadedFiles.video ? <video src={URL.createObjectURL(uploadedFiles.video)} className="max-w-full max-h-full rounded" controls /> : <div className="text-gray-400">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p>上传视频后预览</p>
                    </div>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-center">
            <Button size="lg" onClick={handleGenerateVideo} disabled={!uploadedFiles.video || isGenerating} className="px-8">
              {isGenerating ? '生成中...' : '开始生成'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="works">
          <WorksList type="video-to-video" />
        </TabsContent>
      </Tabs>

      <GenerationModal open={showGenerationModal} onOpenChange={setShowGenerationModal} progress={generationProgress} isGenerating={isGenerating} generatedVideo={generatedVideo} onSave={() => generatedVideo && handleSaveToDatabase(generatedVideo)} />
    </div>
  </div>;
}