// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Label } from '@/components/ui';
// @ts-ignore;
import { Settings, Film, Image } from 'lucide-react';

export function ExportSettings({
  settings,
  onSettingsChange
}) {
  const [exportSettings, setExportSettings] = useState({
    resolution: '1080p',
    format: 'mp4',
    watermark: false,
    quality: 'high',
    fps: 30
  });
  const handleSettingChange = (key, value) => {
    const newSettings = {
      ...exportSettings,
      [key]: value
    };
    setExportSettings(newSettings);
    onSettingsChange(newSettings);
  };
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          导出设置
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>分辨率</Label>
            <Select value={exportSettings.resolution} onValueChange={value => handleSettingChange('resolution', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="720p">720P (HD)</SelectItem>
                <SelectItem value="1080p">1080P (Full HD)</SelectItem>
                <SelectItem value="4k">4K (Ultra HD)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>视频格式</Label>
            <Select value={exportSettings.format} onValueChange={value => handleSettingChange('format', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp4">MP4</SelectItem>
                <SelectItem value="mov">MOV</SelectItem>
                <SelectItem value="avi">AVI</SelectItem>
                <SelectItem value="webm">WebM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>视频质量</Label>
            <Select value={exportSettings.quality} onValueChange={value => handleSettingChange('quality', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">低质量 (小文件)</SelectItem>
                <SelectItem value="medium">中等质量</SelectItem>
                <SelectItem value="high">高质量 (大文件)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>帧率 (FPS)</Label>
            <Select value={exportSettings.fps.toString()} onValueChange={value => handleSettingChange('fps', parseInt(value))}>
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

          <div className="flex items-center justify-between">
            <Label htmlFor="watermark">添加水印</Label>
            <Switch id="watermark" checked={exportSettings.watermark} onCheckedChange={checked => handleSettingChange('watermark', checked)} />
          </div>

          <div className="pt-4 border-t">
            <div className="text-sm text-gray-500">
              <p>预估文件大小: {exportSettings.quality === 'high' ? '50-100MB' : exportSettings.quality === 'medium' ? '20-50MB' : '10-20MB'}</p>
              <p>处理时间: 2-5分钟</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
}