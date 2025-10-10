// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from '@/components/ui';

export function SystemSelector({
  selectedSystem,
  onSystemChange
}) {
  const models = [{
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
  return <div className="space-y-2">
      <Label>选择视频生成模型</Label>
      <Select value={selectedSystem} onValueChange={onSystemChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="请选择视频生成模型" />
        </SelectTrigger>
        <SelectContent>
          {models.map(model => <SelectItem key={model.value} value={model.value}>
              {model.label}
            </SelectItem>)}
        </SelectContent>
      </Select>
    </div>;
}