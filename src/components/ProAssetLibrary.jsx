// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, Search, Folder, Image, Video, Music } from 'lucide-react';

export function ProAssetLibrary({
  project,
  onAssetsChange
}) {
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const filteredAssets = assets.filter(asset => asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || asset.type.toLowerCase().includes(searchTerm.toLowerCase()));
  const getAssetIcon = type => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      default:
        return <Folder className="w-4 h-4" />;
    }
  };
  return <div className="space-y-4">
      <div className="flex gap-2">
        <Input placeholder="搜索素材..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1" />
        <Button size="sm" variant="outline">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <Button className="w-full" size="sm">
          <Upload className="w-4 h-4 mr-2" />
          上传素材
        </Button>
        
        <div className="text-sm text-slate-500">
          共 {filteredAssets.length} 个素材
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredAssets.map(asset => <div key={asset.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
            {getAssetIcon(asset.type)}
            <span className="text-sm truncate">{asset.name}</span>
          </div>)}
      </div>
    </div>;
}