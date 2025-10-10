// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Tabs, TabsContent, TabsList, TabsTrigger, Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@/components/ui';
// @ts-ignore;
import { Upload, Image, FileAudio, Video } from 'lucide-react';

import DigitalHumanPage from './DigitalHumanPage';

// 图+描述组件
function ImageDescriptionMode() {
  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState('');
  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
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
        <label className="block text-sm font-medium mb-2">图片描述</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="请输入图片的描述文字，AI将根据描述生成视频..." className="w-full min-h-[120px] p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
      </div>

      <Button className="w-full" disabled={!imageFile || !description}>
        生成视频
      </Button>
    </div>;
}

// 图+音频组件
function ImageAudioMode() {
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
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
  return <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">上传图片</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-audio-upload" />
          <label htmlFor="image-audio-upload" className="cursor-pointer">
            {imageFile ? <div className="space-y-2">
                <img src={URL.createObjectURL(imageFile)} alt="预览" className="max-w-full h-48 object-contain mx-auto rounded" />
                <p className="text-sm text-gray-600">{imageFile.name}</p>
              </div> : <div className="space-y-2">
                <Image className="w-12 h-12 mx-auto text-gray-400" />
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
                <FileAudio className="w-12 h-12 mx-auto text-blue-500" />
                <p className="text-sm text-gray-600">{audioFile.name}</p>
              </div> : <div className="space-y-2">
                <FileAudio className="w-12 h-12 mx-auto text-gray-400" />
                <p className="text-sm text-gray-600">点击上传音频文件</p>
              </div>}
          </label>
        </div>
      </div>

      <Button className="w-full" disabled={!imageFile || !audioFile}>
        生成视频
      </Button>
    </div>;
}

// 图+视频模式 - 复用DigitalHumanPage
function ImageVideoMode() {
  return <div>
      <DigitalHumanPage />
    </div>;
}
export default function ImageToVideoPage(props) {
  const [activeTab, setActiveTab] = useState('description');
  return <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">图片转视频</h1>
          <p className="text-gray-600">选择适合的方式，将静态图片转换为动态视频</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="description" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              图+描述
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2">
              <FileAudio className="w-4 h-4" />
              图+音频
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              图+视频
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description">
            <Card>
              <CardHeader>
                <CardTitle>图片 + 描述生成</CardTitle>
                <CardDescription>
                  上传图片并输入描述文字，AI将根据描述生成动态视频
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageDescriptionMode />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audio">
            <Card>
              <CardHeader>
                <CardTitle>图片 + 音频生成</CardTitle>
                <CardDescription>
                  上传图片和音频文件，AI将生成口播视频
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageAudioMode />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="video">
            <Card>
              <CardHeader>
                <CardTitle>图片 + 视频生成</CardTitle>
                <CardDescription>
                  使用数字人技术，将图片转换为高质量视频
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageVideoMode />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}