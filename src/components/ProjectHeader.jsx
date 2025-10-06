// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Save, Play, RefreshCw, Settings, Sparkles } from 'lucide-react';

export function ProjectHeader({
  projectName,
  onProjectNameChange,
  onSave,
  onGenerate,
  saving,
  generating,
  user
}) {
  const {
    toast
  } = useToast();
  return <div className="flex justify-between items-center">
    <div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
        AI 视频创作中心
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mt-2">
        使用 AI 技术创作专业级视频内容
      </p>
    </div>

    <div className="flex items-center gap-4">
      <span className="text-sm text-slate-600 dark:text-slate-400">
        欢迎, {user?.name || user?.nickName || '创作者'}
      </span>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onSave} disabled={saving} className="flex items-center gap-2">
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? '保存中...' : '保存项目'}
        </Button>

        <Button onClick={onGenerate} disabled={generating} className="flex items-center gap-2">
          {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {generating ? '生成中...' : '生成视频'}
        </Button>
      </div>

    </div>
  </div>;
}