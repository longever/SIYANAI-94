// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Save, Play, Download, Share2, Sun, Moon, Menu, X } from 'lucide-react';
// @ts-ignore;
import { Button, Card, CardContent } from '@/components/ui';

import { AvatarSelector } from '@/components/AvatarSelector';
import { VoiceSelector } from '@/components/VoiceSelector';
import { DriveModeSelector } from '@/components/DriveModeSelector';
import { BackgroundSelector } from '@/components/BackgroundSelector';
import { ActionExpressionPanel } from '@/components/ActionExpressionPanel';
import { DigitalHumanPreview } from '@/components/DigitalHumanPreview';
export default function DigitalHumanPage(props) {
  const {
    $w,
    style
  } = props;
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [driveMode, setDriveMode] = useState('text');
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedExpression, setSelectedExpression] = useState(null);
  const handleAvatarSelect = avatar => {
    setSelectedAvatar(avatar);
  };
  const handleVoiceSelect = voice => {
    setSelectedVoice(voice);
  };
  const handleModeChange = (mode, data) => {
    setDriveMode(mode);
    console.log('Drive mode changed:', mode, data);
  };
  const handleBackgroundChange = background => {
    setSelectedBackground(background);
  };
  const handleActionChange = action => {
    setSelectedAction(action);
  };
  const handleExpressionChange = expression => {
    setSelectedExpression(expression);
  };
  const handleSave = () => {
    console.log('Saving digital human project...');
  };
  const handlePreview = () => {
    console.log('Starting digital human preview...');
  };
  const handleExport = () => {
    console.log('Exporting digital human project...');
  };
  const handleShare = () => {
    console.log('Sharing digital human project...');
  };
  return <div style={style} className={`h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      {/* 顶部工具栏 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden">
              <Menu className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-semibold">数字人创作</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              保存
            </Button>
            <Button size="sm" variant="outline" onClick={handlePreview}>
              <Play className="w-4 h-4 mr-1" />
              预览
            </Button>
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" />
              导出
            </Button>
            <Button size="sm" variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-1" />
              分享
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧配置面板 */}
        <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4 space-y-6">
            <AvatarSelector onAvatarSelect={handleAvatarSelect} />
            <VoiceSelector onVoiceSelect={handleVoiceSelect} />
            <DriveModeSelector onModeChange={handleModeChange} />
            <BackgroundSelector onBackgroundChange={handleBackgroundChange} />
          </div>
        </div>

        {/* 中央预览区域 */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 p-4">
          <DigitalHumanPreview avatar={selectedAvatar} voice={selectedVoice} background={selectedBackground} action={selectedAction} expression={selectedExpression} isDarkMode={isDarkMode} />
        </div>

        {/* 右侧参数面板 */}
        <div className="w-72 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4">
            <ActionExpressionPanel onActionChange={handleActionChange} onExpressionChange={handleExpressionChange} />
          </div>
        </div>
      </div>

      {/* 移动端菜单 */}
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="absolute left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 overflow-y-auto">
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="font-semibold">配置面板</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 space-y-6">
              <AvatarSelector onAvatarSelect={handleAvatarSelect} />
              <VoiceSelector onVoiceSelect={handleVoiceSelect} />
              <DriveModeSelector onModeChange={handleModeChange} />
              <BackgroundSelector onBackgroundChange={handleBackgroundChange} />
              <ActionExpressionPanel onActionChange={handleActionChange} onExpressionChange={handleExpressionChange} />
            </div>
          </div>
        </div>}
    </div>;
}