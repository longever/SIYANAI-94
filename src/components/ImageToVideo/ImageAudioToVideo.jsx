// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, Mic, Play, Download } from 'lucide-react';

import { AudioPlayer } from './AudioPlayer';
import { GenerationModal } from './GenerationModal';
export default function ImageAudioToVideo(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [generationData, setGenerationData] = useState(null);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };
  const handleAudioUpload = e => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
    }
  };
  const handleGenerateVideo = async () => {
    if (!imageFile || !audioFile) {
      toast({
        title: "缺少文件",
        description: "请上传图片和音频文件",
        variant: "destructive"
      });
      return;
    }
    setIsGenerating(true);
    setShowGenerationModal(true);
    try {
      // 上传图片和音频到云存储
      const tcb = await $w.cloud.getCloudInstance();
      const [imageUpload, audioUpload] = await Promise.all([tcb.uploadFile({
        cloudPath: `images/${Date.now()}_${imageFile.name}`,
        filePath: imageFile
      }), tcb.uploadFile({
        cloudPath: `audios/${Date.now()}_${audioFile.name}`,
        filePath: audioFile
      })]);
      const generationData = {
        imageUrl: imageUpload.fileID,
        audioUrl: audioUpload.fileID,
        title: `图片音频视频 - ${new Date().toLocaleString()}`,
        type: 'image-audio-to-video',
        settings: {
          resolution: '1080p',
          duration: 30,
          fps: 30
        }
      };
      setGenerationData(generationData);

      // 调用云函数创建任务
      const result = await $w.cloud.callFunction({
        name: 'image-to-video-task',
        data: {
          imageUrl: imageUpload.fileID,
          audioUrl: audioUpload.fileID,
          model: 'tongyi-wanxiang',
          userId: $w.auth.currentUser?.userId || 'anonymous',
          type: 'image-audio-to-video',
          settings: {
            resolution: '1080p',
            duration: 30,
            fps: 30
          },
          // 确保时间戳为数字类型
          createdAt: Date.now(),
          updatedAt: Date.now()
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
            setIsGenerating(false);
            // 获取生成的视频URL
            const tcb = await $w.cloud.getCloudInstance();
            const videoUrl = await tcb.getTempFileURL({
              fileList: [result.result.videoUrl]
            });
            setGeneratedVideo({
              url: videoUrl.fileList[0].tempFileURL,
              thumbnail: result.result.thumbnailUrl || '',
              duration: 30,
              size: result.result.fileSize || '25.6 MB'
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
            title: `图片音频视频 - ${new Date().toLocaleString()}`,
            videoUrl: videoData.url,
            thumbnailUrl: videoData.thumbnail,
            duration: 30,
            fileSize: videoData.size,
            type: 'image-audio-to-video',
            taskId: taskId,
            // 确保时间戳为数字类型
            createdAt: Date.now(),
            updatedAt: Date.now()
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
    <div className="grid grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium mb-2">上传图片</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload-audio" />
          <label htmlFor="image-upload-audio" className="cursor-pointer">
            {imageFile ? <div className="space-y-2">
              <img src={URL.createObjectURL(imageFile)} alt="预览" className="max-w-full h-32 object-contain mx-auto rounded" />
              <p className="text-sm text-gray-600">{imageFile.name}</p>
            </div> : <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-gray-400" />
              <p className="text-sm text-gray-600">点击上传图片</p>
            </div>}
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">上传音频</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" id="audio-upload" />
          <label htmlFor="audio-upload" className="cursor-pointer">
            {audioFile ? <div className="space-y-2">
              <Mic className="w-8 h-8 mx-auto text-gray-400" />
              <p className="text-sm text-gray-600">{audioFile.name}</p>
            </div> : <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-gray-400" />
              <p className="text-sm text-gray-600">点击上传音频</p>
            </div>}
          </label>
        </div>
      </div>
    </div>

    {audioFile && <AudioPlayer audioUrl={URL.createObjectURL(audioFile)} title={audioFile.name} />}

    <Button className="w-full" disabled={!imageFile || !audioFile || isGenerating} onClick={handleGenerateVideo}>
      {isGenerating ? '生成中...' : '开始生成'}
    </Button>

    <GenerationModal isOpen={showGenerationModal} onClose={() => setShowGenerationModal(false)} generationData={generationData} />

    {generatedVideo && <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">生成结果</h3>
      <video src={generatedVideo.url} controls className="w-full max-w-md mx-auto rounded" poster={generatedVideo.thumbnail} />
      <div className="flex gap-2 mt-4">
        <Button variant="outline" onClick={() => window.open(generatedVideo.url, '_blank')}>
          <Play className="w-4 h-4 mr-2" />
          预览
        </Button>
        <Button variant="outline" onClick={() => window.open(generatedVideo.url, '_blank')}>
          <Download className="w-4 h-4 mr-2" />
          下载
        </Button>
        <Button onClick={() => handleSaveToDatabase(generatedVideo)}>
          保存到作品库
        </Button>
      </div>
    </div>}
  </div>;
}