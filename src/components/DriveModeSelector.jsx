// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Type, Mic, Upload } from 'lucide-react';
// @ts-ignore;
import { Card, CardContent, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, Button } from '@/components/ui';

export function DriveModeSelector({
  onModeChange
}) {
  const [driveMode, setDriveMode] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const handleModeChange = mode => {
    setDriveMode(mode);
    onModeChange(mode);
  };
  const handleTextChange = text => {
    setTextContent(text);
    onModeChange('text', {
      content: text
    });
  };
  const handleAudioUpload = e => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      onModeChange('audio', {
        file
      });
    }
  };
  return <div className="space-y-4">
      <h4 className="font-medium">驱动模式</h4>
      
      <Tabs value={driveMode} onValueChange={handleModeChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text" className="flex items-center gap-1">
            <Type className="w-4 h-4" />
            文案驱动
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-1">
            <Mic className="w-4 h-4" />
            音频驱动
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="text" className="space-y-3">
          <Textarea placeholder="请输入要合成的文案内容..." value={textContent} onChange={e => handleTextChange(e.target.value)} className="min-h-[100px]" />
          <div className="text-xs text-gray-500">
            支持中英文，建议控制在500字以内
          </div>
        </TabsContent>
        
        <TabsContent value="audio" className="space-y-3">
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" id="audio-upload" />
            <label htmlFor="audio-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                {audioFile ? audioFile.name : '点击上传音频文件'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                支持 MP3, WAV, M4A 格式
              </p>
            </label>
          </div>
        </TabsContent>
      </Tabs>
    </div>;
}