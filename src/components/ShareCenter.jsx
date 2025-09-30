// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Switch, Label, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui';
// @ts-ignore;
import { Share2, Copy, ExternalLink, Clock, Lock, Globe, Trash2, Settings } from 'lucide-react';

export function ShareCenter({
  projects,
  shareLinks,
  onCreateShare,
  onDeleteShare,
  onRefresh
}) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [shareOptions, setShareOptions] = useState({
    expiresIn: 7,
    password: '',
    allowDownload: true,
    allowEmbed: false
  });
  const handleCreateShare = async () => {
    if (!selectedProject) return;
    try {
      await onCreateShare(selectedProject.id, shareOptions);
      setIsCreateModalOpen(false);
      setSelectedProject(null);
      setShareOptions({
        expiresIn: 7,
        password: '',
        allowDownload: true,
        allowEmbed: false
      });
    } catch (error) {
      console.error('创建分享失败:', error);
    }
  };
  const handleCopyLink = url => {
    navigator.clipboard.writeText(url);
  };
  const formatExpiry = expiryDate => {
    if (!expiryDate) return '永久有效';
    const date = new Date(expiryDate);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return '已过期';
    if (diffDays === 1) return '1天后过期';
    return `${diffDays}天后过期`;
  };
  const getAccessIcon = isPublic => {
    return isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />;
  };
  return <>
      <div className="space-y-6">
        {/* 创建分享 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              创建分享
              <Button size="sm" variant="ghost" onClick={onRefresh}>
                <Settings className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">选择项目</Label>
                <select className="w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded text-white" value={selectedProject?.id || ''} onChange={e => {
                const project = projects.find(p => p.id === e.target.value);
                setSelectedProject(project);
              }}>
                  <option value="">选择项目...</option>
                  {projects.map(project => <option key={project.id} value={project.id}>
                      {project.name}
                    </option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">有效期</Label>
                  <select className="w-full mt-1 p-2 bg-slate-700 border border-slate-600 rounded text-white" value={shareOptions.expiresIn} onChange={e => setShareOptions({
                  ...shareOptions,
                  expiresIn: parseInt(e.target.value)
                })}>
                    <option value={1}>1天</option>
                    <option value={7}>7天</option>
                    <option value={30}>30天</option>
                    <option value={365}>1年</option>
                  </select>
                </div>
                
                <div>
                  <Label className="text-slate-300">密码保护</Label>
                  <Input type="text" placeholder="可选密码" value={shareOptions.password} onChange={e => setShareOptions({
                  ...shareOptions,
                  password: e.target.value
                })} className="mt-1 bg-slate-700 border-slate-600" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">允许下载</Label>
                  <Switch checked={shareOptions.allowDownload} onCheckedChange={checked => setShareOptions({
                  ...shareOptions,
                  allowDownload: checked
                })} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">允许嵌入</Label>
                  <Switch checked={shareOptions.allowEmbed} onCheckedChange={checked => setShareOptions({
                  ...shareOptions,
                  allowEmbed: checked
                })} />
                </div>
              </div>
              
              <Button className="w-full" onClick={() => setIsCreateModalOpen(true)} disabled={!selectedProject}>
                <Share2 className="w-4 h-4 mr-2" />
                创建分享链接
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 分享链接列表 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">分享链接管理</CardTitle>
          </CardHeader>
          <CardContent>
            {shareLinks.length > 0 ? <div className="space-y-3">
                {shareLinks.map(link => <div key={link.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getAccessIcon(!link.password)}
                      <div>
                        <p className="text-sm font-medium text-white">{link.projectName}</p>
                        <p className="text-xs text-slate-400">
                          {formatExpiry(link.expiresAt)} • 
                          {link.allowDownload ? ' 可下载' : ''}
                          {link.allowEmbed ? ' 可嵌入' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleCopyLink(link.url)} title="复制链接">
                        <Copy className="w-4 h-4" />
                      </Button>
                      
                      <Button size="sm" variant="ghost" onClick={() => window.open(link.url, '_blank')} title="打开链接">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      
                      <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => onDeleteShare(link.id)} title="删除链接">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>)}
              </div> : <div className="text-center py-8 text-slate-400">
                <Share2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>暂无分享链接</p>
                <p className="text-sm mt-2">创建项目分享链接后在此管理</p>
              </div>}
          </CardContent>
        </Card>
      </div>

      {/* 创建分享确认对话框 */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认创建分享</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-slate-300">
              即将为项目 "{selectedProject?.name}" 创建分享链接
            </p>
            
            <div className="text-sm text-slate-400 space-y-1">
              <p>有效期: {shareOptions.expiresIn}天</p>
              {shareOptions.password && <p>密码保护: 已设置</p>}
              <p>允许下载: {shareOptions.allowDownload ? '是' : '否'}</p>
              <p>允许嵌入: {shareOptions.allowEmbed ? '是' : '否'}</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateShare}>
              确认创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>;
}