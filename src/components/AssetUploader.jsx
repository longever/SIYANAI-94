// @ts-ignore;
import React, { useCallback, useState } from 'react';
// @ts-ignore;
import { Button, Progress, toast } from '@/components/ui';
// @ts-ignore;
import { Upload, X, File, Check } from 'lucide-react';

export function AssetUploader({
  onUploadComplete
}) {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const handleFileSelect = useCallback(event => {
    const acceptedFiles = Array.from(event.target.files);
    setFiles(prev => [...prev, ...acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(2),
      status: 'pending'
    }))]);
  }, []);
  const handleDragOver = useCallback(event => {
    event.preventDefault();
    setIsDragActive(true);
  }, []);
  const handleDragLeave = useCallback(event => {
    event.preventDefault();
    setIsDragActive(false);
  }, []);
  const handleDrop = useCallback(event => {
    event.preventDefault();
    setIsDragActive(false);
    const acceptedFiles = Array.from(event.dataTransfer.files);
    setFiles(prev => [...prev, ...acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(2),
      status: 'pending'
    }))]);
  }, []);
  const removeFile = id => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };
  const uploadFiles = async () => {
    if (files.length === 0) {
      toast({
        title: '请选择文件',
        description: '请先选择要上传的文件',
        variant: 'destructive'
      });
      return;
    }
    setIsUploading(true);
    const uploadedFiles = [];
    try {
      for (const fileItem of files) {
        if (fileItem.status === 'pending') {
          setUploadProgress(prev => ({
            ...prev,
            [fileItem.id]: 0
          }));

          // 创建 FormData 对象
          const formData = new FormData();
          formData.append('file', fileItem.file);
          formData.append('tags', JSON.stringify([]));

          // 使用云函数上传文件
          const result = await fetch('/api/asset-service/upload', {
            method: 'POST',
            body: formData
          });
          if (!result.ok) {
            throw new Error('上传失败');
          }
          const data = await result.json();
          uploadedFiles.push({
            name: data.fileName,
            url: data.fileUrl,
            size: fileItem.file.size,
            type: fileItem.file.type
          });
          setFiles(prev => prev.map(f => f.id === fileItem.id ? {
            ...f,
            status: 'completed'
          } : f));
        }
      }
      onUploadComplete(uploadedFiles);
    } catch (error) {
      toast({
        title: '上传失败',
        description: error.message || '上传过程中出现错误',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };
  return <div className="space-y-4">
      <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'}
        `}>
        <input type="file" multiple accept="image/*,audio/*,video/*,application/pdf,.doc,.docx,.txt" onChange={handleFileSelect} className="hidden" id="file-upload" />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-lg font-medium mb-2">
            {isDragActive ? '释放文件以上传' : '拖拽文件到此处或点击选择文件'}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            支持图片、音频、视频和文档文件，单个文件最大50MB
          </p>
        </label>
      </div>

      {files.length > 0 && <div className="space-y-2">
          <h3 className="font-medium">待上传文件</h3>
          {files.map(fileItem => <div key={fileItem.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <File className="w-5 h-5 text-slate-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fileItem.file.name}</p>
                <p className="text-xs text-slate-500">
                  {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {fileItem.status === 'pending' && uploadProgress[fileItem.id] && <div className="w-24">
                  <Progress value={uploadProgress[fileItem.id]} className="h-2" />
                </div>}
              {fileItem.status === 'completed' && <Check className="w-5 h-5 text-green-500" />}
              <Button variant="ghost" size="sm" onClick={() => removeFile(fileItem.id)} disabled={isUploading}>
                <X className="w-4 h-4" />
              </Button>
            </div>)}
          
          <Button onClick={uploadFiles} disabled={isUploading || files.every(f => f.status === 'completed')} className="w-full">
            {isUploading ? '上传中...' : '开始上传'}
          </Button>
        </div>}
    </div>;
}