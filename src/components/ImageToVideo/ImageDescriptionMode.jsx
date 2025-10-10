// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, Textarea } from '@/components/ui';
// @ts-ignore;
import { Upload, Sparkles } from 'lucide-react';

import { SystemSelector } from '@/components/ImageToVideo/SystemSelector';
import { VideoSettings } from '@/components/ImageToVideo/VideoSettings';
import { ScriptGenerator } from '@/components/ScriptGenerator';
export function ImageDescriptionMode() {
  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState('');
  const [showScriptGenerator, setShowScriptGenerator] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState('default');
  const [videoSettings, setVideoSettings] = useState({
    resolution: '1080p',
    duration: 5,
    style: 'realistic',
    fps: 30
  });
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
  const isReadyToGenerate = imageFile && description.trim();
  return <div className="space-y-6">
    {/* 图片上传区域 */}
    <div>
      <label className="block text-sm font-medium mb-2">上传图片</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
        <label htmlFor="image-upload" className="cursor-pointer">
          {imageFile ? <div className="space-y-2">
            <img src={URL.createObjectURL(imageFile)} alt="预览" className="max-w-full h-48 object-contain mx-auto rounded" />
            <p className="text-sm text-gray-600">{imageFile.name}</p>
          </div> : <div className="space-y-2">
            <Upload className="w-12 h-12 mx-auto text-gray-400" />
            <p className="text-sm text-gray-600">点击上传图片或拖拽到此处</p>
            <p className="text-xs text-gray-500">支持 JPG、PNG、WEBP 格式</p>
          </div>}
        </label>
      </div>
    </div>

    {/* 系统选择 */}
    <SystemSelector value={selectedSystem} onChange={setSelectedSystem} />

    {/* 视频设置 */}
    <VideoSettings settings={videoSettings} onChange={setVideoSettings} />

    {/* 描述输入 */}
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

      <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="请输入图片的描述文字，AI将根据描述生成视频...
例如：一位穿着红色连衣裙的女孩在花园里跳舞，阳光透过树叶洒在她身上，背景是盛开的玫瑰花丛..." className="w-full min-h-[120px] p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
      <p className="text-xs text-gray-500 mt-1">
        描述越详细，生成的视频效果越好
      </p>
    </div>

    {/* 生成按钮 */}
    <Button className="w-full" disabled={!isReadyToGenerate} size="lg">
      {isReadyToGenerate ? '开始生成视频' : '请先上传图片并输入描述'}
    </Button>
  </div>;
}