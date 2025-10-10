// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Progress, Alert, AlertDescription } from '@/components/ui';
// @ts-ignore;
import { Play, Download, Eye, Loader2 } from 'lucide-react';

import { SaveToDatabase } from './SaveToDatabase';
import { AudioPlayer } from './AudioPlayer';
export function GenerationModal({
  open,
  onOpenChange,
  progress,
  isGenerating,
  generatedVideo,
  onSave
}) {
  if (!open) return null;
  return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">文本生成视频</h2>
            <button onClick={() => onOpenChange(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {isGenerating && !generatedVideo && <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>正在生成视频...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>

              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-gray-600 dark:text-gray-400">正在为您生成专属视频...</p>
              </div>
            </div>}

          {generatedVideo && <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>生成结果</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <video src={generatedVideo.url} controls className="w-full h-full object-cover" poster={generatedVideo.thumbnail} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">时长：</span>
                      <span>{generatedVideo.duration}秒</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">大小：</span>
                      <span>{generatedVideo.size}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => window.open(generatedVideo.url, '_blank')}>
                      <Play className="w-4 h-4 mr-2" />
                      预览视频
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => window.open(generatedVideo.url, '_blank')}>
                      <Download className="w-4 h-4 mr-2" />
                      下载视频
                    </Button>
                  </div>

                  <SaveToDatabase videoData={{
                ...generatedVideo,
                type: 'text-to-video',
                createdAt: new Date().toISOString()
              }} />
                </CardContent>
              </Card>
            </div>}
        </div>
      </div>
    </div>;
}