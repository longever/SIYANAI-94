// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, X } from 'lucide-react';

export function AssetUploadDialog({
  open,
  onOpenChange,
  onUpload
}) {
  const {
    toast
  } = useToast();
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({
    name: '',
    type: 'image',
    category: '',
    tags: '',
    description: ''
  });
  const [uploading, setUploading] = useState(false);
  const handleFileSelect = e => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!metadata.name) {
        setMetadata(prev => ({
          ...prev,
          name: selectedFile.name
        }));
      }
    }
  };
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: '请选择文件',
        variant: 'destructive'
      });
      return;
    }
    setUploading(true);
    try {
      await onUpload(file, {
        ...metadata,
        tags: metadata.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      });
    } finally {
      setUploading(false);
    }
  };
  const resetForm = () => {
    setFile(null);
    setMetadata({
      name: '',
      type: 'image',
      category: '',
      tags: '',
      description: ''
    });
  };
  return <Dialog open={open} onOpenChange={isOpen => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>上传素材</DialogTitle>
          <DialogDescription>
            选择文件并填写相关信息
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>选择文件</Label>
            <div className="mt-2">
              <Input type="file" onChange={handleFileSelect} accept="image/*,video/*,audio/*" className="cursor-pointer" />
              {file && <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>}
            </div>
          </div>

          <div>
            <Label>素材类型</Label>
            <Select value={metadata.type} onValueChange={value => setMetadata(prev => ({
            ...prev,
            type: value
          }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">图片</SelectItem>
                <SelectItem value="video">视频</SelectItem>
                <SelectItem value="audio">音频</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>素材名称</Label>
            <Input value={metadata.name} onChange={e => setMetadata(prev => ({
            ...prev,
            name: e.target.value
          }))} placeholder="输入素材名称" />
          </div>

          <div>
            <Label>分类</Label>
            <Input value={metadata.category} onChange={e => setMetadata(prev => ({
            ...prev,
            category: e.target.value
          }))} placeholder="输入分类" />
          </div>

          <div>
            <Label>标签</Label>
            <Input value={metadata.tags} onChange={e => setMetadata(prev => ({
            ...prev,
            tags: e.target.value
          }))} placeholder="用逗号分隔多个标签" />
          </div>

          <div>
            <Label>描述</Label>
            <Textarea value={metadata.description} onChange={e => setMetadata(prev => ({
            ...prev,
            description: e.target.value
          }))} placeholder="输入素材描述" rows={3} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => {
          resetForm();
          onOpenChange(false);
        }}>
            取消
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading} className="min-w-[100px]">
            {uploading ? '上传中...' : '上传'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}