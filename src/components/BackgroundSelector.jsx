// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Upload, Image } from 'lucide-react';
// @ts-ignore;
import { Card, CardContent, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';

export function BackgroundSelector({
  onBackgroundChange
}) {
  const [selectedBackground, setSelectedBackground] = useState('studio');
  const virtualBackgrounds = [{
    id: 'studio',
    name: '演播室',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=120&fit=crop'
  }, {
    id: 'office',
    name: '办公室',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=120&fit=crop'
  }, {
    id: 'living',
    name: '客厅',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=120&fit=crop'
  }, {
    id: 'outdoor',
    name: '户外',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=120&fit=crop'
  }, {
    id: 'green',
    name: '绿幕',
    image: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=200&h=120&fit=crop'
  }];
  const handleBackgroundSelect = background => {
    setSelectedBackground(background.id);
    onBackgroundChange(background);
  };
  return <div className="space-y-4">
      <h4 className="font-medium">背景替换</h4>
      
      <Tabs defaultValue="virtual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="virtual">虚拟背景</TabsTrigger>
          <TabsTrigger value="custom">自定义</TabsTrigger>
        </TabsList>
        
        <TabsContent value="virtual" className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {virtualBackgrounds.map(bg => <Card key={bg.id} className={`cursor-pointer transition-all hover:scale-105 ${selectedBackground === bg.id ? 'ring-2 ring-[#165DFF]' : ''}`} onClick={() => handleBackgroundSelect(bg)}>
                <CardContent className="p-2">
                  <img src={bg.image} alt={bg.name} className="w-full h-16 object-cover rounded" />
                  <p className="text-xs text-center mt-1">{bg.name}</p>
                </CardContent>
              </Card>)}
          </div>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-3">
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input type="file" accept="image/*" className="hidden" id="background-upload" />
            <label htmlFor="background-upload" className="cursor-pointer">
              <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">上传自定义背景</p>
              <p className="text-xs text-gray-500 mt-1">
                支持 JPG, PNG 格式
              </p>
            </label>
          </div>
        </TabsContent>
      </Tabs>
    </div>;
}