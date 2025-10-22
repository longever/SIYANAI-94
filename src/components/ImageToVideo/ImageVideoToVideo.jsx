// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Tabs, TabsContent, TabsList, TabsTrigger, Card, CardContent, CardDescription, CardHeader, CardTitle, useToast } from '@/components/ui';

import { FileUploadSection } from './FileUploadSection';
import { VideoSettings } from './VideoSettings';
import { SystemSelector } from './SystemSelector';
import { GenerationModal } from './GenerationModal';
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
    reference: null
  });
  const [selectedModel, setSelectedModel] = useState('tongyi-wanxiang');
  const [videoSettings, setVideoSettings] = useState({
    resolution: '480p',
    ratio: '3:4',
    fps: 30,
    quality: 'high',
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
      let referenceUpload = null;
      if (uploadedFiles.reference) {
        referenceUpload = await tcb.uploadFile({
          cloudPath: `references/${Date.now()}_${uploadedFiles.reference.name}`,
          filePath: uploadedFiles.reference
        });
      }

      // 调用云函数创建任务
      const result = await $w.cloud.callFunction({
        name: 'image-to-video-task',
        data: {
          videoUrl: videoUpload.fileID,
          referenceUrl: referenceUpload?.fileID || '',
          model: selectedModel,
          prompt: `视频风格转换，风格${videoSettings.style}，分辨率${videoSettings.resolution}，帧率${videoSettings.fps}`,
          userId: $w.auth.currentUser?.userId || 'anonymous',
          type: 'video-to-video',
          settings: videoSettings
        }
      });
      if (result.status === 'running') {
        setTaskId(result.taskId);
        // 开始轮询任务状态
        pollTaskStatus(result.taskId);
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
  const pollTaskStatus = async taskId => {
    const interval = setInterval(async () => {
      try {
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'generation_tasks',
          methodName: 'wedaGetItemV2',
          params: {
            filter: {
              where: {
                taskId: {
                  $eq: taskId
                }
              }
            },
            select: {
              $master: true
            }
          }
        });
        if (result && result.status) {
          if (result.status === 'completed') {
            clearInterval(interval);
            setGenerationProgress(100);
            setIsGenerating(false);

            // 获取生成的视频URL
            const tcb = await $w.cloud.getCloudInstance();
            const videoUrl = await tcb.getTempFileURL({
              fileList: [result.result.videoUrl]
            });
            setGeneratedVideo({
              url: videoUrl.fileList[0].tempFileURL,
              thumbnail: result.result.thumbnailUrl || '',
              duration: videoSettings.duration,
              size: result.result.fileSize || '45.2 MB'
            });
            toast({
              title: "生成完成",
              description: "视频生成成功"
            });
          } else if (result.status === 'failed') {
            clearInterval(interval);
            setIsGenerating(false);
            toast({
              title: "生成失败",
              description: result.result?.error || '未知错误',
              variant: "destructive"
            });
          } else {
            // 更新进度
            const progress = result.result?.progress || 0;
            setGenerationProgress(progress);
          }
        }
      } catch (error) {
        console.error('轮询任务状态失败:', error);
      }
    }, 2000);
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
            taskId: taskId,
            createdAt: Date.new(),
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
              <SystemSelector selectedModel={selectedModel} onSystemChange={setSelectedModel} />

              <VideoSettings settings={videoSettings} onSettingsChange={setVideoSettings} showStyle={true} />

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
          <WorksList type="video-to-video"  $w={$w}/>
        </TabsContent>
      </Tabs>

      <GenerationModal open={showGenerationModal} onOpenChange={setShowGenerationModal} progress={generationProgress} isGenerating={isGenerating} generatedVideo={generatedVideo} onSave={() => generatedVideo && handleSaveToDatabase(generatedVideo)} />
    </div>
  </div>;
}