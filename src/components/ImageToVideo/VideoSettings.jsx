// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Slider, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';

export function VideoSettings({
  settings,
  onSettingsChange
}) {
  const handleSettingChange = (key, value) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };
  return <Card>
    <CardHeader>
      <CardTitle>视频设置</CardTitle>
      <CardDescription>配置数字人视频的生成参数</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-2">
        <Label>视频分辨率</Label>
        <Select value={settings.resolution} onValueChange={value => handleSettingChange('resolution', value)}>
          <SelectTrigger>
            <SelectValue placeholder="选择分辨率" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="720p">720p (HD)</SelectItem>
            <SelectItem value="1080p">1080p (Full HD)</SelectItem>
            <SelectItem value="4k">4K (Ultra HD)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>帧率: {settings.fps}fps</Label>
        <Slider value={[settings.fps]} onValueChange={([value]) => handleSettingChange('fps', value)} min={24} max={60} step={1} />
      </div>

      <div className="space-y-2">
        <Label>视频质量</Label>
        <Select value={settings.quality} onValueChange={value => handleSettingChange('quality', value)}>
          <SelectTrigger>
            <SelectValue placeholder="选择质量" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">低质量 (快速)</SelectItem>
            <SelectItem value="medium">中等质量</SelectItem>
            <SelectItem value="high">高质量 (慢速)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  </Card>;
}