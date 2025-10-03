// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button } from '@/components/ui';
// @ts-ignore;
import { Search, Upload, RotateCcw } from 'lucide-react';

export function AssetSearchBar({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  onUploadClick,
  onRefresh
}) {
  const assetTypes = [{
    value: 'all',
    label: '全部素材'
  }, {
    value: 'image',
    label: '图片'
  }, {
    value: 'video',
    label: '视频'
  }, {
    value: 'audio',
    label: '音频'
  }, {
    value: 'document',
    label: '文档'
  }];
  return <div className="p-6 pb-4 border-b">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="搜索素材名称或标签..." value={searchTerm} onChange={e => onSearchChange(e.target.value)} className="pl-10" />
        </div>
        
        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="选择类型" />
          </SelectTrigger>
          <SelectContent>
            {assetTypes.map(type => <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>)}
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={onRefresh} title="刷新">
          <RotateCcw className="w-4 h-4" />
        </Button>

        <Button onClick={onUploadClick}>
          <Upload className="w-4 h-4 mr-2" />
          上传素材
        </Button>
      </div>
    </div>;
}