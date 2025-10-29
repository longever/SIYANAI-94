// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Tabs, TabsContent, TabsList, TabsTrigger, Card, CardContent, CardDescription, CardHeader, CardTitle, useToast, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';

import { FileUploadSection } from './FileUploadSection';
import { VideoSettings } from './VideoSettings';
import { WorksList } from './WorksList';
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
    image: null
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState('tongyi-wanxiang');
  const [videoSettings, setVideoSettings] = useState({
    resolution: '480P',
    ratio: '3:4',
    modelType: 'Animate_Move',
    duration: 30,
    style: 'normal'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [taskId, setTaskId] = useState(null);
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
    try {
      // 上传文件到云存储
      const tcb = await $w.cloud.getCloudInstance();
      const videoUpload = await tcb.uploadFile({
        cloudPath: `videos/${Date.now()}_${uploadedFiles.video.name}`,
        filePath: uploadedFiles.video
      });
      let imageUpload = null;
      if (uploadedFiles.image) {
        imageUpload = await tcb.uploadFile({
          cloudPath: `images/${Date.now()}_${uploadedFiles.image.name}`,
          filePath: uploadedFiles.image
        });
      }

      // 调用云函数创建任务
      const {
        result
      } = await $w.cloud.callFunction({
        name: 'image-video-to-video',
        data: {
          platform: selectedPlatforms,
          videoUrl: videoUpload.fileID,
          imageUrl: imageUpload.fileID,
          userId: $w.auth.currentUser?.userId || 'anonymous',
          type: 'image-video-to-video',
          settings: videoSettings
        }
      });
      if (result.success) {
        setTaskId(result.taskId);
        setGenerationProgress(100);
        setIsGenerating(false);
        toast({
          title: "任务创建成功",
          description: "任务创建成功，请到我的作品页面查看生成结果。"
        });
      } else {
        throw new Error(result.message || '任务创建失败');
      }
    } catch (error) {
      toast({
        title: "生成失败",
        description: error.message,
        variant: "destructive"
      });
      setIsGenerating(false);
      setShowGenerationModal(false);
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
              <FileUploadSection type="image" title="上传图片" description="支持 JPG、PNG 格式，用于风格参考" accept="image/*" onFileUpload={file => handleFileUpload('image', file)} uploadedFile={uploadedFiles.image} />
              <FileUploadSection type="video" title="上传参考视频" description="支持 MP4、MOV、AVI 格式，最大 100MB" accept="video/*" onFileUpload={file => handleFileUpload('video', file)} uploadedFile={uploadedFiles.video} />
            </div>

            <div className="space-y-6">
              c
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
            <Button size="lg" onClick={handleGenerateVideo} disabled={!uploadedFiles.video || !uploadedFiles.image || isGenerating} className="px-8">
              {isGenerating ? '生成中...' : '开始生成'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="works">
          <WorksList $w={$w} />
        </TabsContent>
      </Tabs>
    </div>
  </div>;
}