// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Upload, Play, Volume2 } from 'lucide-react';
// @ts-ignore;
import { Card, CardContent, Button, Slider } from '@/components/ui';

export function VoiceSelector({
  onVoiceSelect
}) {
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [voicePitch, setVoicePitch] = useState(1.0);
  const baseVoices = [{
    id: 1,
    name: '温柔女声',
    gender: 'female',
    style: 'gentle',
    language: 'zh-CN',
    sample: '这是一段温柔的女声示例'
  }, {
    id: 2,
    name: '沉稳男声',
    gender: 'male',
    style: 'calm',
    language: 'zh-CN',
    sample: '这是一段沉稳的男声示例'
  }, {
    id: 3,
    name: '活泼女声',
    gender: 'female',
    style: 'lively',
    language: 'zh-CN',
    sample: '这是一段活泼的女声示例'
  }, {
    id: 4,
    name: '磁性男声',
    gender: 'male',
    style: 'magnetic',
    language: 'zh-CN',
    sample: '这是一段磁性的男声示例'
  }, {
    id: 5,
    name: '甜美少女',
    gender: 'female',
    style: 'sweet',
    language: 'zh-CN',
    sample: '这是一段甜美的少女声音'
  }, {
    id: 6,
    name: '成熟大叔',
    gender: 'male',
    style: 'mature',
    language: 'zh-CN',
    sample: '这是一段成熟的大叔声音'
  }, {
    id: 7,
    name: '少年音',
    gender: 'male',
    style: 'youth',
    language: 'zh-CN',
    sample: '这是一段阳光少年声音'
  }, {
    id: 8,
    name: '御姐音',
    gender: 'female',
    style: 'mature',
    language: 'zh-CN',
    sample: '这是一段成熟御姐声音'
  }, {
    id: 9,
    name: '萝莉音',
    gender: 'female',
    style: 'cute',
    language: 'zh-CN',
    sample: '这是一段可爱萝莉声音'
  }, {
    id: 10,
    name: '新闻播报',
    gender: 'male',
    style: 'news',
    language: 'zh-CN',
    sample: '这是一段新闻播报声音'
  }];
  const handleVoiceClick = voice => {
    setSelectedVoice(voice.id);
    onVoiceSelect(voice);
  };
  const handlePlaySample = (e, voice) => {
    e.stopPropagation();
    setIsPlaying(voice.id);
    setTimeout(() => setIsPlaying(null), 2000);
  };
  return <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">音色选择</h4>
        <Button size="sm" variant="outline">
          <Upload className="w-4 h-4 mr-1" />
          声音克隆
        </Button>
      </div>
      
      <div className="space-y-2">
        {baseVoices.map(voice => <Card key={voice.id} className={`cursor-pointer transition-all ${selectedVoice === voice.id ? 'ring-2 ring-[#165DFF]' : ''}`} onClick={() => handleVoiceClick(voice)}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{voice.name}</p>
                  <p className="text-xs text-gray-500">{voice.style} · {voice.language}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={e => handlePlaySample(e, voice)}>
                    <Play className={`w-3 h-3 ${isPlaying === voice.id ? 'text-[#165DFF]' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>)}
      </div>

      <div className="space-y-3 pt-4 border-t">
        <div>
          <div className="flex justify-between text-sm">
            <label>语速</label>
            <span>{voiceSpeed.toFixed(1)}x</span>
          </div>
          <Slider value={[voiceSpeed]} onValueChange={v => setVoiceSpeed(v[0])} min={0.5} max={2.0} step={0.1} />
        </div>
        
        <div>
          <div className="flex justify-between text-sm">
            <label>音调</label>
            <span>{voicePitch.toFixed(1)}x</span>
          </div>
          <Slider value={[voicePitch]} onValueChange={v => setVoicePitch(v[0])} min={0.5} max={1.5} step={0.1} />
        </div>
      </div>
    </div>;
}