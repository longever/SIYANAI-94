// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { Film, Image, User } from 'lucide-react';

// @ts-ignore;
import TextToVideoPage from './TextToVideoPage';
// @ts-ignore;
import ImageToVideoPage from './ImageToVideoPage';
// @ts-ignore;
import DigitalHuman from './digital-human';
export default function CreatePage(props) {
  const {
    $w,
    style
  } = props;
  const [activeFeature, setActiveFeature] = useState('text');
  const features = [{
    id: 'text',
    name: '文生视频',
    icon: Film,
    description: '用文字描述生成精彩视频',
    component: TextToVideoPage
  }, {
    id: 'image',
    name: '图生视频',
    icon: Image,
    description: '让静态图片变成动态视频',
    component: ImageToVideoPage
  }, {
    id: 'digital',
    name: '数字人',
    icon: User,
    description: '创建AI数字人虚拟形象',
    component: DigitalHuman
  }];
  const ActiveComponent = features.find(f => f.id === activeFeature)?.component;
  return <div style={style} className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">AI视频创作</h1>
        <p className="text-xl text-purple-300">选择创作方式，释放您的创意</p>
      </div>

      {/* 功能选择器 */}
      <div className="mb-8">
        <Card className="bg-gray-800/50 border-purple-800/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {features.map(feature => {
                const Icon = feature.icon;
                return <button key={feature.id} onClick={() => setActiveFeature(feature.id)} className={`p-6 rounded-lg border-2 transition-all duration-300 ${activeFeature === feature.id ? 'border-purple-500 bg-purple-500/20' : 'border-gray-600 hover:border-purple-400 bg-gray-700/50'}`}>
                  <div className="flex flex-col items-center space-y-3">
                    <Icon className={`w-8 h-8 ${activeFeature === feature.id ? 'text-purple-400' : 'text-gray-400'}`} />
                    <div>
                      <h3 className={`font-semibold ${activeFeature === feature.id ? 'text-purple-300' : 'text-white'}`}>{feature.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{feature.description}</p>
                    </div>
                  </div>
                </button>;
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 动态渲染选中的功能组件 */}
      {ActiveComponent && <ActiveComponent $w={$w} style={style} />}
    </div>
  </div>;
}