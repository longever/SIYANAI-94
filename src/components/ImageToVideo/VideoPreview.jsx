// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent } from '@/components/ui';
// @ts-ignore;
import { Play } from 'lucide-react';

export function VideoPreview({
  videoUrl,
  className = ''
}) {
  if (!videoUrl) return null;
  return <Card className={`mt-4 ${className}`}>
      <CardContent className="p-4">
        <h3 className="text-sm font-medium mb-2">视频预览</h3>
        <div className="relative aspect-video bg-gray-100 rounded overflow-hidden">
          <video src={videoUrl} controls className="w-full h-full object-contain" preload="metadata" />
        </div>
      </CardContent>
    </Card>;
}