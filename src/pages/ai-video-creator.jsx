// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card } from '@/components/ui';

import { ModeSelector } from '@/components/ModeSelector';
import { Text2VideoPanel } from '@/components/Text2VideoPanel';
import { Image2VideoPanel } from '@/components/Image2VideoPanel';
import { DigitalHumanPanel } from '@/components/DigitalHumanPanel';
import { VideoPreview } from '@/components/VideoPreview';
export default function AIVideoCreatorPage(props) {
  const [currentMode, setCurrentMode] = useState('text2video');
  const [generatedResult, setGeneratedResult] = useState(null);
  const handleGenerate = result => {
    setGeneratedResult(result);
  };
  const renderCurrentPanel = () => {
    switch (currentMode) {
      case 'text2video':
        return <Text2VideoPanel onGenerate={handleGenerate} />;
      case 'image2video':
        return <Image2VideoPanel onGenerate={handleGenerate} />;
      case 'digital_human':
        return <DigitalHumanPanel onGenerate={handleGenerate} />;
      default:
        return <Text2VideoPanel onGenerate={handleGenerate} />;
    }
  };
  return <div className="h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* 顶部标题栏 */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <h1 className="text-2xl font-bold">AI视频创作中心</h1>
        <p className="text-sm text-slate-400 mt-1">
          智能生成高质量视频内容
        </p>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧配置面板 */}
        <div className="w-96 bg-slate-900 border-r border-slate-800 p-4 overflow-y-auto">
          <ModeSelector currentMode={currentMode} onModeChange={setCurrentMode} />
          
          <div className="mt-4">
            {renderCurrentPanel()}
          </div>
        </div>

        {/* 右侧预览区域 */}
        <div className="flex-1 bg-slate-950 p-4">
          <VideoPreview result={generatedResult} />
          
          {generatedResult && <Card className="mt-4 bg-slate-900 border-slate-800">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">生成信息</h3>
                <div className="text-sm text-slate-400 space-y-1">
                  <p>类型: {generatedResult.type}</p>
                  {generatedResult.type === 'text2video' && <p>文本长度: {generatedResult.text?.length || 0}字符</p>}
                  {generatedResult.type === 'image2video' && <p>图片数量: {generatedResult.images?.length || 0}张</p>}
                  {generatedResult.type === 'digital_human' && <>
                      <p>形象: {generatedResult.avatar}</p>
                      <p>音色: {generatedResult.voice}</p>
                    </>}
                </div>
              </div>
            </Card>}
        </div>
      </div>
    </div>;
}