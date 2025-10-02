// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label, Progress, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, X, FileImage, FileVideo, FileAudio, File } from 'lucide-react';

export function AssetUploadDialog({
  open,
  onOpenChange,
  onUploadSuccess
}) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const {
    toast
  } = useToast();
  const handleFileSelect = e => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };
  const getFileIcon = fileType => {
    if (fileType.startsWith('image/')) return <FileImage className="h-4 w-4" />;
    if (fileType.startsWith('video/')) return <FileVideo className="h-4 w-4" />;
    if (fileType.startsWith('audio/')) return <FileAudio className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };
  const uploadFile = async file => {
    try {
      // 使用云开发API上传文件
      const cloud = await window.$w.cloud.getCloudInstance();

      // 上传到云存储
      const uploadResult = await cloud.uploadFile({
        cloudPath: `assets/${Date.now()}_${file.name}`,
        filePath: file
      });

      // 调用云函数保存素材信息
      const result = await window.$w.cloud.callFunction({
        name: 'upload-asset',
        data: {
          fileId: uploadResult.fileID,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadTime: new Date().toISOString()
        }
      });
      if (result.result.success) {
        return result.result.data;
      } else {
        throw new Error(result.result.error || '上传失败');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };
  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "请选择文件",
        description: "请先选择要上传的文件",
        variant: "destructive"
      });
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const uploadedFiles = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await uploadFile(file);
        uploadedFiles.push(result);
        setProgress((i + 1) / files.length * 100);
      }
      toast({
        title: "上传成功",
        description: `成功上传 ${uploadedFiles.length} 个文件`
      });
      onUploadSuccess(uploadedFiles);
      setFiles([]);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "上传失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };
  const removeFile = index => {
    setFiles(files.filter((_, i) => i !== index));
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>上传素材</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <Label>选择文件</Label>
          <div className="mt-2">
            <Input type="file" multiple onChange={handleFileSelect} accept="image/*,video/*,audio/*" className="cursor-pointer" />
          </div>
        </div>

        {files.length > 0 && <div className="space-y-2">
          <Label>已选择文件</Label>
          {files.map((file, index) => <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
            <div className="flex items-center space-x-2">
              {getFileIcon(file.type)}
              <span className="text-sm">{file.name}</span>
              <span className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
              <X className="h-4 w-4" />
            </Button>
          </div>)}
        </div>}

        {uploading && <div className="space-y-2">
          <Label>上传进度</Label>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-500 text-center">{Math.round(progress)}%</p>
        </div>}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
          取消
        </Button>
        <Button onClick={handleUpload} disabled={files.length === 0 || uploading}>
          {uploading ? "上传中..." : "开始上传"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}