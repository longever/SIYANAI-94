// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Slider } from '@/components/ui';
// @ts-ignore;
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2 } from 'lucide-react';

export function VideoPreviewWindow({
  nodes
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const totalDuration = nodes.reduce((sum, node) => sum + node.duration, 0);
    setDuration(totalDuration);
  }, [nodes]);
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  const handleSeek = value => {
    setCurrentTime(value[0]);
  };
  return <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">预览窗口</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            {nodes.length > 0 ? <div className="text-center">
                <p className="text-slate-400 mb-2">视频预览</p>
                <p className="text-sm text-slate-500">
                  {nodes[0]?.title || '暂无节点'}
                </p>
              </div> : <p className="text-slate-500">添加节点开始创作</p>}
          </div>
          
          <div className="absolute top-2 right-2">
            <Button size="sm" variant="ghost" onClick={() => setIsFullscreen(!isFullscreen)}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">{formatTime(currentTime)}</span>
            <Slider value={[currentTime]} onValueChange={handleSeek} max={duration} step={1} className="flex-1" />
            <span className="text-sm text-slate-500">{formatTime(duration)}</span>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <Button size="sm" variant="ghost">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={handlePlayPause}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="ghost">
              <SkipForward className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-2 ml-4">
              <Volume2 className="w-4 h-4 text-slate-500" />
              <Slider value={[volume]} onValueChange={([v]) => setVolume(v)} max={1} step={0.1} className="w-20" />
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Button className="w-full">
            渲染完整视频
          </Button>
        </div>
      </CardContent>
    </Card>;
}