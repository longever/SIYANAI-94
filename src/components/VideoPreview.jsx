// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Slider, useToast } from '@/components/ui';
// @ts-ignore;
import { Play, Pause, Download, Maximize2, Volume2 } from 'lucide-react';

export function VideoPreview({
  result
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const {
    toast
  } = useToast();
  const handleDownload = () => {
    toast({
      title: '开始下载',
      description: '视频正在准备下载...'
    });
  };
  const handleShare = () => {
    toast({
      title: '分享链接已复制',
      description: '视频分享链接已复制到剪贴板'
    });
  };
  return <Card className="bg-slate-900 border-slate-800 h-full">
      <CardHeader>
        <CardTitle className="text-lg">预览窗口</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            {result ? <div className="text-center">
                <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mb-4">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <p className="text-slate-300">
                  {result.type === 'text2video' && '文生视频预览'}
                  {result.type === 'image2video' && '图生视频预览'}
                  {result.type === 'digital_human' && '数字人视频预览'}
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  点击播放查看效果
                </p>
              </div> : <p className="text-slate-500">生成视频后在此预览</p>}
          </div>

          <div className="absolute top-2 right-2">
            <Button size="sm" variant="ghost" onClick={() => setIsFullscreen(!isFullscreen)}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Slider value={[currentTime]} onValueChange={([value]) => setCurrentTime(value)} max={100} step={1} className="flex-1" />
            
            <span className="text-sm text-slate-400">0:00 / 0:30</span>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <Slider value={[volume]} onValueChange={([value]) => setVolume(value)} max={1} step={0.1} className="w-24" />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleDownload} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            下载视频
          </Button>
          <Button onClick={handleShare} variant="outline" className="flex-1">
            分享视频
          </Button>
        </div>
      </CardContent>
    </Card>;
}