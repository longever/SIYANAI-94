// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { RotateCcw, Loader2 } from 'lucide-react';

export function GlobalLoadingOverlay({
  isOpen,
  onRetry,
  message = '正在处理...',
  error = null
}) {
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-8 max-w-sm w-full mx-4 shadow-xl">
        <div className="text-center">
          {!error ? <>
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {message}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                请稍候，正在处理您的请求...
              </p>
            </> : <>
              <div className="h-12 w-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                处理失败
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {error}
              </p>
              <Button onClick={onRetry} variant="outline" className="flex items-center gap-2 mx-auto">
                <RotateCcw className="h-4 w-4" />
                重试
              </Button>
            </>}
        </div>
      </div>
    </div>;
}