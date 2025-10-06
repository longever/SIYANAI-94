// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Search, Filter } from 'lucide-react';
// @ts-ignore;
import { Input, Badge, Checkbox, ScrollArea, Separator } from '@/components/ui';

const typeIcons = {
  image: '图片',
  audio: '音频',
  video: '视频',
  other: '其他'
};
export function AssetFilter({
  allTags,
  selectedTypes,
  selectedTags,
  searchQuery,
  onTypeChange,
  onTagChange,
  onSearchChange
}) {
  return <div className="space-y-6">
      {/* 搜索框 */}
      <div>
        <label className="text-sm font-medium mb-2 block">搜索</label>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="搜索素材..." value={searchQuery} onChange={e => onSearchChange(e.target.value)} className="pl-8" />
        </div>
      </div>

      {/* 类型筛选 */}
      <div>
        <label className="text-sm font-medium mb-2 block">类型筛选</label>
        <div className="space-y-2">
          {Object.entries(typeIcons).map(([type, label]) => <label key={type} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={selectedTypes.includes(type)} onCheckedChange={() => onTypeChange(type)} />
              <span className="text-sm">{label}</span>
            </label>)}
        </div>
      </div>

      {/* 标签筛选 */}
      <div>
        <label className="text-sm font-medium mb-2 block">标签筛选</label>
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => <Badge key={tag} variant={selectedTags.includes(tag) ? "default" : "outline"} className="cursor-pointer" onClick={() => onTagChange(tag)}>
              {tag}
            </Badge>)}
        </div>
      </div>
    </div>;
}