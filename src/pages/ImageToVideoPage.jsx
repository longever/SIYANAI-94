// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Tabs, TabsContent, TabsList, TabsTrigger, Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Progress, Alert, AlertDescription, AlertTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, Image, FileAudio, Video, Sparkles, Download, Play, Loader2 } from 'lucide-react';

import { ScriptGenerator } from '@/components/ScriptGenerator';
import ImageAudioToVideo from '@/components/ImageToVideo/ImageAudioToVideo';
import ImageVideoToVideo from '@/components/ImageToVideo/ImageVideoToVideo';

// 图+描述组件
function ImageDescriptionMode({
  onTaskCreated
}) {
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [showScriptGenerator, setShowScriptGenerator] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const {
    toast
  } = useToast();
  const handleImageUpload = async e => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setIsUploading(true);
      try {
        // 上传图片到云存储
        const tcb = await window.$w.cloud.getCloudInstance();
        const uploadRes = await tcb.uploadFile({
          cloudPath: `temp/${Date.now()}_${file.name}`,
          filePath: file
        });
        setImageUrl(uploadRes.fileID);
        toast({
          title: '图片上传成功'
        });
      } catch (error) {
        toast({
          title: '图片上传失败',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setIsUploading(false);
      }
    }
  };
  const handleScriptGenerated = script => {
    const generatedDescription = script.nodes.map(node => node.content).join('\n\n');
    setDescription(generatedDescription);
    setShowScriptGenerator(false);
  };
  const handleGenerate = async () => {
    if (!imageUrl || !description.trim()) {
      toast({
        title: '请上传图片并输入描述',
        variant: 'destructive'
      });
      return;
    }
    try {
      const result = await window.$w.cloud.callFunction({
        name: 'generateImageToVideo',
        data: {
          userId: window.$w.auth.currentUser?.userId || 'anonymous',
          inputType: 'text',
          imageUrl,
          text: description,
          modelParams: {
            duration: 10,
            fps: 30,
            resolution: '1080p'
          }
        }
      });
      if (result.result.error) {
        throw new Error(result.result.error);
      }
      toast({
        title: '任务创建成功',
        description: '正在生成视频...'
      });
      onTaskCreated(result.result.taskId);
    } catch (error) {
      toast({
        title: '任务创建失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  return <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium mb-2">上传图片</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" disabled={isUploading} />
        <label htmlFor="image-upload" className="cursor-pointer">
          {imageFile ? <div className="space-y-2">
              <img src={URL.createObjectURL(imageFile)} alt="预览" className="max-w-full h-48 object-contain mx-auto rounded" />
              <p className="text-sm text-gray-600">{imageFile.name}</p>
            </div> : <div className="space-y-2">
              {isUploading ? <Loader2 className="w-12 h-12 mx-auto text-gray-400 animate-spin" /> : <Upload className="w-12 h-12 mx-auto text-gray-400" />}
              <p className="text-sm text-gray-600">
                {isUploading ? '上传中...' : '点击上传图片'}
              </p>
            </div>}
        </label>
      </div>
    </div>

    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium">图片描述</label>
        <Button variant="ghost" size="sm" onClick={() => setShowScriptGenerator(!showScriptGenerator)} className="text-blue-600 hover:text-blue-700">
          <Sparkles className="w-4 h-4 mr-1" />
          AI生成描述
        </Button>
      </div>

      {showScriptGenerator && <div className="mb-4">
          <ScriptGenerator onGenerate={handleScriptGenerated} />
        </div>}

      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="请输入图片的描述文字，AI将根据描述生成视频..." className="w-full min-h-[120px] p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
    </div>

    <Button className="w-full" onClick={handleGenerate} disabled={!imageUrl || !description.trim() || isUploading}>
      生成视频
    </Button>
  </div>;
}

// 图+音频组件
function ImageAudioMode({
  onTaskCreated
}) {
  return <ImageAudioToVideo onTaskCreated={onTaskCreated} />;
}

// 图+视频组件
function ImageVideoMode({
  onTaskCreated
}) {
  return <ImageVideoToVideo onTaskCreated={onTaskCreated} />;
}

// 任务进度组件
function TaskProgress({
  taskId,
  onComplete
}) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);
  const {
    toast
  } = useToast();
  const fetchTaskStatus = async () => {
    if (!taskId) return;
    try {
      const result = await window.$w.cloud.callFunction({
        name: 'getVideoGenerationResult',
        data: {
          taskId
        }
      });
      if (result.result.code === 200) {
        const taskData = result.result.data;
        setTask(taskData);
        if (taskData.status === 'completed') {
          onComplete(taskData);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        } else if (taskData.status === 'failed') {
          toast({
            title: '生成失败',
            description: taskData.errorMessage || '未知错误',
            variant: 'destructive'
          });
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      } else {
        throw new Error(result.result.message);
      }
    } catch (error) {
      toast({
        title: '获取任务状态失败',
        description: error.message,
        variant: 'destructive'
      });
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (taskId) {
      fetchTaskStatus();
      intervalRef.current = setInterval(fetchTaskStatus, 3000);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [taskId]);
  if (loading && !task) {
    return <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>;
  }
  if (!task) return null;
  return <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">生成进度</span>
        <span className="text-sm text-gray-600">{task.status}</span>
      </div>
      <Progress value={task.progress} className="w-full" />
      <div className="text-center text-sm text-gray-600">
        {task.progress}%
      </div>
    </div>;
}

// 结果预览组件
function ResultPreview({
  task
}) {
  if (!task || task.status !== 'completed') return null;
  return <div className="space-y-4">
      <h3 className="text-lg font-semibold">生成结果</h3>
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <video src={task.outputUrl} controls className="w-full h-full" poster={task.inputAssets?.imageUrl} />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => window.open(task.outputUrl, '_blank')}>
          <Play className="w-4 h-4 mr-2" />
          预览
        </Button>
        <Button className="flex-1" onClick={() => {
        const a = document.createElement('a');
        a.href = task.outputUrl;
        a.download = `video_${task.taskId}.mp4`;
        a.click();
      }}>
          <Download className="w-4 h-4 mr-2" />
          下载
        </Button>
      </div>
    </div>;
}
export default function ImageToVideoPage(props) {
  const [activeTab, setActiveTab] = useState('description');
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [completedTask, setCompletedTask] = useState(null);
  const handleTaskCreated = taskId => {
    setCurrentTaskId(taskId);
    setCompletedTask(null);
  };
  const handleTaskComplete = task => {
    setCompletedTask(task);
    setCurrentTaskId(null);
  };
  return <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">图片转视频</h1>
          <p className="text-gray-600">选择适合的方式，将静态图片转换为动态视频</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="description" className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  图+描述
                </TabsTrigger>
                <TabsTrigger value="audio" className="flex items-center gap-2">
                  <FileAudio className="w-4 h-4" />
                  图+音频
                </TabsTrigger>
                <TabsTrigger value="video" className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  图+视频
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description">
                <Card>
                  <CardHeader>
                    <CardTitle>图片 + 描述生成</CardTitle>
                    <CardDescription>
                      上传图片并输入描述文字，AI将根据描述生成动态视频
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImageDescriptionMode onTaskCreated={handleTaskCreated} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="audio">
                <Card>
                  <CardHeader>
                    <CardTitle>图片 + 音频生成</CardTitle>
                    <CardDescription>
                      上传图片和音频文件，AI将生成口播视频
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImageAudioMode onTaskCreated={handleTaskCreated} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="video">
                <Card>
                  <CardHeader>
                    <CardTitle>图片 + 视频生成</CardTitle>
                    <CardDescription>
                      上传人物图片和动作参考视频，AI将合成高质量视频
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImageVideoMode onTaskCreated={handleTaskCreated} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {currentTaskId && <Card>
                  <CardHeader>
                    <CardTitle>任务进度</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TaskProgress taskId={currentTaskId} onComplete={handleTaskComplete} />
                  </CardContent>
                </Card>}

              {completedTask && <Card>
                  <CardHeader>
                    <CardTitle>生成结果</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResultPreview task={completedTask} />
                  </CardContent>
                </Card>}

              {!currentTaskId && !completedTask && <Card>
                  <CardHeader>
                    <CardTitle>使用提示</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• 上传清晰的图片以获得最佳效果</li>
                      <li>• 描述越详细，生成的视频越符合预期</li>
                      <li>• 生成时间通常为1-3分钟</li>
                      <li>• 支持MP4格式下载</li>
                    </ul>
                  </CardContent>
                </Card>}
            </div>
          </div>
        </div>
      </div>
    </div>;
}