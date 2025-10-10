// @ts-ignore;
import React, { useState, useRef } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Progress, useToast, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { Upload, X, Image, Video, Play, Settings, Sparkles } from 'lucide-react';

import { VideoSettings } from './VideoSettings';
import { GenerationModal } from './GenerationModal';
import { WorksList } from './WorksList';
import { SaveToDatabase } from './SaveToDatabase';
function FileUploadSection({
  type,
  title,
  description,
  accept,
  onFileUpload,
  uploadedFile,
  preview
}) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const {
    toast
  } = useToast();
  const handleFileSelect = e => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 100; // 100MB for video files
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "文件过大",
          description: `${title}文件大小不能超过 ${maxSize}MB`,
          variant: "destructive"
        });
        return;
      }
      onFileUpload(file);
    }
  };
  const handleDrop = e => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const maxSize = 100;
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "文件过大",
          description: `${title}文件大小不能超过 ${maxSize}MB`,
          variant: "destructive"
        });
        return;
      }
      onFileUpload(file);
    }
  };
  const getFileIcon = () => {
    if (type === 'image') return <Image className="w-12 h-12 text-gray-400" />;
    return <Video className="w-12 h-12 text-gray-400" />;
  };
  return <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {uploadedFile ? <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {type === 'image' ? <img src={preview} alt="预览" className="w-16 h-16 rounded-lg object-cover" /> : <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Video className="w-8 h-8 text-purple-600" />
                </div>}
              <div>
                <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                <p className="text-xs text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button onClick={() => onFileUpload(null)} className="text-red-500 hover:text-red-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div> : <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragOver ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-gray-400'}`} onDrop={handleDrop} onDragOver={e => {
      e.preventDefault();
      setDragOver(true);
    }} onDragLeave={() => setDragOver(false)}>
          <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileSelect} className="hidden" />
          <div className="flex flex-col items-center">
            {getFileIcon()}
            <p className="text-gray-600 mb-2">
              拖拽{type === 'image' ? '图片' : '视频'}文件到此处，或
              <button onClick={() => fileInputRef.current?.click()} className="text-purple-600 hover:text-purple-700 font-medium ml-1">
                点击上传
              </button>
            </p>
            <p className="text-gray-500 text-sm">
              支持 {accept} 格式
            </p>
          </div>
        </div>}
    </div>;
}
function PreviewSection({
  imageFile,
  videoFile,
  settings
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  return <Card>
      <CardHeader>
        <CardTitle>实时预览</CardTitle>
        <CardDescription>预览图+视频合成效果</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
          {imageFile && videoFile ? <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-purple-200">
                  <img src={URL.createObjectURL(imageFile)} alt="人物" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center justify-center space-x-2 text-purple-600">
                  <Video className="w-5 h-5" />
                  <span className="text-sm">{videoFile.name}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {settings.resolution} • {settings.fps}fps • {settings.quality}
                </p>
              </div>
            </div> : <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">上传图片和视频后开始预览</p>
              </div>
            </div>}
        </div>
      </CardContent>
    </Card>;
}
export default function ImageVideoToVideo(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('create');
  const [uploadedFiles, setUploadedFiles] = useState({
    image: null,
    video: null
  });
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
    if (!uploadedFiles.image || !uploadedFiles.video) {
      toast({
        title: "缺少文件",
        description: "请上传图片和视频文件",
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
            size: '45.8 MB'
          });
          return 100;
        }
        return prev + 5;
      });
    }, 300);
  };
  const handleSaveToDatabase = async videoData => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'video_generation_tasks',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            title: `图+视频生成 - ${new Date().toLocaleString()}`,
            type: 'image_video',
            imageUrl: 'placeholder-image-url',
            videoUrl: 'placeholder-video-url',
            outputUrl: videoData.url,
            thumbnailUrl: videoData.thumbnail,
            duration: videoData.duration,
            fileSize: videoData.size,
            settings: videoSettings,
            status: 'completed',
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
            <Sparkles className="w-8 h-8 text-purple-600 mr-3" />
            图+视频生成
          </h1>
          <p className="text-gray-600">上传人物图片和动作参考视频，AI将合成高质量视频</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="create">创建视频</TabsTrigger>
            <TabsTrigger value="works">我的作品</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <FileUploadSection type="image" title="上传人物图片" description="支持 JPG、PNG 格式，建议清晰正面照片" accept="image/*" onFileUpload={file => handleFileUpload('image', file)} uploadedFile={uploadedFiles.image} preview={uploadedFiles.image ? URL.createObjectURL(uploadedFiles.image) : null} />

                <FileUploadSection type="video" title="上传参考视频" description="支持 MP4、MOV 格式，最大 100MB" accept="video/*" onFileUpload={file => handleFileUpload('video', file)} uploadedFile={uploadedFiles.video} />
              </div>

              <div className="space-y-6">
                <VideoSettings settings={videoSettings} onSettingsChange={setVideoSettings} />

                <PreviewSection imageFile={uploadedFiles.image} videoFile={uploadedFiles.video} settings={videoSettings} />
              </div>
            </div>

            <div className="flex justify-center">
              <Button size="lg" onClick={handleGenerateVideo} disabled={!uploadedFiles.image || !uploadedFiles.video || isGenerating} className="px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                {isGenerating ? <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    生成中...
                  </> : <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    开始生成
                  </>}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="works">
            <WorksList type="image_video" />
          </TabsContent>
        </Tabs>

        <GenerationModal open={showGenerationModal} onOpenChange={setShowGenerationModal} progress={generationProgress} isGenerating={isGenerating} generatedVideo={generatedVideo} onSave={() => generatedVideo && handleSaveToDatabase(generatedVideo)} />
      </div>
    </div>;
}