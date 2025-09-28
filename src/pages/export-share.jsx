// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Sun, Moon, Menu, X, Download, Share2 } from 'lucide-react';

import { ExportConfigPanel } from '@/components/ExportConfigPanel';
import { BatchExportQueue } from '@/components/BatchExportQueue';
import { ShareCenter } from '@/components/ShareCenter';
import { VideoPreview } from '@/components/VideoPreview';
export default function ExportSharePage(props) {
  const {
    $w,
    style
  } = props;
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    format: 'mp4',
    resolution: '1080p',
    watermark: false,
    compression: 'medium',
    quality: 85
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const handleConfigChange = newConfig => {
    setExportConfig(newConfig);
  };
  const handleTaskAction = (taskId, action) => {
    console.log(`Task ${taskId}: ${action}`);
  };
  const handleShare = shareSettings => {
    console.log('Sharing with settings:', shareSettings);
  };
  const handleExport = () => {
    setIsExporting(true);
    setExportProgress(0);

    // 模拟导出进度
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };
  return <div style={style} className={`min-h-screen bg-[#F5F7FA] dark:bg-gray-900 ${isDarkMode ? 'dark' : ''}`}>
      {/* 顶部导航 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden">
                <Menu className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-semibold ml-2">导出与分享</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧配置 */}
          <div className="lg:col-span-1 space-y-6">
            <ExportConfigPanel config={exportConfig} onConfigChange={handleConfigChange} />
            <BatchExportQueue onTaskAction={handleTaskAction} />
          </div>

          {/* 中间预览 */}
          <div className="lg:col-span-1">
            <VideoPreview isExporting={isExporting} progress={exportProgress} />
          </div>

          {/* 右侧分享 */}
          <div className="lg:col-span-1">
            <ShareCenter onShare={handleShare} />
          </div>
        </div>

        {/* 移动端底部操作栏 */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t p-4">
          <div className="flex gap-2">
            <Button className="flex-1 bg-[#165DFF] hover:bg-[#165DFF]/90" onClick={handleExport} disabled={isExporting}>
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? `${exportProgress}%` : '开始导出'}
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              分享
            </Button>
          </div>
        </div>
      </main>

      {/* 移动端菜单 */}
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-800">
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="font-semibold">菜单</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4">
              <nav className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  导出设置
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  批量队列
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  分享中心
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  数据统计
                </Button>
              </nav>
            </div>
          </div>
        </div>}
    </div>;
}