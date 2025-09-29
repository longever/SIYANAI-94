// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Input, Textarea, Label, Slider, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Button } from '@/components/ui';
// @ts-ignore;
import { Settings, Palette, Volume2, Clock } from 'lucide-react';

export function PropertyPanel({
  selectedNode,
  onNodeUpdate,
  mode
}) {
  if (!selectedNode) {
    return <div className="p-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center text-gray-400">
              <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">选择一个节点进行编辑</p>
            </div>
          </CardContent>
        </Card>
      </div>;
  }
  const handleUpdate = (field, value) => {
    onNodeUpdate(selectedNode.id, {
      [field]: value
    });
  };
  return <div className="p-4 space-y-4">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">节点属性</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-gray-400">节点名称</Label>
            <Input value={selectedNode.data.name || ''} onChange={e => handleUpdate('data', {
            ...selectedNode.data,
            name: e.target.value
          })} className="bg-gray-700 border-gray-600 text-sm" placeholder="输入节点名称" />
          </div>

          <div>
            <Label className="text-xs text-gray-400">持续时间 (秒)</Label>
            <Slider value={[selectedNode.data.duration || 5]} onValueChange={([value]) => handleUpdate('data', {
            ...selectedNode.data,
            duration: value
          })} min={1} max={30} step={0.5} className="mt-2" />
            <span className="text-xs text-gray-500">{selectedNode.data.duration || 5}s</span>
          </div>

          {mode === 'text2video' && <div>
              <Label className="text-xs text-gray-400">文本内容</Label>
              <Textarea value={selectedNode.data.content || ''} onChange={e => handleUpdate('data', {
            ...selectedNode.data,
            content: e.target.value
          })} className="bg-gray-700 border-gray-600 text-sm min-h-[100px]" placeholder="输入要转换为视频的文本..." />
            </div>}

          {mode === 'image2video' && <div>
              <Label className="text-xs text-gray-400">图片设置</Label>
              <Select value={selectedNode.data.transition || 'fade'} onValueChange={value => handleUpdate('data', {
            ...selectedNode.data,
            transition: value
          })}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="选择转场效果" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fade">淡入淡出</SelectItem>
                  <SelectItem value="slide">滑动</SelectItem>
                  <SelectItem value="zoom">缩放</SelectItem>
                  <SelectItem value="rotate">旋转</SelectItem>
                </SelectContent>
              </Select>
            </div>}

          {mode === 'digitalHuman' && <>
              <div>
                <Label className="text-xs text-gray-400">数字人形象</Label>
                <Select value={selectedNode.data.avatar || 'default'} onValueChange={value => handleUpdate('data', {
              ...selectedNode.data,
              avatar: value
            })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="选择数字人形象" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">默认形象</SelectItem>
                    <SelectItem value="business">商务形象</SelectItem>
                    <SelectItem value="casual">休闲形象</SelectItem>
                    <SelectItem value="professional">专业形象</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-400">语音风格</Label>
                <Select value={selectedNode.data.voice || 'neutral'} onValueChange={value => handleUpdate('data', {
              ...selectedNode.data,
              voice: value
            })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="选择语音风格" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neutral">中性</SelectItem>
                    <SelectItem value="warm">温暖</SelectItem>
                    <SelectItem value="energetic">活力</SelectItem>
                    <SelectItem value="calm">平静</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>}

          <div>
            <Label className="text-xs text-gray-400 flex items-center">
              <Palette className="w-3 h-3 mr-1" />
              样式设置
            </Label>
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-400">背景模糊</Label>
                <Switch checked={selectedNode.data.blur || false} onCheckedChange={checked => handleUpdate('data', {
                ...selectedNode.data,
                blur: checked
              })} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-400">阴影效果</Label>
                <Switch checked={selectedNode.data.shadow || false} onCheckedChange={checked => handleUpdate('data', {
                ...selectedNode.data,
                shadow: checked
              })} />
              </div>
            </div>
          </div>

          <Button variant="outline" size="sm" className="w-full bg-gray-700 border-gray-600 hover:bg-gray-600" onClick={() => handleUpdate('data', {
          ...selectedNode.data,
          reset: true
        })}>
            重置为默认
          </Button>
        </CardContent>
      </Card>
    </div>;
}