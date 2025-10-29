// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Slider } from '@/components/ui';

export function VideoSettings({
  settings,
  onSettingsChange,
  selectedPlatform,
  onPlatformChange,
  showStyle = false
}) {
  const platforms = [{
    value: 'tongyi-wanxiang',
    label: '通义万相'
  }, {
    value: 'keling',
    label: '可灵AI'
  }, {
    value: 'sora',
    label: 'Sora'
  }, {
    value: 'runway',
    label: 'Runway'
  }, {
    value: 'pika',
    label: 'Pika'
  }, {
    value: 'stable-video',
    label: 'Stable Video'
  }, {
    value: 'luma-dream-machine',
    label: 'Luma Dream Machine'
  }, {
    value: 'krea',
    label: 'Krea AI'
  }];
  return <div className="space-y-4">
    <div>
      <Label>选择视频生成模型</Label>
      <Select value={selectedPlatform} onValueChange={onPlatformChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="请选择视频生成模型" />
        </SelectTrigger>
        <SelectContent>
          {platforms.map(platform => <SelectItem key={platform.value} value={platform.value}>
            {platform.label}
          </SelectItem>)}
        </SelectContent>
      </Select>
    </div>;
    {selectedPlatform === 'tongyi-wanxiang' && <Card>
      <CardHeader>
        <CardTitle>视频生成模型</CardTitle>
        <CardDescription>选择通义万相的视频生成模型</CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={modelType} onValueChange={setModelType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="选择视频生成模型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Animate_Anyone">舞动人像AnimateAnyone</SelectItem>
            <SelectItem value="Animate_Mix">视频换人模型</SelectItem>
            <SelectItem value="Animate_Move">图生动作</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>}
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
          <SelectItem value="480P">480p</SelectItem>
          <SelectItem value="720P">720p (HD)</SelectItem>
          <SelectItem value="1080P">1080p (Full HD)</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div>
      <Label>画幅</Label>
      <Select value={settings.ratio} onValueChange={value => onSettingsChange({
        ...settings,
        ratio: value
      })}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1:1">1:1</SelectItem>
          <SelectItem value="3:4">3:4</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* <div>
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
    </div> */}

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
          <SelectItem value="normal">适中</SelectItem>
          <SelectItem value="calm">平静</SelectItem>
          <SelectItem value="active">活泼</SelectItem>
        </SelectContent>
      </Select>
    </div>}
  </div>;
}