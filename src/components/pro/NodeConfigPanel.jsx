// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';

import { NodeAssets } from './NodeAssets';
export function NodeConfigPanel({
  node,
  onUpdate
}) {
  return <div className="space-y-4">
      {/* 基本信息 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">节点标题</label>
          <Input value={node.title} onChange={e => onUpdate({
          title: e.target.value
        })} placeholder="输入节点标题" />
        </div>
        <div>
          <label className="text-sm font-medium">时长(秒)</label>
          <Input type="number" value={node.duration} onChange={e => onUpdate({
          duration: parseInt(e.target.value) || 5
        })} min={1} max={60} />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">内容描述</label>
        <Textarea value={node.content} onChange={e => onUpdate({
        content: e.target.value
      })} placeholder="输入节点内容描述" rows={3} />
      </div>

      {/* 生成方式和提供商 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">生成方式</label>
          <Select value={node.type} onValueChange={value => onUpdate({
          type: value
        })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text2video">文生视频</SelectItem>
              <SelectItem value="image2video">图生视频</SelectItem>
              <SelectItem value="digital_human">数字人</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">AI服务商</label>
          <Select value={node.provider} onValueChange={value => onUpdate({
          provider: value
        })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tongyi">阿里云通义万相</SelectItem>
              <SelectItem value="digital_human">数字人API</SelectItem>
              <SelectItem value="minmax">MinMax</SelectItem>
              <SelectItem value="keling">可灵</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 视频参数 */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">镜头景别</label>
          <Select value={node.shotType} onValueChange={value => onUpdate({
          shotType: value
        })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="close">特写</SelectItem>
              <SelectItem value="medium">中景</SelectItem>
              <SelectItem value="long">远景</SelectItem>
              <SelectItem value="wide">全景</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">转场效果</label>
          <Select value={node.transition} onValueChange={value => onUpdate({
          transition: value
        })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">无</SelectItem>
              <SelectItem value="fade">淡入淡出</SelectItem>
              <SelectItem value="slide">滑动</SelectItem>
              <SelectItem value="zoom">缩放</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">色彩风格</label>
          <Select value={node.colorStyle} onValueChange={value => onUpdate({
          colorStyle: value
        })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="natural">自然</SelectItem>
              <SelectItem value="vivid">鲜艳</SelectItem>
              <SelectItem value="warm">暖色</SelectItem>
              <SelectItem value="cool">冷色</SelectItem>
              <SelectItem value="monochrome">黑白</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 素材配置 */}
      <NodeAssets assets={node.assets} onAssetsUpdate={assets => onUpdate({
      assets
    })} />

      {/* 自定义参数 */}
      <div>
        <label className="text-sm font-medium">自定义参数</label>
        <Textarea value={JSON.stringify(node.customParams, null, 2)} onChange={e => {
        try {
          const params = JSON.parse(e.target.value);
          onUpdate({
            customParams: params
          });
        } catch {}
      }} placeholder="输入JSON格式的自定义参数" rows={3} className="font-mono text-xs" />
      </div>
    </div>;
}