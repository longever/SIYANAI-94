// @ts-ignore;
import React, { useState, useRef, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Progress } from '@/components/ui';
// @ts-ignore;
import { Play, Pause, Volume2, VolumeX, Maximize, Download, Share2, Clock, Film } from 'lucide-react';

export function VideoPreviewWindow({
  previewUrl,
  isLoading,
  nodes,
  currentProgress = 0
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const totalDuration = nodes.reduce((sum, node) => sum + (node.duration || 5), 0);
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  const handleSeek = e => {
    const seekTime = e.target.value / 100 * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
  };
  const handleVolumeToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };
  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };
  const formatTime = time => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  const getCurrentNode = () => {
    let elapsed = 0;
    for (const node of nodes) {
      if (currentTime >= elapsed && currentTime < elapsed + (node.duration || 5)) {
        return {
          ...node,
          startTime: elapsed
        };
      }
      elapsed += node.duration || 5;
    }
    return null;
  };
  const handleDownload = () => {
    if (previewUrl) {
      const link = document.createElement('a');
      link.href = previewUrl;
      link.download = `ai-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  const handleShare = () => {
    if (previewUrl) {
      navigator.clipboard.writeText(previewUrl);
    }
  };
  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('ended', () => setIsPlaying(false));
    }
  }, []);
  const currentNode = getCurrentNode();
  return <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Film className="w-5 h-5" />
          视频预览
          {currentNode && <span className="text-sm text-slate-400 font-normal">
              {currentNode.title}
            </span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="relative" onMouseEnter={() => setShowControls(true)} onMouseLeave={() => setShowControls(false)}>
          {/* 视频播放区域 */}
          <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative">
            {previewUrl ? <video ref={videoRef} src={previewUrl} className="w-full h-full object-cover" onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} muted={isMuted} onClick={handlePlayPause} /> : <div className="w-full h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <Film className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p className="text-lg">暂无预览</p>
                  <p className="text-sm opacity-75 mt-1">
                    {nodes.length === 0 ? '添加节点并生成视频后查看预览' : '点击生成视频按钮开始制作'}
                  </p>
                </div>
              </div>}
            
            {/* 加载遮罩 */}
            {isLoading && <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                <div className="text-center">
                  <Progress value={currentProgress} className="w-48 mb-3" />
                  <p className="text-white font-medium">生成中... {currentProgress}%</p>
                  <p className="text-slate-300 text-sm mt-1">正在处理您的视频，请稍候...</p>
                </div>
              </div>}

            {/* 播放按钮遮罩 */}
            {previewUrl && !isLoading && showControls && <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <button onClick={handlePlayPause} className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all">
                  {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
                </button>
              </div>}
          </div>

          {/* 控制栏 */}
          {previewUrl && <div className={`mt-4 space-y-3 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
              {/* 进度条 */}
              <div className="space-y-1">
                <input type="range" min="0" max="100" value={duration ? currentTime / duration * 100 : 0} onChange={handleSeek} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                <div className="flex justify-between text-sm text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* 控制按钮 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={handlePlayPause} className="p-2 hover:bg-slate-700 rounded transition-colors">
                    {isPlaying ? <Pause className="w-5 h-5 text-slate-300" /> : <Play className="w-5 h-5 text-slate-300" />}
                  </button>
                  
                  <button onClick={handleVolumeToggle} className="p-2 hover:bg-slate-700 rounded transition-colors">
                    {isMuted ? <VolumeX className="w-5 h-5 text-slate-300" /> : <Volume2 className="w-5 h-5 text-slate-300" />}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={handleDownload} className="p-2 hover:bg-slate-700 rounded transition-colors" title="下载视频">
                    <Download className="w-5 h-5 text-slate-300" />
                  </button>
                  
                  <button onClick={handleShare} className="p-2 hover:bg-slate-700 rounded transition-colors" title="分享视频">
                    <Share2 className="w-5 h-5 text-slate-300" />
                  </button>
                  
                  <button onClick={handleFullscreen} className="p-2 hover:bg-slate-700 rounded transition-colors" title="全屏">
                    <Maximize className="w-5 h-5 text-slate-300" />
                  </button>
                </div>
              </div>
            </div>}

          {/* 节点时间线 */}
          {nodes.length > 0 && <div className="mt-4">
              <div className="text-sm text-slate-400 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                节点时间线 ({totalDuration}s)
              </div>
              <div className="relative h-8 bg-slate-700 rounded overflow-hidden">
                {nodes.map((node, index) => {
              const startPercent = nodes.slice(0, index).reduce((sum, n) => sum + (n.duration || 5), 0) / totalDuration * 100;
              const widthPercent = (node.duration || 5) / totalDuration * 100;
              const isActive = currentNode && currentNode._id === node._id;
              return <div key={node._id} className={`absolute h-full transition-all cursor-pointer ${isActive ? 'bg-blue-500' : 'bg-slate-600 hover:bg-slate-500'}`} style={{
                left: `${startPercent}%`,
                width: `${widthPercent}%`
              }} title={`${node.title} (${node.duration || 5}s)`}>
                      <div className="px-2 py-1 text-xs text-white truncate">
                        {node.title}
                      </div>
                    </div>;
            })}
                
                {/* 播放进度指示器 */}
                {previewUrl && duration > 0 && <div className="absolute top-0 bottom-0 w-0.5 bg-red-500" style={{
              left: `${currentTime / duration * 100}%`
            }} />}
              </div>
            </div>}
        </div>
      </CardContent>
    </Card>;
}