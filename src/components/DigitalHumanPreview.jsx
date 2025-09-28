// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
// @ts-ignore;
import { Button, Slider } from '@/components/ui';

export function DigitalHumanPreview({
  avatar,
  voice,
  background,
  action,
  expression,
  isDarkMode
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(100);
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  const handleReset = () => {
    setRotation(0);
    setZoom(100);
  };
  return <div className="h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden">
      {/* 3D预览区域 */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* 背景 */}
          <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: background?.image ? `url(${background.image})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }} />
          
          {/* 3D虚拟人 */}
          <div className="relative">
            <div className="w-48 h-64 bg-gradient-to-b from-gray-200 to-gray-400 rounded-lg flex items-center justify-center transition-transform duration-300" style={{
            transform: `rotateY(${rotation}deg) scale(${zoom / 100})`,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-600 rounded-full mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl">
                    {avatar?.name?.charAt(0) || '👤'}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{avatar?.name || '虚拟形象'}</p>
                <p className="text-xs text-gray-500">{voice?.name || '默认音色'}</p>
              </div>
            </div>
            
            {/* 动作指示器 */}
            {action && <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <span className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                  {action.name}
                </span>
              </div>}
          </div>
        </div>
        
        {/* 控制按钮 */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button size="sm" variant="secondary" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="secondary">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
        
        {/* 视角控制 */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 rounded-lg p-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white">旋转</span>
              <Slider value={[rotation]} onValueChange={v => setRotation(v[0])} min={-180} max={180} step={1} className="w-24" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white">缩放</span>
              <Slider value={[zoom]} onValueChange={v => setZoom(v[0])} min={50} max={200} step={10} className="w-24" />
            </div>
          </div>
        </div>
      </div>
      
      {/* 播放控制 */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-center gap-4">
          <Button size="sm" onClick={handlePlayPause} className="bg-[#165DFF] hover:bg-[#165DFF]/90">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <span className="text-sm text-gray-300">
            {isPlaying ? '正在预览...' : '点击预览'}
          </span>
        </div>
      </div>
    </div>;
}