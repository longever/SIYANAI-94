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
      <Label>选择平台</Label>
      <Select value={selectedPlatform} onValueChange={onPlatformChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="请选择平台" />
        </SelectTrigger>
        <SelectContent>
          {platforms.map(platform => <SelectItem key={platform.value} value={platform.value}>
            {platform.label}
          </SelectItem>)}
        </SelectContent>
      </Select>
    </div>;
    {selectedPlatform === 'tongyi-wanxiang' &&
      <div>
        <Label>视频生成模型</Label>
        <Select value={settings.modelType} onValueChange={value => onSettingsChange({
          ...settings,
          modelType: value
        })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="选择视频生成模型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Animate_Anyone">舞动人像AnimateAnyone</SelectItem>
            <SelectItem value="Animate_Mix">视频换人模型</SelectItem>
            <SelectItem value="Animate_Move">图生动作</SelectItem>
          </SelectContent>
        </Select>
      </div>
    }
    {modelType === 'Animate_Mix' &&
      <div>
        <Label>模式选择</Label>
        <Select value={settings.mode} onValueChange={value => onSettingsChange({
          ...settings,
          mode: value
        })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="模式选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="wan-std">标准模式</SelectItem>
            <SelectItem value="wan-pro">专业模式</SelectItem>
          </SelectContent>
        </Select>
      </div>

    }
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