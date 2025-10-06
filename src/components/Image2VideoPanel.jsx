// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Slider, Dialog, DialogContent, DialogHeader, DialogTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { Image, Film, Sparkles } from 'lucide-react';

import { EnhancedAssetLibrary } from '@/components/EnhancedAssetLibrary';
export function Image2VideoPanel({
  onAddToTimeline,
  $w
}) {
  const [inputImage, setInputImage] = useState('');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [duration, setDuration] = useState(5);
  const [motionIntensity, setMotionIntensity] = useState(50);
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const {
    toast
  } = useToast();
  const handleAddToTimeline = () => {
    if (!inputImage) {
      toast({
        title: '请选择图片',
        description: '请先选择或上传一张图片',
        variant: 'destructive'
      });
      return;
    }
    const nodeData = {
      type: 'image2video',
      title: `图片转视频 - ${prompt.substring(0, 20)}...`,
      inputImage,
      prompt,
      style,
      duration,
      motionIntensity,
      config: {
        resolution: '1920x1080',
        fps: 30
      }
    };
    onAddToTimeline(nodeData);

    // 重置表单
    setInputImage('');
    setPrompt('');
    setStyle('realistic');
    setDuration(5);
    setMotionIntensity(50);
  };
  const handleAssetSelect = asset => {
    if (asset.type === 'image') {
      setInputImage(asset.url);
      setShowAssetLibrary(false);
      toast({
        title: '图片已选择',
        description: `${asset.name} 已添加到配置中`
      });
    } else {
      toast({
        title: '请选择图片',
        description: '此功能仅支持图片素材',
        variant: 'destructive'
      });
    }
  };
  return <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>图片转视频</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>输入图片</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input placeholder="图片URL或选择素材" value={inputImage} onChange={e => setInputImage(e.target.value)} />
                <Button size="sm" variant="outline" onClick={() => setShowAssetLibrary(true)}>
                  <Image className="w-4 h-4" />
                </Button>
              </div>
              
              {inputImage && <img src={inputImage} alt="输入图片预览" className="w-full h-48 object-cover rounded" />}
            </div>
          </div>

          <div>
            <Label>动画提示词</Label>
            <Input placeholder="描述你想要的动画效果..." value={prompt} onChange={e => setPrompt(e.target.value)} />
          </div>

          <div>
            <Label>视频风格</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realistic">写实风格</SelectItem>
                <SelectItem value="cartoon">卡通风格</SelectItem>
                <SelectItem value="anime">动漫风格</SelectItem>
                <SelectItem value="cinematic">电影风格</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>视频时长: {duration}秒</Label>
            <Slider value={[duration]} onValueChange={value => setDuration(value[0])} min={3} max={30} step={1} />
          </div>

          <div>
            <Label>运动强度: {motionIntensity}%</Label>
            <Slider value={[motionIntensity]} onValueChange={value => setMotionIntensity(value[0])} min={0} max={100} step={10} />
          </div>

          <Button className="w-full" onClick={handleAddToTimeline} disabled={!inputImage}>
            <Sparkles className="w-4 h-4 mr-2" />
            生成视频
          </Button>
        </CardContent>
      </Card>

      {/* 素材库弹窗 */}
      <Dialog open={showAssetLibrary} onOpenChange={setShowAssetLibrary}>
        <DialogContent className="max-w-6xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>选择图片素材</DialogTitle>
          </DialogHeader>
          <EnhancedAssetLibrary onAssetSelect={handleAssetSelect} onInsertToCreator={handleAssetSelect} $w={$w} onClose={() => setShowAssetLibrary(false)} />
        </DialogContent>
      </Dialog>
    </div>;
}