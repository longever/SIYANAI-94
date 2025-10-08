// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Progress, Alert, AlertDescription } from '@/components/ui';
// @ts-ignore;
import { Play, Download, Eye, Loader2 } from 'lucide-react';

import { SaveToDatabase } from './SaveToDatabase';
import { AudioPlayer } from './AudioPlayer';
export function GenerationModal({
  isOpen,
  onClose,
  generationData
}) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('准备中...');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  useEffect(() => {
    if (isOpen && generationData) {
      startGeneration();
    }
  }, [isOpen, generationData]);
  const startGeneration = async () => {
    if (!generationData) return;
    setIsGenerating(true);
    setProgress(0);
    setStatus('正在上传音频文件...');
    setError(null);
    try {
      // 模拟生成过程
      const steps = [{
        progress: 20,
        status: '正在分析音频特征...'
      }, {
        progress: 40,
        status: '正在生成数字人形象...'
      }, {
        progress: 60,
        status: '正在合成视频...'
      }, {
        progress: 80,
        status: '正在优化视频质量...'
      }, {
        progress: 100,
        status: '生成完成！'
      }];
      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setProgress(step.progress);
        setStatus(step.status);
      }

      // 模拟生成结果
      setResult({
        videoUrl: 'https://example.com/generated-video.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
        duration: '00:30',
        size: '15.2MB'
      });
    } catch (err) {
      setError('生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">数字人视频生成</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isGenerating && !result && <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>{status}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600 dark:text-gray-400">正在为您生成专属数字人视频...</p>
          </div>
        </div>}

        {error && <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>}

        {result && <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>生成结果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <video src={result.videoUrl} controls className="w-full h-full object-cover" poster={result.thumbnailUrl} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">时长：</span>
                  <span>{result.duration}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">大小：</span>
                  <span>{result.size}</span>
                </div>
              </div>

              <AudioPlayer audioUrl={generationData?.audioUrl} title={generationData?.title || '数字人音频'} />

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => window.open(result.videoUrl, '_blank')}>
                  <Play className="w-4 h-4 mr-2" />
                  预览视频
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => window.open(result.videoUrl, '_blank')}>
                  <Download className="w-4 h-4 mr-2" />
                  下载视频
                </Button>
              </div>

              <SaveToDatabase videoData={{
                ...result,
                ...generationData,
                type: 'digital_human',
                createdAt: new Date().toISOString()
              }} />
            </CardContent>
          </Card>
        </div>}
      </div>
    </div>
  </div>;
}