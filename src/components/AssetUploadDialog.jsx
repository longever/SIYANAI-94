// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Progress, useToast, Card } from '@/components/ui';
// @ts-ignore;
import { Upload, X, File } from 'lucide-react';

export function AssetUploadDialog({
  open,
  onOpenChange,
  onSuccess,
  $w
}) {
  const {
    toast
  } = useToast();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const handleFileSelect = e => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => {
      const type = file.type;
      const ext = file.name.split('.').pop().toLowerCase();
      const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
      const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'];
      const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg'];
      return (type.startsWith('image/') && imageExts.includes(ext) || type.startsWith('video/') && videoExts.includes(ext) || type.startsWith('audio/') && audioExts.includes(ext)) && file.size <= 100 * 1024 * 1024;
    });
    setFiles(prev => [...prev, ...validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      tags: [],
      description: ''
    }))]);
  };
  const removeFile = id => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };
  const updateFileMetadata = (id, field, value) => {
    setFiles(prev => prev.map(file => file.id === id ? {
      ...file,
      [field]: value
    } : file));
  };
  const uploadFiles = async () => {
    if (files.length === 0) return;
    setUploading(true);
    let successCount = 0;
    try {
      for (const fileItem of files) {
        setUploadProgress(prev => ({
          ...prev,
          [fileItem.id]: 0
        }));

        // 上传到云存储
        const tcb = await $w.cloud.getCloudInstance();
        const uploadResult = await tcb.uploadFile({
          cloudPath: `assets/${Date.now()}_${fileItem.name}`,
          filePath: fileItem.file
        });

        // 保存到数据库
        const assetData = {
          name: fileItem.name,
          type: fileItem.type.startsWith('image/') ? 'image' : fileItem.type.startsWith('video/') ? 'video' : 'audio',
          url: uploadResult.fileID,
          size: fileItem.size,
          format: fileItem.name.split('.').pop().toLowerCase(),
          mime_type: fileItem.type,
          tags: fileItem.tags,
          description: fileItem.description,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        const saveResult = await $w.cloud.callDataSource({
          dataSourceName: 'asset_library',
          methodName: 'wedaCreateV2',
          params: {
            data: assetData
          }
        });
        if (saveResult.id) {
          successCount++;
          setUploadProgress(prev => ({
            ...prev,
            [fileItem.id]: 100
          }));

          // 立即调用成功回调
          onSuccess({
            ...assetData,
            _id: saveResult.id
          });
        }
      }
      if (successCount > 0) {
        toast({
          title: '上传完成',
          description: `成功上传 ${successCount} 个文件`,
          variant: 'default'
        });
        setFiles([]);
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: '上传失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>上传素材</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input type="file" multiple onChange={handleFileSelect} className="hidden" id="file-input" accept="image/*,video/*,audio/*" />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">拖拽文件到此处或点击选择</p>
            <p className="text-sm text-gray-500 mt-2">
              支持图片、视频、音频文件，单个文件最大100MB
            </p>
            <label htmlFor="file-input" className="mt-2 inline-block">
              <Button variant="outline" size="sm">选择文件</Button>
            </label>
          </div>

          {files.length > 0 && <div className="space-y-2">
              <h3 className="font-medium">待上传文件</h3>
              {files.map(fileItem => <Card key={fileItem.id} className="p-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <File className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">{fileItem.name}</p>
                          <p className="text-xs text-gray-500">
                            {(fileItem.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {uploadProgress[fileItem.id] !== undefined && <div className="w-24">
                            <Progress value={uploadProgress[fileItem.id]} />
                          </div>}
                        <Button variant="ghost" size="sm" onClick={() => removeFile(fileItem.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="标签，用逗号分隔" className="text-sm px-2 py-1 border rounded" value={fileItem.tags.join(', ')} onChange={e => updateFileMetadata(fileItem.id, 'tags', e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))} />
                      <input type="text" placeholder="描述" className="text-sm px-2 py-1 border rounded" value={fileItem.description} onChange={e => updateFileMetadata(fileItem.id, 'description', e.target.value)} />
                    </div>
                  </div>
                </Card>)}
              
              <Button onClick={uploadFiles} disabled={uploading || files.length === 0} className="w-full">
                {uploading ? "上传中..." : "开始上传"}
              </Button>
            </div>}
        </div>
      </DialogContent>
    </Dialog>;
}