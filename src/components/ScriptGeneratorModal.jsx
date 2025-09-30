// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label, Input } from '@/components/ui';
// @ts-ignore;
import { Sparkles, Loader2 } from 'lucide-react';

export function ScriptGeneratorModal({
  open,
  onOpenChange,
  onGenerate,
  isGenerating
}) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('creative');
  const [duration, setDuration] = useState(60);
  const [tone, setTone] = useState('neutral');
  const [industry, setIndustry] = useState('general');
  const styles = [{
    value: 'creative',
    label: '创意风格'
  }, {
    value: 'professional',
    label: '专业风格'
  }, {
    value: 'casual',
    label: '轻松风格'
  }, {
    value: 'dramatic',
    label: '戏剧风格'
  }, {
    value: 'educational',
    label: '教育风格'
  }];
  const tones = [{
    value: 'neutral',
    label: '中性'
  }, {
    value: 'positive',
    label: '积极'
  }, {
    value: 'emotional',
    label: '情感化'
  }, {
    value: 'urgent',
    label: '紧迫'
  }, {
    value: 'inspiring',
    label: '激励'
  }];
  const industries = [{
    value: 'general',
    label: '通用'
  }, {
    value: 'technology',
    label: '科技'
  }, {
    value: 'education',
    label: '教育'
  }, {
    value: 'business',
    label: '商业'
  }, {
    value: 'entertainment',
    label: '娱乐'
  }, {
    value: 'lifestyle',
    label: '生活方式'
  }];
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      return;
    }
    const options = {
      style,
      duration,
      tone,
      industry
    };
    await onGenerate(prompt, options);
    setPrompt('');
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI脚本生成
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>视频主题描述</Label>
            <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="描述您想要生成的视频内容，例如：制作一个关于人工智能发展的科普视频..." rows={4} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>视频时长 (秒)</Label>
              <Input type="number" min="10" max="300" value={duration} onChange={e => setDuration(parseInt(e.target.value) || 60)} />
            </div>

            <div>
              <Label>行业领域</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(ind => <SelectItem key={ind.value} value={ind.value}>{ind.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>创作风格</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styles.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>情感基调</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
            {isGenerating ? <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                生成中...
              </> : <>
                <Sparkles className="w-4 h-4 mr-2" />
                生成脚本
              </>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}