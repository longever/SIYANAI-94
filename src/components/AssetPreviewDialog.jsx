// @ts-ignore;
import React, { useState, useRef, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button } from '@/components/ui';
// @ts-ignore;
import { Download, X, Play, Pause, Volume2, VolumeX, Music, FileText, Folder, Maximize, Minimize } from 'lucide-react';

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const dialogRef = useRef(null);
  useEffect(() => {
    if (asset && open) {
      setLoading(true);
      loadAssetUrl();
    }
  }, [asset, open]);
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  const loadAssetUrl = async () => {
    if (!asset || !asset._id) {
      setLoading(false);
      return;
    }
    try {
      const url = await getAssetDownloadUrl(asset._id);
      setDownloadUrl(url);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load asset URL:', error);
      setLoading(false);
    }
  };
  const handlePlayPause = () => {
    const mediaElement = videoRef.current || audioRef.current;
    if (mediaElement) {
      if (isPlaying) {
        mediaElement.pause();
      } else {
        mediaElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  const handleMuteToggle = () => {
    const mediaElement = videoRef.current || audioRef.current;
    if (mediaElement) {
      mediaElement.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  const handleTimeUpdate = e => {
    setCurrentTime(e.target.currentTime);
  };
  const handleLoadedMetadata = e => {
    setDuration(e.target.duration);
  };
  const handleSeek = e => {
    const mediaElement = videoRef.current || audioRef.current;
    if (mediaElement && duration > 0) {
      const seekTime = e.target.value / 100 * duration;
      mediaElement.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };
  const handleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };
  const formatTime = time => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  const handleDownload = async () => {
    if (downloadUrl) {
      try {
        const response = await fetch(downloadUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = asset.name;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
        alert('下载失败，请稍后重试');
      }
    }
  };
  const getFolderPath = folderPath => {
    if (!folderPath) return '未知路径';
    const parts = folderPath.split('/');
    if (parts.length >= 2 && parts[0] === 'saas_temp') {
      return `saas_temp/${parts[1]}/`;
    }
    return folderPath;
  };
  if (!asset) return null;
  const isVideo = asset.type === 'video';
  const isAudio = asset.type === 'audio';
  const isImage = asset.type === 'image';
  const isModel = asset.type === 'model';
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-4xl max-h-[90vh] ${isFullscreen ? 'max-w-full max-h-full' : ''}`} ref={dialogRef}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate">{asset.name}</span>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        {loading ? <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div> : <div className="flex flex-col gap-4">
            {/* 媒体内容区域 */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              {isImage && downloadUrl && <div className="relative">
                  <img src={downloadUrl} alt={asset.name} className="w-full h-auto max-h-[60vh] object-contain cursor-zoom-in" onError={e => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="p-8 text-center text-gray-500">图片加载失败</div>';
            }} onClick={e => {
              if (e.target === e.currentTarget) {
                window.open(downloadUrl, '_blank');
              }
            }} />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => window.open(downloadUrl, '_blank')} className="bg-black/50 text-white hover:bg-black/70">
                      <Maximize className="w-4 h-4" />
                    </Button>
                  </div>
                </div>}
              
              {isVideo && downloadUrl && <div className="relative">
                  <video ref={videoRef} src={downloadUrl} className="w-full max-h-[60vh]" onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onError={() => alert('视频加载失败，请检查网络连接')} controls={false} />
                  
                  {/* 自定义视频控制栏 */}
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
                </div>}
              
              {isAudio && downloadUrl && <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100">
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
                      
                      <audio ref={audioRef} src={downloadUrl} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onError={() => alert('音频加载失败，请检查网络连接')} className="hidden" />
                      
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
                        
                        {/* 音频可视化效果 */}
                        <div className="flex items-center justify-center space-x-1 h-8">
                          {[...Array(20)].map((_, i) => <div key={i} className={`w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full transition-all duration-200 ${isPlaying ? 'animate-pulse' : ''}`} style={{
                      height: isPlaying ? `${Math.random() * 100}%` : '20%'
                    }} />)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>}

              {isModel && downloadUrl && <div className="p-8 text-center">
                  <Folder className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-2">3D模型文件</p>
                  <p className="text-sm text-gray-500">请下载后在3D软件中查看</p>
                </div>}
              
              {!isImage && !isVideo && !isAudio && !isModel && downloadUrl && <div className="p-8 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">此文件类型暂不支持预览</p>
                </div>}
            </div>
            
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
                <span className="font-medium">存储路径：</span>
                <span className="text-blue-600">{getFolderPath(asset.folder_path)}</span>
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