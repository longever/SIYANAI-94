// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from '@/components/ui';

export function SystemSelector({
  value,
  onChange
}) {
  const systems = [{
    value: 'ali',
    label: '阿里云'
  }, {
    value: 'tencent',
    label: '腾讯云'
  }, {
    value: 'baidu',
    label: '百度智能云'
  }, {
    value: 'huawei',
    label: '华为云'
  }];
  return <div className="space-y-2">
      <Label>选择系统</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="请选择系统" />
        </SelectTrigger>
        <SelectContent>
          {systems.map(system => <SelectItem key={system.value} value={system.value}>
              {system.label}
            </SelectItem>)}
        </SelectContent>
      </Select>
    </div>;
}