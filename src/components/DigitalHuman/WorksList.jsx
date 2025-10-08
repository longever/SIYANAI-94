// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@/components/ui';
// @ts-ignore;
import { Play, Download, Trash2, RefreshCw } from 'lucide-react';

// 移除 date-fns 依赖，使用原生 Date 实现
function formatRelativeTime(date) {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now - target;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  if (diffSec < 60) return '刚刚';
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (diffHour < 24) return `${diffHour}小时前`;
  if (diffDay < 30) return `${diffDay}天前`;
  return target.toLocaleDateString('zh-CN');
}
export function WorksList({
  works = [],
  onRefresh
}) {
  const handlePlay = work => {
    // 播放视频逻辑
    console.log('播放视频:', work);
  };
  const handleDownload = work => {
    // 下载视频逻辑
    console.log('下载视频:', work);
  };
  const handleDelete = work => {
    // 删除视频逻辑
    console.log('删除视频:', work);
  };
  if (!works || works.length === 0) {
    return <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4" />
            </svg>
          </div>
          <p className="text-gray-500 text-center">暂无作品</p>
          {onRefresh && <Button variant="outline" size="sm" className="mt-4" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </Button>}
        </CardContent>
      </Card>;
  }
  return <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">我的作品</h2>
        {onRefresh && <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {works.map(work => <Card key={work._id || work.id} className="overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              {work.thumbnail || work.avatar_url ? <img src={work.thumbnail || work.avatar_url} alt={work.prompt || '数字人视频'} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>}
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                <Button size="icon" variant="ghost" className="text-white opacity-0 hover:opacity-100" onClick={() => handlePlay(work)}>
                  <Play className="w-6 h-6" />
                </Button>
              </div>
            </div>
            
            <CardHeader>
              <CardTitle className="text-sm">
                {work.prompt || '数字人视频'}
              </CardTitle>
              <CardDescription className="text-xs">
                状态: {work.status === 'completed' ? '已完成' : work.status === 'processing' ? '处理中' : work.status === 'failed' ? '失败' : '未知'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {work.createdAt ? formatRelativeTime(work.createdAt) : '刚刚'}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handlePlay(work)} disabled={work.status !== 'completed'}>
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDownload(work)} disabled={work.status !== 'completed'}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(work)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>)}
      </div>
    </div>;
}