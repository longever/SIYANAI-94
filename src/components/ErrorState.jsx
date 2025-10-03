// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { AlertCircle, RotateCcw } from 'lucide-react';

export function ErrorState({
  onRetry
}) {
  return <div className="text-center py-12">
      <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
      <p className="text-gray-600 mb-4">无法加载素材库，请稍后重试</p>
      <div className="flex gap-2 justify-center">
        <Button onClick={onRetry} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          重新加载
        </Button>
      </div>
    </div>;
}