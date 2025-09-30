// @ts-ignore;
import React, { useState, useRef } from 'react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, useToast, Badge } from '@/components/ui';
// @ts-ignore;
import { Upload, X, File, Image, Video, Music, Type, Box, Loader2 } from 'lucide-react';

export function AssetUploadDialog({
  open,
  onOpenChange,
  onSuccess,
  $w
}) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const {
    toast
  } = useToast();
  const handleFileSelect = files => {
    if (files && files.length > 0) {
      setUploadedFiles(prev => [...prev, ...Array.from(files)]);
    }
  };
  const removeFile = index => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  const handleUpload = async () => {
    if (!uploadedFiles.length) return;
    try {
      setUploading(true);
      const uploadedAssets = [];

      // 获取云开发实例
      const tcb = await $w.cloud.getCloudInstance();
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];

        // 根据文件类型确定子文件夹
        let subFolder = 'other';
        if (file.type.startsWith('image/')) {
          subFolder = 'image';
        } else if (file.type.startsWith('video/')) {
          subFolder = 'video';
        } else if (file.type.startsWith('audio/')) {
          subFolder = 'audio';
        } else if (file.type.includes('font')) {
          subFolder = 'font';
        } else if (file.name.endsWith('.glb') || file.name.endsWith('.gltf') || file.name.endsWith('.obj')) {
          subFolder = 'model';
        }

        // 生成唯一文件名，使用 saas_temp 文件夹结构
        const fileExtension = file.name.split('.').pop();
        const uniqueFilename = `saas_temp/${subFolder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

        // 直接上传到云存储
        const uploadResult = await tcb.uploadFile({
          cloudPath: uniqueFilename,
          filePath: file
        });

        // 获取临时访问URL
        const fileUrl = await tcb.getTempFileURL({
          fileList: [uploadResult.fileID]
        });

        // 创建素材记录
        const assetData = {
          name: file.name,
          type: subFolder,
          // 使用子文件夹作为类型
          size: file.size,
          mime_type: file.type,
          url: uploadResult.fileID,
          thumbnail: subFolder === 'image' ? uploadResult.fileID : null,
          tags: [],
          usage_count: 0,
          download_count: 0,
          is_platform: false,
          folder_path: uniqueFilename,
          // 存储完整路径
          file_hash: null,
          dimensions: null,
          metadata: {
            originalName: file.name,
            uploadPath: uniqueFilename
          }
        };
        const createResult = await $w.cloud.callDataSource({
          dataSourceName: 'asset_library',
          methodName: 'wedaCreateV2',
          params: {
            data: assetData
          }
        });
        if (createResult.id) {
          uploadedAssets.push({
            ...assetData,
            _id: createResult.id,
            tempUrl: fileUrl.fileList[0].tempFileURL
          });
        }
        setUploadProgress((i + 1) / uploadedFiles.length * 100);
      }
      toast({
        title: "上传成功",
        description: `成功上传 ${uploadedAssets.length} 个文件到云存储的 saas_temp 文件夹`
      });
      onSuccess(uploadedAssets);
      onOpenChange(false);
      setUploadedFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "上传失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  const getFileIcon = file => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.startsWith('video/')) return Video;
    if (file.type.startsWith('audio/')) return Music;
    if (file.type.includes('font')) return Type;
    return File;
  };
  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>上传素材</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 拖拽上传区域 */}
          <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'}`} onDragOver={e => {
          e.preventDefault();
          setIsDragging(true);
        }} onDragLeave={() => setIsDragging(false)} onDrop={e => {
          e.preventDefault();
          setIsDragging(false);
          handleFileSelect(e.dataTransfer.files);
        }}>
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">
              拖拽文件到此处或
              <Button variant="link" className="p-0 h-auto ml-1" onClick={() => fileInputRef.current?.click()}>
                选择文件
              </Button>
            </p>
            <p className="text-xs text-gray-500">
              支持图片、视频、音频、字体、3D模型等格式，将自动分类到对应子文件夹
            </p>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => handleFileSelect(e.target.files)} />
          </div>

          {/* 文件列表 */}
          {uploadedFiles.length > 0 && <div className="space-y-2">
              <h4 className="text-sm font-medium">待上传文件 ({uploadedFiles.length})</h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {uploadedFiles.map((file, index) => {
              const Icon = getFileIcon(file);
              return <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>;
            })}
              </div>
            </div>}

          {/* 上传进度 */}
          {uploading && <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>上传中...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all" style={{
              width: `${uploadProgress}%`
            }} />
              </div>
            </div>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleUpload} disabled={uploading || uploadedFiles.length === 0}>
            {uploading ? <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                上传中...
              </> : `开始上传 (${uploadedFiles.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}