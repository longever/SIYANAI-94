// @ts-ignore;
import React, { useState, useRef } from 'react';
// @ts-ignore;
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, useToast, Progress } from '@/components/ui';
// @ts-ignore;
import { Upload, X, FileText, Image, Video, Music } from 'lucide-react';

export function AssetUploadDialog({
  open,
  onOpenChange,
  onSuccess,
  $w
}) {
  const {
    toast
  } = useToast();
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [metadata, setMetadata] = useState({
    name: '',
    type: 'image',
    category: '',
    tags: '',
    description: ''
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
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
  const handleDrop = e => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (!metadata.name) {
        setMetadata(prev => ({
          ...prev,
          name: droppedFile.name
        }));
      }
    }
  };
  const handleDragOver = e => {
    e.preventDefault();
  };
  const fileToBase64 = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };
  const getFileTypeFolder = mimeType => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'other';
  };
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: '请选择文件',
        description: '请先选择要上传的文件',
        variant: 'destructive'
      });
      return;
    }
    if (!metadata.name.trim()) {
      toast({
        title: '请输入素材名称',
        description: '素材名称不能为空',
        variant: 'destructive'
      });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      // 步骤1：上传文件到云存储
      setUploadProgress(30);
      const base64Data = await fileToBase64(file);

      // 根据文件类型确定子文件夹
      const fileTypeFolder = getFileTypeFolder(file.type);
      const cloudPathPrefix = `saas_temp/${fileTypeFolder}`;
      const uploadResult = await $w.cloud.callFunction({
        name: 'upload-asset',
        data: {
          fileBase64: base64Data,
          fileName: file.name,
          contentType: file.type,
          cloudPathPrefix: cloudPathPrefix
        }
      });
      if (uploadResult.error) {
        throw new Error(uploadResult.error);
      }
      setUploadProgress(70);

      // 步骤2：保存文件信息到数据库
      const assetData = {
        name: metadata.name.trim(),
        type: metadata.type,
        category: metadata.category.trim(),
        url: uploadResult.fileURL,
        size: file.size,
        mime_type: file.type,
        tags: metadata.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        description: metadata.description.trim(),
        folder_path: `/${fileTypeFolder}`,
        download_count: 0,
        metadata: {
          originalName: file.name,
          uploadTime: new Date().toISOString(),
          fileID: uploadResult.fileID,
          cloudPath: uploadResult.cloudPath
        }
      };
      const saveResult = await $w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaCreateV2',
        params: {
          data: assetData
        }
      });

      // 获取完整的素材信息
      const newAsset = {
        ...assetData,
        _id: saveResult.id,
        createdAt: new Date().toISOString()
      };
      setUploadProgress(100);
      toast({
        title: '上传成功',
        description: `素材 "${metadata.name}" 已成功上传到素材库`,
        duration: 3000
      });

      // 重置表单并关闭对话框
      resetForm();
      onOpenChange(false);

      // 通知父组件刷新列表，并传递新素材
      if (onSuccess) {
        onSuccess(newAsset);
      }
    } catch (error) {
      console.error('上传失败:', error);
      toast({
        title: '上传失败',
        description: error.message || '上传过程中发生错误，请稍后重试',
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const getFileIcon = fileType => {
    switch (fileType) {
      case 'image':
        return <Image className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'audio':
        return <Music className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };
  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  return <Dialog open={open} onOpenChange={isOpen => {
    if (!isOpen && !uploading) {
      resetForm();
    }
    onOpenChange(isOpen);
  }}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>上传素材</DialogTitle>
          <DialogDescription>
            选择文件并填写相关信息，支持拖拽上传
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 文件选择区域 */}
          <div>
            <Label>选择文件</Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors" onDrop={handleDrop} onDragOver={handleDragOver}>
              <input ref={fileInputRef} type="file" onChange={handleFileSelect} accept="image/*,video/*,audio/*" className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  点击选择文件或拖拽文件到此处
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  支持图片、视频、音频文件
                </p>
              </label>
            </div>

            {file && <div className="mt-3 p-3 bg-gray-50 rounded-md border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getFileIcon(metadata.type)}
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => {
                setFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>}
          </div>

          {/* 上传进度 */}
          {uploading && <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>上传进度</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>}

          {/* 素材信息表单 */}
          <div className="space-y-4">
            <div>
              <Label>素材类型</Label>
              <Select value={metadata.type} onValueChange={value => setMetadata(prev => ({
              ...prev,
              type: value
            }))} disabled={uploading}>
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
              <Label>素材名称 *</Label>
              <Input value={metadata.name} onChange={e => setMetadata(prev => ({
              ...prev,
              name: e.target.value
            }))} placeholder="输入素材名称" disabled={uploading} maxLength={100} />
            </div>

            <div>
              <Label>分类</Label>
              <Input value={metadata.category} onChange={e => setMetadata(prev => ({
              ...prev,
              category: e.target.value
            }))} placeholder="如：背景、人物、图标等" disabled={uploading} maxLength={50} />
            </div>

            <div>
              <Label>标签</Label>
              <Input value={metadata.tags} onChange={e => setMetadata(prev => ({
              ...prev,
              tags: e.target.value
            }))} placeholder="用逗号分隔多个标签，如：风景,高清,自然" disabled={uploading} maxLength={200} />
            </div>

            <div>
              <Label>描述</Label>
              <Textarea value={metadata.description} onChange={e => setMetadata(prev => ({
              ...prev,
              description: e.target.value
            }))} placeholder="输入素材描述信息" rows={3} disabled={uploading} maxLength={500} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => {
          if (!uploading) {
            resetForm();
            onOpenChange(false);
          }
        }} disabled={uploading}>
            取消
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading || !metadata.name.trim()} className="min-w-[100px]">
            {uploading ? '上传中...' : '上传'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}