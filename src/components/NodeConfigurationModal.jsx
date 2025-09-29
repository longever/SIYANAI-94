// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from '@/components/ui';
// @ts-ignore;
import { Settings } from 'lucide-react';

export function NodeConfigurationModal({
  node,
  isOpen,
  onClose,
  onUpdate
}) {
  const [config, setConfig] = React.useState(node);
  const handleSave = () => {
    onUpdate(node.id, config);
    onClose();
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            节点配置 - {node.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>节点标题</Label>
              <Input value={config.title} onChange={e => setConfig({
              ...config,
              title: e.target.value
            })} />
            </div>
            <div>
              <Label>时长(秒)</Label>
              <Input type="number" value={config.duration} onChange={e => setConfig({
              ...config,
              duration: parseInt(e.target.value) || 5
            })} min={1} max={60} />
            </div>
          </div>

          <div>
            <Label>内容描述</Label>
            <Textarea value={config.content} onChange={e => setConfig({
            ...config,
            content: e.target.value
          })} rows={4} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>生成方式</Label>
              <Select value={config.type} onValueChange={value => setConfig({
              ...config,
              type: value
            })}>
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
              <Label>AI服务商</Label>
              <Select value={config.provider} onValueChange={value => setConfig({
              ...config,
              provider: value
            })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tongyi">阿里云通义万相</SelectItem>
                  <SelectItem value="digital_human">数字人API</SelectItem>
                  <SelectItem value="minmax">MinMax</SelectItem>
                  <SelectItem value="keling">可灵</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>镜头景别</Label>
              <Select value={config.shotType} onValueChange={value => setConfig({
              ...config,
              shotType: value
            })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="close">特写</SelectItem>
                  <SelectItem value="medium">中景</SelectItem>
                  <SelectItem value="long">远景</SelectItem>
                  <SelectItem value="wide">全景</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>转场效果</Label>
              <Select value={config.transition} onValueChange={value => setConfig({
              ...config,
              transition: value
            })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">无</SelectItem>
                  <SelectItem value="fade">淡入淡出</SelectItem>
                  <SelectItem value="slide">滑动</SelectItem>
                  <SelectItem value="zoom">缩放</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>色彩风格</Label>
              <Select value={config.colorStyle} onValueChange={value => setConfig({
              ...config,
              colorStyle: value
            })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">自然</SelectItem>
                  <SelectItem value="vivid">鲜艳</SelectItem>
                  <SelectItem value="warm">暖色</SelectItem>
                  <SelectItem value="cool">冷色</SelectItem>
                  <SelectItem value="monochrome">黑白</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存配置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}