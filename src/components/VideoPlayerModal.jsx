// @ts-ignore;
import React, { useState, useRef, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button } from '@/components/ui';
// @ts-ignore;
import { Play, Pause, Volume2, VolumeX, Maximize, Download, X } from 'lucide-react';

const VideoPlayerModal = ({
  isOpen,
  onClose,
  videoUrl,
  videoTitle
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  useEffect(() => {
    if (isOpen && videoUrl) {
      setIsLoading(true);
      setError(null);
      setIsPlaying(false);

      // 重置视频状态
      if (videoRef.current) {
        videoRef.current.load();
      }
    }
  }, [isOpen, videoUrl]);
  const handlePlayPause = async () => {
    if (!videoRef.current) return;
    try {
      if (isPlaying) {
        await videoRef.current.pause();
        setIsPlaying(false);
      } else {
        // 处理自动播放限制
        await videoRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('播放失败:', error);
      setError('无法自动播放，请点击播放按钮');

      // 尝试静音播放（解决自动播放限制）
      if (error.name === 'NotAllowedError') {
        videoRef.current.muted = true;
        setIsMuted(true);
        try {
          await videoRef.current.play();
          setIsPlaying(true);
          setError(null);
        } catch (mutedError) {
          setError('请手动点击播放按钮');
        }
      }
    }
  };
  const handleLoadedMetadata = () => {
    setIsLoading(false);
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  const handleVolumeChange = e => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };
  const handleSeek = e => {
    const newTime = parseFloat(e.target.value) / 100 * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };
  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `${videoTitle || 'video'}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  const formatTime = time => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  const handleVideoError = e => {
    console.error('视频加载错误:', e);
    setError('视频加载失败，请检查网络连接或视频地址');
    setIsLoading(false);
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full bg-gray-900 border-gray-700">
        <DialogHeader className="border-b border-gray-700 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-xl">{videoTitle || '视频播放'}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="relative bg-black rounded-lg overflow-hidden">
          {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>加载中...</p>
              </div>
            </div>}

          {error && <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="text-red-400 text-center p-4">
                <p className="mb-4">{error}</p>
                <Button onClick={() => {
              setError(null);
              setIsLoading(true);
              if (videoRef.current) {
                videoRef.current.load();
              }
            }} variant="outline" className="text-white border-white">
                  重试
                </Button>
              </div>
            </div>}

          <video ref={videoRef} src={videoUrl} className="w-full aspect-video" onLoadedMetadata={handleLoadedMetadata} onTimeUpdate={handleTimeUpdate} onError={handleVideoError} onLoadStart={() => setIsLoading(true)} onCanPlay={() => setIsLoading(false)} controls={false} playsInline preload="metadata" />

          {/* 自定义控制栏 */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center space-x-4">
              <Button onClick={handlePlayPause} variant="ghost" size="sm" className="text-white hover:bg-white/20">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <div className="flex items-center space-x-2">
                <Button onClick={() => {
                setIsMuted(!isMuted);
                if (videoRef.current) {
                  videoRef.current.muted = !isMuted;
                }
              }} variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                
                <input type="range" min="0" max="1" step="0.1" value={volume} onChange={handleVolumeChange} className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
              </div>

              <div className="flex-1 flex items-center space-x-2">
                <span className="text-white text-sm">{formatTime(currentTime)}</span>
                <input type="range" min="0" max="100" value={duration ? currentTime / duration * 100 : 0} onChange={handleSeek} className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                <span className="text-white text-sm">{formatTime(duration)}</span>
              </div>

              <Button onClick={handleDownload} variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Download className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};
export default VideoPlayerModal;