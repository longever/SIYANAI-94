// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Play, Volume2 } from 'lucide-react';

export function AvatarPreview({
  avatarFile,
  audioFile
}) {
  const getFileUrl = file => {
    if (!file) return null;
    return URL.createObjectURL(file);
  };
  return <div className="space-y-4">
      <div className="text-center">
        <h4 className="text-sm font-medium text-gray-700 mb-3">预览效果</h4>
        
        {avatarFile ? <div className="relative inline-block">
            <img src={getFileUrl(avatarFile)} alt="头像预览" className="w-32 h-32 rounded-full object-cover border-4 border-purple-200" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <Play className="w-4 h-4 text-white" />
            </div>
          </div> : <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
            <span className="text-gray-500 text-sm">等待上传头像</span>
          </div>}
      </div>

      {audioFile && <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700 truncate">{audioFile.name}</span>
          </div>
          <audio controls className="w-full mt-2">
            <source src={getFileUrl(audioFile)} type={audioFile.type} />
            您的浏览器不支持音频播放。
          </audio>
        </div>}
    </div>;
}