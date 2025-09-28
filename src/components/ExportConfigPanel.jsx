// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Label, Slider } from '@/components/ui';
// @ts-ignore;
import { Settings, Film, Image, Zap } from 'lucide-react';

export function ExportConfigPanel({
  config,
  onConfigChange
}) {
  const [settings, setSettings] = useState({
    format: 'mp4',
    resolution: '1080p',
    watermark: false,
    compression: 'medium',
    quality: 85,
    fps: 30,
    bitrate: 'auto'
  });
  const handleSettingChange = (key, value) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    setSettings(newSettings);
    onConfigChange(newSettings);
  };
  const formatOptions = [{
    value: 'mp4',
    label: 'MP4',
    description: '通用格式，兼容性好'
  }, {
    value: 'mov',
    label: 'MOV',
    description: '高质量，文件较大'
  }, {
    value: 'webm',
    label: 'WEBM',
    description: '网络优化，体积小'
  }];
  const resolutionOptions = [{
    value: '720p',
    label: '720P HD',
    dimensions: '1280×720'
  }, {
    value: '1080p',
    label: '1080P Full HD',
    dimensions: '1920×1080'
  }, {
    value: '4k',
    label: '4K Ultra HD',
    dimensions: '3840×2160'
  }];
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          导出设置
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>视频格式</Label>
          <Select value={settings.format} onValueChange={value => handleSettingChange('format', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {formatOptions.map(option => <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-gray-500">{option.description}</span>
                  </div>
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>分辨率</Label>
          <Select value={settings.resolution} onValueChange={value => handleSettingChange('resolution', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {resolutionOptions.map(option => <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-gray-500">{option.dimensions}</span>
                  </div>
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>帧率 (FPS)</Label>
          <Select value={settings.fps.toString()} onValueChange={value => handleSettingChange('fps', parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24">24 FPS (电影)</SelectItem>
              <SelectItem value="30">30 FPS (标准)</SelectItem>
              <SelectItem value="60">60 FPS (流畅)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>压缩质量</Label>
          <Slider value={[settings.quality]} onValueChange={([value]) => handleSettingChange('quality', value)} max={100} min={10} step={5} className="mt-2" />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>低质量</span>
            <span>{settings.quality}%</span>
            <span>高质量</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="watermark">添加水印</Label>
          <Switch id="watermark" checked={settings.watermark} onCheckedChange={checked => handleSettingChange('watermark', checked)} />
        </div>

        <div className="pt-4 border-t">
          <div className="text-sm text-gray-500 space-y-1">
            <p>预估文件大小: {settings.quality > 80 ? '50-100MB' : settings.quality > 60 ? '20-50MB' : '10-20MB'}</p>
            <p>处理时间: 2-5分钟</p>
          </div>
        </div>
      </CardContent>
    </Card>;
}