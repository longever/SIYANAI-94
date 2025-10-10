// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';

import { SystemSelector } from './SystemSelector';
import { VideoSettings } from './VideoSettings';
export function ImageDescriptionMode({
  selectedModel,
  onSystemChange,
  videoSettings,
  onSettingsChange,
  uploadedFiles,
  onFileUpload,
  onGenerate,
  isGenerating
}) {
  return <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* 这里可以添加图片描述相关的上传组件 */}
          <Card>
            <CardHeader>
              <CardTitle>图片描述</CardTitle>
              <CardDescription>输入或上传图片进行描述生成</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="text-gray-500">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm">拖拽图片到此处或点击上传</p>
                  </div>
                </div>
                <textarea className="w-full p-3 border rounded-md" rows={4} placeholder="或输入图片描述文字..." />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <SystemSelector selectedModel={selectedModel} onSystemChange={onSystemChange} />
          
          <VideoSettings settings={videoSettings} onSettingsChange={onSettingsChange} />
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={onGenerate} disabled={isGenerating} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          {isGenerating ? '生成中...' : '生成视频'}
        </button>
      </div>
    </div>;
}