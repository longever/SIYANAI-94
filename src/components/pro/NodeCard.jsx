// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardHeader, CardContent, CardTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Collapsible, CollapsibleContent, CollapsibleTrigger, Button, Badge, Textarea } from '@/components/ui';
// @ts-ignore;
import { Trash2, Copy, ChevronUp, ChevronDown, Sparkles, Image, Mic, Film } from 'lucide-react';

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
  ;
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
export function NodeCard({
  node,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  onDuplicate,
  onAssetSelect
}) {
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
            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">节点标题</label>
                <Input value={node.title} onChange={e => onUpdate(node.id, {
                title: e.target.value
              })} placeholder="输入节点标题" />
              </div>
              <div>
                <label className="text-sm font-medium">时长(秒)</label>
                <Input type="number" value={node.duration} onChange={e => onUpdate(node.id, {
                duration: parseInt(e.target.value) || 5
              })} min={1} max={60} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">内容描述</label>
              <Textarea value={node.content} onChange={e => onUpdate(node.id, {
              content: e.target.value
            })} placeholder="输入节点内容描述" rows={3} />
            </div>

            {/* 生成方式和提供商 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">生成方式</label>
                <Select value={node.type} onValueChange={value => onUpdate(node.id, {
                type: value
              })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text2video">文生视频</SelectItem>
                    <SelectItem value="image2video">图生视频</SelectItem>
                    <SelectItem value="digital_human">数字人</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">AI服务商</label>
                <Select value={node.provider} onValueChange={value => onUpdate(node.id, {
                provider: value
              })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tongyi">阿里云通义万相</SelectItem>
                    <SelectItem value="digital_human">数字人API</SelectItem>
                    <SelectItem value="minmax">MinMax</SelectItem>
                    <SelectItem value="keling">可灵</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 视频参数 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">镜头景别</label>
                <Select value={node.shotType} onValueChange={value => onUpdate(node.id, {
                shotType: value
              })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="close">特写</SelectItem>
                    <SelectItem value="medium">中景</SelectItem>
                    <SelectItem value="long">远景</SelectItem>
                    <SelectItem value="wide">全景</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">转场效果</label>
                <Select value={node.transition} onValueChange={value => onUpdate(node.id, {
                transition: value
              })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无</SelectItem>
                    <SelectItem value="fade">淡入淡出</SelectItem>
                    <SelectItem value="slide">滑动</SelectItem>
                    <SelectItem value="zoom">缩放</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">色彩风格</label>
                <Select value={node.colorStyle} onValueChange={value => onUpdate(node.id, {
                colorStyle: value
              })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natural">自然</SelectItem>
                    <SelectItem value="vivid">鲜艳</SelectItem>
                    <SelectItem value="warm">暖色</SelectItem>
                    <SelectItem value="cool">冷色</SelectItem>
                    <SelectItem value="monochrome">黑白</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 素材区域 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">素材配置</label>
                <Button size="sm" variant="outline" onClick={() => onAssetSelect(`${node.id}-image`)}>
                  选择素材
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {['image', 'audio', 'subtitle'].map(assetType => <div key={assetType} className="border rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-2">
                      {assetType === 'image' ? '图片' : assetType === 'audio' ? '音频' : '字幕'}
                    </div>
                    {node.assets[assetType] ? <div className="text-center">
                        <div className="text-xs text-green-600 mb-1">已选择</div>
                        <Button size="sm" variant="ghost" onClick={() => onUpdate(node.id, {
                    assets: {
                      ...node.assets,
                      [assetType]: null
                    }
                  })}>
                          移除
                        </Button>
                      </div> : <Button size="sm" variant="outline" className="w-full" onClick={() => onAssetSelect(`${node.id}-${assetType}`)}>
                        选择
                      </Button>}
                  </div>)}
              </div>
            </div>

            {/* 自定义参数 */}
            <div>
              <label className="text-sm font-medium">自定义参数</label>
              <Textarea value={JSON.stringify(node.customParams, null, 2)} onChange={e => {
              try {
                const params = JSON.parse(e.target.value);
                onUpdate(node.id, {
                  customParams: params
                });
              } catch {}
            }} placeholder="输入JSON格式的自定义参数" rows={3} className="font-mono text-xs" />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>;
}