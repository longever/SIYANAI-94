// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Input, Button, Switch, Label, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { Share2, Link, Lock, Clock, Download, Eye, Copy, QrCode } from 'lucide-react';

export function ShareCenter({
  videoData,
  onShare
}) {
  const [shareSettings, setShareSettings] = useState({
    platforms: [],
    linkExpiry: '7days',
    passwordProtected: false,
    password: '',
    allowDownload: true
  });
  const platforms = [{
    id: 'douyin',
    name: '抖音',
    icon: '🔥',
    color: 'bg-black'
  }, {
    id: 'kuaishou',
    name: '快手',
    icon: '👋',
    color: 'bg-orange-500'
  }, {
    id: 'bilibili',
    name: 'B站',
    icon: '📺',
    color: 'bg-blue-500'
  }, {
    id: 'wechat',
    name: '微信',
    icon: '💬',
    color: 'bg-green-500'
  }, {
    id: 'weibo',
    name: '微博',
    icon: '📱',
    color: 'bg-red-500'
  }, {
    id: 'link',
    name: '链接',
    icon: '🔗',
    color: 'bg-gray-500'
  }, {
    id: 'iframe',
    name: '嵌入',
    icon: '📋',
    color: 'bg-purple-500'
  }];
  const togglePlatform = platformId => {
    const newPlatforms = shareSettings.platforms.includes(platformId) ? shareSettings.platforms.filter(id => id !== platformId) : [...shareSettings.platforms, platformId];
    setShareSettings({
      ...shareSettings,
      platforms: newPlatforms
    });
  };
  const generateShareLink = () => {
    const baseUrl = 'https://siyanchuangying.com/share/';
    const videoId = Date.now().toString(36);
    const params = new URLSearchParams({
      id: videoId,
      expiry: shareSettings.linkExpiry,
      ...(shareSettings.passwordProtected && {
        pwd: shareSettings.password
      })
    });
    return `${baseUrl}${videoId}?${params.toString()}`;
  };
  const shareLink = generateShareLink();
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          分享中心
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="platforms" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="platforms">平台分享</TabsTrigger>
            <TabsTrigger value="link">链接分享</TabsTrigger>
            <TabsTrigger value="stats">数据统计</TabsTrigger>
          </TabsList>

          <TabsContent value="platforms" className="space-y-4">
            <div>
              <Label>选择分享平台</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {platforms.map(platform => <button key={platform.id} onClick={() => togglePlatform(platform.id)} className={`p-3 rounded-lg border-2 transition-all ${shareSettings.platforms.includes(platform.id) ? 'border-[#165DFF] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="text-2xl mb-1">{platform.icon}</div>
                    <div className="text-xs">{platform.name}</div>
                  </button>)}
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-[#165DFF] hover:bg-[#165DFF]/90" onClick={() => onShare(shareSettings)} disabled={shareSettings.platforms.length === 0}>
                一键分享
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="link" className="space-y-4">
            <div>
              <Label>分享链接设置</Label>
              <div className="space-y-3 mt-2">
                <div>
                  <Label className="text-sm">有效期</Label>
                  <select value={shareSettings.linkExpiry} onChange={e => setShareSettings({
                  ...shareSettings,
                  linkExpiry: e.target.value
                })} className="w-full mt-1 p-2 border rounded-md">
                    <option value="1day">1天</option>
                    <option value="7days">7天</option>
                    <option value="30days">30天</option>
                    <option value="permanent">永久</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">密码保护</Label>
                  <Switch checked={shareSettings.passwordProtected} onCheckedChange={checked => setShareSettings({
                  ...shareSettings,
                  passwordProtected: checked
                })} />
                </div>

                {shareSettings.passwordProtected && <div>
                    <Label className="text-sm">设置密码</Label>
                    <Input type="text" placeholder="输入4-8位密码" value={shareSettings.password} onChange={e => setShareSettings({
                  ...shareSettings,
                  password: e.target.value
                })} maxLength={8} className="mt-1" />
                  </div>}

                <div className="flex items-center justify-between">
                  <Label className="text-sm">允许下载</Label>
                  <Switch checked={shareSettings.allowDownload} onCheckedChange={checked => setShareSettings({
                  ...shareSettings,
                  allowDownload: checked
                })} />
                </div>
              </div>
            </div>

            <div>
              <Label>分享链接</Label>
              <div className="flex gap-2 mt-2">
                <Input value={shareLink} readOnly className="flex-1 font-mono text-sm" />
                <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(shareLink)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="p-4 border rounded-lg">
                <QrCode className="w-24 h-24" />
                <p className="text-xs text-center mt-2">扫码分享</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Eye className="w-8 h-8 mx-auto mb-2 text-[#165DFF]" />
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-sm text-gray-500">播放量</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Share2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">89</p>
                <p className="text-sm text-gray-500">分享次数</p>
              </div>
            </div>

            <div>
              <Label>今日数据</Label>
              <div className="space-y-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span>播放量</span>
                  <span className="font-medium">+156</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>分享量</span>
                  <span className="font-medium">+12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>下载量</span>
                  <span className="font-medium">+8</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>;
}