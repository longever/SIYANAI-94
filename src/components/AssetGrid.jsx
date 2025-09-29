// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, Badge, Button } from '@/components/ui';
// @ts-ignore;
import { Image, Video, Music, Type, Box, File, Download, Trash2, Eye } from 'lucide-react';

export function AssetGrid({
  assets,
  onPreview,
  onDelete,
  onDownload
}) {
  const getTypeIcon = type => {
    switch (type) {
      case 'image':
        return Image;
      case 'video':
        return Video;
      case 'audio':
        return Music;
      case 'font':
        return Type;
      case '3d':
        return Box;
      default:
        return File;
    }
  };
  const getTypeName = type => {
    const typeMap = {
      'image': '图片',
      'video': '视频',
      'audio': '音频',
      'font': '字体',
      '3d': '3D模型',
      'subtitle': '字幕'
    };
    return typeMap[type] || '其他';
  };
  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const formatTime = timestamp => {
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };
  return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {assets.map(asset => {
      const Icon = getTypeIcon(asset.type);
      return <Card key={asset._id} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {asset.type === 'image' && asset.thumbnail ? <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" /> : <Icon className="w-12 h-12 text-gray-400" />}
              </div>
              
              <h3 className="font-medium text-sm truncate mb-1">{asset.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{formatFileSize(asset.size)}</p>
              
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {getTypeName(asset.type)}
                </Badge>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onPreview(asset)}>
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onDownload(asset)}>
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600" onClick={() => onDelete(asset)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>;
    })}
    </div>;
}