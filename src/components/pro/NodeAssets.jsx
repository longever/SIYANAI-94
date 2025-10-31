// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Upload } from 'lucide-react';

export function NodeAssets({
  assets,
  onAssetsUpdate
}) {
  const assetTypes = [{
    key: 'image',
    label: '图片'
  }, {
    key: 'audio',
    label: '音频'
  }, {
    key: 'subtitle',
    label: '字幕'
  }];
  const handleAssetChange = (type, asset) => {
    onAssetsUpdate({
      ...assets,
      [type]: asset
    });
  };
  const handleAssetRemove = type => {
    onAssetsUpdate({
      ...assets,
      [type]: null
    });
  };
  return <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">素材配置</label>
        <Button size="sm" variant="outline" onClick={() => {
        // 这里可以触发素材库弹窗
        console.log('打开素材库');
      }}>
          <Upload className="w-3 h-3 mr-1" />
          选择素材
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {assetTypes.map(({
        key,
        label
      }) => <div key={key} className="border rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-2">{label}</div>
            {assets[key] ? <div className="text-center">
                <div className="text-xs text-green-600 mb-1">已选择</div>
                <Button size="sm" variant="ghost" onClick={() => handleAssetRemove(key)}>
                  移除
                </Button>
              </div> : <Button size="sm" variant="outline" className="w-full" onClick={() => {
          // 这里可以触发素材选择
          console.log(`选择${label}`);
        }}>
                选择
              </Button>}
          </div>)}
      </div>
    </div>;
}