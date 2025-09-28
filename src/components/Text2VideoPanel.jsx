// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Textarea, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label, Slider, Switch, useToast } from '@/components/ui';
// @ts-ignore;
import { Mic, Sparkles } from 'lucide-react';

export function Text2VideoPanel({
  onGenerate
}) {
  const [text, setText] = useState('');
  const [template, setTemplate] = useState('educational');
  const [duration, setDuration] = useState(30);
  const [style, setStyle] = useState('natural');
  const [enableVoice, setEnableVoice] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const {
    toast
  } = useToast();
  const templates = {
    educational: {
      name: '教育科普',
      prompt: '制作一个教育科普视频，内容专业但通俗易懂，适合大众学习'
    },
    promotional: {
      name: '产品推广',
      prompt: '制作一个产品推广视频，突出产品特点和优势，吸引用户购买'
    },
    entertaining: {
      name: '娱乐搞笑',
      prompt: '制作一个娱乐搞笑视频，内容轻松有趣，能够引起观众共鸣'
    },
    storytelling: {
      name: '故事叙述',
      prompt: '制作一个情感故事视频，情节引人入胜，富有感染力'
    }
  };
  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: '请输入文本内容',
        description: '请填写要生成视频的文本内容',
        variant: 'destructive'
      });
      return;
    }
    setIsGenerating(true);

    // 模拟AI生成过程
    setTimeout(() => {
      const result = {
        type: 'text2video',
        text,
        template,
        duration,
        style,
        enableVoice,
        prompt: templates[template].prompt + ': ' + text
      };
      onGenerate(result);
      toast({
        title: '生成成功',
        description: '文生视频已生成完成'
      });
      setIsGenerating(false);
    }, 3000);
  };
  return <div className="space-y-4">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg">文本输入</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea value={text} onChange={e => setText(e.target.value)} placeholder="输入你想要生成视频的文本内容..." className="min-h-[120px] bg-slate-800 border-slate-700" />
          
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">支持语音转文字</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg">模板选择</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={template} onValueChange={setTemplate}>
            <SelectTrigger className="bg-slate-800 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(templates).map(([key, value]) => <SelectItem key={key} value={key}>
                  {value.name}
                </SelectItem>)}
            </SelectContent>
          </Select>
          
          <p className="text-sm text-slate-400">
            {templates[template].prompt}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg">参数设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>视频时长: {duration}秒</Label>
            <Slider value={[duration]} onValueChange={([value]) => setDuration(value)} min={5} max={120} step={5} className="mt-2" />
          </div>
          
          <div>
            <Label>视觉风格</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="bg-slate-800 border-slate-700 mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="natural">自然写实</SelectItem>
                <SelectItem value="cinematic">电影质感</SelectItem>
                <SelectItem value="animated">动画风格</SelectItem>
                <SelectItem value="vintage">复古风格</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <Label>启用AI配音</Label>
            <Switch checked={enableVoice} onCheckedChange={setEnableVoice} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-sky-600 hover:bg-sky-700">
        {isGenerating ? <>
            <Sparkles className="w-4 h-4 mr-2 animate-spin" />
            生成中...
          </> : <>
            <Sparkles className="w-4 h-4 mr-2" />
            生成视频
          </>}
      </Button>
    </div>;
}