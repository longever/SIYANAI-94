// @ts-ignore;
import React, { useRef, useCallback } from 'react';
// @ts-ignore;
import { Upload, X } from 'lucide-react';
// @ts-ignore;
import { Button, Progress } from '@/components/ui';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function AssetUploader({
  onFileUpload,
  uploadingFiles,
  uploadProgress
}) {
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const handleDragOver = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  const handleDrop = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileUpload(files);
    }
  }, [onFileUpload]);
  const handleFileSelect = useCallback(e => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFileUpload(files);
    }
  }, [onFileUpload]);
  return <div className="space-y-4">
      <div ref={dropZoneRef} className={cn("border-2 border-dashed rounded-lg p-8 text-center transition-colors", "hover:border-primary/50 hover:bg-primary/5")} onDragOver={handleDragOver} onDrop={handleDrop}>
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">
          拖拽文件到此处上传，或{' '}
          <Button variant="link" className="p-0 h-auto" onClick={() => fileInputRef.current?.click()}>
            选择文件
          </Button>
        </p>
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
      </div>

      {uploadingFiles.length > 0 && <div className="space-y-2">
          <h4 className="text-sm font-medium">上传进度</h4>
          {uploadingFiles.map(file => <div key={file.id} className="flex items-center gap-3 text-sm">
              <span className="flex-1 truncate">{file.name}</span>
              <div className="w-32">
                <Progress value={uploadProgress[file.id] || 0} />
              </div>
              <span className="text-xs text-muted-foreground w-10 text-right">
                {Math.round(uploadProgress[file.id] || 0)}%
              </span>
            </div>)}
        </div>}
    </div>;
}