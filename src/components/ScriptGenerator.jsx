// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Card, CardContent, CardHeader, CardTitle, Badge, Tabs, TabsContent, TabsList, TabsTrigger, useToast } from '@/components/ui';
// @ts-ignore;
import { Sparkles, Clock, Palette } from 'lucide-react';

export function ScriptGenerator({
  onGenerate
}) {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(60);
  const [style, setStyle] = useState('professional');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const {
    toast
  } = useToast();
  const styles = [{
    value: 'professional',
    label: '专业正式',
    icon: '💼'
  }, {
    value: 'casual',
    label: '轻松随意',
    icon: '😊'
  }, {
    value: 'creative',
    label: '创意有趣',
    icon: '🎨'
  }, {
    value: 'emotional',
    label: '情感共鸣',
    icon: '❤️'
  }, {
    value: 'educational',
    label: '教育科普',
    icon: '📚'
  }];
  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "请输入主题",
        description: "请填写视频主题",
        variant: "destructive"
      });
      return;
    }
    setIsGenerating(true);
    try {
      // 模拟生成脚本
      const generatedScript = {
        title: topic,
        totalDuration: duration,
        style: style,
        nodes: generateNodesFromPrompt(topic, duration, style)
      };
      onGenerate(generatedScript);
      toast({
        title: "脚本生成成功",
        description: `已生成包含 ${generatedScript.nodes.length} 个节点的脚本`
      });
    } catch (error) {
      toast({
        title: "生成失败",
        description: "脚本生成失败，请重试",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const generateNodesFromPrompt = (topic, duration, style) => {
    const nodeCount = Math.max(3, Math.min(8, Math.floor(duration / 10)));
    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        id: `generated-${Date.now()}-${i}`,
        type: 'text2video',
        provider: 'tongyi',
        title: `第${i + 1}段：${topic} - ${getSegmentTitle(i, nodeCount)}`,
        content: generateSegmentContent(topic, i, nodeCount, style),
        duration: Math.floor(duration / nodeCount),
        assets: {
          images: [],
          audio: null,
          subtitle: ''
        },
        settings: {
          shotType: getShotTypeForSegment(i, nodeCount),
          transition: i === 0 ? 'fade' : 'cut',
          colorStyle: getColorStyleForStyle(style)
        }
      });
    }
    return nodes;
  };
  const getSegmentTitle = (index, total) => {
    const positions = ['开场', '引入', '发展', '高潮', '转折', '深入', '总结', '结尾'];
    return positions[index] || `片段${index + 1}`;
  };
  const generateSegmentContent = (topic, index, total, style) => {
    const templates = {
      professional: [`欢迎来到${topic}的专业解读`, `让我们深入了解${topic}的核心要点`, `${topic}的实际应用场景展示`, `总结${topic}的关键价值`],
      casual: [`嘿，今天聊聊${topic}`, `你知道吗？${topic}超有趣的`, `来看看${topic}的酷炫效果`, `${topic}真的很棒，你觉得呢？`],
      creative: [`想象一下，${topic}的世界`, `${topic}的无限可能`, `创意无限的${topic}展示`, `${topic}让想象成为现实`]
    };
    const styleTemplates = templates[style] || templates.professional;
    return styleTemplates[index % styleTemplates.length];
  };
  const getShotTypeForSegment = (index, total) => {
    const types = ['medium', 'close', 'medium', 'long'];
    return types[index % types.length];
  };
  const getColorStyleForStyle = style => {
    const map = {
      professional: 'natural',
      casual: 'warm',
      creative: 'cinematic',
      emotional: 'warm',
      educational: 'natural'
    };
    return map[style] || 'natural';
  };
  return <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="w-5 h-5 mr-2" />
          智能脚本生成
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">视频主题</label>
          <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="例如：人工智能的未来发展" className="bg-gray-800 border-gray-700" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              视频时长
            </label>
            <Select value={duration.toString()} onValueChange={v => setDuration(parseInt(v))}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30秒</SelectItem>
                <SelectItem value="60">1分钟</SelectItem>
                <SelectItem value="120">2分钟</SelectItem>
                <SelectItem value="180">3分钟</SelectItem>
                <SelectItem value="300">5分钟</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block flex items-center">
              <Palette className="w-4 h-4 mr-1" />
              视频风格
            </label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {styles.map(s => <SelectItem key={s.value} value={s.value}>
                    {s.icon} {s.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">自定义要求（可选）</label>
          <Textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} placeholder="输入额外的要求，如特定的场景、语气等..." className="bg-gray-800 border-gray-700 min-h-[80px]" />
        </div>

        <Button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-blue-600 hover:bg-blue-700">
          {isGenerating ? <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              生成中...
            </> : <>
              <Sparkles className="w-4 h-4 mr-2" />
              生成脚本
            </>}
        </Button>
      </CardContent>
    </Card>;
}