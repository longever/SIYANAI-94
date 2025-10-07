// @ts-ignore;
import React, { useState, useCallback } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Progress, Alert, AlertDescription, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, X, Tag, Image as ImageIcon, Video, Music, FileText, Loader2 } from 'lucide-react';

const ASSET_CATEGORIES = [{
  value: 'image',
  label: '图片',
  icon: ImageIcon
}, {
  value: 'character',
  label: '已训练形象',
  icon: ImageIcon
}, {
  value: 'video',
  label: '视频',
  icon: ImageIcon
}, {
  value: 'effect',
  label: '已克隆声音',
  icon: Music
}, {
  value: 'audio',
  label: '音频',
  icon: Music
}, {
  value: 'template',
  label: '模板',
  icon: FileText
}];
const ASSET_TYPES = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  video: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
  audio: ['mp3', 'wav', 'ogg', 'flac', 'aac']
};
export function AssetUploadDialog({
  open,
  onOpenChange,
  onUploadSuccess
}) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: [],
    is_platform: false
  });
  const [tagInput, setTagInput] = useState('');
  const {
    toast
  } = useToast();
  const handleFileDrop = useCallback(e => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);
  const handleFileSelect = useCallback(e => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  }, []);
  const removeFile = useCallback(index => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);
  const addTag = useCallback(() => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  }, [tagInput, formData.tags]);
  const removeTag = useCallback(tagToRemove => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);
  const handleKeyPress = useCallback(e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  }, [addTag]);
  const getFileType = file => {
    const extension = file.name.split('.').pop().toLowerCase();
    if (ASSET_TYPES.image.includes(extension)) return 'image';
    if (ASSET_TYPES.video.includes(extension)) return 'video';
    if (ASSET_TYPES.audio.includes(extension)) return 'audio';
    return 'other';
  };
  const getFileIcon = type => {
    switch (type) {
      case 'image':
        return ImageIcon;
      case 'video':
        return Video;
      case 'audio':
        return Music;
      default:
        return FileText;
    }
  };
  const getCategoryFolder = category => {
    const folderMap = {
      image: 'image',
      character: 'characters',
      video: 'video',
      effect: 'effects',
      audio: 'audio',
      template: 'templates'
    };
    return folderMap[category] || 'others';
  };
  const uploadFile = async file => {
    const formDataToUpload = new FormData();
    formDataToUpload.append('file', file);
    try {
      // 上传到云存储
      const tcb = await window.$w.cloud.getCloudInstance();
      const fileType = getFileType(file);
      const categoryFolder = getCategoryFolder(formData.category);
      const cloudPath = `assets/${categoryFolder}/${Date.now()}_${file.name}`;
      const uploadResult = await tcb.uploadFile({
        cloudPath: cloudPath,
        filePath: file
      });
      return uploadResult.fileID;
    } catch (error) {
      console.error('上传失败:', error);
      throw error;
    }
  };
  const createAssetRecord = async (file, fileUrl) => {
    const fileType = getFileType(file);
    const assetData = {
      name: formData.name || file.name,
      type: fileType,
      url: fileUrl,
      thumbnail_url: fileType === 'image' ? fileUrl : '',
      preview_url: fileType === 'image' ? fileUrl : '',
      waveform_url: '',
      size: file.size,
      duration: 0,
      dimensions: null,
      format: file.name.split('.').pop().toLowerCase(),
      mime_type: file.type,
      tags: formData.tags,
      description: formData.description,
      category: formData.category,
      is_platform: formData.is_platform,
      download_count: 0,
      usage_count: 0,
      metadata: {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    try {
      const result = await window.$w.cloud.callDataSource({
        dataSourceName: 'asset_library',
        methodName: 'wedaCreateV2',
        params: {
          data: assetData
        }
      });
      return result;
    } catch (error) {
      console.error('创建素材记录失败:', error);
      throw error;
    }
  };
  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: '请选择文件',
        description: '请先选择要上传的文件',
        variant: 'destructive'
      });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploadedAssets = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(i / files.length * 100);

        // 上传文件到云存储
        const fileUrl = await uploadFile(file);

        // 创建素材记录
        const assetRecord = await createAssetRecord(file, fileUrl);
        uploadedAssets.push(assetRecord);
      }
      setUploadProgress(100);
      toast({
        title: '上传成功',
        description: `成功上传 ${uploadedAssets.length} 个素材`
      });

      // 重置表单
      setFiles([]);
      setFormData({
        name: '',
        description: '',
        category: '',
        tags: [],
        is_platform: false
      });
      onUploadSuccess?.(uploadedAssets);
      onOpenChange(false);
    } catch (error) {
      console.error('上传失败:', error);
      toast({
        title: '上传失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>上传素材</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* 文件上传区域 */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors" onDrop={handleFileDrop} onDragOver={e => e.preventDefault()}>
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            拖拽文件到此处，或
            <label className="text-blue-600 hover:text-blue-700 cursor-pointer ml-1">
              点击选择文件
              <input type="file" multiple className="hidden" onChange={handleFileSelect} accept="image/*,video/*,audio/*" />
            </label>
          </p>
          <p className="text-xs text-gray-500">
            支持图片、视频、音频文件
          </p>
        </div>

        {/* 文件列表 */}
        {files.length > 0 && <div className="space-y-2">
          <h3 className="text-sm font-medium">已选择文件</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {files.map((file, index) => {
              const Icon = getFileIcon(getFileType(file));
              return <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>;
            })}
          </div>
        </div>}

        {/* 表单字段 */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">素材名称</Label>
            <Input id="name" value={formData.name} onChange={e => setFormData(prev => ({
              ...prev,
              name: e.target.value
            }))} placeholder="输入素材名称" />
          </div>

          <div>
            <Label htmlFor="category">素材分类</Label>
            <Select value={formData.category} onValueChange={value => setFormData(prev => ({
              ...prev,
              category: value
            }))}>
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {ASSET_CATEGORIES.map(category => <SelectItem key={category.value} value={category.value}>
                  <div className="flex items-center">
                    <category.icon className="h-4 w-4 mr-2" />
                    {category.label}
                  </div>
                </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">描述</Label>
            <Textarea id="description" value={formData.description} onChange={e => setFormData(prev => ({
              ...prev,
              description: e.target.value
            }))} placeholder="输入素材描述" rows={3} />
          </div>

          <div>
            <Label htmlFor="tags">标签</Label>
            <div className="flex gap-2">
              <Input id="tags" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="输入标签后按回车" className="flex-1" />
              <Button type="button" onClick={addTag} size="sm">
                添加
              </Button>
            </div>
            {formData.tags.length > 0 && <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, index) => <Badge key={index} variant="secondary" className="text-sm">
                {tag}
                <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>)}
            </div>}
          </div>
        </div>

        {/* 上传进度 */}
        {uploading && <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>上传中...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>}

        {/* 错误提示 */}
        {uploading && uploadProgress < 100 && <Alert>
          <AlertDescription>
            正在上传文件，请稍候...
          </AlertDescription>
        </Alert>}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
          取消
        </Button>
        <Button onClick={handleUpload} disabled={uploading || files.length === 0}>
          {uploading ? <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            上传中...
          </> : '开始上传'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}