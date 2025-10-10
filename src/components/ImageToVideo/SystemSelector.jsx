// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
// @ts-ignore;
import { Bot } from 'lucide-react';

const systems = [{
  id: 'default',
  name: '标准模式',
  description: '通用视频生成，适合大多数场景'
}, {
  id: 'anime',
  name: '动漫风格',
  description: '生成动漫风格的视频效果'
}, {
  id: 'realistic',
  name: '写实风格',
  description: '生成逼真的写实风格视频'
}, {
  id: 'artistic',
  name: '艺术风格',
  description: '具有艺术感的视频效果'
}, {
  id: 'cinematic',
  name: '电影风格',
  description: '电影级别的视觉效果'
}];
export default function SystemSelector({
  value,
  onChange
}) {
  return <div>
      <label className="block text-sm font-medium mb-2">选择生成系统</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="选择AI生成系统" />
        </SelectTrigger>
        <SelectContent>
          {systems.map(system => <SelectItem key={system.id} value={system.id}>
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4" />
                <div>
                  <div className="font-medium">{system.name}</div>
                  <div className="text-xs text-gray-500">{system.description}</div>
                </div>
              </div>
            </SelectItem>)}
        </SelectContent>
      </Select>
    </div>;
}