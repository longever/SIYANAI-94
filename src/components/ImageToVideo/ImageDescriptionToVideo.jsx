// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Tabs, TabsContent, TabsList, TabsTrigger, Card, CardContent, CardDescription, CardHeader, CardTitle, useToast, Checkbox } from '@/components/ui';
// @ts-ignore;
import { Upload, Sparkles } from 'lucide-react';

import { ScriptGenerator } from '@/components/ScriptGenerator';
import { FileUploadSection } from './FileUploadSection';
import { AvatarPreview } from './AvatarPreview';
import { VideoSettings } from './VideoSettings';
import { WorksList } from './WorksList';
import { FUNCTION_IMAGE_DESCRIPTION_TO_VIDEO } from '.././configs/myConfigs';
export function ImageDescriptionToVideo(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [imageFile, setImageFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({
    avatar: null,
    audio: null
  });
  const [activeTab, setActiveTab] = useState('create');
  const [description, setDescription] = useState('');
  const [showScriptGenerator, setShowScriptGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [useAudio, setUseAudio] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState('tongyi-wanxiang');
  const [videoSettings, setVideoSettings] = useState({
    resolution: '480P',
    ratio: '3:4',
    duration: 30,
    style: 'normal'
  });
  const handleFileUpload = (type, file) => {
    setUploadedFiles(prev => ({
      ...prev,
      [type]: file
    }));
  };
  const handleScriptGenerated = script => {
    const generatedDescription = script.nodes.map(node => node.content).join('\n\n');
    setDescription(generatedDescription);
    setShowScriptGenerator(false);
  };
  const handleGenerateVideo = async () => {
    if (!uploadedFiles.avatar || !description.trim()) {
      toast({
        title: "缺少内容",
        description: "请上传图片并输入描述",
        variant: "destructive"
      });
      return;
    }
    setIsGenerating(true);
    setShowGenerationModal(true);
    setGenerationProgress(0);
    try {
      // 上传图片到云存储
      const tcb = await $w.cloud.getCloudInstance();
      const imageUpload = await tcb.uploadFile({
        cloudPath: `images/${Date.now()}_${uploadedFiles.avatar.name}`,
        filePath: uploadedFiles.avatar
      });
      let audioUpload = null;
      if (useAudio && uploadedFiles.audio) {
        audioUpload = await tcb.uploadFile({
          cloudPath: `audios/${Date.now()}_${uploadedFiles.audio.name}`,
          filePath: uploadedFiles.audio
        });
      }

      // 调用云函数创建任务
      const {
        result
      } = await $w.cloud.callFunction({
        name: FUNCTION_IMAGE_DESCRIPTION_TO_VIDEO,
        data: {
          imageUrl: imageUpload.fileID,
          audioUrl: useAudio && audioUpload ? audioUpload.fileID : '',
          prompt: description, 
          userId: $w.auth.currentUser?.userId || 'anonymous',
          type: 'image-description-to-video',
          settings: videoSettings,
          model: selectedPlatforms,
          useAudio: useAudio
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
              <FileUploadSection type="avatar" title="上传头像" description="支持 JPG、PNG 格式，建议尺寸 512x512" accept="image/*" onFileUpload={file => handleFileUpload('avatar', file)} uploadedFile={uploadedFiles.avatar} />

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="use-audio" checked={useAudio} onCheckedChange={checked => setUseAudio(!!checked)} />
                  <label htmlFor="use-audio" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    使用音频
                  </label>
                </div>

                {useAudio && <FileUploadSection type="audio" title="上传音频" description="支持 MP3、WAV 格式，最大 50MB" accept="audio/*" onFileUpload={file => handleFileUpload('audio', file)} uploadedFile={uploadedFiles.audio} />}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">图片描述</label>
                  <Button variant="ghost" size="sm" onClick={() => setShowScriptGenerator(!showScriptGenerator)} className="text-blue-600 hover:text-blue-700">
                    <Sparkles className="w-4 h-4 mr-1" />
                    AI生成描述
                  </Button>
                </div>

                {showScriptGenerator && <div className="mb-4">
                  <ScriptGenerator onGenerate={handleScriptGenerated} />
                </div>}

                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="请输入图片的描述文字，AI将根据描述生成视频..." className="w-full min-h-[120px] p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
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
            <Button size="lg" onClick={handleGenerateVideo} disabled={!uploadedFiles.avatar || !description.trim() || isGenerating} className="px-8">
              {isGenerating ? '生成中...' : '开始生成'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="works">
          <WorksList $w={props.$w} />
        </TabsContent>
      </Tabs>

    </div>
  </div>;
}