// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2 } from 'lucide-react';
// @ts-ignore;
import { Button, Slider, Card } from '@/components/ui';

export function PreviewWindow({
  isDarkMode
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120);
  const [volume, setVolume] = useState(75);
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
  return <div className="h-full flex flex-col bg-black">
      {/* 视频预览区域 */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <Play className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-400">视频预览区域</p>
            </div>
          </div>
        </div>
        
        {/* 预览模式切换 */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Button size="sm" variant="secondary">节点预览</Button>
          <Button size="sm" variant="ghost">全片预览</Button>
        </div>
        
        {/* 全屏按钮 */}
        <Button size="sm" variant="ghost" className="absolute top-4 right-4">
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* 播放控制栏 */}
      <div className="bg-gray-900 p-4">
        <div className="flex items-center gap-4">
          <Button size="sm" variant="ghost" onClick={handlePlayPause} className="text-white hover:text-white">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button size="sm" variant="ghost" className="text-white hover:text-white">
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button size="sm" variant="ghost" className="text-white hover:text-white">
            <SkipForward className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm text-gray-400">{formatTime(currentTime)}</span>
            <Slider value={[currentTime]} onValueChange={handleSeek} max={duration} step={1} className="flex-1" />
            <span className="text-sm text-gray-400">{formatTime(duration)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <Slider value={[volume]} onValueChange={v => setVolume(v[0])} max={100} step={1} className="w-20" />
          </div>
        </div>
      </div>
    </div>;
}