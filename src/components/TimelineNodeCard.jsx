// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge } from '@/components/ui';
// @ts-ignore;
import { Trash2, Settings, Image, Video, Mic, FileText } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function TimelineNodeCard({
  node,
  index,
  onUpdate,
  onDelete,
  onConfigure
}) {
  const [isDragging, setIsDragging] = useState(false);
  const generationTypes = [{
    value: 'text2video',
    label: '文生视频',
    icon: FileText
  }, {
    value: 'image2video',
    label: '图生视频',
    icon: Image
  }, {
    value: 'digital_human',
    label: '数字人',
    icon: Video
  }];
  const providers = [{
    value: 'tongyi',
    label: '阿里云通义万相'
  }, {
    value: 'digital_api',
    label: '数字人专用API'
  }, {
    value: 'baidu',
    label: '百度智能云'
  }];
  const GenerationIcon = generationTypes.find(t => t.value === node.generationType)?.icon || FileText;

  // 添加空函数检查，防止 onUpdate 未定义
  const handleUpdate = (nodeId, updates) => {
    if (typeof onUpdate === 'function') {
      onUpdate(nodeId, updates);
    }
  };
  return <Card className={cn("w-80 flex-shrink-0 transition-all duration-200", isDragging && "opacity-50 scale-95")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">节点 {index + 1}</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => onConfigure && onConfigure(node)}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete && onDelete(node.id)} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-xs font-medium mb-1 block">生成方式</label>
          <Select value={node.generationType} onValueChange={value => handleUpdate(node.id, {
          generationType: value
        })}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {generationTypes.map(type => <SelectItem key={type.value} value={type.value} className="text-sm">
                  <div className="flex items-center gap-2">
                    <type.icon className="h-3 w-3" />
                    {type.label}
                  </div>
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium mb-1 block">AI服务商</label>
          <Select value={node.provider} onValueChange={value => handleUpdate(node.id, {
          provider: value
        })}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {providers.map(provider => <SelectItem key={provider.value} value={provider.value} className="text-sm">
                  {provider.label}
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium mb-1 block">素材</label>
          <div className="flex gap-2">
            {node.assets?.image && <Badge variant="secondary" className="text-xs">
                <Image className="h-3 w-3 mr-1" />
                图片
              </Badge>}
            {node.assets?.audio && <Badge variant="secondary" className="text-xs">
                <Mic className="h-3 w-3 mr-1" />
                音频
              </Badge>}
            {node.assets?.subtitle && <Badge variant="secondary" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                字幕
              </Badge>}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          {node.text?.substring(0, 50)}...
        </div>
      </CardContent>
    </Card>;
}