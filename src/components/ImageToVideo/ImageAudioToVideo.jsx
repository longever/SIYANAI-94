// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Tabs, TabsContent, TabsList, TabsTrigger, Card, CardContent, CardDescription, CardHeader, CardTitle, useToast } from '@/components/ui';

import { FileUploadSection } from './FileUploadSection';
import { AvatarPreview } from './AvatarPreview';
import { VideoSettings } from './VideoSettings'; 
import { WorksList } from './WorksList';
import { FUNCTION_IMAGE_AUDIO_TO_VIDEO } from '@/configs/index';
export default function ImageAudioToVideo(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('create');
  const [uploadedFiles, setUploadedFiles] = useState({
    avatar: null,
    audio: null
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState('tongyi-wanxiang');
  const [videoSettings, setVideoSettings] = useState({
    resolution: '480P',
    ratio: '3:4',
    duration: 30,
    style: 'normal'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0); 
  const [taskId, setTaskId] = useState(null);
  const handleFileUpload = (type, file) => {
    setUploadedFiles(prev => ({
      ...prev,
      [type]: file
    }));
  };
  const handleGenerateVideo = async () => {
    if (!uploadedFiles.avatar || !uploadedFiles.audio) {
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
    try {
      // 上传文件到云存储
      const tcb = await $w.cloud.getCloudInstance();
      const avatarUpload = await tcb.uploadFile({
        cloudPath: `avatars/${Date.now()}_${uploadedFiles.avatar.name}`,
        filePath: uploadedFiles.avatar
      });
      const audioUpload = await tcb.uploadFile({
        cloudPath: `audios/${Date.now()}_${uploadedFiles.audio.name}`,
        filePath: uploadedFiles.audio
      });

      // 调用云函数创建任务
      const { result } = await $w.cloud.callFunction({
        name: FUNCTION_IMAGE_AUDIO_TO_VIDEO,
        data: {
          imageUrl: avatarUpload.fileID,
          audioUrl: audioUpload.fileID,
          model: selectedPlatforms,
          prompt: `生成数字人视频，分辨率${videoSettings.resolution}，帧率${videoSettings.fps}，质量${videoSettings.quality}`,
          userId: $w.auth.currentUser?.userId || 'anonymous',
          type: 'image-audio-to-video',
          settings: videoSettings
        }
      });
      console.log("result", result)
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
              <FileUploadSection type="avatar" title="上传头像" description="支持 JPG、PNG 格式，建议尺寸 512x512" accept="image/*" onFileUpload={file => handleFileUpload('avatar', file)} uploadedFile={uploadedFiles.avatar} />

              <FileUploadSection type="audio" title="上传音频" description="支持 MP3、WAV 格式，最大 50MB" accept="audio/*" onFileUpload={file => handleFileUpload('audio', file)} uploadedFile={uploadedFiles.audio} />
            </div>

            <div className="space-y-6">

              <VideoSettings settings={videoSettings} onSettingsChange={setVideoSettings} showStyle={true} selectedPlatform={selectedPlatforms} onPlatformChange={setSelectedPlatforms} />


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
          </div>

          <div className="flex justify-center">
            <Button size="lg" onClick={handleGenerateVideo} disabled={!uploadedFiles.avatar || !uploadedFiles.audio || isGenerating} className="px-8">
              {isGenerating ? '生成中...' : '开始生成'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="works">
          <WorksList $w={props.$w} />
        </TabsContent>
      </Tabs>

    </div>
  </div>
}