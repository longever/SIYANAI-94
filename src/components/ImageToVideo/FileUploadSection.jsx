// @ts-ignore;
import React, { useRef, useState } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, X, Image, Music } from 'lucide-react';

export function FileUploadSection({
  type,
  title,
  description,
  accept,
  onFileUpload,
  uploadedFile
}) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const {
    toast
  } = useToast();
  const handleFileSelect = e => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = type === 'avatar' ? 10 : 50; // 头像10MB，音频50MB
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "文件过大",
          description: `${title}文件大小不能超过 ${maxSize}MB`,
          variant: "destructive"
        });
        return;
      }
      onFileUpload(file);
    }
  };
  const handleDrop = e => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const maxSize = type === 'avatar' ? 10 : 50;
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "文件过大",
          description: `${title}文件大小不能超过 ${maxSize}MB`,
          variant: "destructive"
        });
        return;
      }
      onFileUpload(file);
    }
  };
  const handleRemove = () => {
    onFileUpload(null);
  };
  const getFileIcon = () => {
    if (type === 'avatar') return <Image className="w-12 h-12 text-gray-400" />;
    return <Music className="w-12 h-12 text-gray-400" />;
  };
  const getFileUrl = file => {
    if (!file) return null;
    return URL.createObjectURL(file);
  };
  return <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {uploadedFile ? <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {type === 'avatar' ? <img src={getFileUrl(uploadedFile)} alt="预览" className="w-16 h-16 rounded-lg object-cover" /> : <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Music className="w-8 h-8 text-purple-600" />
                </div>}
              <div>
                <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                <p className="text-xs text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button onClick={handleRemove} className="text-red-500 hover:text-red-700 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div> : <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragOver ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-gray-400'}`} onDrop={handleDrop} onDragOver={e => {
      e.preventDefault();
      setDragOver(true);
    }} onDragLeave={() => setDragOver(false)}>
          <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileSelect} className="hidden" />
          <div className="flex flex-col items-center">
            {getFileIcon()}
            <p className="text-gray-600 mb-2">
              拖拽{type === 'avatar' ? '照片' : '音频'}文件到此处，或
              <button onClick={() => fileInputRef.current?.click()} className="text-purple-600 hover:text-purple-700 font-medium ml-1">
                点击上传
              </button>
            </p>
            <p className="text-gray-500 text-sm">
              支持 {accept} 格式
            </p>
          </div>
        </div>}
    </div>;
}