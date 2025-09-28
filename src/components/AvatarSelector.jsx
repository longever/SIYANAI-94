// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Upload, Plus, Check } from 'lucide-react';
// @ts-ignore;
import { Card, CardContent, Button } from '@/components/ui';

export function AvatarSelector({
  onAvatarSelect
}) {
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const baseAvatars = [{
    id: 1,
    name: '商务精英',
    gender: 'male',
    style: 'professional',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  }, {
    id: 2,
    name: '职场女性',
    gender: 'female',
    style: 'professional',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  }, {
    id: 3,
    name: '科技达人',
    gender: 'male',
    style: 'tech',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  }, {
    id: 4,
    name: '教育讲师',
    gender: 'female',
    style: 'education',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  }, {
    id: 5,
    name: '时尚博主',
    gender: 'female',
    style: 'fashion',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
  }, {
    id: 6,
    name: '健身教练',
    gender: 'male',
    style: 'sports',
    image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&h=150&fit=crop&crop=face'
  }, {
    id: 7,
    name: '医疗专家',
    gender: 'male',
    style: 'medical',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
  }, {
    id: 8,
    name: '金融顾问',
    gender: 'female',
    style: 'finance',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face'
  }, {
    id: 9,
    name: '游戏主播',
    gender: 'male',
    style: 'gaming',
    image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face'
  }, {
    id: 10,
    name: '美食达人',
    gender: 'female',
    style: 'food',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face'
  }, {
    id: 11,
    name: '旅行博主',
    gender: 'male',
    style: 'travel',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
  }, {
    id: 12,
    name: '艺术创作者',
    gender: 'female',
    style: 'art',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
  }];
  const handleAvatarClick = avatar => {
    setSelectedAvatar(avatar.id);
    onAvatarSelect(avatar);
  };
  return <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">虚拟形象</h4>
        <Button size="sm" variant="outline">
          <Upload className="w-4 h-4 mr-1" />
          自定义上传
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {baseAvatars.map(avatar => <Card key={avatar.id} className={`relative cursor-pointer transition-all hover:scale-105 ${selectedAvatar === avatar.id ? 'ring-2 ring-[#165DFF]' : ''}`} onClick={() => handleAvatarClick(avatar)}>
            <CardContent className="p-3">
              <div className="relative">
                <img src={avatar.image} alt={avatar.name} className="w-full h-20 object-cover rounded" />
                {selectedAvatar === avatar.id && <div className="absolute top-1 right-1 bg-[#165DFF] text-white rounded-full p-1">
                    <Check className="w-3 h-3" />
                  </div>}
              </div>
              <p className="text-xs text-center mt-2 truncate">{avatar.name}</p>
            </CardContent>
          </Card>)}
        
        <Card className="cursor-pointer transition-all hover:scale-105 border-dashed">
          <CardContent className="p-3 flex flex-col items-center justify-center h-full">
            <Plus className="w-6 h-6 text-gray-400 mb-1" />
            <p className="text-xs text-gray-500">添加更多</p>
          </CardContent>
        </Card>
      </div>
    </div>;
}