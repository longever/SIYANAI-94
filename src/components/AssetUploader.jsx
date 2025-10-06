// @ts-ignore;
import React, { useCallback, useState } from 'react';
// @ts-ignore;
import { Button, Progress, Card, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, X, File } from 'lucide-react';

export function AssetUploader({
  onUploadComplete,
  uploading,
  setUploading,
  onFileUpload
}) {
  const {
    toast
  } = useToast();
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isDragActive, setIsDragActive] = useState(false);
  const handleDrop = useCallback(event => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
    const acceptedFiles = Array.from(event.dataTransfer.files).filter(file => {
      const type = file.type;
      const ext = file.name.split('.').pop().toLowerCase();
      const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
      const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'];
      const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg'];
      return type.startsWith('image/') && imageExts.includes(ext) || type.startsWith('video/') && videoExts.includes(ext) || type.startsWith('audio/') && audioExts.includes(ext);
    }).filter(file => file.size <= 100 * 1024 * 1024);
    setFiles(prev => [...prev, ...acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      tags: [],
      description: ''
    }))]);
  }, []);
  const handleDragOver = useCallback(event => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(true);
  }, []);
  const handleDragLeave = useCallback(event => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
  }, []);
  const handleFileInputChange = useCallback(event => {
    const acceptedFiles = Array.from(event.target.files).filter(file => {
      const type = file.type;
      const ext = file.name.split('.').pop().toLowerCase();
      const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
      const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'];
      const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg'];
      return type.startsWith('image/') && imageExts.includes(ext) || type.startsWith('video/') && videoExts.includes(ext) || type.startsWith('audio/') && audioExts.includes(ext);
    }).filter(file => file.size <= 100 * 1024 * 1024);
    setFiles(prev => [...prev, ...acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      tags: [],
      description: ''
    }))]);
  }, []);
  const removeFile = id => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };
  const uploadFiles = async () => {
    if (files.length === 0) return;
    setUploading(true);
    let successCount = 0;
    for (const fileItem of files) {
      try {
        setUploadProgress(prev => ({
          ...prev,
          [fileItem.id]: 0
        }));
        const success = await onFileUpload(fileItem.file, {
          tags: fileItem.tags,
          description: fileItem.description
        });
        if (success) {
          successCount++;
          setUploadProgress(prev => ({
            ...prev,
            [fileItem.id]: 100
          }));
        }
      } catch (error) {
        toast({
          title: "上传失败",
          description: `${fileItem.name} 上传失败: ${error.message}`,
          variant: "destructive"
        });
      }
    }
    setUploading(false);
    if (successCount > 0) {
      toast({
        title: "上传完成",
        description: `成功上传 ${successCount} 个文件`,
        variant: "default"
      });
      setFiles([]);
      onUploadComplete();
    }
  };
  const updateFileMetadata = (id, field, value) => {
    setFiles(prev => prev.map(file => file.id === id ? {
      ...file,
      [field]: value
    } : file));
  };
  return <div className="space-y-4">
      <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
        <input type="file" multiple onChange={handleFileInputChange} className="hidden" id="file-input" accept="image/*,video/*,audio/*" />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium">
          {isDragActive ? "释放文件以上传" : "拖拽文件到此处或点击选择"}
        </p>
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
    </div>;
}