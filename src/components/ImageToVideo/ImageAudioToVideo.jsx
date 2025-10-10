// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Progress, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, FileAudio, Loader2, Image } from 'lucide-react';

export default function ImageAudioToVideo({
  onTaskCreated
}) {
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const {
    toast
  } = useToast();
  const handleImageUpload = async e => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setIsUploading(true);
      try {
        const tcb = await window.$w.cloud.getCloudInstance();
        const uploadRes = await tcb.uploadFile({
          cloudPath: `temp/${Date.now()}_${file.name}`,
          filePath: file
        });
        setImageUrl(uploadRes.fileID);
        toast({
          title: '图片上传成功'
        });
      } catch (error) {
        toast({
          title: '图片上传失败',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setIsUploading(false);
      }
    }
  };
  const handleAudioUpload = async e => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      setIsUploading(true);
      try {
        const tcb = await window.$w.cloud.getCloudInstance();
        const uploadRes = await tcb.uploadFile({
          cloudPath: `temp/${Date.now()}_${file.name}`,
          filePath: file
        });
        setAudioUrl(uploadRes.fileID);
        toast({
          title: '音频上传成功'
        });
      } catch (error) {
        toast({
          title: '音频上传失败',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setIsUploading(false);
      }
    }
  };
  const handleGenerate = async () => {
    if (!imageUrl || !audioUrl) {
      toast({
        title: '请上传图片和音频',
        variant: 'destructive'
      });
      return;
    }
    try {
      const result = await window.$w.cloud.callFunction({
        name: 'generateImageToVideo',
        data: {
          userId: window.$w.auth.currentUser?.userId || 'anonymous',
          inputType: 'audio',
          imageUrl,
          audioUrl,
          modelParams: {
            duration: 10,
            fps: 30,
            resolution: '1080p'
          }
        }
      });
      if (result.result.error) {
        throw new Error(result.result.error);
      }
      toast({
        title: '任务创建成功',
        description: '正在生成视频...'
      });
      onTaskCreated(result.result.taskId);
    } catch (error) {
      toast({
        title: '任务创建失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  return <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">上传图片</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload-audio" disabled={isUploading} />
          <label htmlFor="image-upload-audio" className="cursor-pointer">
            {imageFile ? <div className="space-y-2">
                <img src={URL.createObjectURL(imageFile)} alt="预览" className="max-w-full h-48 object-contain mx-auto rounded" />
                <p className="text-sm text-gray-600">{imageFile.name}</p>
              </div> : <div className="space-y-2">
                {isUploading ? <Loader2 className="w-12 h-12 mx-auto text-gray-400 animate-spin" /> : <Image className="w-12 h-12 mx-auto text-gray-400" />}
                <p className="text-sm text-gray-600">
                  {isUploading ? '上传中...' : '点击上传图片'}
                </p>
              </div>}
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">上传音频</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" id="audio-upload" disabled={isUploading} />
          <label htmlFor="audio-upload" className="cursor-pointer">
            {audioFile ? <div className="space-y-2">
                <FileAudio className="w-12 h-12 mx-auto text-gray-400" />
                <p className="text-sm text-gray-600">{audioFile.name}</p>
                <audio controls src={URL.createObjectURL(audioFile)} className="w-full max-w-xs" />
              </div> : <div className="space-y-2">
                {isUploading ? <Loader2 className="w-12 h-12 mx-auto text-gray-400 animate-spin" /> : <FileAudio className="w-12 h-12 mx-auto text-gray-400" />}
                <p className="text-sm text-gray-600">
                  {isUploading ? '上传中...' : '点击上传音频'}
                </p>
              </div>}
          </label>
        </div>
      </div>

      <Button className="w-full" onClick={handleGenerate} disabled={!imageUrl || !audioUrl || isUploading}>
        生成视频
      </Button>
    </div>;
}