// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Loader2 } from 'lucide-react';

export function LoadingState() {
  return <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
        <p className="text-gray-600">正在加载素材...</p>
      </div>
    </div>;
}