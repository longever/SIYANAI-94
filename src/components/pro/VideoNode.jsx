// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardHeader, CardContent, Button, Badge, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui';
// @ts-ignore;
import { ChevronDown, ChevronUp, Copy, Trash2, Sparkles, Image, Mic, Film } from 'lucide-react';

import { NodeConfigPanel } from './NodeConfigPanel';
import { NodeActions } from './NodeActions';
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
      tongyi: '阿里云通义万相',
      digital_human: '数字人API',
      minmax: 'MinMax',
      keling: '可灵'
    };
    return providers[provider] || provider;
  };
  const handleSettingsChange = newSettings => {
    onUpdate(node.id, {
      ...node,
      settings: newSettings
    });
  };
  const handlePlatformChange = newPlatform => {
    onUpdate(node.id, {
      ...node,
      platform: newPlatform
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
              <NodeActions onDuplicate={() => onDuplicate(node.id)} onDelete={() => onDelete(node.id)} />
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
            <NodeConfigPanel node={node} onUpdate={updates => onUpdate(node.id, updates)} />
            
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">视频设置</h4>
              <VideoSettings settings={node.settings || {
              modelType: 'WAN_2_5_I2V_PREVIEW',
              resolution: '720P',
              ratio: '1:1',
              duration: 10,
              style: 'normal',
              mode: 'wan-std'
            }} onSettingsChange={handleSettingsChange} selectedPlatform={node.platform || 'tongyi-wanxiang'} onPlatformChange={handlePlatformChange} showStyle={true} />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>;
}