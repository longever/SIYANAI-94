// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Play, Pause, Volume2, VolumeX, Maximize2, Settings } from 'lucide-react';
// @ts-ignore;
import { Button, Slider } from '@/components/ui';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function ImageVideoPreview({
  videoUrl,
  thumbnailUrl,
  className,
  autoPlay = false,
  showControls = true,
  onReady,
  onError
}) {
  const [isPlaying, setIsPlaying] = React.useState(autoPlay);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const videoRef = React.useRef(null);
  React.useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.src = videoUrl;
      if (autoPlay) {
        videoRef.current.play().catch(console.error);
      }
    }
  }, [videoUrl, autoPlay]);
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      onReady?.();
    }
  };
  const handleSeek = value => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };
  const handleVolumeChange = value => {
    if (videoRef.current) {
      const newVolume = value[0];
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };
  const handleMuteToggle = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (!newMuted && volume === 0) {
        setVolume(0.5);
      }
    }
  };
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  return <div className={cn("relative bg-black rounded-lg overflow-hidden", className)}>
    <video ref={videoRef} className="w-full h-full object-cover" poster={thumbnailUrl} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onError={onError} onClick={handlePlayPause} />

    {showControls && <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={handlePlayPause}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <div className="flex-1">
          <Slider value={[currentTime]} max={duration} step={0.1} onValueChange={handleSeek} className="w-full" />
        </div>

        <span className="text-white text-sm">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={handleMuteToggle}>
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>

        <Slider value={[isMuted ? 0 : volume]} max={1} step={0.1} onValueChange={handleVolumeChange} className="w-20" />

        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>}

    {!isPlaying && <div className="absolute inset-0 flex items-center justify-center">
      <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full w-16 h-16" onClick={handlePlayPause}>
        <Play className="h-8 w-8" />
      </Button>
    </div>}
  </div>;
}