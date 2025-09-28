// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label, useToast } from '@/components/ui';
// @ts-ignore;
import { X, Upload, Image as ImageIcon, Video, File } from 'lucide-react';

export function NodeCard({
  node,
  index,
  onUpdate,
  onDelete
}) {
  const {
    toast
  } = useToast();
  const [localNode, setLocalNode] = useState(node);
  const handleUpdate = (field, value) => {
    const updated = {
      ...localNode,
      [field]: value
    };
    setLocalNode(updated);
    onUpdate(index, updated);
  };
  const handleFileUpload = e => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "文件过大",
          description: "请选择小于10MB的文件",
          variant: "destructive"
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = event => {
        const updated = {
          ...localNode,
          material: {
            name: file.name,
            type: file.type,
            url: event.target.result,
            size: file.size
          }
        };
        setLocalNode(updated);
        onUpdate(index, updated);
        toast({
          title: "上传成功",
          description: `已上传 ${file.name}`
        });
      };
      reader.readAsDataURL(file);
    }
  };
  return <Card className="mb-4 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">节点 {index + 1}</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onDelete(index)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`text-${index}`}>文本内容</Label>
          <Textarea id={`text-${index}`} value={localNode.text || ''} onChange={e => handleUpdate('text', e.target.value)} placeholder="请输入视频文案内容..." className="min-h-[80px] resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`duration-${index}`}>视频时长</Label>
            <Select value={localNode.duration || '15'} onValueChange={value => handleUpdate('duration', value)}>
              <SelectTrigger id={`duration-${index}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5秒</SelectItem>
                <SelectItem value="10">10秒</SelectItem>
                <SelectItem value="15">15秒</SelectItem>
                <SelectItem value="30">30秒</SelectItem>
                <SelectItem value="60">60秒</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor={`style-${index}`}>视频风格</Label>
            <Select value={localNode.style || 'casual'} onValueChange={value => handleUpdate('style', value)}>
              <SelectTrigger id={`style-${index}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">休闲</SelectItem>
                <SelectItem value="business">商务</SelectItem>
                <SelectItem value="creative">创意</SelectItem>
                <SelectItem value="minimal">极简</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor={`voice-${index}`}>配音选择</Label>
          <Select value={localNode.voice || 'female'} onValueChange={value => handleUpdate('voice', value)}>
            <SelectTrigger id={`voice-${index}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">男声</SelectItem>
              <SelectItem value="female">女声</SelectItem>
              <SelectItem value="child">童声</SelectItem>
              <SelectItem value="elder">长者</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>素材</Label>
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            {localNode.material ? <div className="space-y-2">
                {localNode.material.type.startsWith('image/') ? <img src={localNode.material.url} alt={localNode.material.name} className="max-h-32 mx-auto rounded" /> : localNode.material.type.startsWith('video/') ? <video src={localNode.material.url} className="max-h-32 mx-auto rounded" controls /> : <div className="flex items-center justify-center h-32 bg-muted rounded">
                    <File className="h-8 w-8 text-muted-foreground" />
                  </div>}
                <p className="text-sm text-muted-foreground">{localNode.material.name}</p>
                <Button variant="outline" size="sm" onClick={() => document.getElementById(`file-${index}`).click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  替换素材
                </Button>
              </div> : <div className="space-y-2">
                <div className="flex items-center justify-center h-32 bg-muted rounded">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <Button variant="outline" size="sm" onClick={() => document.getElementById(`file-${index}`).click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  上传素材
                </Button>
              </div>}
            <input id={`file-${index}`} type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
          </div>
        </div>
      </CardContent>
    </Card>;
}