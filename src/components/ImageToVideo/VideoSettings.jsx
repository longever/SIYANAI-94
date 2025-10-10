// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from '@/components/ui';
// @ts-ignore;
import { Settings } from 'lucide-react';

const resolutions = [{
  value: '720p',
  label: 'HD (1280×720)',
  description: '标准清晰度'
}, {
  value: '1080p',
  label: 'Full HD (1920×1080)',
  description: '高清画质'
}, {
  value: '1440p',
  label: '2K (2560×1440)',
  description: '超清画质'
}, {
  value: '2160p',
  label: '4K (3840×2160)',
  description: '极致清晰度'
}];
const durations = [{
  value: 3,
  label: '3秒',
  description: '短视频'
}, {
  value: 5,
  label: '5秒',
  description: '适中长度'
}, {
  value: 10,
  label: '10秒',
  description: '较长视频'
}, {
  value: 15,
  label: '15秒',
  description: '长视频'
}];
const styles = [{
  value: 'realistic',
  label: '写实',
  description: '真实感强'
}, {
  value: 'cartoon',
  label: '卡通',
  description: '卡通风格'
}, {
  value: 'anime',
  label: '动漫',
  description: '日系动漫'
}, {
  value: 'sketch',
  label: '素描',
  description: '手绘风格'
}, {
  value: 'oil-painting',
  label: '油画',
  description: '艺术油画'
}];
const fpsOptions = [{
  value: 24,
  label: '24 FPS',
  description: '电影标准'
}, {
  value: 30,
  label: '30 FPS',
  description: '网络视频'
}, {
  value: 60,
  label: '60 FPS',
  description: '流畅动画'
}];
export  function VideoSettings({
  settings,
  onChange
}) {
  const handleSettingChange = (key, value) => {
    onChange({
      ...settings,
      [key]: value
    });
  };
  return <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-3">
        <Settings className="w-4 h-4 text-gray-600" />
        <Label className="text-sm font-medium">视频设置</Label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 分辨率 */}
        <div>
          <Label className="text-sm text-gray-700">分辨率</Label>
          <Select value={settings.resolution} onValueChange={value => handleSettingChange('resolution', value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {resolutions.map(res => <SelectItem key={res.value} value={res.value}>
                  <div>
                    <div className="font-medium">{res.label}</div>
                    <div className="text-xs text-gray-500">{res.description}</div>
                  </div>
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* 时长 */}
        <div>
          <Label className="text-sm text-gray-700">时长</Label>
          <Select value={settings.duration.toString()} onValueChange={value => handleSettingChange('duration', parseInt(value))}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {durations.map(dur => <SelectItem key={dur.value} value={dur.value.toString()}>
                  <div>
                    <div className="font-medium">{dur.label}</div>
                    <div className="text-xs text-gray-500">{dur.description}</div>
                  </div>
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* 风格 */}
        <div>
          <Label className="text-sm text-gray-700">风格</Label>
          <Select value={settings.style} onValueChange={value => handleSettingChange('style', value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {styles.map(style => <SelectItem key={style.value} value={style.value}>
                  <div>
                    <div className="font-medium">{style.label}</div>
                    <div className="text-xs text-gray-500">{style.description}</div>
                  </div>
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* 帧率 */}
        <div>
          <Label className="text-sm text-gray-700">帧率</Label>
          <Select value={settings.fps.toString()} onValueChange={value => handleSettingChange('fps', parseInt(value))}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fpsOptions.map(fps => <SelectItem key={fps.value} value={fps.value.toString()}>
                  <div>
                    <div className="font-medium">{fps.label}</div>
                    <div className="text-xs text-gray-500">{fps.description}</div>
                  </div>
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>;
}