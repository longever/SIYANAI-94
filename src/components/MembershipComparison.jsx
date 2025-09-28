// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
// @ts-ignore;
import { Check, X } from 'lucide-react';

export function MembershipComparison() {
  const comparisonData = [['每日生成次数', '3次', '20次', '无限'], ['导出分辨率', '720p', '1080p', '4K'], ['平台水印', '有', '无', '无'], ['商用授权', '×', '×', '√'], ['优先队列', '×', '×', '√'], ['专属客服', '×', '×', '√'], ['批量导出', '×', '×', '√'], ['自定义水印', '×', '×', '√'], ['高级模板', '×', '√', '√'], ['商用素材库', '×', '×', '√']];
  return <Card>
      <CardHeader>
        <CardTitle>会员权益详细对比</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 font-medium">功能</th>
                <th className="text-center py-3 font-medium">免费版</th>
                <th className="text-center py-3 font-medium">基础会员</th>
                <th className="text-center py-3 font-medium">高级会员</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map(([feature, free, basic, premium]) => <tr key={feature} className="border-b last:border-b-0">
                  <td className="py-3">{feature}</td>
                  <td className="text-center py-3">
                    {free === '√' ? <Check className="w-5 h-5 mx-auto text-green-500" /> : free === '×' ? <X className="w-5 h-5 mx-auto text-red-500" /> : <span className="text-sm">{free}</span>}
                  </td>
                  <td className="text-center py-3">
                    {basic === '√' ? <Check className="w-5 h-5 mx-auto text-green-500" /> : basic === '×' ? <X className="w-5 h-5 mx-auto text-red-500" /> : <span className="text-sm">{basic}</span>}
                  </td>
                  <td className="text-center py-3">
                    {premium === '√' ? <Check className="w-5 h-5 mx-auto text-green-500" /> : premium === '×' ? <X className="w-5 h-5 mx-auto text-red-500" /> : <span className="text-sm">{premium}</span>}
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>;
}