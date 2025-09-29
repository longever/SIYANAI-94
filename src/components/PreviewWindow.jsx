// @ts-ignore;
import React, { useEffect, useRef } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
// @ts-ignore;
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';

export function PreviewWindow({
  mode,
  nodes,
  isPlaying,
  currentTime
}) {
  const videoRef = useRef(null);
  useEffect(() => {
    if (isPlaying && videoRef.current) {
      videoRef.current.play();
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isPlaying]);
  const renderPreview = () => {
    switch (mode) {
      case 'text2video':
        return <div className="aspect-video bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">文本转视频预览</div>
              <div className="text-gray-300">
                {nodes.length > 0 ? `${nodes.length} 个节点已配置` : '请添加文本节点'}
              </div>
            </div>
          </div>;
      case 'image2video':
        return <div className="aspect-video bg-gradient-to-br from-purple-900 to-pink-900 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">图片转视频预览</div>
              <div className="text-gray-300">
                {nodes.length > 0 ? `${nodes.length} 个图片节点已配置` : '请添加图片节点'}
              </div>
            </div>
          </div>;
      case 'digitalHuman':
        return <div className="aspect-video bg-gradient-to-br from-green-900 to-blue-900 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">数字人视频预览</div>
              <div className="text-gray-300">
                {nodes.length > 0 ? `${nodes.length} 个数字人节点已配置` : '请添加数字人节点'}
              </div>
            </div>
          </div>;
      default:
        return <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-gray-400">选择创作模式开始预览</div>
          </div>;
    }
  };
  return <div className="space-y-4">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            实时预览
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Maximize2 className="w-3 h-3" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderPreview()}
          
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Play className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Volume2 className="w-3 h-3" />
              </Button>
            </div>
            <div className="text-xs text-gray-400">
              {nodes.length} 节点 | {currentTime.toFixed(1)}s
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
}