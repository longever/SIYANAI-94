// @ts-ignore;
import React, { useState, useRef } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Button, Alert, AlertDescription, Progress, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, X, File, AlertCircle } from 'lucide-react';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

export function AssetUploadDialog({
  open,
  onOpenChange,
  onUploadComplete,
  onSuccess,
  onUploadError,
  $w
}) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const {
    toast
  } = useToast();
  const handleFileSelect = event => {
    const selectedFiles = Array.from(event.target.files);
    setError(null);

    // 检查文件大小
    const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      const oversizedFileNames = oversizedFiles.map(file => file.name).join(', ');
      toast({
        title: "文件过大",
        description: `以下文件超过50MB限制：${oversizedFileNames}`,
        variant: "destructive"
      });

      // 过滤掉过大的文件
      const validFiles = selectedFiles.filter(file => file.size <= MAX_FILE_SIZE);
      if (validFiles.length > 0) {
        setFiles(prevFiles => [...prevFiles, ...validFiles]);
      }
    } else {
      setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    }
  };
  const removeFile = index => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
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
    if (!$w || !$w.cloud) {
      toast({
        title: "系统错误",
        description: "无法连接到云服务，请刷新页面重试",
        variant: "destructive"
      });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const uploadedAssets = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const cloudPath = `assets/${Date.now()}_${file.name}`;

        // 直接上传到云存储
        const uploadResult = await tcb.uploadFile({
          cloudPath,
          filePath: file,
          onProgressUpdate: progress => {
            const totalProgress = (i + progress / 100) / files.length * 100;
            setUploadProgress(totalProgress);
          }
        });

        // 获取文件临时访问URL
        const fileURL = await tcb.getTempFileURL({
          fileList: [uploadResult.fileID]
        });

        // 保存素材信息到数据库
        const assetData = {
          name: file.name,
          fileName: file.name,
          fileType: file.type,
          size: file.size,
          url: fileURL.fileList[0].tempFileURL,
          cloudPath: uploadResult.fileID,
          type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'other',
          tags: [],
          createdAt: new Date().toISOString()
        };
        const savedAsset = await $w.cloud.callDataSource({
          dataSourceName: 'asset_library',
          methodName: 'wedaCreateV2',
          params: {
            data: assetData
          }
        });
        uploadedAssets.push({
          ...assetData,
          _id: savedAsset.id
        });
      }
      toast({
        title: "上传成功",
        description: `成功上传 ${uploadedAssets.length} 个文件`
      });

      // 调用回调函数
      if (onUploadComplete) {
        onUploadComplete(uploadedAssets);
      }
      if (onSuccess) {
        onSuccess(uploadedAssets);
      }
      handleClose();
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.message || '上传失败，请重试';
      setError(errorMessage);
      toast({
        title: "上传失败",
        description: errorMessage,
        variant: "destructive"
      });
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  const handleClose = () => {
    setFiles([]);
    setError(null);
    setUploading(false);
    setUploadProgress(0);
    onOpenChange(false);
  };
  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  return <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>上传素材</DialogTitle>
          <DialogDescription>
            选择要上传的素材文件，支持图片、视频、音频等格式。单个文件大小限制为50MB。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} accept="image/*,video/*,audio/*" />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="text-sm text-gray-600">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                选择文件
              </Button>
              <p className="mt-2 text-xs text-gray-500">
                支持拖拽上传，单个文件最大50MB
              </p>
            </div>
          </div>

          {files.length > 0 && <div className="space-y-2">
              <h4 className="text-sm font-medium">已选择文件：</h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {files.map((file, index) => <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <File className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)} disabled={uploading}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>)}
              </div>
            </div>}

          {uploading && <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>上传中...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>}
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={uploading}>
            取消
          </Button>
          <Button type="button" onClick={handleUpload} disabled={files.length === 0 || uploading}>
            {uploading ? '上传中...' : '开始上传'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
}