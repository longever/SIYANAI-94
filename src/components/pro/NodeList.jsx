// @ts-ignore;
import React from 'react';

import { NodeCard } from './NodeCard';
export function NodeList({
  nodes,
  expandedNodes,
  onToggleNode,
  onUpdateNode,
  onDeleteNode,
  onDuplicateNode,
  onAssetSelect
}) {
  if (nodes.length === 0) {
    return <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto text-gray-400 mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4"></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          开始创建您的视频
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          从左侧选择一个模板或添加节点开始创作
        </p>
      </div>;
  }
  return <div className="space-y-4">
      {nodes.map((node, index) => <NodeCard key={node.id} node={node} isExpanded={expandedNodes[node.id]} onToggle={() => onToggleNode(node.id)} onUpdate={onUpdateNode} onDelete={onDeleteNode} onDuplicate={onDuplicateNode} onAssetSelect={onAssetSelect} />)}
    </div>;
}