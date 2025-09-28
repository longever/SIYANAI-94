// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label, Slider, Switch, Tabs, TabsContent, TabsList, TabsTrigger, useToast, Textarea } from '@/components/ui';
// @ts-ignore;
import { Upload, User, Mic, Smile, Hand, Eye } from 'lucide-react';

export function DigitalHumanPanel({
  onGenerate
}) {
  const [avatar, setAvatar] = useState('default_1');
  const [voice, setVoice] = useState('female_1');
  const [driveMode, setDriveMode] = useState('text');
  const [text, setText] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [background, setBackground] = useState('office');
  const [expression, setExpression] = useState('neutral');
  const [gesture, setGesture] = useState('standing');
  const [enableCustom, setEnableCustom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const {
    toast
  } = useToast();
  const avatars = [{
    id: 'default_1',
    name: '商务男士',
    gender: 'male',
    style: 'professional'
  }, {
    id: 'default_2',
    name: '优雅女士',
    gender: 'female',
    style: 'elegant'
  }, {
    id: 'default_3',
    name: '年轻学生',
    gender: 'male',
    style: 'casual'
  }, {
    id: 'default_4',
    name: '知性女士',
    gender: 'female',
    style: 'intellectual'
  }, {
    id: 'default_5',
    name: '活力青年',
    gender: 'male',
    style: 'energetic'
  }, {
    id: 'default_6',
    name: '温柔女士',
    gender: 'female',
    style: 'gentle'
  }, {
    id: 'default_7',
    name: '成熟男士',
    gender: 'male',
    style: 'mature'
  }, {
    id: 'default_8',
    name: '时尚女士',
    gender: 'female',
    style: 'fashion'
  }, {
    id: 'default_9',
    name: '学者形象',
    gender: 'male',
    style: 'scholar'
  }, {
    id: 'default_10',
    name: '亲和女士',
    gender: 'female',
    style: 'friendly'
  }, {
    id: 'default_11',
    name: '科技达人',
    gender: 'male',
    style: 'tech'
  }, {
    id: 'default_12',
    name: '职场精英',
    gender: 'female',
    style: 'business'
  }];
  const voices = [{
    id: 'female_1',
    name: '温柔女声',
    gender: 'female',
    tone: 'gentle'
  }, {
    id: 'female_2',
    name: '活泼女声',
    gender: 'female',
    tone: 'lively'
  }, {
    id: 'female_3',
    name: '专业女声',
    gender: 'female',
    tone: 'professional'
  }, {
    id: 'male_1',
    name: '磁性男声',
    gender: 'male',
    tone: 'magnetic'
  }, {
    id: 'male_2',
    name: '阳光男声',
    gender: 'male',
    tone: 'sunny'
  }, {
    id: 'male_3',
    name: '成熟男声',
    gender: 'male',
    tone: 'mature'
  }, {
    id: 'female_4',
    name: '少女音',
    gender: 'female',
    tone: 'youthful'
  }, {
    id: 'male_4',
    name: '少年音',
    gender: 'male',
    tone: 'youthful'
  }, {
    id: 'female_5',
    name: '知性女声',
    gender: 'female',
    tone: 'intellectual'
  }, {
    id: 'male_5',
    name: '权威男声',
    gender: 'male',
    tone: 'authoritative'
  }];
  const backgrounds = [{
    id: 'office',
    name: '办公室'
  }, {
    id: 'home',
    name: '居家环境'
  }, {
    id: 'studio',
    name: '演播室'
  }, {
    id: 'nature',
    name: '自然环境'
  }, {
    id: 'virtual',
    name: '虚拟背景'
  }, {
    id: 'custom',
    name: '自定义上传'
  }];
  const expressions = [{
    id: 'neutral',
    name: '自然',
    icon: Smile
  }, {
    id: 'smile',
    name: '微笑',
    icon: Smile
  }, {
    id: 'serious',
    name: '严肃',
    icon: Smile
  }, {
    id: 'surprised',
    name: '惊讶',
    icon: Smile
  }, {
    id: 'happy',
    name: '开心',
    icon: Smile
  }, {
    id: 'confident',
    name: '自信',
    icon: Smile
  }];
  const gestures = [{
    id: 'standing',
    name: '站立',
    icon: Hand
  }, {
    id: 'sitting',
    name: '坐姿',
    icon: Hand
  }, {
    id: 'hand_gesture',
    name: '手势',
    icon: Hand
  }, {
    id: 'eye_contact',
    name: '眼神交流',
    icon: Eye
  }, {
    id: 'walking',
    name: '走动',
    icon: Hand
  }];
  const handleAudioUpload = e => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      toast({
        title: '音频已上传',
        description: `${file.name} 已上传成功`
      });
    }
  };
  const handleGenerate = async () => {
    if (driveMode === 'text' && !text.trim()) {
      toast({
        title: '请输入文案',
        description: '文案驱动模式需要输入文本内容',
        variant: 'destructive'
      });
      return;
    }
    if (driveMode === 'audio' && !audioFile) {
      toast({
        title: '请上传音频',
        description: '音频驱动模式需要上传音频文件',
        variant: 'destructive'
      });
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const result = {
        type: 'digital_human',
        avatar,
        voice,
        driveMode,
        text: driveMode === 'text' ? text : null,
        audioFile: driveMode === 'audio' ? audioFile : null,
        background,
        expression,
        gesture,
        enableCustom
      };
      onGenerate(result);
      toast({
        title: '生成成功',
        description: '数字人视频已生成完成'
      });
      setIsGenerating(false);
    }, 4000);
  };
  return <div className="space-y-4">
      <Tabs defaultValue="avatar" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="avatar">形象选择</TabsTrigger>
          <TabsTrigger value="voice">音色配置</TabsTrigger>
          <TabsTrigger value="settings">高级设置</TabsTrigger>
        </TabsList>

        <TabsContent value="avatar" className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">虚拟形象</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {avatars.map(av => <div key={av.id} className={`border-2 rounded-lg p-2 cursor-pointer transition-all ${avatar === av.id ? 'border-sky-500 bg-sky-500/10' : 'border-slate-700 hover:border-slate-600'}`} onClick={() => setAvatar(av.id)}>
                    <div className="bg-slate-800 rounded-lg h-20 flex items-center justify-center mb-2">
                      <User className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-xs text-center">{av.name}</p>
                  </div>)}
              </div>
              
              <div className="mt-4">
                <Label>自定义形象</Label>
                <div className="mt-2">
                  <Switch checked={enableCustom} onCheckedChange={setEnableCustom} />
                  <span className="ml-2 text-sm text-slate-400">
                    上传个人图片生成专属数字人
                  </span>
                </div>
                {enableCustom && <Button variant="outline" className="mt-2 w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    上传个人图片
                  </Button>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">音色选择</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voices.map(v => <SelectItem key={v.id} value={v.id}>
                      {v.name} ({v.gender} - {v.tone})
                    </SelectItem>)}
                </SelectContent>
              </Select>
              
              <div className="mt-4">
                <Label>声音克隆</Label>
                <Button variant="outline" className="mt-2 w-full">
                  <Mic className="w-4 h-4 mr-2" />
                  上传30秒语音样本
                </Button>
                <p className="text-xs text-slate-400 mt-1">
                  上传清晰语音样本生成个性化音色
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">驱动设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={driveMode} onValueChange={setDriveMode}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">文案驱动</TabsTrigger>
                  <TabsTrigger value="audio">音频驱动</TabsTrigger>
                </TabsList>
                
                <TabsContent value="text">
                  <Textarea value={text} onChange={e => setText(e.target.value)} placeholder="输入要播报的文案..." className="bg-slate-800 border-slate-700" />
                </TabsContent>
                
                <TabsContent value="audio">
                  <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" id="audio-upload" />
                  <label htmlFor="audio-upload">
                    <Button variant="outline" className="w-full" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {audioFile ? audioFile.name : '上传音频文件'}
                      </span>
                    </Button>
                  </label>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">场景与动作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>虚拟背景</Label>
                <Select value={background} onValueChange={setBackground}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {backgrounds.map(bg => <SelectItem key={bg.id} value={bg.id}>
                        {bg.name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>表情设置</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {expressions.map(exp => <Button key={exp.id} variant={expression === exp.id ? "default" : "outline"} size="sm" onClick={() => setExpression(exp.id)}>
                      <exp.icon className="w-3 h-3 mr-1" />
                      {exp.name}
                    </Button>)}
                </div>
              </div>

              <div>
                <Label>动作模板</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {gestures.map(gest => <Button key={gest.id} variant={gesture === gest.id ? "default" : "outline"} size="sm" onClick={() => setGesture(gest.id)}>
                      <gest.icon className="w-3 h-3 mr-1" />
                      {gest.name}
                    </Button>)}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-sky-600 hover:bg-sky-700">
        {isGenerating ? <>
            <User className="w-4 h-4 mr-2 animate-spin" />
            生成中...
          </> : <>
            <User className="w-4 h-4 mr-2" />
            生成数字人视频
          </>}
      </Button>
    </div>;
}