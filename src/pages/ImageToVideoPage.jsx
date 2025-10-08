// @ts-ignore;
import React, { useState, useRef } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, useToast, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, RadioGroup, RadioGroupItem, Label } from '@/components/ui';
// @ts-ignore;
import { Upload, Play, Loader2, Image as ImageIcon, Video, Settings, XCircle as XCircleIcon } from 'lucide-react';

import { ScriptGenerator } from '@/components/ScriptGenerator';
export default function ImageToVideoPage(props) {
  const {
    $w,
    style
  } = props;
  const {
    toast
  } = useToast();
  const [imageFile, setImageFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [videoQuality, setVideoQuality] = useState('720p');
  const [videoRatio, setVideoRatio] = useState('1:1');
  const [videoSettings, setVideoSettings] = useState({
    duration: 5,
    fps: 24,
    width: 512,
    height: 512
  });
  const [selectedSystem, setSelectedSystem] = useState('wanx2.1');
  const [generatedScript, setGeneratedScript] = useState(null);

  // 处理文件上传
  const handleFileUpload = (file, type) => {
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "文件过大",
          description: "图片大小不能超过10MB",
          variant: "destructive"
        });
        return;
      }
      setImageFile(file);
    }
  };

  // 处理文件删除
  const handleFileRemove = () => {
    setImageFile(null);
  };

  // 处理生成
  const handleGenerate = async () => {
    if (!imageFile) {
      toast({
        title: "提示",
        description: "请上传图片",
        variant: "destructive"
      });
      return;
    }
    if (!generatedScript || !generatedScript.nodes || generatedScript.nodes.length === 0) {
      toast({
        title: "提示",
        description: "请先生成视频脚本",
        variant: "destructive"
      });
      return;
    }
    setIsGenerating(true);
    setGenerationProgress(0);

    // 模拟生成过程
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          toast({
            title: "生成完成",
            description: "您的图生视频已生成完成",
            variant: "success"
          });
          return 100;
        }
        return prev + 10;
      });
    }, 1000);
  };

  // 处理脚本生成
  const handleScriptGenerate = script => {
    setGeneratedScript(script);
    toast({
      title: "脚本已生成",
      description: `已生成包含 ${script.nodes.length} 个节点的脚本`,
      variant: "success"
    });
  };

  // 文件上传组件
  const FileUploadSection = ({
    type,
    onFileUpload,
    onFileRemove,
    acceptedTypes,
    maxSize
  }) => {
    const fileInputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);
    const handleFileSelect = e => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > maxSize * 1024 * 1024) {
          toast({
            title: "文件过大",
            description: `文件大小不能超过 ${maxSize}MB`,
            variant: "destructive"
          });
          return;
        }
        onFileUpload(file, type);
      }
    };
    const handleDrop = e => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        if (file.size > maxSize * 1024 * 1024) {
          toast({
            title: "文件过大",
            description: `文件大小不能超过 ${maxSize}MB`,
            variant: "destructive"
          });
          return;
        }
        onFileUpload(file, type);
      }
    };
    const handleDragOver = e => {
      e.preventDefault();
      setDragOver(true);
    };
    const handleDragLeave = () => {
      setDragOver(false);
    };
    return <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragOver ? 'border-purple-400 bg-purple-400/10' : 'border-gray-600 hover:border-gray-500'}`} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
        <input ref={fileInputRef} type="file" accept={acceptedTypes} onChange={handleFileSelect} className="hidden" />
        <div className="flex flex-col items-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-300 mb-2">
            拖拽图片文件到此处，或
            <button onClick={() => fileInputRef.current?.click()} className="text-purple-400 hover:text-purple-300 ml-1">
              点击上传
            </button>
          </p>
          <p className="text-gray-500 text-sm">
            支持 {acceptedTypes}，最大 {maxSize}MB
          </p>
        </div>
      </div>;
  };

  // 视频设置组件
  const VideoSettingsControl = ({
    settings,
    onChange
  }) => {
    return <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">时长(秒)</label>
            <Select value={settings.duration.toString()} onValueChange={value => onChange({
            ...settings,
            duration: parseInt(value)
          })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3秒</SelectItem>
                <SelectItem value="5">5秒</SelectItem>
                <SelectItem value="10">10秒</SelectItem>
                <SelectItem value="15">15秒</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">帧率</label>
            <Select value={settings.fps.toString()} onValueChange={value => onChange({
            ...settings,
            fps: parseInt(value)
          })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12fps</SelectItem>
                <SelectItem value="24">24fps</SelectItem>
                <SelectItem value="30">30fps</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">分辨率</label>
            <Select value={`${settings.width}x${settings.height}`} onValueChange={value => {
            const [width, height] = value.split('x').map(Number);
            onChange({
              ...settings,
              width,
              height
            });
          }}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="512x512">512x512</SelectItem>
                <SelectItem value="768x512">768x512</SelectItem>
                <SelectItem value="512x768">512x768</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>;
  };

  // 系统选择组件
  const SystemSelectorControl = ({
    selectedSystem,
    onChange
  }) => {
    return <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300 mb-2">AI系统</label>
        <Select value={selectedSystem} onValueChange={onChange}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="wanx2.1">万相2.1</SelectItem>
            <SelectItem value="wanx1.0">万相1.0</SelectItem>
            <SelectItem value="keling">可灵</SelectItem>
            <SelectItem value="pika">Pika</SelectItem>
          </SelectContent>
        </Select>
      </div>;
  };

  // 生成进度模态框
  const GenerationProgressModal = ({
    isOpen,
    onClose,
    progress
  }) => {
    if (!isOpen) return null;
    return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold text-white mb-4">生成中...</h3>
          <div className="space-y-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{
              width: `${progress}%`
            }}></div>
            </div>
            <p className="text-center text-gray-300">{progress}%</p>
            {progress === 100 && <Button onClick={onClose} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                完成
              </Button>}
          </div>
        </div>
      </div>;
  };
  return <div style={style} className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">图生视频</h1>
        <p className="text-xl text-purple-300">上传图片，让静态图片变成动态视频</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：创作区域 */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-800/50 border-purple-800/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">图片生成视频</CardTitle>
              <CardDescription className="text-gray-300">上传图片并描述您想要的视频效果</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <FileUploadSection type="image" onFileUpload={handleFileUpload} onFileRemove={handleFileRemove} acceptedTypes="image/*" maxSize={10} />

                {imageFile && <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ImageIcon className="w-5 h-5 text-purple-400" />
                        <span className="text-white text-sm">{imageFile.name}</span>
                      </div>
                      <button onClick={handleFileRemove} className="text-gray-400 hover:text-red-400 transition-colors">
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>}

                <ScriptGenerator onGenerate={handleScriptGenerate} />

                {generatedScript && <div className="bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">已生成脚本</h4>
                    <p className="text-gray-300 text-sm">{generatedScript.title}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      包含 {generatedScript.nodes.length} 个节点，总时长 {generatedScript.totalDuration} 秒
                    </p>
                  </div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">视频清晰度</label>
                    <Select value={videoQuality} onValueChange={setVideoQuality}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="480p">480P (标清)</SelectItem>
                        <SelectItem value="720p">720P (高清)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">视频比例</label>
                    <RadioGroup value={videoRatio} onValueChange={setVideoRatio} className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1:1" id="ratio-1-1" />
                        <Label htmlFor="ratio-1-1" className="text-gray-300">1:1 (头像)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3:4" id="ratio-3-4" />
                        <Label htmlFor="ratio-3-4" className="text-gray-300">3:4 (半身)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <VideoSettingsControl settings={videoSettings} onChange={setVideoSettings} />
                <SystemSelectorControl selectedSystem={selectedSystem} onChange={setSelectedSystem} />

                <Button onClick={handleGenerate} disabled={isGenerating || !imageFile || !generatedScript} className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800">
                  {isGenerating ? <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      生成中...
                    </> : <>
                      <Play className="w-4 h-4 mr-2" />
                      开始生成
                    </>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：预览和设置 */}
        <div className="space-y-6">
          <Card className="bg-gray-800/50 border-purple-800/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg">预览</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center">
                <Video className="w-16 h-16 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-purple-800/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg">设置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">清晰度:</span>
                  <span className="text-white">{videoQuality === '480p' ? '480P' : '720P'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">比例:</span>
                  <span className="text-white">{videoRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">系统:</span>
                  <span className="text-white">{selectedSystem}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <GenerationProgressModal isOpen={isGenerating} onClose={() => setIsGenerating(false)} progress={generationProgress} />
  </div>;
}