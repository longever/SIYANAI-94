// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Slider, Card, CardContent, CardDescription, CardHeader, CardTitle, Switch } from '@/components/ui';

import { useForm } from 'react-hook-form';
import { ImageVideoPreview } from './ImageVideoPreview';
const formSchema = {
  title: value => {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return '请输入标题';
    }
    return true;
  },
  description: () => true,
  duration: value => {
    if (typeof value !== 'number' || value < 1 || value > 300) {
      return '时长必须在 1-300 秒之间';
    }
    return true;
  },
  fps: value => {
    if (typeof value !== 'number' || value < 1 || value > 60) {
      return '帧率必须在 1-60 之间';
    }
    return true;
  },
  resolution: value => {
    const allowed = ['3840x2160', '1920x1080', '1280x720'];
    return allowed.includes(value) || '请选择有效分辨率';
  },
  quality: value => {
    const allowed = ['high', 'medium', 'low'];
    return allowed.includes(value) || '请选择有效质量';
  },
  enableAudio: value => typeof value === 'boolean',
  audioUrl: () => true
};
function validateForm(values) {
  const errors = {};
  Object.keys(formSchema).forEach(key => {
    const result = formSchema[key](values[key]);
    if (result !== true) {
      errors[key] = {
        message: result
      };
    }
  });
  return Object.keys(errors).length === 0 ? {
    valid: true
  } : {
    valid: false,
    errors
  };
}
export function VideoSettings({
  imageUrl,
  videoUrl,
  onGenerate,
  isGenerating = false
}) {
  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      duration: 10,
      fps: 24,
      resolution: '1920x1080',
      quality: 'high',
      enableAudio: false,
      audioUrl: ''
    }
  });
  const onSubmit = values => {
    const validation = validateForm(values);
    if (!validation.valid) {
      Object.keys(validation.errors).forEach(key => {
        form.setError(key, validation.errors[key]);
      });
      return;
    }
    onGenerate(values);
  };
  return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle>预览</CardTitle>
        <CardDescription>查看当前图片效果</CardDescription>
      </CardHeader>
      <CardContent>
        <ImageVideoPreview videoUrl={videoUrl} thumbnailUrl={imageUrl} className="w-full aspect-video" showControls={false} />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>视频设置</CardTitle>
        <CardDescription>配置视频生成参数</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="title" render={({
              field
            }) => <FormItem>
                <FormLabel>标题</FormLabel>
                <FormControl>
                  <Input placeholder="输入视频标题" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>} />

            <FormField control={form.control} name="description" render={({
              field
            }) => <FormItem>
                <FormLabel>描述</FormLabel>
                <FormControl>
                  <Textarea placeholder="输入视频描述" className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>} />

            <FormField control={form.control} name="duration" render={({
              field
            }) => <FormItem>
                <FormLabel>时长: {field.value}秒</FormLabel>
                <FormControl>
                  <Slider min={1} max={60} step={1} value={[field.value]} onValueChange={value => field.onChange(value[0])} />
                </FormControl>
                <FormDescription>视频持续时间</FormDescription>
                <FormMessage />
              </FormItem>} />

            <FormField control={form.control} name="fps" render={({
              field
            }) => <FormItem>
                <FormLabel>帧率: {field.value}fps</FormLabel>
                <FormControl>
                  <Slider min={1} max={60} step={1} value={[field.value]} onValueChange={value => field.onChange(value[0])} />
                </FormControl>
                <FormDescription>每秒帧数</FormDescription>
                <FormMessage />
              </FormItem>} />

            <FormField control={form.control} name="resolution" render={({
              field
            }) => <FormItem>
                <FormLabel>分辨率</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择分辨率" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="3840x2160">4K (3840x2160)</SelectItem>
                    <SelectItem value="1920x1080">1080p (1920x1080)</SelectItem>
                    <SelectItem value="1280x720">720p (1280x720)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>} />

            <FormField control={form.control} name="quality" render={({
              field
            }) => <FormItem>
                <FormLabel>质量</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择质量" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>} />

            <FormField control={form.control} name="enableAudio" render={({
              field
            }) => <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">启用音频</FormLabel>
                  <FormDescription>为视频添加背景音乐</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>} />

            {form.watch('enableAudio') && <FormField control={form.control} name="audioUrl" render={({
              field
            }) => <FormItem>
                <FormLabel>音频URL</FormLabel>
                <FormControl>
                  <Input placeholder="输入音频文件URL" {...field} />
                </FormControl>
                <FormDescription>支持MP3、WAV格式</FormDescription>
                <FormMessage />
              </FormItem>} />}

            <Button type="submit" className="w-full" disabled={isGenerating}>
              {isGenerating ? '生成中...' : '生成视频'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  </div>;
}