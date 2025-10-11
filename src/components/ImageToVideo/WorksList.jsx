// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Eye, Download, Share2, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
// @ts-ignore;
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Badge } from '@/components/ui';
// @ts-ignore;
import { cn } from '@/lib/utils';

import ImageVideoPreview from './ImageVideoPreview';
export default function WorksList({
  works,
  onPreview,
  onDownload,
  onShare,
  onDelete
}) {
  const getStatusBadge = status => {
    const statusMap = {
      pending: {
        label: '处理中',
        variant: 'secondary',
        icon: Clock
      },
      completed: {
        label: '已完成',
        variant: 'default',
        icon: CheckCircle
      },
      failed: {
        label: '失败',
        variant: 'destructive',
        icon: XCircle
      }
    };
    const config = statusMap[status] || statusMap.pending;
    const Icon = config.icon;
    return <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>;
  };
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {works.map(work => <Card key={work._id} className="overflow-hidden">
          <CardHeader className="p-0">
            <div className="aspect-video relative">
              <ImageVideoPreview videoUrl={work.videoUrl} thumbnailUrl={work.thumbnailUrl} className="w-full h-full" showControls={false} />
              <div className="absolute top-2 right-2">
                {getStatusBadge(work.status)}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-4">
            <CardTitle className="text-lg mb-2">{work.title}</CardTitle>
            <p className="text-sm text-muted-foreground mb-2">
              {work.description || '无描述'}
            </p>
            <div className="text-xs text-muted-foreground">
              <p>创建时间: {new Date(work.createdAt).toLocaleString()}</p>
              {work.duration && <p>时长: {work.duration}s</p>}
            </div>
          </CardContent>
          
          <CardFooter className="p-4 pt-0 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onPreview(work)} className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              预览
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDownload(work)} disabled={work.status !== 'completed'}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onShare(work)} disabled={work.status !== 'completed'}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(work)} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>)}
    </div>;
}