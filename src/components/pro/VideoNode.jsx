// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardHeader, CardContent, Button, Badge, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui';
// @ts-ignore;
import { ChevronDown, ChevronUp, Copy, Trash2, Sparkles, Image, Mic, Film } from 'lucide-react';

import { VideoSettings } from '@/components/ImageToVideo/VideoSettings';
export function VideoNode({
  node,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  onDuplicate
}) {
  const getNodeIcon = type => {
    switch (type) {
      case 'text2video':
        return <Sparkles className="w-4 h-4" />;
      case 'image2video':
        return <Image className="w-4 h-4" />;
      case 'digital_human':
        return <Mic className="w-4 h-4" />;
      default:
        return <Film className="w-4 h-4" />;
    }
  };
  const getProviderName = provider => {
    const providers = {
      tongyi: '通义万相',
      digital_human: '数字人API',
      minmax: 'MinMax',
      keling: '可灵'
    };
    return providers[provider] || provider;
  };

  // 处理设置更新
  const handleSettingsChange = newSettings => {
    onUpdate(node.id, {
      ...node,
      settings: newSettings
    });
  };

  // 处理平台变更
  const handlePlatformChange = newPlatform => {
    onUpdate(node.id, {
      ...node,
      provider: newPlatform
    });
  };
  return <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {getNodeIcon(node.type)}
                <span className="font-medium">{node.title}</span>
              </div>
              <Badge variant="outline">{getProviderName(node.provider)}</Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => onDuplicate(node.id)}>
                <Copy className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(node.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            <VideoSettings settings={node.settings || {}} onSettingsChange={handleSettingsChange} selectedPlatform={node.provider || 'tongyi-wanxiang'} onPlatformChange={handlePlatformChange} showStyle={true} />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>;
}