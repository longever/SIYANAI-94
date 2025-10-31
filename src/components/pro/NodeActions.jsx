// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Copy, Trash2 } from 'lucide-react';

export function NodeActions({
  onDuplicate,
  onDelete
}) {
  return <div className="flex items-center space-x-2">
      <Button variant="ghost" size="sm" onClick={onDuplicate} title="复制节点">
        <Copy className="w-3 h-3" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onDelete} title="删除节点">
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>;
}