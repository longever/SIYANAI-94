// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, Slider, Dialog, DialogContent, DialogHeader, DialogTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { User, Mic, Image, Film } from 'lucide-react';

import { AssetLibrary } from '@/components/AssetLibrary';
export function DigitalHumanPanel({
  onAddToTimeline,
  $w
}) {
  const [avatar, setAvatar] = useState('');
  const [voice, setVoice] = useState('');
  const [script, setScript] = useState('');
  const [background, setBackground] = useState('');
  const [expression, setExpression] = useState('neutral');
  const [gesture, setGesture] = useState('natural');
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const [assetType, setAssetType] = useState('');
  const {
    toast
  } = useToast();
  const handleAddToTimeline = () => {
    if (!script.trim()) {
      toast({
        title: '请输入脚本',
        description: '数字人脚本不能为空',
        variant: 'destructive'
      });
      return;
    }
    const nodeData = {
      type: 'digitalhuman',
      title: `数字人 - ${script.substring(0, 20)}...`,
      avatar,
      voice,
      script,
      background,
      expression,
      gesture,
      config: {
        resolution: '1920x1080',
        fps: 30
      }
    };
    onAddToTimeline(nodeData);

    // 重置表单
    setAvatar('');
    setVoice('');
    setScript('');
    setBackground('');
    setExpression('neutral');
    setGesture('natural');
  };
  const handleAssetSelect = asset => {
    if (assetType === 'image') {
      if (asset.name.toLowerCase().includes('avatar') || asset.name.toLowerCase().includes('人物')) {
        setAvatar(asset.url);
      } else {
        setBackground(asset.url);
      }
    } else if (assetType === 'audio') {
      setVoice(asset.url);
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
          <CardTitle>数字人创作</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>数字人形象</Label>
            <div className="flex gap-2">
              <Input placeholder="头像URL或选择素材" value={avatar} onChange={e => setAvatar(e.target.value)} />
              <Button size="sm" variant="outline" onClick={() => {
              setAssetType('image');
              setShowAssetLibrary(true);
            }}>
                <User className="w-4 h-4" />
              </Button>
            </div>
            {avatar && <img src={avatar} alt="数字人预览" className="mt-2 w-24 h-24 object-cover rounded-full" />}
          </div>

          <div>
            <Label>语音文件</Label>
            <div className="flex gap-2">
              <Input placeholder="音频URL或选择素材" value={voice} onChange={e => setVoice(e.target.value)} />
              <Button size="sm" variant="outline" onClick={() => {
              setAssetType('audio');
              setShowAssetLibrary(true);
            }}>
                <Mic className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label>背景图片</Label>
            <div className="flex gap-2">
              <Input placeholder="背景URL或选择素材" value={background} onChange={e => setBackground(e.target.value)} />
              <Button size="sm" variant="outline" onClick={() => {
              setAssetType('image');
              setShowAssetLibrary(true);
            }}>
                <Image className="w-4 h-4" />
              </Button>
            </div>
            {background && <img src={background} alt="背景预览" className="mt-2 w-full h-32 object-cover rounded" />}
          </div>

          <div>
            <Label>脚本内容</Label>
            <Textarea placeholder="输入数字人要说的话..." value={script} onChange={e => setScript(e.target.value)} className="min-h-[100px]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>表情风格</Label>
              <Select value={expression} onValueChange={setExpression}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neutral">自然</SelectItem>
                  <SelectItem value="happy">开心</SelectItem>
                  <SelectItem value="sad">悲伤</SelectItem>
                  <SelectItem value="angry">愤怒</SelectItem>
                  <SelectItem value="surprised">惊讶</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>手势动作</Label>
              <Select value={gesture} onValueChange={setGesture}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">自然</SelectItem>
                  <SelectItem value="pointing">指向</SelectItem>
                  <SelectItem value="waving">挥手</SelectItem>
                  <SelectItem value="explaining">解释</SelectItem>
                  <SelectItem value="emphasis">强调</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full" onClick={handleAddToTimeline} disabled={!script.trim()}>
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
          <AssetLibrary onAssetSelect={handleAssetSelect} onInsertToCreator={handleAssetSelect} $w={$w} />
        </DialogContent>
      </Dialog>
    </div>;
}