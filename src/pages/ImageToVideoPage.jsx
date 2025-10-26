// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Tabs, TabsContent, TabsList, TabsTrigger, Card, CardContent, CardDescription, CardHeader, CardTitle, Button, useToast, GenerationModal } from '@/components/ui';
// @ts-ignore;
import { Upload, Image, FileAudio, Video, Sparkles } from 'lucide-react';
 
import ImageAudioToVideo from '@/components/ImageToVideo/ImageAudioToVideo';
import ImageVideoToVideo from '@/components/ImageToVideo/ImageVideoToVideo';
import ImageDescriptionToVideo from '@/components/ImageToVideo/ImageDescriptionToVideo';


// 图+描述组件
function ImageDescriptionMode(props){
  return <ImageDescriptionToVideo $w={props.$w} />;
}

// 图+音频组件
function ImageAudioMode(props) {
  return <ImageAudioToVideo $w={props.$w} />;
}

// 图+视频组件
function ImageVideoMode(props) {
  return <ImageVideoToVideo $w={props.$w} />;
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
              <ImageDescriptionMode $w={props.$w} />
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
              <ImageAudioMode $w={props.$w} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video">
          <Card>
            <CardHeader>
              <CardTitle>图片 + 视频生成</CardTitle>
              <CardDescription>
                上传人物图片和动作参考视频，AI将合成高质量视频
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageVideoMode $w={props.$w} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </div>;
}