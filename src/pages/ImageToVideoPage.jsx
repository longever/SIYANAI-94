// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Tabs, TabsContent, TabsList, TabsTrigger, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';

import { ImageToVideo } from '@/components/ImageToVideo/ImageToVideo';
import { ImageAudioToVideo } from '@/components/ImageToVideo/ImageAudioToVideo';
import { ImageVideoToVideo } from '@/components/ImageToVideo/ImageVideoToVideo';
import { WorksList } from '@/components/ImageToVideo/WorksList';
export default function ImageToVideoPage(props) {
  const [activeTab, setActiveTab] = useState('image-to-video');
  return <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">图生视频</h1>
        <p className="text-muted-foreground">
          使用AI技术将静态图片转换为动态视频，支持多种生成模式
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="image-to-video">图片转视频</TabsTrigger>
          <TabsTrigger value="image-audio-to-video">图片+音频转视频</TabsTrigger>
          <TabsTrigger value="image-video-to-video">图片+视频转视频</TabsTrigger>
        </TabsList>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TabsContent value="image-to-video" className="mt-0">
              <ImageToVideo />
            </TabsContent>
            
            <TabsContent value="image-audio-to-video" className="mt-0">
              <ImageAudioToVideo />
            </TabsContent>
            
            <TabsContent value="image-video-to-video" className="mt-0">
              <ImageVideoToVideo />
            </TabsContent>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>我的作品</CardTitle>
                <CardDescription>查看和管理您的生成历史</CardDescription>
              </CardHeader>
              <CardContent>
                <WorksList />
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>;
}