// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, X, Loader2 } from 'lucide-react';

export function AssetUploadDialog({
  open,
  onOpenChange,
  onSuccess,
  onUpload,
  uploading
}) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('image');
  const [category, setCategory] = useState('user');
  const [tags, setTags] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const {
    toast
  } = useToast();
  const handleFileSelect = selectedFile => {
    if (!selectedFile) return;

    // 验证文件类型
    const allowedTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
      audio: ['audio/mp3', 'audio/wav', 'audio/flac', 'audio/aac'],
      document: ['application/pdf', 'text/plain', 'application/msword']
    };
    if (!allowedTypes[type]?.includes(selectedFile.type)) {
      toast({
        title: '文件类型不匹配',
        description: `请上传 ${type} 类型的文件`,
        variant: 'destructive'
      });
      return;
    }

    // 验证文件大小 (50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast({
        title: '文件过大',
        description: '文件大小不能超过50MB',
        variant: 'destructive'
      });
      return;
    }
    setFile(selectedFile);
    if (!name) {
      setName(selectedFile.name);
    }
  };
  const handleDrop = e => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };
  const handleFileInput = e => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };
  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: '请选择文件',
        description: '请先选择要上传的文件',
        variant: 'destructive'
      });
      return;
    }
    if (!name.trim()) {
      toast({
        title: '请输入名称',
        description: '请为素材输入一个名称',
        variant: 'destructive'
      });
      return;
    }
    const metadata = {
      name: name.trim(),
      type,
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    const result = await onUpload(file, metadata);
    if (result?.success) {
      resetForm();
      onSuccess();
    }
  };
  const resetForm = () => {
    setFile(null);
    setName('');
    setType('image');
    setCategory('user');
    setTags('');
  };
  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>上传素材</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 文件选择区域 */}
          <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`} onDrop={handleDrop} onDragOver={e => {
          e.preventDefault();
          setDragOver(true);
        }} onDragLeave={() => setDragOver(false)}>
            {file ? <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  已选择: {file.name}
                </div>
                <div className="text-xs text-gray-500">
                  大小: {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)}>
                  <X className="w-4 h-4 mr-1" />
                  重新选择
                </Button>
              </div> : <div className="space-y-4">
                <Upload className="w-12 h-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">
                    拖拽文件到此处或
                    <label className="text-blue-600 cursor-pointer hover:underline ml-1">
                      点击选择
                      <input type="file" className="hidden" onChange={handleFileInput} accept="image/*,video/*,audio/*,.pdf,.txt" />
                    </label>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    支持图片、视频、音频和文档，最大50MB
                  </p>
                </div>
              </div>}
          </div>

          {/* 表单字段 */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">素材名称</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="输入素材名称" />
            </div>

            <div>
              <label className="text-sm font-medium">素材类型</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">图片</SelectItem>
                  <SelectItem value="video">视频</SelectItem>
                  <SelectItem value="audio">音频</SelectItem>
                  <SelectItem value="document">文档</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">分类</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">用户上传</SelectItem>
                  <SelectItem value="project">项目素材</SelectItem>
                  <SelectItem value="template">模板素材</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">标签</label>
              <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="输入标签，用逗号分隔" />
              <p className="text-xs text-gray-500 mt-1">
                例如：风景,高清,自然
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={uploading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!file || !name.trim() || uploading}>
            {uploading ? <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                上传中...
              </> : <>
                <Upload className="w-4 h-4 mr-2" />
                上传
              </>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
}