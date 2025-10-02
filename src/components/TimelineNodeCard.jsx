// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Slider, Badge, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui';
// @ts-ignore;
import { Trash2, Copy, Plus, Settings, Image, Film, User, ChevronDown, ChevronUp, Upload } from 'lucide-react';

export function TimelineNodeCard({
  node,
  index,
  aiProviders,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddNode,
  onSelectAssets
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const nodeTypeIcons = {
    text2video: <Film className="w-4 h-4" />,
    image2video: <Image className="w-4 h-4" />,
    digitalHuman: <User className="w-4 h-4" />
  };
  const nodeTypeLabels = {
    text2video: '文生视频',
    image2video: '图生视频',
    digitalHuman: '数字人'
  };
  const shotTypes = [{
    value: 'extreme-close',
    label: '极特写'
  }, {
    value: 'close',
    label: '特写'
  }, {
    value: 'medium-close',
    label: '中特写'
  }, {
    value: 'medium',
    label: '中景'
  }, {
    value: 'medium-long',
    label: '中远景'
  }, {
    value: 'long',
    label: '远景'
  }, {
    value: 'extreme-long',
    label: '极远景'
  }];
  const transitions = [{
    value: 'cut',
    label: '硬切'
  }, {
    value: 'fade',
    label: '淡入淡出'
  }, {
    value: 'dissolve',
    label: '溶解'
  }, {
    value: 'wipe',
    label: '擦除'
  }, {
    value: 'slide',
    label: '滑动'
  }];
  const colorStyles = [{
    value: 'natural',
    label: '自然'
  }, {
    value: 'warm',
    label: '暖色调'
  }, {
    value: 'cool',
    label: '冷色调'
  }, {
    value: 'vintage',
    label: '复古'
  }, {
    value: 'cinematic',
    label: '电影感'
  }];
  return <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-sm">
              #{index + 1}
            </Badge>
            <CardTitle className="text-lg">{node.title}</CardTitle>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => onDuplicate(node.id)} className="h-8 w-8 p-0">
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(node.id)} className="h-8 w-8 p-0 text-red-400 hover:text-red-300">
              <Trash2 className="w-4 h-4" />
            </Button>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 p-0">
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
      </CardHeader>
      
      <CollapsibleContent>
        <CardContent className="space-y-4">
          {/* 节点类型和AI服务商 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">节点类型</label>
              <Select value={node.type} onValueChange={value => onUpdate(node.id, {
              type: value
            })}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text2video">
                    <div className="flex items-center">
                      <Film className="w-4 h-4 mr-2" />
                      文生视频
                    </div>
                  </SelectItem>
                  <SelectItem value="image2video">
                    <div className="flex items-center">
                      <Image className="w-4 h-4 mr-2" />
                      图生视频
                    </div>
                  </SelectItem>
                  <SelectItem value="digitalHuman">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      数字人
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">AI服务商</label>
              <Select value={node.provider} onValueChange={value => onUpdate(node.id, {
              provider: value
            })}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aiProviders.map(provider => <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 标题和内容 */}
          <div>
            <label className="text-sm font-medium mb-2 block">节点标题</label>
            <Input value={node.title} onChange={e => onUpdate(node.id, {
            title: e.target.value
          })} className="bg-gray-800 border-gray-700" placeholder="输入节点标题" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">内容描述</label>
            <Textarea value={node.content} onChange={e => onUpdate(node.id, {
            content: e.target.value
          })} className="bg-gray-800 border-gray-700 min-h-[80px]" placeholder="输入视频内容描述..." />
          </div>

          {/* 素材区域 */}
          <div>
            <label className="text-sm font-medium mb-2 block">素材</label>
            <div className="space-y-2">
              <Button variant="outline" size="sm" onClick={onSelectAssets} className="w-full justify-start">
                <Upload className="w-4 h-4 mr-2" />
                选择或上传素材
              </Button>
              
              {node.assets.images.length > 0 && <div className="grid grid-cols-3 gap-2">
                  {node.assets.images.map((image, idx) => <div key={idx} className="relative aspect-video bg-gray-800 rounded">
                      <img src={image.url} alt={image.name} className="w-full h-full object-cover rounded" />
                    </div>)}
                </div>}
            </div>
          </div>

          {/* 时长设置 */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              时长: {node.duration}秒
            </label>
            <Slider value={[node.duration]} onValueChange={([value]) => onUpdate(node.id, {
            duration: value
          })} min={1} max={30} step={1} className="w-full" />
          </div>

          {/* 高级设置 */}
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                高级设置
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              <div>
                <label className="text-sm font-medium mb-1 block">镜头景别</label>
                <Select value={node.settings.shotType} onValueChange={value => onUpdate(node.id, {
                settings: {
                  ...node.settings,
                  shotType: value
                }
              })}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {shotTypes.map(shot => <SelectItem key={shot.value} value={shot.value}>
                        {shot.label}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">转场效果</label>
                <Select value={node.settings.transition} onValueChange={value => onUpdate(node.id, {
                settings: {
                  ...node.settings,
                  transition: value
                }
              })}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {transitions.map(transition => <SelectItem key={transition.value} value={transition.value}>
                        {transition.label}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">色彩风格</label>
                <Select value={node.settings.colorStyle} onValueChange={value => onUpdate(node.id, {
                settings: {
                  ...node.settings,
                  colorStyle: value
                }
              })}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorStyles.map(style => <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* 添加节点按钮 */}
          <Button variant="outline" size="sm" onClick={() => onAddNode('text2video', index)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            在此后添加节点
          </Button>
        </CardContent>
      </CollapsibleContent>
    </Card>;
}