// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Textarea, Card, CardContent, CardDescription, CardHeader, CardTitle, Label, Switch, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, Video, Music, Loader2 } from 'lucide-react';

export default function TextToVideoPage(props) {
  const {
    $w
  } = props;
  const [text, setText] = useState('');
  const [useAudio, setUseAudio] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const {
    toast
  } = useToast();
  const handleTextChange = e => {
    setText(e.target.value);
  };
  const handleAudioToggle = checked => {
    setUseAudio(checked);
    if (!checked) {
      setAudioFile(null);
    }
  };
  const handleAudioUpload = e => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setAudioFile(file);
        toast({
          title: '音频已选择',
          description: `已选择音频文件: ${file.name}`
        });
      } else {
        toast({
          title: '文件格式错误',
          description: '请选择音频文件',
          variant: 'destructive'
        });
      }
    }
  };
  const handleGenerateVideo = async () => {
    if (!text.trim()) {
      toast({
        title: '请输入文本',
        description: '请至少输入一些文本内容',
        variant: 'destructive'
      });
      return;
    }
    if (useAudio && !audioFile) {
      toast({
        title: '请选择音频',
        description: '已启用音频选项，请上传音频文件',
        variant: 'destructive'
      });
      return;
    }
    setIsGenerating(true);
    try {
      let audioBase64 = null;
      if (useAudio && audioFile) {
        // 将音频文件转换为base64
        const reader = new FileReader();
        audioBase64 = await new Promise((resolve, reject) => {
          reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(audioFile);
        });
      }

      // 调用云函数生成视频
      const result = await $w.cloud.callFunction({
        name: 'description-to-video',
        data: {
          description: text,
          audio: audioBase64,
          audioType: audioFile ? audioFile.type : null,
          useAudio: useAudio
        }
      });
      if (result.success) {
        toast({
          title: '生成成功',
          description: '视频正在处理中，请稍后查看'
        });

        // 跳转到作品页面
        $w.utils.navigateTo({
          pageId: 'works',
          params: {}
        });
      } else {
        throw new Error(result.error || '生成失败');
      }
    } catch (error) {
      console.error('生成视频失败:', error);
      toast({
        title: '生成失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">文本转视频</h1>
          <p className="text-gray-600">输入文本描述，AI将为您生成对应的视频内容</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              视频生成设置
            </CardTitle>
            <CardDescription>
              输入您想要生成的视频文本描述
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="text-description">文本描述</Label>
              <Textarea id="text-description" placeholder="请输入您想要生成的视频内容描述，越详细越好..." value={text} onChange={handleTextChange} className="min-h-[120px] resize-none" />
              <p className="text-sm text-gray-500 mt-1">
                {text.length}/500 字符
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="use-audio" className="flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  使用自定义音频
                </Label>
                <Switch id="use-audio" checked={useAudio} onCheckedChange={handleAudioToggle} />
              </div>

              {useAudio && <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" id="audio-upload" />
                  <label htmlFor="audio-upload" className="cursor-pointer flex flex-col items-center space-y-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {audioFile ? audioFile.name : '点击上传音频文件'}
                    </span>
                    <span className="text-xs text-gray-500">
                      支持 MP3, WAV, M4A 格式
                    </span>
                  </label>
                </div>}
            </div>

            <Button onClick={handleGenerateVideo} disabled={isGenerating || !text.trim() || useAudio && !audioFile} className="w-full" size="lg">
              {isGenerating ? <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  生成中...
                </> : <>
                  <Video className="w-4 h-4 mr-2" />
                  开始生成视频
                </>}
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-6 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">使用提示</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 文本描述越详细，生成的视频效果越好</li>
              <li>• 可以添加场景、动作、情感等细节描述</li>
              <li>• 使用音频选项可以添加背景音乐或旁白</li>
              <li>• 生成时间根据文本长度和复杂度而定</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>;
}