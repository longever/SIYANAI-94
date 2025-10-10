// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Slider } from '@/components/ui';

export function VideoSettings({
  settings,
  onSettingsChange,
  showStyle = false
}) {
  return <div className="space-y-4">
      <div>
        <Label>分辨率</Label>
        <Select value={settings.resolution} onValueChange={value => onSettingsChange({
        ...settings,
        resolution: value
      })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="720p">720p (HD)</SelectItem>
            <SelectItem value="1080p">1080p (Full HD)</SelectItem>
            <SelectItem value="1440p">1440p (2K)</SelectItem>
            <SelectItem value="2160p">2160p (4K)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>帧率: {settings.fps}fps</Label>
        <Slider value={[settings.fps]} onValueChange={([value]) => onSettingsChange({
        ...settings,
        fps: value
      })} min={24} max={60} step={1} />
      </div>

      <div>
        <Label>视频质量</Label>
        <Select value={settings.quality} onValueChange={value => onSettingsChange({
        ...settings,
        quality: value
      })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">低质量 (快速)</SelectItem>
            <SelectItem value="medium">中等质量</SelectItem>
            <SelectItem value="high">高质量</SelectItem>
            <SelectItem value="ultra">超高质量 (慢速)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>时长: {settings.duration}秒</Label>
        <Slider value={[settings.duration]} onValueChange={([value]) => onSettingsChange({
        ...settings,
        duration: value
      })} min={5} max={60} step={5} />
      </div>

      {showStyle && <div>
          <Label>风格</Label>
          <Select value={settings.style} onValueChange={value => onSettingsChange({
        ...settings,
        style: value
      })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="realistic">写实风格</SelectItem>
              <SelectItem value="cartoon">卡通风格</SelectItem>
              <SelectItem value="anime">动漫风格</SelectItem>
              <SelectItem value="artistic">艺术风格</SelectItem>
            </SelectContent>
          </Select>
        </div>}
    </div>;
}