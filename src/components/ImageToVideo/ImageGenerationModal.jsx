// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Button, Progress, Alert, AlertDescription, useToast } from '@/components/ui';
// @ts-ignore;
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export function ImageGenerationModal({
  open,
  onOpenChange,
  type,
  params,
  onSuccess
}) {
  const [status, setStatus] = useState('idle'); // idle, generating, success, error
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState(null);
  const [error, setError] = useState(null);
  const {
    toast
  } = useToast();
  const startGeneration = async () => {
    try {
      setStatus('generating');
      setProgress(0);
      setError(null);

      // 创建生成任务
      const taskResult = await $w.cloud.callDataSource({
        dataSourceName: 'generation_tasks',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            type,
            params,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      });
      const newTaskId = taskResult.id;
      setTaskId(newTaskId);

      // 调用云函数开始生成
      const result = await $w.cloud.callFunction({
        name: 'image-to-video-task',
        data: {
          taskId: newTaskId,
          type,
          params
        }
      });
      if (result.success) {
        setStatus('success');
        setProgress(100);
        toast({
          title: '生成成功',
          description: '视频已生成完成'
        });

        // 获取最终结果
        const taskData = await $w.cloud.callDataSource({
          dataSourceName: 'generation_tasks',
          methodName: 'wedaGetItemV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: newTaskId
                }
              }
            },
            select: {
              $master: true
            }
          }
        });
        if (onSuccess) {
          onSuccess(taskData);
        }
      } else {
        throw new Error(result.error || '生成失败');
      }
    } catch (err) {
      setStatus('error');
      setError(err.message);
      toast({
        title: '生成失败',
        description: err.message,
        variant: 'destructive'
      });
    }
  };
  const handleClose = () => {
    if (status === 'generating') {
      toast({
        title: '提示',
        description: '正在生成中，请稍候...'
      });
      return;
    }
    onOpenChange(false);
    // 重置状态
    setTimeout(() => {
      setStatus('idle');
      setProgress(0);
      setError(null);
      setTaskId(null);
    }, 300);
  };
  return <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>视频生成中</DialogTitle>
          <DialogDescription>
            正在为您生成视频，请耐心等待...
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {status === 'generating' && <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-center text-sm text-muted-foreground">
                正在处理中，预计需要1-3分钟...
              </p>
            </div>}

          {status === 'success' && <div className="space-y-4">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-center text-sm text-green-600">
                视频生成成功！
              </p>
            </div>}

          {status === 'error' && <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>}

          {status === 'idle' && <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                准备开始生成视频，点击开始按钮继续。
              </p>
              <Button onClick={startGeneration} className="w-full" size="lg">
                开始生成
              </Button>
            </div>}
        </div>

        <div className="flex justify-end space-x-2">
          {status !== 'generating' && <Button variant="outline" onClick={() => onOpenChange(false)}>
              关闭
            </Button>}
        </div>
      </DialogContent>
    </Dialog>;
}