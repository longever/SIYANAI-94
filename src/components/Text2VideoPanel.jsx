// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Textarea, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Slider, Dialog, DialogContent, DialogHeader, DialogTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { Image, Music, Film } from 'lucide-react';

import { EnhancedAssetLibrary } from '@/components/EnhancedAssetLibrary';
export function Text2VideoPanel({
  onAddToTimeline,
  $w
}) {
  const [text, setText] = useState('');
  const [style, setStyle] = useState('realistic');
  const [duration, setDuration] = useState(5);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [backgroundMusic, setBackgroundMusic] = useState('');
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const [assetType, setAssetType] = useState('');
  const {
    toast
  } = useToast();
  const handleAddToTimeline = () => {
    if (!text.trim()) {
      toast({
        title: '请输入文本内容',
        description: '文本内容不能为空',
        variant: 'destructive'
      });
      return;
    }
    const nodeData = {
      type: 'text2video',
      title: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
      text,
      style,
      duration,
      backgroundImage,
      backgroundMusic,
      config: {
        resolution: '1920x1080',
        fps: 30
      }
    };
    onAddToTimeline(nodeData);

    // 重置表单
    setText('');
    setStyle('realistic');
    setDuration(5);
    setBackgroundImage('');
    setBackgroundMusic('');
  };
  const handleAssetSelect = asset => {
    if (assetType === 'image') {
      setBackgroundImage(asset.url);
    } else if (assetType === 'audio') {
      setBackgroundMusic(asset.url);
    }
    setShowAssetLibrary(false);
    toast({
      title: '素材已选择',
      description: `${asset.name} 已添加到配置中`
    });
  };
  return <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>文本转视频</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>文本内容</Label>
            <Textarea placeholder="输入你想要转换成视频的文本内容..." value={text} onChange={e => setText(e.target.value)} className="min-h-[100px]" />
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
                <SelectItem value="sketch">素描风格</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>视频时长: {duration}秒</Label>
            <Slider value={[duration]} onValueChange={value => setDuration(value[0])} min={3} max={30} step={1} />
          </div>

          <div>
            <Label>背景图片</Label>
            <div className="flex gap-2">
              <Input placeholder="图片URL或选择素材" value={backgroundImage} onChange={e => setBackgroundImage(e.target.value)} />
              <Button size="sm" variant="outline" onClick={() => {
              setAssetType('image');
              setShowAssetLibrary(true);
            }}>
                <Image className="w-4 h-4" />
              </Button>
            </div>
            {backgroundImage && <img src={backgroundImage} alt="背景预览" className="mt-2 w-full h-32 object-cover rounded" />}
          </div>

          <div>
            <Label>背景音乐</Label>
            <div className="flex gap-2">
              <Input placeholder="音频URL或选择素材" value={backgroundMusic} onChange={e => setBackgroundMusic(e.target.value)} />
              <Button size="sm" variant="outline" onClick={() => {
              setAssetType('audio');
              setShowAssetLibrary(true);
            }}>
                <Music className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button className="w-full" onClick={handleAddToTimeline} disabled={!text.trim()}>
            <Film className="w-4 h-4 mr-2" />
            添加到时间线
          </Button>
        </CardContent>
      </Card>

      {/* 素材库弹窗 */}
      <Dialog open={showAssetLibrary} onOpenChange={setShowAssetLibrary}>
        <DialogContent className="max-w-6xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>选择素材</DialogTitle>
          </DialogHeader>
          <EnhancedAssetLibrary onAssetSelect={handleAssetSelect} onClose={() => setShowAssetLibrary(false)} mode="select" />
        </DialogContent>
      </Dialog>
    </div>;
}