// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, useToast, Badge, Progress, Skeleton } from '@/components/ui';
// @ts-ignore;
import { Play, Pause, Download, Share2, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Settings, Film, Layers, Package, ExternalLink, Copy, Eye } from 'lucide-react';

import { AdvancedTimeline } from '@/components/AdvancedTimeline';
import { BatchExportQueue } from '@/components/BatchExportQueue';
import { ShareCenter } from '@/components/ShareCenter';
import { ExportSettings } from '@/components/ExportSettings';
import { ExportConfigPanel } from '@/components/ExportConfigPanel';
export default function VideoCreatorPro(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [exportTasks, setExportTasks] = useState([]);
  const [shareLinks, setShareLinks] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentTaskId, setCurrentTaskId] = useState(null);

  // 获取项目列表
  const loadProjects = async () => {
    try {
      setLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'video_node',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {}
          },
          select: {
            $master: true
          },
          getCount: true,
          orderBy: [{
            createdAt: 'desc'
          }]
        }
      });
      if (result.records && result.records.length > 0) {
        // 按项目ID分组
        const projectMap = {};
        result.records.forEach(node => {
          const projectId = node.projectId || 'default_project';
          if (!projectMap[projectId]) {
            projectMap[projectId] = {
              id: projectId,
              name: node.projectName || `项目 ${projectId}`,
              nodes: [],
              totalDuration: 0,
              createdAt: node.createdAt,
              updatedAt: node.updatedAt
            };
          }
          projectMap[projectId].nodes.push(node);
          projectMap[projectId].totalDuration += node.duration || 5;
        });
        const projectList = Object.values(projectMap).map(project => ({
          ...project,
          nodeCount: project.nodes.length,
          status: project.nodes.every(n => n.status === 'completed') ? 'completed' : project.nodes.some(n => n.status === 'failed') ? 'failed' : 'processing'
        }));
        setProjects(projectList);
      } else {
        // 如果没有项目数据，创建一个示例项目
        setProjects([{
          id: 'demo_project',
          name: '示例项目',
          nodes: result.records || [],
          totalDuration: (result.records || []).reduce((sum, node) => sum + (node.duration || 5), 0),
          nodeCount: (result.records || []).length,
          status: 'pending',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }]);
      }
    } catch (error) {
      console.error('获取项目列表失败:', error);
      toast({
        title: '获取项目列表失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });

      // 创建空项目列表避免页面报错
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // 获取导出任务列表
  const loadExportTasks = async () => {
    try {
      const result = await $w.cloud.callFunction({
        name: 'media-service',
        data: {
          action: 'getExportTasks',
          userId: $w.auth.currentUser?.userId
        }
      });
      if (result.success) {
        setExportTasks(result.data.tasks || []);
      }
    } catch (error) {
      console.error('获取导出任务失败:', error);
      toast({
        title: '获取导出任务失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 获取分享链接列表
  const loadShareLinks = async () => {
    try {
      const result = await $w.cloud.callFunction({
        name: 'media-service',
        data: {
          action: 'getShareLinks',
          userId: $w.auth.currentUser?.userId
        }
      });
      if (result.success) {
        setShareLinks(result.data.links || []);
      }
    } catch (error) {
      console.error('获取分享链接失败:', error);
      toast({
        title: '获取分享链接失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 批量生成视频
  const handleBatchGenerate = async selectedProjects => {
    if (!selectedProjects || selectedProjects.length === 0) {
      toast({
        title: '请选择项目',
        description: '请先选择要生成的项目',
        variant: 'destructive'
      });
      return;
    }
    try {
      setIsGenerating(true);
      setGenerationProgress(0);

      // 调用批量生成云函数
      const result = await $w.cloud.callFunction({
        name: 'generateVideo',
        data: {
          action: 'batchGenerate',
          projects: selectedProjects.map(project => ({
            projectId: project.id,
            projectName: project.name,
            nodes: project.nodes,
            exportConfig: {
              format: 'mp4',
              quality: 'high',
              resolution: '1920x1080',
              fps: 30
            }
          }))
        }
      });
      if (result.success) {
        setCurrentTaskId(result.batchId);

        // 记录导出历史
        await $w.cloud.callFunction({
          name: 'order-service',
          data: {
            action: 'recordExport',
            batchId: result.batchId,
            projectCount: selectedProjects.length,
            totalDuration: selectedProjects.reduce((sum, p) => sum + p.totalDuration, 0)
          }
        });
        toast({
          title: '批量生成已启动',
          description: `正在处理 ${selectedProjects.length} 个项目`,
          variant: 'success'
        });

        // 开始轮询任务状态
        pollBatchStatus(result.batchId);
      } else {
        throw new Error(result.error || '批量生成失败');
      }
    } catch (error) {
      console.error('批量生成失败:', error);
      toast({
        title: '批量生成失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
      setIsGenerating(false);
    }
  };

  // 轮询批量任务状态
  const pollBatchStatus = async batchId => {
    const checkStatus = async () => {
      try {
        const result = await $w.cloud.callFunction({
          name: 'generateVideo',
          data: {
            action: 'getBatchStatus',
            batchId
          }
        });
        if (result.success) {
          const progress = result.data.progress || 0;
          setGenerationProgress(progress);
          if (result.data.status === 'completed') {
            setIsGenerating(false);
            loadExportTasks();
            toast({
              title: '批量生成完成',
              description: `成功生成 ${result.data.completedCount} 个视频`,
              variant: 'success'
            });
            return true;
          } else if (result.data.status === 'failed') {
            setIsGenerating(false);
            toast({
              title: '批量生成失败',
              description: result.data.error || '部分任务处理失败',
              variant: 'destructive'
            });
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error('检查批量状态失败:', error);
        return true;
      }
    };

    // 每5秒检查一次，最多检查72次（6分钟）
    let attempts = 0;
    const maxAttempts = 72;
    const interval = setInterval(async () => {
      attempts++;
      const completed = await checkStatus();
      if (completed || attempts >= maxAttempts) {
        clearInterval(interval);
        if (attempts >= maxAttempts) {
          setIsGenerating(false);
          toast({
            title: '批量生成超时',
            description: '请稍后重试',
            variant: 'destructive'
          });
        }
      }
    }, 5000);
  };

  // 创建分享链接
  const createShareLink = async (projectId, options = {}) => {
    try {
      const result = await $w.cloud.callFunction({
        name: 'media-service',
        data: {
          action: 'createShareLink',
          projectId,
          options: {
            expiresIn: options.expiresIn || 7 * 24 * 3600,
            // 默认7天
            password: options.password || null,
            allowDownload: options.allowDownload !== false
          }
        }
      });
      if (result.success) {
        toast({
          title: '分享链接创建成功',
          description: '链接已复制到剪贴板',
          variant: 'success'
        });

        // 复制到剪贴板
        navigator.clipboard.writeText(result.data.shareUrl);
        loadShareLinks();
        return result.data;
      } else {
        throw new Error(result.error || '创建分享链接失败');
      }
    } catch (error) {
      console.error('创建分享链接失败:', error);
      toast({
        title: '创建分享链接失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // 删除分享链接
  const deleteShareLink = async linkId => {
    try {
      const result = await $w.cloud.callFunction({
        name: 'media-service',
        data: {
          action: 'deleteShareLink',
          linkId
        }
      });
      if (result.success) {
        toast({
          title: '分享链接已删除',
          description: '链接已失效',
          variant: 'success'
        });
        loadShareLinks();
      } else {
        throw new Error(result.error || '删除分享链接失败');
      }
    } catch (error) {
      console.error('删除分享链接失败:', error);
      toast({
        title: '删除分享链接失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 下载导出文件
  const downloadExport = async taskId => {
    try {
      const result = await $w.cloud.callFunction({
        name: 'media-service',
        data: {
          action: 'getDownloadUrl',
          taskId
        }
      });
      if (result.success && result.data.downloadUrl) {
        // 创建下载链接
        const link = document.createElement('a');
        link.href = result.data.downloadUrl;
        link.download = result.data.filename || `video-${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
          title: '下载开始',
          description: '文件下载已开始',
          variant: 'success'
        });
      } else {
        throw new Error(result.error || '获取下载链接失败');
      }
    } catch (error) {
      console.error('下载失败:', error);
      toast({
        title: '下载失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 刷新所有数据
  const refreshAllData = async () => {
    try {
      await Promise.all([loadProjects(), loadExportTasks(), loadShareLinks()]);
      toast({
        title: '数据已更新',
        description: '所有信息已同步到最新状态'
      });
    } catch (error) {
      toast({
        title: '更新失败',
        description: '部分数据更新失败，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 初始化加载
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([loadProjects(), loadExportTasks(), loadShareLinks()]);
      } finally {
        setLoading(false);
      }
    };
    if ($w.auth.currentUser) {
      loadData();
    }
  }, [$w.auth.currentUser]);
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">高级视频创作</h1>
            <p className="text-slate-400 mt-2">专业级视频制作与批量管理</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshAllData}>
              <RefreshCw className="w-4 h-4 mr-1" />
              刷新
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="timeline" className="text-slate-300">高级时间线</TabsTrigger>
            <TabsTrigger value="batch" className="text-slate-300">批量导出</TabsTrigger>
            <TabsTrigger value="share" className="text-slate-300">分享中心</TabsTrigger>
            <TabsTrigger value="history" className="text-slate-300">导出历史</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-6">
            <AdvancedTimeline projects={projects} selectedProject={selectedProject} onProjectSelect={setSelectedProject} onRefresh={loadProjects} />
          </TabsContent>

          <TabsContent value="batch" className="space-y-6">
            <BatchExportQueue projects={projects} exportTasks={exportTasks} isGenerating={isGenerating} generationProgress={generationProgress} onBatchGenerate={handleBatchGenerate} onDownload={downloadExport} onRefresh={loadExportTasks} />
          </TabsContent>

          <TabsContent value="share" className="space-y-6">
            <ShareCenter projects={projects} shareLinks={shareLinks} onCreateShare={createShareLink} onDeleteShare={deleteShareLink} onRefresh={loadShareLinks} />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <ExportSettings exportTasks={exportTasks} onDownload={downloadExport} onRefresh={loadExportTasks} />
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}