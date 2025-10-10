// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Textarea, Label, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, Play } from 'lucide-react';

import { FileUploadSection } from './FileUploadSection';
import { VideoSettings } from './VideoSettings';
import { ImageGenerationModal } from './ImageGenerationModal';
export function ImageAudioToVideo() {
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [settings, setSettings] = useState({
    duration: 5,
    fps: 24,
    resolution: '720p'
  });
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const {
    toast
  } = useToast();
  const handleGenerate = () => {
    if (!imageFile) {
      toast({
        title: '提示',
        description: '请先上传图片',
        variant: 'destructive'
      });
      return;
    }
    if (!audioFile) {
      toast({
        title: '提示',
        description: '请先上传音频',
        variant: 'destructive'
      });
      return;
    }
    setShowGenerationModal(true);
  };
  const handleGenerationSuccess = async taskData => {
    console.log('Generation completed:', taskData);
  };
  return <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>图片+音频转视频</CardTitle>
          <CardDescription>
            上传静态图片和音频，AI将为您生成同步的视频
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FileUploadSection type="image" file={imageFile} onFileChange={setImageFile} accept="image/*" label="上传图片" description="支持 JPG、PNG、WEBP 格式" />
            
            <FileUploadSection type="audio" file={audioFile} onFileChange={setAudioFile} accept="audio/*" label="上传音频" description="支持 MP3、WAV、M4A 格式" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">视频描述</Label>
            <Textarea id="prompt" placeholder="描述您希望生成的视频效果，例如：让图片中的人物随着音乐节奏动起来" value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} />
          </div>

          <VideoSettings settings={settings} onSettingsChange={setSettings} />

          <Button onClick={handleGenerate} disabled={!imageFile || !audioFile} className="w-full" size="lg">
            <Play className="mr-2 h-4 w-4" />
            生成视频
          </Button>
        </CardContent>
      </Card>

      <ImageGenerationModal open={showGenerationModal} onOpenChange={setShowGenerationModal} type="image_audio_to_video" params={{
      imageUrl: imageFile?.url || '',
      audioUrl: audioFile?.url || '',
      prompt,
      settings
    }} onSuccess={handleGenerationSuccess} />
    </div>;
}