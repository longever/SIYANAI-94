// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label, Card, CardContent, CardHeader, CardTitle, Slider, Switch } from '@/components/ui';

const modelOptions = [{
  value: 'WAN_2_5_I2V_PREVIEW',
  label: '图文生视频（支持音频）'
}, {
  value: 'WAN_2_2_I2V_FLASH',
  label: '图文生视频（无音频）'
}, {
  value: 'WAN_2_2_T2V_PLUS',
  label: '文生视频（支持音频）'
}, {
  value: 'WAN_2_5_T2V_PREVIEW',
  label: '文生视频（无音频）'
}, {
  value: 'LivePortrait',
  label: '声动人像1（图+音频）'
}, {
  value: 'WAN_EMO_V1',
  label: '声动人像2（图+音频）'
}, {
  value: 'WAN_2_2_S2V',
  label: '声动人像3（图+音频）'
}, {
  value: 'VideoRetalk',
  label: '声动人像4（图+音频）'
}, {
  value: 'Animate_Mix',
  label: '视频换人（图+视频）'
}, {
  value: 'Animate_Move',
  label: '图生动作（图+视频）'
}, {
  value: 'Animate_Anyone',
  label: '舞动人像（图+视频）'
}];
export default function VideoSettings({
  settings,
  onSettingsChange
}) {
  const handleSettingChange = (key, value) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };
  return <Card className="w-full">
      <CardHeader>
        <CardTitle>视频设置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="model">视频生成模型</Label>
          <Select value={settings.model} onValueChange={value => handleSettingChange('model', value)}>
            <SelectTrigger id="model">
              <SelectValue placeholder="选择视频生成模型" />
            </SelectTrigger>
            <SelectContent>
              {modelOptions.map(option => <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">视频时长（秒）</Label>
          <Slider id="duration" min={1} max={30} step={1} value={[settings.duration]} onValueChange={([value]) => handleSettingChange('duration', value)} />
          <div className="text-sm text-muted-foreground">{settings.duration} 秒</div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fps">帧率</Label>
          <Select value={settings.fps.toString()} onValueChange={value => handleSettingChange('fps', parseInt(value))}>
            <SelectTrigger id="fps">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="8">8 FPS</SelectItem>
              <SelectItem value="12">12 FPS</SelectItem>
              <SelectItem value="16">16 FPS</SelectItem>
              <SelectItem value="24">24 FPS</SelectItem>
              <SelectItem value="30">30 FPS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="resolution">分辨率</Label>
          <Select value={settings.resolution} onValueChange={value => handleSettingChange('resolution', value)}>
            <SelectTrigger id="resolution">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="480p">480p</SelectItem>
              <SelectItem value="720p">720p</SelectItem>
              <SelectItem value="1080p">1080p</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="enhance">画质增强</Label>
          <Switch id="enhance" checked={settings.enhance} onCheckedChange={checked => handleSettingChange('enhance', checked)} />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="watermark">添加水印</Label>
          <Switch id="watermark" checked={settings.watermark} onCheckedChange={checked => handleSettingChange('watermark', checked)} />
        </div>
      </CardContent>
    </Card>;
}