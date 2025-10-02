// @ts-ignore;
import React, { useState, useRef, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Download, X, Play, Pause, Volume2, VolumeX, Music, FileText, Maximize, Minimize, AlertCircle, RotateCcw } from 'lucide-react';

import { getAssetDownloadUrl } from '@/lib/assetUtils';
export function AssetPreviewDialog({
  open,
  onOpenChange,
  asset
}) {
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const dialogRef = useRef(null);
  const {
    toast
  } = useToast();

  // 加载素材URL
  const loadAssetUrl = useCallback(async () => {
    if (!asset || !asset._id) {
      setError('无效的素材');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const url = await getAssetDownloadUrl(asset._id, {
        cloud: {
          callDataSource: params => window.$w?.cloud?.callDataSource(params),
          getCloudInstance: () => window.$w?.cloud?.getCloudInstance()
        }
      });
      setDownloadUrl(url);
    } catch (error) {
      console.error('加载素材URL失败:', error);
      setError(error.message || '无法加载素材');
      toast({
        title: '加载失败',
        description: error.message || '无法加载素材，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [asset]);
  useEffect(() => {
    if (open && asset) {
      loadAssetUrl();
    }
  }, [open, asset, loadAssetUrl]);

  // 重试加载
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    loadAssetUrl();
  };

  // 全屏处理
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 媒体控制函数
  const handlePlayPause = useCallback(() => {
    const mediaElement = videoRef.current || audioRef.current;
    if (!mediaElement) return;
    if (isPlaying) {
      mediaElement.pause();
    } else {
      mediaElement.play().catch(err => {
        console.error('播放失败:', err);
        toast({
          title: '播放失败',
          description: '无法播放媒体文件',
          variant: 'destructive'
        });
      });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, toast]);
  const handleMuteToggle = useCallback(() => {
    const mediaElement = videoRef.current || audioRef.current;
    if (mediaElement) {
      mediaElement.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);
  const handleTimeUpdate = useCallback(e => {
    setCurrentTime(e.target.currentTime);
  }, []);
  const handleLoadedMetadata = useCallback(e => {
    setDuration(e.target.duration);
  }, []);
  const handleSeek = useCallback(e => {
    const mediaElement = videoRef.current || audioRef.current;
    if (mediaElement && duration > 0) {
      const seekTime = e.target.value / 100 * duration;
      mediaElement.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  }, [duration]);
  const handleFullscreen = useCallback(() => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen().catch(err => {
          console.error('全屏失败:', err);
        });
      } else {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);
  const formatTime = time => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 下载文件
  const handleDownload = async () => {
    if (!downloadUrl) {
      toast({
        title: '下载失败',
        description: '文件URL不可用',
        variant: 'destructive'
      });
      return;
    }
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('下载失败');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = asset.name || 'download';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({
        title: '下载成功',
        description: '文件已开始下载'
      });
    } catch (error) {
      console.error('下载失败:', error);
      toast({
        title: '下载失败',
        description: '无法下载文件，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 获取文件路径显示
  const getFolderPath = folderPath => {
    if (!folderPath) return '根目录';
    const parts = folderPath.split('/');
    return parts.length > 2 ? `.../${parts.slice(-2).join('/')}` : folderPath;
  };
  if (!asset) return null;
  const isVideo = asset.type === 'video';
  const isAudio = asset.type === 'audio';
  const isImage = asset.type === 'image';
  const isDocument = asset.type === 'document';

  // 错误状态组件
  const ErrorState = () => <div className="flex flex-col items-center justify-center h-96 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-2">
            <Button onClick={handleRetry} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              重试
            </Button>
            <Button onClick={() => onOpenChange(false)} variant="outline">
              关闭
            </Button>
          </div>
        </div>;

  // 加载状态组件
  const LoadingState = () => <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">正在加载素材...</p>
          </div>
        </div>;

  // 媒体预览组件
  const MediaPreview = () => {
    if (isImage) {
      return <div className="relative">
              <img src={downloadUrl} alt={asset.name} className="w-full h-auto max-h-[60vh] object-contain rounded-lg" onError={e => {
          e.target.style.display = 'none';
          e.target.parentElement.innerHTML = `
                    <div class="text-center py-8">
                      <AlertCircle class="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <p class="text-gray-600">图片加载失败</p>
                    </div>
                  `;
        }} />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => window.open(downloadUrl, '_blank')} className="bg-black/50 text-white hover:bg-black/70">
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>;
    }
    if (isVideo) {
      return <div className="relative bg-black rounded-lg overflow-hidden">
              <video ref={videoRef} src={downloadUrl} className="w-full max-h-[60vh]" onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onError={() => {
          setError('视频加载失败，请检查网络连接');
        }} controls={false} />
              
              {/* 视频控制栏 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-4 text-white">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={handlePlayPause}>
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </Button>
                  
                  <span className="text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                  
                  <input type="range" min="0" max="100" value={duration ? currentTime / duration * 100 : 0} onChange={handleSeek} className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer" />
                  
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={handleMuteToggle}>
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={handleFullscreen}>
                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                  </Button>
                </div>
              </div>
            </div>;
    }
    if (isAudio) {
      return <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Music className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{asset.name}</h3>
                      <p className="text-sm text-gray-500">音频文件</p>
                    </div>
                  </div>
                  
                  <audio ref={audioRef} src={downloadUrl} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onError={() => {
              setError('音频加载失败，请检查网络连接');
            }} className="hidden" />
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="sm" onClick={handlePlayPause} className="w-10 h-10 rounded-full">
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      </Button>
                      
                      <span className="text-sm text-gray-600">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                      
                      <Button variant="ghost" size="sm" onClick={handleMuteToggle} className="ml-auto">
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </Button>
                    </div>
                    
                    <input type="range" min="0" max="100" value={duration ? currentTime / duration * 100 : 0} onChange={handleSeek} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    
                    {/* 音频可视化 */}
                    <div className="flex items-center justify-center space-x-1 h-8">
                      {[...Array(20)].map((_, i) => <div key={i} className={`w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full transition-all duration-200 ${isPlaying ? 'animate-pulse' : ''}`} style={{
                  height: isPlaying ? `${Math.random() * 100}%` : '20%'
                }} />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>;
    }
    return <div className="p-8 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2">文档预览</p>
            <p className="text-sm text-gray-500">此文件类型暂不支持在线预览</p>
          </div>;
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className={`max-w-4xl max-h-[90vh] ${isFullscreen ? 'max-w-full max-h-full' : ''}`}>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span className="truncate">{asset.name}</span>
                <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="hover:bg-gray-100">
                  <X className="w-4 h-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            {loading && <LoadingState />}
            {!loading && error && <ErrorState />}
            {!loading && !error && <div className="flex flex-col gap-4">
                <MediaPreview />
                
                {/* 文件信息 */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">类型：</span>
                    <span className="capitalize">{asset.type}</span>
                  </div>
                  <div>
                    <span className="font-medium">大小：</span>
                    <span>{asset.size}</span>
                  </div>
                  <div>
                    <span className="font-medium">上传时间：</span>
                    <span>{new Date(asset.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-medium">标签：</span>
                    <span>{asset.tags?.join(', ') || '无'}</span>
                  </div>
                  {asset.duration && <div>
                      <span className="font-medium">时长：</span>
                      <span>{formatTime(asset.duration)}</span>
                    </div>}
                </div>
                
                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <Button onClick={handleDownload} disabled={!downloadUrl}>
                    <Download className="w-4 h-4 mr-2" />
                    下载
                  </Button>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    <X className="w-4 h-4 mr-2" />
                    关闭
                  </Button>
                </div>
              </div>}
          </DialogContent>
        </Dialog>;
}