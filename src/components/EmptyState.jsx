// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Search, Upload } from 'lucide-react';

export function EmptyState({
  onUpload
}) {
  return <div className="text-center py-12">
      <div className="text-purple-300 mb-4">
        <Search className="w-12 h-12 mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        没有找到匹配的素材
      </h3>
      <p className="text-gray-600 mb-4">
        尝试调整搜索条件或上传新素材
      </p>
      <Button onClick={onUpload}>
        <Upload className="w-4 h-4 mr-2" />
        上传素材
      </Button>
    </div>;
}