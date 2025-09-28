// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Settings, Film, Palette, Music, Type } from 'lucide-react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Slider, Switch, Textarea, Input, ScrollArea } from '@/components/ui';

export function PropertyPanel({
  selectedNode,
  onPropertyChange
}) {
  const [properties, setProperties] = useState({
    shotType: 'medium',
    transition: 'fade',
    filter: 'none',
    backgroundMusic: 'none',
    subtitleStyle: 'default',
    textContent: '',
    imageUrl: '',
    voiceType: 'female',
    background: 'studio',
    gesture: 'standing',
    expression: 'neutral'
  });
  const handlePropertyChange = (key, value) => {
    const newProperties = {
      ...properties,
      [key]: value
    };
    setProperties(newProperties);
    if (onPropertyChange) {
      onPropertyChange(newProperties);
    }
  };
  if (!selectedNode) {
    return <div className="h-full flex items-center justify-center text-gray-500">
        <p>请选择一个节点进行配置</p>
      </div>;
  }
  const renderNodeProperties = () => {
    switch (selectedNode.type) {
      case 'text-to-video':
        return <div className="space-y-4">
            <div>
              <Label>文本内容</Label>
              <Textarea placeholder="输入视频描述文本..." value={properties.textContent} onChange={e => handlePropertyChange('textContent', e.target.value)} className="mt-1" rows={4} />
            </div>
            <div>
              <Label>镜头景别</Label>
              <Select value={properties.shotType} onValueChange={v => handlePropertyChange('shotType', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="close-up">特写</SelectItem>
                  <SelectItem value="medium">中景</SelectItem>
                  <SelectItem value="long">远景</SelectItem>
                  <SelectItem value="wide">全景</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>转场效果</Label>
              <Select value={properties.transition} onValueChange={v => handlePropertyChange('transition', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fade">淡入淡出</SelectItem>
                  <SelectItem value="slide">滑动</SelectItem>
                  <SelectItem value="zoom">缩放</SelectItem>
                  <SelectItem value="dissolve">溶解</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>滤镜</Label>
              <Select value={properties.filter} onValueChange={v => handlePropertyChange('filter', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">无</SelectItem>
                  <SelectItem value="vintage">复古</SelectItem>
                  <SelectItem value="cinematic">电影感</SelectItem>
                  <SelectItem value="bright">明亮</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>;
      case 'image-to-video':
        return <div className="space-y-4">
            <div>
              <Label>图片URL</Label>
              <Input type="url" placeholder="输入图片URL..." value={properties.imageUrl} onChange={e => handlePropertyChange('imageUrl', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>动画效果</Label>
              <Select value={properties.transition} onValueChange={v => handlePropertyChange('transition', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pan">平移</SelectItem>
                  <SelectItem value="zoom">缩放</SelectItem>
                  <SelectItem value="rotate">旋转</SelectItem>
                  <SelectItem value="ken-burns">Ken Burns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>动画时长 (秒)</Label>
              <Slider value={[parseInt(properties.duration) || 3]} onValueChange={v => handlePropertyChange('duration', v[0].toString())} min={1} max={10} step={0.5} className="mt-2" />
              <span className="text-sm text-gray-500">{properties.duration || 3}秒</span>
            </div>
          </div>;
      case 'digital-human':
        return <div className="space-y-4">
            <div>
              <Label>语音类型</Label>
              <Select value={properties.voiceType} onValueChange={v => handlePropertyChange('voiceType', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">女声</SelectItem>
                  <SelectItem value="male">男声</SelectItem>
                  <SelectItem value="child">童声</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>背景场景</Label>
              <Select value={properties.background} onValueChange={v => handlePropertyChange('background', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="studio">演播室</SelectItem>
                  <SelectItem value="office">办公室</SelectItem>
                  <SelectItem value="outdoor">户外</SelectItem>
                  <SelectItem value="green">绿幕</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>手势动作</Label>
              <Select value={properties.gesture} onValueChange={v => handlePropertyChange('gesture', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standing">站立</SelectItem>
                  <SelectItem value="gesturing">手势</SelectItem>
                  <SelectItem value="walking">行走</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>表情</Label>
              <Select value={properties.expression} onValueChange={v => handlePropertyChange('expression', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neutral">中性</SelectItem>
                  <SelectItem value="smile">微笑</SelectItem>
                  <SelectItem value="serious">严肃</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>;
      default:
        return <p>未知节点类型</p>;
    }
  };
  return <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="w-4 h-4" />
          属性设置
        </h3>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{selectedNode.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderNodeProperties()}
          </CardContent>
        </Card>
        
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Music className="w-4 h-4" />
              背景音乐
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={properties.backgroundMusic} onValueChange={v => handlePropertyChange('backgroundMusic', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">无</SelectItem>
                <SelectItem value="upbeat">欢快</SelectItem>
                <SelectItem value="calm">平静</SelectItem>
                <SelectItem value="dramatic">戏剧性</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Type className="w-4 h-4" />
              字幕样式
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={properties.subtitleStyle} onValueChange={v => handlePropertyChange('subtitleStyle', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">默认</SelectItem>
                <SelectItem value="modern">现代</SelectItem>
                <SelectItem value="classic">经典</SelectItem>
                <SelectItem value="minimal">极简</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </ScrollArea>
    </div>;
}