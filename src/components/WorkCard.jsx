// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Progress, useToast, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui';
// @ts-ignore;
import { Play, Download, Eye, Clock, CheckCircle, XCircle, RefreshCw, Loader2, Image as ImageIcon, Cloud, CloudOff, Share2, Trash2 } from 'lucide-react';

const WorkCard = ({
  work,
  onRefresh,
  onRecover,
  onPublish,
  onShare,
  onDelete,
  recovering,
  onPlay
}) => {
  const {
    toast
  } = useToast();
  const getStatusInfo = status => {
    const statusMap = {
      'SUCCEEDED': {
        color: 'bg-green-500',
        icon: CheckCircle,
        text: '已完成'
      },
      'FAILED': {
        color: 'bg-red-500',
        icon: XCircle,
        text: '失败'
      },
      'UNKNOWN': {
        color: 'bg-red-500',
        icon: XCircle,
        text: '未知'
      },
      'CANCELED': {
        color: 'bg-orange-500',
        icon: XCircle,
        text: '已取消'
      },
      'PENDING': {
        color: 'bg-yellow-500',
        icon: Clock,
        text: '等待中'
      },
      'RUNNING': {
        color: 'bg-blue-500',
        icon: Loader2,
        text: '生成中'
      }
    };
    return statusMap[status] || {
      color: 'bg-gray-500',
      icon: Clock,
      text: '未知'
    };
  };
  const getCloudStatus = work => {
    if (work.status !== 'SUCCEEDED') return 'pending';
    if (work.cloud_video_url) return 'available';
    if (work.video_url) return 'recoverable';
    return 'missing';
  };
  const formatDate = dateString => {
    return new Date(dateString).toLocaleString('zh-CN');
  };
  const statusInfo = getStatusInfo(work.status);
  const StatusIcon = statusInfo.icon;
  const cloudStatus = getCloudStatus(work);
  return <Card className="bg-gray-800/50 border-purple-800/30 backdrop-blur-sm overflow-hidden">
    {/* 封面图片 */}
    <div className="aspect-video relative group">
      <img src={work.image_url || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop'} alt="数字人形象" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs text-white ${statusInfo.color} flex items-center gap-1`}>
        <StatusIcon className={`w-3 h-3 ${work.status === 'RUNNING' ? 'animate-spin' : ''}`} />
        {statusInfo.text}
      </div>

      {/* 云端状态指示器 */}
      {work.status === 'SUCCEEDED' && <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs text-white flex items-center gap-1 ${cloudStatus === 'available' ? 'bg-green-600' : cloudStatus === 'recoverable' ? 'bg-orange-600' : 'bg-gray-600'}`}>
        {cloudStatus === 'available' ? <Cloud className="w-3 h-3" /> : <CloudOff className="w-3 h-3" />}
        {cloudStatus === 'available' ? '已保存' : cloudStatus === 'recoverable' ? '可恢复' : '等待中'}
      </div>}
    </div>

    <CardHeader className="pb-3">
      <CardTitle className="text-white text-sm line-clamp-2">
        {work.prompt || '无标题作品'}
      </CardTitle>
      <CardDescription className="text-gray-400 text-xs">
        创建于 {formatDate(work.created_at)}
      </CardDescription>
    </CardHeader>

    <CardContent>
      {/* 进度条 */}
      {(work.status === 'PENDING' || work.status === 'RUNNING') && <div className="mb-3">
        <Progress value={work.status === 'PENDING' ? 30 : 70} className="h-2 bg-gray-700" />
      </div>}

      {/* 云端视频缺失警告 */}
      {work.status === 'SUCCEEDED' && !work.cloud_video_url && work.video_url && <div className="mb-3 p-2 bg-orange-900/30 border border-orange-700 rounded-md">
        <div className="flex items-center text-orange-300 text-xs">
          <CloudOff className="w-3 h-3 mr-1" />
          <span>云端视频未保存</span>
        </div>
      </div>}

      {/* 作品信息 */}
      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center text-gray-300">
          <ImageIcon className="w-4 h-4 mr-2" />
          <span>分辨率: {work.resolution || '1080P'}</span>
        </div>
        <div className="flex items-center text-gray-300">
          <Clock className="w-4 h-4 mr-2" />
          <span>时长: {work.duration || 5}秒</span>
        </div>
      </div>

      {/* 操作按钮组 */}
      <div className="space-y-2">
        {/* 刷新按钮 */}
        {(work.status === 'PENDING' || work.status === 'RUNNING') && <Button size="sm" variant="outline" className="w-full border-blue-600 text-blue-400 hover:bg-blue-600/20" onClick={() => onRefresh(work)}>
          <RefreshCw className="w-3 h-3 mr-1" />
          刷新状态
        </Button>}

        {/* 重新获取视频按钮 */}
        {work.status === 'SUCCEEDED' && !work.cloud_video_url && work.video_url && <Button size="sm" variant="outline" className="w-full border-orange-600 text-orange-400 hover:bg-orange-600/20" onClick={() => onRecover(work)} disabled={recovering}>
          {recovering ? <>
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            恢复中...
          </> : <>
            <Cloud className="w-3 h-3 mr-1" />
            重新获取视频
          </>}
        </Button>}

        {/* 主要操作按钮 */}
        <div className="grid grid-cols-2 gap-2">
          {work.status === 'SUCCEEDED' && <>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => onPlay(work)}>
              <Play className="w-3 h-3 mr-1" />
              播放
            </Button>
            <Button size="sm" variant="outline" className="border-purple-600 text-purple-300 hover:bg-purple-600/20" onClick={() => {
              const a = document.createElement('a');
              a.href = work.video_url;
              a.download = `${work.prompt || '数字人视频'}.mp4`;
              a.click();
            }}>
              <Download className="w-3 h-3 mr-1" />
              下载
            </Button>
          </>}
        </div>

        {/* 次要操作按钮 */}
        <div className="grid grid-cols-2 gap-2">
          {work.status === 'SUCCEEDED' && <>
            <Button size="sm" variant="outline" className="border-green-600 text-green-400 hover:bg-green-600/20" onClick={() => onPublish(work)} disabled={work.is_published}>
              <Eye className="w-3 h-3 mr-1" />
              {work.is_published ? '已发布' : '发布'}
            </Button>
            <Button size="sm" variant="outline" className="border-cyan-600 text-cyan-400 hover:bg-cyan-600/20" onClick={() => onShare(work)}>
              <Share2 className="w-3 h-3 mr-1" />
              分享
            </Button>
          </>}
        </div>

        {/* 删除按钮 */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="outline" className="w-full border-red-600 text-red-400 hover:bg-red-600/20">
              <Trash2 className="w-3 h-3 mr-1" />
              删除
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gray-800 border-purple-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">确认删除</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                确定要删除这个作品吗？此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-600 text-gray-300">取消</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => onDelete(work._id)}>
                确认删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 重试按钮 */}
        {work.status === 'FAILED' && <Button size="sm" variant="outline" className="w-full border-orange-600 text-orange-400 hover:bg-orange-600/20">
          <RefreshCw className="w-3 h-3 mr-1" />
          重新生成
        </Button>}
      </div>
    </CardContent>
  </Card>;
};
export default WorkCard;