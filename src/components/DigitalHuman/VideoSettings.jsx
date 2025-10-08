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
        <Select value={settings.quality} onValueChange={value => handleSettingChange('quality', value)}>
          <SelectTrigger>
            <SelectValue placeholder="选择分辨率" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="480P">480P</SelectItem>
            <SelectItem value="720p">720p (HD)</SelectItem>
            <SelectItem value="1080p">1080p (Full HD)</SelectItem>
          </SelectContent>
        </Select>
      </div>


      <div className="space-y-2">
        <Label>视频长宽</Label>
        <Select value={settings.ratio} onValueChange={value => handleSettingChange('ratio', value)}>
          <SelectTrigger>
            <SelectValue placeholder="长宽" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1:1">1:1</SelectItem>
            <SelectItem value="3:4">3:4</SelectItem>
            <SelectItem value="16:9">16:9</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  </Card>;
}