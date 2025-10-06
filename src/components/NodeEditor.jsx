// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Settings, Image as ImageIcon, Video, Music, Trash2, Eye, Download } from 'lucide-react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Slider, Button, Badge, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';

export function NodeEditor({
  nodes,
  selectedNode,
  onNodeUpdate
}) {
  const [localNode, setLocalNode] = useState(selectedNode);
  const [previewOpen, setPreviewOpen] = useState(false);
  useEffect(() => {
    setLocalNode(selectedNode);
  }, [selectedNode]);
  if (!selectedNode) {
    return <div className="p-4 text-center text-muted-foreground">
        <Settings className="w-8 h-8 mx-auto mb-2" />
        <p>选择一个节点进行编辑</p>
      </div>;
  }
  const handleUpdate = updates => {
    const updatedNode = {
      ...localNode,
      ...updates
    };
    setLocalNode(updatedNode);
    onNodeUpdate(selectedNode.id, updates);
  };
  const getNodeIcon = type => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      default:
        return <ImageIcon className="w-4 h-4" />;
    }
  };
  const formatDuration = seconds => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  return <div className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm">节点属性</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto">
        {/* 素材预览 */}
        <div className="mb-4">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {localNode.thumbnailUrl ? <img src={localNode.thumbnailUrl} alt={localNode.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">
                {getNodeIcon(localNode.type)}
              </div>}
            
            <div className="absolute top-2 right-2 flex space-x-1">
              <Button size="sm" variant="secondary" className="h-6 px-2" onClick={() => setPreviewOpen(true)}>
                <Eye className="w-3 h-3 mr-1" />
                预览
              </Button>
            </div>
          </div>
          
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{localNode.name}</h3>
              <Badge variant="outline">{localNode.type}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              时长: {formatDuration(localNode.duration || 0)}
            </p>
          </div>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="text-xs">基础</TabsTrigger>
            <TabsTrigger value="transform" className="text-xs">变换</TabsTrigger>
            <TabsTrigger value="effects" className="text-xs">效果</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div>
              <Label>节点名称</Label>
              <Input value={localNode.name || ''} onChange={e => handleUpdate({
              name: e.target.value
            })} placeholder="输入节点名称" />
            </div>

            <div>
              <Label>开始时间 (秒)</Label>
              <Slider value={[localNode.startTime || 0]} max={60} step={0.1} onValueChange={([value]) => handleUpdate({
              startTime: value
            })} />
              <span className="text-sm text-muted-foreground">
                {formatDuration(localNode.startTime || 0)}
              </span>
            </div>

            <div>
              <Label>持续时间 (秒)</Label>
              <Slider value={[localNode.duration || 5]} max={30} step={0.1} onValueChange={([value]) => handleUpdate({
              duration: value,
              endTime: localNode.startTime + value
            })} />
              <span className="text-sm text-muted-foreground">
                {formatDuration(localNode.duration || 5)}
              </span>
            </div>

            <div>
              <Label>图层</Label>
              <Input type="number" value={localNode.layer || 1} onChange={e => handleUpdate({
              layer: parseInt(e.target.value) || 1
            })} min={1} max={10} />
            </div>
          </TabsContent>

          <TabsContent value="transform" className="space-y-4">
            <div>
              <Label>位置 X</Label>
              <Slider value={[localNode.properties?.position?.x || 0]} min={-100} max={100} step={1} onValueChange={([value]) => handleUpdate({
              properties: {
                ...localNode.properties,
                position: {
                  ...localNode.properties?.position,
                  x: value
                }
              }
            })} />
            </div>

            <div>
              <Label>位置 Y</Label>
              <Slider value={[localNode.properties?.position?.y || 0]} min={-100} max={100} step={1} onValueChange={([value]) => handleUpdate({
              properties: {
                ...localNode.properties,
                position: {
                  ...localNode.properties?.position,
                  y: value
                }
              }
            })} />
            </div>

            <div>
              <Label>缩放</Label>
              <Slider value={[localNode.properties?.scale || 1]} min={0.1} max={3} step={0.1} onValueChange={([value]) => handleUpdate({
              properties: {
                ...localNode.properties,
                scale: value
              }
            })} />
            </div>

            <div>
              <Label>透明度</Label>
              <Slider value={[localNode.properties?.opacity || 1]} min={0} max={1} step={0.1} onValueChange={([value]) => handleUpdate({
              properties: {
                ...localNode.properties,
                opacity: value
              }
            })} />
            </div>

            <div>
              <Label>旋转角度</Label>
              <Slider value={[localNode.properties?.rotation || 0]} min={-180} max={180} step={1} onValueChange={([value]) => handleUpdate({
              properties: {
                ...localNode.properties,
                rotation: value
              }
            })} />
            </div>
          </TabsContent>

          <TabsContent value="effects" className="space-y-4">
            <div className="text-center text-muted-foreground py-8">
              <Settings className="w-8 h-8 mx-auto mb-2" />
              <p>效果设置即将推出</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* 预览模态窗口 */}
      {previewOpen && <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-background rounded-lg p-4 max-w-4xl max-h-[80vh]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{localNode.name}</h3>
              <Button variant="ghost" size="sm" onClick={() => setPreviewOpen(false)}>
                关闭
              </Button>
            </div>
            
            <div className="bg-muted rounded-lg overflow-hidden">
              {localNode.type === 'image' && <img src={localNode.url} alt={localNode.name} className="w-full h-auto max-h-[60vh] object-contain" />}
              {localNode.type === 'video' && <video src={localNode.url} controls className="w-full max-h-[60vh]" />}
              {localNode.type === 'audio' && <audio src={localNode.url} controls className="w-full" />}
            </div>
          </div>
        </div>}
    </div>;
}