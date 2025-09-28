// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, Tabs, TabsContent, TabsList, TabsTrigger, Input } from '@/components/ui';

import { AssetLibrary } from '@/components/AssetLibrary';
export function NodeConfigurationModal({
  open,
  onOpenChange,
  node,
  onSave,
  $w
}) {
  const [config, setConfig] = React.useState(node || {});
  const [assets, setAssets] = React.useState({
    image: null,
    audio: null,
    subtitle: null
  });
  React.useEffect(() => {
    if (node) {
      setConfig(node);
      setAssets({
        image: node.assets?.image || null,
        audio: node.assets?.audio || null,
        subtitle: node.assets?.subtitle || null
      });
    }
  }, [node]);
  const handleSave = () => {
    const updatedConfig = {
      ...config,
      assets: {
        image: assets.image,
        audio: assets.audio,
        subtitle: assets.subtitle
      }
    };
    onSave(updatedConfig);
    onOpenChange(false);
  };
  const handleAssetSelect = asset => {
    setAssets(prev => ({
      ...prev,
      [asset.type]: asset
    }));
  };
  const shotTypes = [{
    value: 'wide',
    label: '全景'
  }, {
    value: 'medium',
    label: '中景'
  }, {
    value: 'close',
    label: '特写'
  }, {
    value: 'extreme_close',
    label: '极特写'
  }];
  const transitionEffects = [{
    value: 'fade',
    label: '淡入淡出'
  }, {
    value: 'slide',
    label: '滑动'
  }, {
    value: 'zoom',
    label: '缩放'
  }, {
    value: 'blur',
    label: '模糊'
  }];
  const colorStyles = [{
    value: 'vibrant',
    label: '鲜艳'
  }, {
    value: 'moody',
    label: '情绪'
  }, {
    value: 'vintage',
    label: '复古'
  }, {
    value: 'cinematic',
    label: '电影感'
  }];
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>节点配置</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">基础设置</TabsTrigger>
            <TabsTrigger value="assets">素材选择</TabsTrigger>
            <TabsTrigger value="advanced">高级参数</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div>
              <Label>节点标题</Label>
              <Input value={config.title || ''} onChange={e => setConfig({
              ...config,
              title: e.target.value
            })} placeholder="输入节点标题..." />
            </div>
            
            <div>
              <Label>节点文本</Label>
              <Textarea value={config.text || ''} onChange={e => setConfig({
              ...config,
              text: e.target.value
            })} placeholder="输入节点内容..." rows={4} />
            </div>
            
            <div>
              <Label>节点时长(秒)</Label>
              <Input type="number" value={config.duration || 10} onChange={e => setConfig({
              ...config,
              duration: parseInt(e.target.value) || 10
            })} min="5" max="300" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>镜头景别</Label>
                <Select value={config.shotType || 'medium'} onValueChange={value => setConfig({
                ...config,
                shotType: value
              })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {shotTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>转场效果</Label>
                <Select value={config.transition || 'fade'} onValueChange={value => setConfig({
                ...config,
                transition: value
              })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {transitionEffects.map(effect => <SelectItem key={effect.value} value={effect.value}>{effect.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>色彩风格</Label>
              <Select value={config.colorStyle || 'cinematic'} onValueChange={value => setConfig({
              ...config,
              colorStyle: value
            })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorStyles.map(style => <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="assets">
            <div className="space-y-4">
              <div>
                <Label>已选素材</Label>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(assets).map(([type, asset]) => <div key={type} className="border rounded-lg p-3">
                      <div className="text-sm font-medium mb-2 capitalize">{type}</div>
                      {asset ? <div className="text-xs text-muted-foreground">
                          {asset.name || asset}
                        </div> : <div className="text-xs text-muted-foreground">未选择</div>}
                    </div>)}
                </div>
              </div>
              
              <AssetLibrary onAssetSelect={handleAssetSelect} />
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <div>
              <Label>自定义参数 (JSON)</Label>
              <Textarea value={JSON.stringify(config.customParams || {}, null, 2)} onChange={e => {
              try {
                setConfig({
                  ...config,
                  customParams: JSON.parse(e.target.value)
                });
              } catch {}
            }} placeholder='{"key": "value"}' rows={6} />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
}