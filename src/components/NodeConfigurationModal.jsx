// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from '@/components/ui';
// @ts-ignore;
import { Settings, Save } from 'lucide-react';

export function NodeConfigurationModal({
  open,
  onOpenChange,
  node,
  onSave
}) {
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    generationType: 'text2video',
    provider: 'default',
    shotType: 'medium',
    transition: 'fade',
    colorStyle: 'natural',
    duration: 5,
    assets: {},
    customParams: {}
  });
  useEffect(() => {
    if (node) {
      setFormData({
        title: node.title || '',
        text: node.text || '',
        generationType: node.generationType || 'text2video',
        provider: node.provider || 'default',
        shotType: node.shotType || 'medium',
        transition: node.transition || 'fade',
        colorStyle: node.colorStyle || 'natural',
        duration: node.duration || 5,
        assets: node.assets || {},
        customParams: node.customParams || {}
      });
    } else {
      setFormData({
        title: '',
        text: '',
        generationType: 'text2video',
        provider: 'default',
        shotType: 'medium',
        transition: 'fade',
        colorStyle: 'natural',
        duration: 5,
        assets: {},
        customParams: {}
      });
    }
  }, [node]);
  const handleSubmit = () => {
    onSave(formData);
    onOpenChange(false);
  };
  const generationTypes = [{
    value: 'text2video',
    label: '文本生成视频'
  }, {
    value: 'image2video',
    label: '图片生成视频'
  }, {
    value: 'digitalhuman',
    label: '数字人视频'
  }, {
    value: 'transition',
    label: '转场效果'
  }];
  const providers = [{
    value: 'default',
    label: '默认引擎'
  }, {
    value: 'openai',
    label: 'OpenAI'
  }, {
    value: 'stability',
    label: 'Stability AI'
  }, {
    value: 'runway',
    label: 'Runway'
  }];
  const shotTypes = [{
    value: 'extreme-close-up',
    label: '极特写'
  }, {
    value: 'close-up',
    label: '特写'
  }, {
    value: 'medium',
    label: '中景'
  }, {
    value: 'long',
    label: '远景'
  }, {
    value: 'extreme-long',
    label: '极远景'
  }];
  const transitions = [{
    value: 'fade',
    label: '淡入淡出'
  }, {
    value: 'slide',
    label: '滑动'
  }, {
    value: 'zoom',
    label: '缩放'
  }, {
    value: 'dissolve',
    label: '溶解'
  }, {
    value: 'cut',
    label: '剪切'
  }];
  const colorStyles = [{
    value: 'natural',
    label: '自然'
  }, {
    value: 'vibrant',
    label: '鲜艳'
  }, {
    value: 'cinematic',
    label: '电影感'
  }, {
    value: 'monochrome',
    label: '黑白'
  }, {
    value: 'warm',
    label: '暖色调'
  }, {
    value: 'cool',
    label: '冷色调'
  }];
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            节点配置
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>节点标题</Label>
            <Input value={formData.title} onChange={e => setFormData({
            ...formData,
            title: e.target.value
          })} placeholder="输入节点标题" />
          </div>

          <div>
            <Label>文本内容</Label>
            <Textarea value={formData.text} onChange={e => setFormData({
            ...formData,
            text: e.target.value
          })} placeholder="输入要生成的文本内容" rows={4} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>生成方式</Label>
              <Select value={formData.generationType} onValueChange={value => setFormData({
              ...formData,
              generationType: value
            })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {generationTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>AI服务商</Label>
              <Select value={formData.provider} onValueChange={value => setFormData({
              ...formData,
              provider: value
            })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providers.map(provider => <SelectItem key={provider.value} value={provider.value}>{provider.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>镜头景别</Label>
              <Select value={formData.shotType} onValueChange={value => setFormData({
              ...formData,
              shotType: value
            })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {shotTypes.map(shot => <SelectItem key={shot.value} value={shot.value}>{shot.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>转场效果</Label>
              <Select value={formData.transition} onValueChange={value => setFormData({
              ...formData,
              transition: value
            })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {transitions.map(transition => <SelectItem key={transition.value} value={transition.value}>{transition.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>色彩风格</Label>
              <Select value={formData.colorStyle} onValueChange={value => setFormData({
              ...formData,
              colorStyle: value
            })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorStyles.map(style => <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>时长 (秒)</Label>
              <Input type="number" min="1" max="60" value={formData.duration} onChange={e => setFormData({
              ...formData,
              duration: parseInt(e.target.value) || 5
            })} />
            </div>
          </div>

          <div>
            <Label>自定义参数 (JSON)</Label>
            <Textarea value={JSON.stringify(formData.customParams, null, 2)} onChange={e => {
            try {
              const parsed = JSON.parse(e.target.value);
              setFormData({
                ...formData,
                customParams: parsed
              });
            } catch {
              // 忽略无效JSON
            }
          }} placeholder='{"key": "value"}' rows={3} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-1" />
            保存配置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}