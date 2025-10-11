// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Save, Play, Download, Share2, Sun, Moon, Menu, X, Loader2, AlertCircle } from 'lucide-react';
// @ts-ignore;
import { Button, Card, CardContent, useToast, Alert, AlertDescription, AlertTitle, Skeleton } from '@/components/ui';

import { AvatarSelector } from '@/components/AvatarSelector';
import { VoiceSelector } from '@/components/VoiceSelector';
import { DriveModeSelector } from '@/components/DriveModeSelector';
import { BackgroundSelector } from '@/components/BackgroundSelector';
import { ActionExpressionPanel } from '@/components/ActionExpressionPanel';
import { DigitalHumanPreview } from '@/components/DigitalHumanPreview';
export default function DigitalHuman(props) {
  const {
    $w,
    style
  } = props;
  const {
    toast
  } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // 素材数据
  const [avatars, setAvatars] = useState([]);
  const [voices, setVoices] = useState([]);
  const [backgrounds, setBackgrounds] = useState([]);
  const [actions, setActions] = useState([]);
  const [expressions, setExpressions] = useState([]);

  // 选中状态
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [driveMode, setDriveMode] = useState('text');
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedExpression, setSelectedExpression] = useState(null);

  // 预览数据
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [taskId, setTaskId] = useState(null);

  // 获取素材列表
  const fetchAssets = async () => {
    try {
      setLoading(true);

      // 获取头像素材
      const avatarResult = await $w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              type: {
                $eq: 'avatar'
              },
              is_platform: {
                $eq: true
              }
            }
          },
          select: {
            $master: true
          }
        }
      });

      // 获取声音素材
      const voiceResult = await $w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              type: {
                $eq: 'voice'
              },
              is_platform: {
                $eq: true
              }
            }
          },
          select: {
            $master: true
          }
        }
      });

      // 获取背景素材
      const backgroundResult = await $w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              type: {
                $eq: 'background'
              },
              is_platform: {
                $eq: true
              }
            }
          },
          select: {
            $master: true
          }
        }
      });

      // 获取动作素材
      const actionResult = await $w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              type: {
                $eq: 'action'
              },
              is_platform: {
                $eq: true
              }
            }
          },
          select: {
            $master: true
          }
        }
      });

      // 获取表情素材
      const expressionResult = await $w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              type: {
                $eq: 'expression'
              },
              is_platform: {
                $eq: true
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      setAvatars(avatarResult.records || []);
      setVoices(voiceResult.records || []);
      setBackgrounds(backgroundResult.records || []);
      setActions(actionResult.records || []);
      setExpressions(expressionResult.records || []);

      // 设置默认选中第一个
      if (avatarResult.records?.length > 0) {
        setSelectedAvatar(avatarResult.records[0]);
      }
      if (voiceResult.records?.length > 0) {
        setSelectedVoice(voiceResult.records[0]);
      }
      if (backgroundResult.records?.length > 0) {
        setSelectedBackground(backgroundResult.records[0]);
      }
    } catch (error) {
      console.error('获取素材失败:', error);
      toast({
        title: '获取素材失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 生成数字人预览
  const generatePreview = async () => {
    if (!selectedAvatar || !selectedVoice || !selectedBackground) {
      toast({
        title: '请选择完整配置',
        description: '请确保已选择头像、声音和背景',
        variant: 'destructive'
      });
      return;
    }
    try {
      setPreviewLoading(true);

      // 调用AI引擎生成预览
      const result = await $w.cloud.callFunction({
        name: 'ai-engine-service',
        data: {
          action: 'generate-preview',
          avatarId: selectedAvatar._id,
          voiceId: selectedVoice._id,
          backgroundId: selectedBackground._id,
          actionId: selectedAction?._id,
          expressionId: selectedExpression?._id,
          driveMode: driveMode,
          text: '欢迎使用数字人创作平台'
        }
      });
      if (result.success) {
        setTaskId(result.data.taskId);
        setPreviewUrl(result.data.previewUrl);

        // 轮询检查任务状态
        pollTaskStatus(result.data.taskId);
      } else {
        throw new Error(result.error || '生成预览失败');
      }
    } catch (error) {
      console.error('生成预览失败:', error);
      toast({
        title: '生成预览失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  // 轮询任务状态
  const pollTaskStatus = async taskId => {
    const checkStatus = async () => {
      try {
        const result = await $w.cloud.callFunction({
          name: 'ai-engine-service',
          data: {
            action: 'get-task-status',
            taskId: taskId
          }
        });
        if (result.success) {
          if (result.data.status === 'completed') {
            setPreviewUrl(result.data.resultUrl);
            return true;
          } else if (result.data.status === 'failed') {
            throw new Error('任务处理失败');
          }
        }
        return false;
      } catch (error) {
        console.error('检查任务状态失败:', error);
        return true; // 停止轮询
      }
    };

    // 每2秒检查一次，最多检查30次
    let attempts = 0;
    const maxAttempts = 30;
    const interval = setInterval(async () => {
      attempts++;
      const completed = await checkStatus();
      if (completed || attempts >= maxAttempts) {
        clearInterval(interval);
        if (attempts >= maxAttempts) {
          toast({
            title: '预览生成超时',
            description: '请稍后重试',
            variant: 'destructive'
          });
        }
      }
    }, 2000);
  };

  // 保存项目
  const handleSave = async () => {
    try {
      const projectData = {
        avatar: selectedAvatar,
        voice: selectedVoice,
        background: selectedBackground,
        action: selectedAction,
        expression: selectedExpression,
        driveMode: driveMode,
        previewUrl: previewUrl,
        createdAt: Date.new(),
      };
      const result = await $w.cloud.callFunction({
        name: 'media-service',
        data: {
          action: 'save-project',
          project: projectData
        }
      });
      if (result.success) {
        toast({
          title: '保存成功',
          description: '项目已保存到云端',
          variant: 'success'
        });
      } else {
        throw new Error(result.error || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      toast({
        title: '保存失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 导出项目
  const handleExport = async () => {
    if (!previewUrl) {
      toast({
        title: '请先生成预览',
        description: '生成预览后才能导出',
        variant: 'destructive'
      });
      return;
    }
    try {
      setGenerating(true);
      const result = await $w.cloud.callFunction({
        name: 'media-service',
        data: {
          action: 'export-video',
          taskId: taskId,
          format: 'mp4',
          quality: 'high'
        }
      });
      if (result.success) {
        toast({
          title: '导出成功',
          description: '视频已导出到您的素材库',
          variant: 'success'
        });

        // 下载文件
        if (result.data.downloadUrl) {
          window.open(result.data.downloadUrl, '_blank');
        }
      } else {
        throw new Error(result.error || '导出失败');
      }
    } catch (error) {
      console.error('导出失败:', error);
      toast({
        title: '导出失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  // 分享项目
  const handleShare = async () => {
    if (!previewUrl) {
      toast({
        title: '请先生成预览',
        description: '生成预览后才能分享',
        variant: 'destructive'
      });
      return;
    }
    try {
      const result = await $w.cloud.callFunction({
        name: 'media-service',
        data: {
          action: 'share-project',
          taskId: taskId
        }
      });
      if (result.success) {
        // 复制分享链接到剪贴板
        navigator.clipboard.writeText(result.data.shareUrl);
        toast({
          title: '分享链接已复制',
          description: '链接已复制到剪贴板',
          variant: 'success'
        });
      } else {
        throw new Error(result.error || '分享失败');
      }
    } catch (error) {
      console.error('分享失败:', error);
      toast({
        title: '分享失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 处理素材选择
  const handleAvatarSelect = avatar => {
    setSelectedAvatar(avatar);
    setPreviewUrl(null); // 清除预览
  };
  const handleVoiceSelect = voice => {
    setSelectedVoice(voice);
    setPreviewUrl(null);
  };
  const handleBackgroundChange = background => {
    setSelectedBackground(background);
    setPreviewUrl(null);
  };
  const handleActionChange = action => {
    setSelectedAction(action);
    setPreviewUrl(null);
  };
  const handleExpressionChange = expression => {
    setSelectedExpression(expression);
    setPreviewUrl(null);
  };
  const handleModeChange = (mode, data) => {
    setDriveMode(mode);
    setPreviewUrl(null);
  };

  // 初始化加载
  useEffect(() => {
    fetchAssets();
  }, []);
  if (loading) {
    return <div style={style} className="h-screen flex flex-col">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>

        <div className="flex-1 bg-gray-100 dark:bg-gray-800 p-4">
          <Skeleton className="h-full w-full" />
        </div>

        <div className="w-72 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 p-4">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>;
  }
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
          <Button size="sm" variant="outline" onClick={handleSave} disabled={!selectedAvatar || !selectedVoice}>
            <Save className="w-4 h-4 mr-1" />
            保存
          </Button>
          <Button size="sm" variant="outline" onClick={generatePreview} disabled={!selectedAvatar || !selectedVoice || previewLoading}>
            {previewLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
            {previewLoading ? '生成中...' : '预览'}
          </Button>
          <Button size="sm" variant="outline" onClick={handleExport} disabled={!previewUrl || generating}>
            {generating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Download className="w-4 h-4 mr-1" />}
            {generating ? '导出中...' : '导出'}
          </Button>
          <Button size="sm" variant="outline" onClick={handleShare} disabled={!previewUrl}>
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
          <AvatarSelector avatars={avatars} selectedAvatar={selectedAvatar} onAvatarSelect={handleAvatarSelect} />
          <VoiceSelector voices={voices} selectedVoice={selectedVoice} onVoiceSelect={handleVoiceSelect} />
          <DriveModeSelector onModeChange={handleModeChange} />
          <BackgroundSelector backgrounds={backgrounds} selectedBackground={selectedBackground} onBackgroundChange={handleBackgroundChange} />
        </div>
      </div>

      {/* 中央预览区域 */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-800 p-4">
        <DigitalHumanPreview avatar={selectedAvatar} voice={selectedVoice} background={selectedBackground} action={selectedAction} expression={selectedExpression} isDarkMode={isDarkMode} previewUrl={previewUrl} previewLoading={previewLoading} />
      </div>

      {/* 右侧参数面板 */}
      <div className="w-72 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-4">
          <ActionExpressionPanel actions={actions} expressions={expressions} selectedAction={selectedAction} selectedExpression={selectedExpression} onActionChange={handleActionChange} onExpressionChange={handleExpressionChange} />
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
          <AvatarSelector avatars={avatars} selectedAvatar={selectedAvatar} onAvatarSelect={handleAvatarSelect} />
          <VoiceSelector voices={voices} selectedVoice={selectedVoice} onVoiceSelect={handleVoiceSelect} />
          <DriveModeSelector onModeChange={handleModeChange} />
          <BackgroundSelector backgrounds={backgrounds} selectedBackground={selectedBackground} onBackgroundChange={handleBackgroundChange} />
          <ActionExpressionPanel actions={actions} expressions={expressions} selectedAction={selectedAction} selectedExpression={selectedExpression} onActionChange={handleActionChange} onExpressionChange={handleExpressionChange} />
        </div>
      </div>
    </div>}
  </div>;
}