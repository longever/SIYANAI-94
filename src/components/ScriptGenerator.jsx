// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label, Slider, useToast } from '@/components/ui';
// @ts-ignore;
import { Wand2, Sparkles } from 'lucide-react';

export function ScriptGenerator({
  onGenerate
}) {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(60);
  const [style, setStyle] = useState('educational');
  const [tone, setTone] = useState('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const {
    toast
  } = useToast();
  const generateScript = async () => {
    if (!topic.trim()) {
      toast({
        title: "请输入主题",
        description: "请填写视频主题以生成脚本",
        variant: "destructive"
      });
      return;
    }
    setIsGenerating(true);

    // 模拟AI生成脚本
    setTimeout(() => {
      const segments = generateScriptSegments(topic, duration, style, tone);
      onGenerate(segments);
      toast({
        title: "脚本生成成功",
        description: `已生成包含 ${segments.length} 个节点的脚本`
      });
      setIsGenerating(false);
    }, 2000);
  };
  const generateScriptSegments = (topic, duration, style, tone) => {
    const segmentCount = Math.ceil(duration / 15);
    const segments = [];
    const styles = {
      educational: {
        intro: "欢迎来到本期视频，今天我们将学习",
        body: "让我们深入了解",
        outro: "总结一下今天的内容"
      },
      entertaining: {
        intro: "嘿，朋友们！今天有个超有趣的话题",
        body: "你们绝对想不到",
        outro: "喜欢的话别忘了点赞关注"
      },
      promotional: {
        intro: "你是否正在寻找",
        body: "让我告诉你一个绝佳的选择",
        outro: "现在就行动吧"
      }
    };
    const currentStyle = styles[style] || styles.educational;
    for (let i = 0; i < segmentCount; i++) {
      let content = '';
      let type = 'text2video';
      if (i === 0) {
        content = `${currentStyle.intro} ${topic}`;
        type = 'digital_human';
      } else if (i === segmentCount - 1) {
        content = `${currentStyle.outro}`;
      } else {
        content = `${currentStyle.body} ${topic} 的第 ${i} 个要点`;
        type = i % 2 === 0 ? 'text2video' : 'image2video';
      }
      segments.push({
        id: `segment-${Date.now()}-${i}`,
        title: `段落 ${i + 1}`,
        description: content,
        type: type,
        provider: 'tongyi',
        duration: Math.floor(duration / segmentCount),
        status: 'pending',
        assets: {
          image: null,
          audio: null,
          subtitle: null
        },
        cameraAngle: 'medium',
        transition: i === 0 ? 'none' : 'fade',
        colorStyle: 'natural',
        enableMotion: true
      });
    }
    return segments;
  };
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          智能脚本生成器
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>视频主题</Label>
          <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="例如：人工智能入门教程" />
        </div>
        
        <div>
          <Label>视频时长: {duration}秒</Label>
          <Slider value={[duration]} onValueChange={([value]) => setDuration(value)} min={15} max={300} step={15} />
        </div>
        
        <div>
          <Label>内容风格</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="educational">教育科普</SelectItem>
              <SelectItem value="entertaining">娱乐搞笑</SelectItem>
              <SelectItem value="promotional">产品推广</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>语调风格</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">专业正式</SelectItem>
              <SelectItem value="casual">轻松随意</SelectItem>
              <SelectItem value="enthusiastic">热情活力</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={generateScript} disabled={isGenerating} className="w-full">
          {isGenerating ? <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              生成中...
            </> : <>
              <Wand2 className="w-4 h-4 mr-2" />
              生成脚本
            </>}
        </Button>
      </CardContent>
    </Card>;
}