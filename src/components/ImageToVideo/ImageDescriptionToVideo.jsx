// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, useToast, GenerationModal } from '@/components/ui';
// @ts-ignore;
import { Upload, Sparkles } from 'lucide-react';

import { ScriptGenerator } from '@/components/ScriptGenerator';
export function ImageDescriptionToVideo(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState('');
  const [showScriptGenerator, setShowScriptGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };
  const handleScriptGenerated = script => {
    const generatedDescription = script.nodes.map(node => node.content).join('\n\n');
    setDescription(generatedDescription);
    setShowScriptGenerator(false);
  };
  const handleGenerateVideo = async () => {
    if (!imageFile || !description.trim()) {
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
        cloudPath: `images/${Date.now()}_${imageFile.name}`,
        filePath: imageFile
      });

      // 调用云函数创建任务
      const result = await $w.cloud.callFunction({
        name: 'image-prompt-to-video-task',
        data: {
          imageUrl: imageUpload.fileID,
          prompt: description,
          model: 'tongyi-wanxiang',
          userId: $w.auth.currentUser?.userId || 'anonymous',
          type: 'image-description-to-video',
          settings: {
            resolution: '1080p',
            duration: 10,
            fps: 30
          }
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
              duration: 10,
              size: result.result.fileSize || '15.8 MB'
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
            title: `图片描述视频 - ${new Date().toLocaleString()}`,
            videoUrl: videoData.url,
            thumbnailUrl: videoData.thumbnail,
            duration: 10,
            fileSize: videoData.size,
            prompt: description,
            type: 'image-description-to-video',
            taskId: taskId,
            createdAt: Date.now()
          }
        }
      });
      toast({
        title: "保存成功",
        description: "视频已保存到作品库"
      });
    } catch (error) {
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  return <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium mb-2">上传图片</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
        <label htmlFor="image-upload" className="cursor-pointer">
          {imageFile ? <div className="space-y-2">
            <img src={URL.createObjectURL(imageFile)} alt="预览" className="max-w-full h-48 object-contain mx-auto rounded" />
            <p className="text-sm text-gray-600">{imageFile.name}</p>
          </div> : <div className="space-y-2">
            <Upload className="w-12 h-12 mx-auto text-gray-400" />
            <p className="text-sm text-gray-600">点击上传图片</p>
          </div>}
        </label>
      </div>
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

    <Button className="w-full" disabled={!imageFile || !description.trim() || isGenerating} onClick={handleGenerateVideo}>
      {isGenerating ? '生成中...' : '生成视频'}
    </Button>

    <GenerationModal open={showGenerationModal} onOpenChange={setShowGenerationModal} progress={generationProgress} isGenerating={isGenerating} generatedVideo={generatedVideo} onSave={() => generatedVideo && handleSaveToDatabase(generatedVideo)} />
  </div>;
}