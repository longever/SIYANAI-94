// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Slider, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, Image, Play } from 'lucide-react';

export function Image2VideoPanel({
  onGenerate
}) {
  const [images, setImages] = useState([]);
  const [effect, setEffect] = useState('zoom_in');
  const [duration, setDuration] = useState(5);
  const [intensity, setIntensity] = useState(50);
  const [transition, setTransition] = useState('fade');
  const [isGenerating, setIsGenerating] = useState(false);
  const {
    toast
  } = useToast();
  const handleImageUpload = e => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: `img-${Date.now()}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setImages(prev => [...prev, ...newImages]);
  };
  const removeImage = id => {
    setImages(prev => prev.filter(img => img.id !== id));
  };
  const handleGenerate = async () => {
    if (images.length === 0) {
      toast({
        title: '请上传图片',
        description: '至少需要一张图片来生成视频',
        variant: 'destructive'
      });
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const result = {
        type: 'image2video',
        images,
        effect,
        duration,
        intensity,
        transition
      };
      onGenerate(result);
      toast({
        title: '生成成功',
        description: '图生视频已生成完成'
      });
      setIsGenerating(false);
    }, 3000);
  };
  const effects = {
    zoom_in: '放大效果',
    zoom_out: '缩小效果',
    pan_left: '左移效果',
    pan_right: '右移效果',
    rotate: '旋转效果',
    ken_burns: 'Ken Burns效果'
  };
  return <div className="space-y-4">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg">图片上传</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {images.map(image => <div key={image.id} className="relative group">
                <img src={image.url} alt={image.name} className="w-full h-24 object-cover rounded-lg" />
                <button onClick={() => removeImage(image.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  ×
                </button>
              </div>)}
            
            <label className="border-2 border-dashed border-slate-700 rounded-lg h-24 flex items-center justify-center cursor-pointer hover:border-slate-600 transition-colors">
              <Upload className="w-6 h-6 text-slate-500" />
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg">动态效果</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>效果类型</Label>
            <Select value={effect} onValueChange={setEffect}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(effects).map(([key, value]) => <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>效果强度: {intensity}%</Label>
            <Slider value={[intensity]} onValueChange={([value]) => setIntensity(value)} min={0} max={100} step={10} className="mt-2" />
          </div>

          <div>
            <Label>转场效果</Label>
            <Select value={transition} onValueChange={setTransition}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fade">淡入淡出</SelectItem>
                <SelectItem value="slide">滑动</SelectItem>
                <SelectItem value="zoom">缩放</SelectItem>
                <SelectItem value="blur">模糊</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>单张时长: {duration}秒</Label>
            <Slider value={[duration]} onValueChange={([value]) => setDuration(value)} min={1} max={10} step={1} className="mt-2" />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleGenerate} disabled={isGenerating || images.length === 0} className="w-full bg-sky-600 hover:bg-sky-700">
        {isGenerating ? <>
            <Play className="w-4 h-4 mr-2 animate-spin" />
            生成中...
          </> : <>
            <Play className="w-4 h-4 mr-2" />
            生成视频
          </>}
      </Button>
    </div>;
}