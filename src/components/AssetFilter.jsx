// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Badge, ScrollArea } from '@/components/ui';
// @ts-ignore;
import { FileImage, FileAudio, FileVideo, FileText, Tag, X } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

const assetTypes = [{
  value: 'all',
  label: '全部',
  icon: null
}, {
  value: 'image',
  label: '图片',
  icon: FileImage
}, {
  value: 'video',
  label: '视频',
  icon: FileVideo
}, {
  value: 'audio',
  label: '音频',
  icon: FileAudio
}, {
  value: 'other',
  label: '其他',
  icon: FileText
}];
export function AssetFilter({
  selectedType,
  onTypeChange,
  selectedTags,
  onTagToggle,
  allTags
}) {
  return <div className="space-y-6">
      {/* 类型筛选 */}
      <div>
        <h3 className="font-medium mb-3">素材类型</h3>
        <div className="space-y-1">
          {assetTypes.map(type => {
          const Icon = type.icon;
          return <Button key={type.value} variant={selectedType === type.value ? "secondary" : "ghost"} className={cn("w-full justify-start", selectedType === type.value && "bg-blue-100 text-blue-700")} onClick={() => onTypeChange(type.value)}>
                {Icon && <Icon className="w-4 h-4 mr-2" />}
                {type.label}
              </Button>;
        })}
        </div>
      </div>

      {/* 标签筛选 */}
      {allTags.length > 0 && <div>
          <h3 className="font-medium mb-3 flex items-center">
            <Tag className="w-4 h-4 mr-2" />
            标签筛选
          </h3>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {allTags.map(tag => <div key={tag} className={cn("flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-100", selectedTags.includes(tag) && "bg-blue-50")} onClick={() => onTagToggle(tag)}>
                  <Badge variant={selectedTags.includes(tag) ? "default" : "outline"} className="cursor-pointer">
                    {tag}
                  </Badge>
                  {selectedTags.includes(tag) && <X className="w-3 h-3 text-blue-600" />}
                </div>)}
            </div>
          </ScrollArea>
        </div>}
    </div>;
}