// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Plus, Sparkles, Image, Mic } from 'lucide-react';

export function NodeActions({
  onAddNode
}) {
  return <div className="space-y-2">
      <Button onClick={() => onAddNode('text2video')} className="w-full justify-start" variant="outline">
        <Sparkles className="w-4 h-4 mr-2" />
        添加文生视频节点
      </Button>
      <Button onClick={() => onAddNode('image2video')} className="w-full justify-start" variant="outline">
        <Image className="w-4 h-4 mr-2" />
        添加图生视频节点
      </Button>
      <Button onClick={() => onAddNode('digital_human')} className="w-full justify-start" variant="outline">
        <Mic className="w-4 h-4 mr-2" />
        添加数字人节点
      </Button>
    </div>;
}