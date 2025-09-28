// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input, Textarea, Slider, Switch, Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { Upload } from 'lucide-react';

export function NodePropertyPanel({
  node,
  onUpdate
}) {
  if (!node) {
    return <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-slate-500">选择一个节点进行编辑</p>
        </CardContent>
      </Card>;
  }
  const handleUpdate = (field, value) => {
    onUpdate(node.id, {
      ...node,
      [field]: value
    });
  };
  return <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">节点配置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">基础</TabsTrigger>
            <TabsTrigger value="assets">素材</TabsTrigger>
            <TabsTrigger value="effects">效果</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div>
              <Label>节点标题</Label>
              <Input value={node.title} onChange={e => handleUpdate('title', e.target.value)} placeholder="输入节点标题" />
            </div>
            
            <div>
              <Label>生成方式</Label>
              <Select value={node.type} onValueChange={value => handleUpdate('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text2video">文生视频</SelectItem>
                  <SelectItem value="image2video">图生视频</SelectItem>
                  <SelectItem value="digital_human">数字人</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>AI服务提供商</Label>
              <Select value={node.provider} onValueChange={value => handleUpdate('provider', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tongyi">阿里云通义万相</SelectItem>
                  <SelectItem value="digital_api">数字人API</SelectItem>
                  <SelectItem value="kling">快手可灵</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>描述</Label>
              <Textarea value={node.description} onChange={e => handleUpdate('description', e.target.value)} placeholder="输入视频描述或提示词" rows={3} />
            </div>
            
            <div>
              <Label>时长: {node.duration}s</Label>
              <Slider value={[node.duration]} onValueChange={([value]) => handleUpdate('duration', value)} min={1} max={30} step={1} />
            </div>
          </TabsContent>
          
          <TabsContent value="assets" className="space-y-4">
            <div>
              <Label>图片素材</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                <p className="text-sm text-slate-500">拖拽或点击上传图片</p>
                <Button size="sm" variant="outline" className="mt-2">
                  选择文件
                </Button>
              </div>
            </div>
            
            <div>
              <Label>音频素材</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                <p className="text-sm text-slate-500">拖拽或点击上传音频</p>
                <Button size="sm" variant="outline" className="mt-2">
                  选择文件
                </Button>
              </div>
            </div>
            
            <div>
              <Label>字幕文件</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                <p className="text-sm text-slate-500">拖拽或点击上传字幕</p>
                <Button size="sm" variant="outline" className="mt-2">
                  选择文件
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="effects" className="space-y-4">
            <div>
              <Label>镜头景别</Label>
              <Select value={node.cameraAngle || 'medium'} onValueChange={value => handleUpdate('cameraAngle', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="extreme_close_up">极特写</SelectItem>
                  <SelectItem value="close_up">特写</SelectItem>
                  <SelectItem value="medium_close_up">中特写</SelectItem>
                  <SelectItem value="medium">中景</SelectItem>
                  <SelectItem value="medium_long">中远景</SelectItem>
                  <SelectItem value="long">远景</SelectItem>
                  <SelectItem value="extreme_long">极远景</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>转场效果</Label>
              <Select value={node.transition || 'fade'} onValueChange={value => handleUpdate('transition', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fade">淡入淡出</SelectItem>
                  <SelectItem value="slide">滑动</SelectItem>
                  <SelectItem value="zoom">缩放</SelectItem>
                  <SelectItem value="blur">模糊</SelectItem>
                  <SelectItem value="none">无</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>色彩风格</Label>
              <Select value={node.colorStyle || 'natural'} onValueChange={value => handleUpdate('colorStyle', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">自然</SelectItem>
                  <SelectItem value="vibrant">鲜艳</SelectItem>
                  <SelectItem value="cinematic">电影感</SelectItem>
                  <SelectItem value="vintage">复古</SelectItem>
                  <SelectItem value="monochrome">黑白</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label>启用动态效果</Label>
              <Switch checked={node.enableMotion || false} onCheckedChange={checked => handleUpdate('enableMotion', checked)} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>;
}