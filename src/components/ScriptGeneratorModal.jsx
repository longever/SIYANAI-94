// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Button, Label, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Slider, useToast } from '@/components/ui';

export function ScriptGeneratorModal({
  open,
  onOpenChange,
  onGenerate
}) {
  const [form, setForm] = useState({
    topic: '',
    duration: 60,
    style: 'professional',
    description: ''
  });
  const {
    toast
  } = useToast();
  const styles = [{
    value: 'professional',
    label: '专业商务'
  }, {
    value: 'casual',
    label: '轻松休闲'
  }, {
    value: 'educational',
    label: '教育科普'
  }, {
    value: 'promotional',
    label: '产品推广'
  }];
  const handleGenerate = async () => {
    if (!form.topic.trim()) {
      toast({
        title: "请输入主题",
        description: "主题不能为空",
        variant: "destructive"
      });
      return;
    }
    try {
      // 模拟AI生成脚本
      const generatedNodes = generateScriptNodes(form);
      onGenerate(generatedNodes);
      onOpenChange(false);
      toast({
        title: "脚本生成成功",
        description: `已生成 ${generatedNodes.length} 个节点`
      });
    } catch (error) {
      toast({
        title: "生成失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const generateScriptNodes = ({
    topic,
    duration,
    style,
    description
  }) => {
    const nodeCount = Math.ceil(duration / 15);
    const baseNodes = [];

    // 根据风格生成不同的节点结构
    const templates = {
      professional: ['开场介绍', '核心内容', '总结呼吁'],
      casual: ['开场白', '主要内容', '互动环节', '结尾'],
      educational: ['引入问题', '知识讲解', '案例分析', '总结回顾'],
      promotional: ['产品展示', '功能介绍', '使用场景', '购买引导']
    };
    const selectedTemplate = templates[style] || templates.professional;
    for (let i = 0; i < Math.min(nodeCount, selectedTemplate.length); i++) {
      baseNodes.push({
        id: `generated-${Date.now()}-${i}`,
        text: `${selectedTemplate[i]}: ${topic}${description ? ` - ${description}` : ''}`,
        generationType: i === 0 ? 'digital_human' : 'text2video',
        provider: 'tongyi',
        shotType: i === 0 ? 'medium' : 'wide',
        transition: i === 0 ? 'fade' : 'slide',
        colorStyle: style === 'professional' ? 'cinematic' : 'vibrant',
        duration: Math.floor(duration / nodeCount),
        assets: {}
      });
    }
    return baseNodes;
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>智能脚本生成</DialogTitle>
          <DialogDescription>
            输入主题和参数，AI将为您生成结构化脚本
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>视频主题</Label>
            <Input value={form.topic} onChange={e => setForm({
            ...form,
            topic: e.target.value
          })} placeholder="例如：产品发布会介绍" />
          </div>
          
          <div>
            <Label>视频时长: {form.duration}秒</Label>
            <Slider value={[form.duration]} onValueChange={([value]) => setForm({
            ...form,
            duration: value
          })} min={15} max={300} step={15} />
          </div>
          
          <div>
            <Label>视频风格</Label>
            <Select value={form.style} onValueChange={value => setForm({
            ...form,
            style: value
          })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {styles.map(style => <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>补充描述（可选）</Label>
            <Textarea value={form.description} onChange={e => setForm({
            ...form,
            description: e.target.value
          })} placeholder="补充说明视频的具体要求..." rows={3} />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleGenerate}>
            生成脚本
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
}