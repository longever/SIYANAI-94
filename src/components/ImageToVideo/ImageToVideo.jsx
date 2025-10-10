// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Textarea, Label, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, Play, Settings } from 'lucide-react';

import { FileUploadSection } from './FileUploadSection';
import { VideoSettings } from './VideoSettings';
import { ImageGenerationModal } from './ImageGenerationModal';
import { SaveToDatabase } from './SaveToDatabase';
export function ImageToVideo() {
  const [imageFile, setImageFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [settings, setSettings] = useState({
    duration: 5,
    fps: 24,
    resolution: '720p'
  });
  const [isGenerating, setIsGenerating] = useState(false);
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
    setShowGenerationModal(true);
  };
  const handleGenerationSuccess = async taskData => {
    setIsGenerating(false);
    // 可以在这里处理生成成功后的逻辑
    console.log('Generation completed:', taskData);
  };
  return <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>图片转视频</CardTitle>
          <CardDescription>
            上传静态图片，AI将为您生成动态视频
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUploadSection type="image" file={imageFile} onFileChange={setImageFile} accept="image/*" label="上传图片" description="支持 JPG、PNG、WEBP 格式" />

          <div className="space-y-2">
            <Label htmlFor="prompt">视频描述</Label>
            <Textarea id="prompt" placeholder="描述您希望生成的视频效果，例如：让图片中的人物微笑并眨眼" value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} />
          </div>

          <VideoSettings settings={settings} onSettingsChange={setSettings} />

          <Button onClick={handleGenerate} disabled={!imageFile || isGenerating} className="w-full" size="lg">
            <Play className="mr-2 h-4 w-4" />
            生成视频
          </Button>
        </CardContent>
      </Card>

      <ImageGenerationModal open={showGenerationModal} onOpenChange={setShowGenerationModal} type="image_to_video" params={{
      imageUrl: imageFile?.url || '',
      prompt,
      settings
    }} onSuccess={handleGenerationSuccess} />
    </div>;
}