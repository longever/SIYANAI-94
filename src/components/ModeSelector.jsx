// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, Button } from '@/components/ui';
// @ts-ignore;
import { FileText, Image, User } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function ModeSelector({
  currentMode,
  onModeChange
}) {
  const modes = [{
    id: 'text2video',
    name: '文生视频',
    description: '输入文本生成视频',
    icon: FileText,
    color: 'text-blue-400'
  }, {
    id: 'image2video',
    name: '图生视频',
    description: '图片转动态视频',
    icon: Image,
    color: 'text-purple-400'
  }, {
    id: 'digital_human',
    name: '数字人视频',
    description: 'AI虚拟形象视频',
    icon: User,
    color: 'text-green-400'
  }];
  return <Card className="bg-slate-900 border-slate-800">
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-2">
          {modes.map(mode => <Button key={mode.id} variant={currentMode === mode.id ? "default" : "ghost"} className={cn("h-auto py-4 px-3 flex flex-col items-center gap-2", currentMode === mode.id && "bg-sky-600 hover:bg-sky-700")} onClick={() => onModeChange(mode.id)}>
              <mode.icon className={cn("w-6 h-6", mode.color)} />
              <div className="text-xs text-center">
                <div className="font-medium">{mode.name}</div>
                <div className="text-slate-400 text-[10px]">{mode.description}</div>
              </div>
            </Button>)}
        </div>
      </CardContent>
    </Card>;
}