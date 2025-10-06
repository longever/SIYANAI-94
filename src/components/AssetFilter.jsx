// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Badge, Input } from '@/components/ui';
// @ts-ignore;
import { Search, Filter } from 'lucide-react';

export function AssetFilter({
  onFilterChange,
  activeFilters
}) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedTypes, setSelectedTypes] = React.useState([]);
  const [selectedTags, setSelectedTags] = React.useState([]);
  const assetTypes = [{
    value: 'image',
    label: '图片',
    color: 'bg-blue-100 text-blue-800'
  }, {
    value: 'audio',
    label: '音频',
    color: 'bg-green-100 text-green-800'
  }, {
    value: 'video',
    label: '视频',
    color: 'bg-purple-100 text-purple-800'
  }, {
    value: 'other',
    label: '其他',
    color: 'bg-gray-100 text-gray-800'
  }];
  const popularTags = ['高清', '风景', '人物', '产品', '背景', '图标', '音乐', '音效'];
  const handleSearch = value => {
    setSearchTerm(value);
    onFilterChange({
      search: value,
      types: selectedTypes,
      tags: selectedTags
    });
  };
  const toggleType = type => {
    const newTypes = selectedTypes.includes(type) ? selectedTypes.filter(t => t !== type) : [...selectedTypes, type];
    setSelectedTypes(newTypes);
    onFilterChange({
      search: searchTerm,
      types: newTypes,
      tags: selectedTags
    });
  };
  const toggleTag = tag => {
    const newTags = selectedTags.includes(tag) ? selectedTags.filter(t => t !== tag) : [...selectedTags, tag];
    setSelectedTags(newTags);
    onFilterChange({
      search: searchTerm,
      types: selectedTypes,
      tags: newTags
    });
  };
  const clearAll = () => {
    setSearchTerm('');
    setSelectedTypes([]);
    setSelectedTags([]);
    onFilterChange({
      search: '',
      types: [],
      tags: []
    });
  };
  return <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input placeholder="搜索素材名称或标签..." value={searchTerm} onChange={e => handleSearch(e.target.value)} className="pl-10" />
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">文件类型</h4>
        <div className="flex flex-wrap gap-2">
          {assetTypes.map(type => <Badge key={type.value} variant={selectedTypes.includes(type.value) ? "default" : "outline"} className={`cursor-pointer ${selectedTypes.includes(type.value) ? type.color : ''}`} onClick={() => toggleType(type.value)}>
              {type.label}
            </Badge>)}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">热门标签</h4>
        <div className="flex flex-wrap gap-2">
          {popularTags.map(tag => <Badge key={tag} variant={selectedTags.includes(tag) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleTag(tag)}>
              {tag}
            </Badge>)}
        </div>
      </div>

      {(searchTerm || selectedTypes.length > 0 || selectedTags.length > 0) && <Button variant="ghost" size="sm" onClick={clearAll} className="w-full">
          <Filter className="w-4 h-4 mr-2" />
          清除所有筛选
        </Button>}
    </div>;
}