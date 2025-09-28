// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { TrendingUp, TrendingDown } from 'lucide-react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
export function UsageStatistics({
  usageData
}) {
  const data = [{
    day: '周一',
    used: 45,
    limit: 50
  }, {
    day: '周二',
    used: 38,
    limit: 50
  }, {
    day: '周三',
    used: 52,
    limit: 50
  }, {
    day: '周四',
    used: 41,
    limit: 50
  }, {
    day: '周五',
    used: 48,
    limit: 50
  }, {
    day: '周六',
    used: 35,
    limit: 50
  }, {
    day: '周日',
    used: 12,
    limit: 50
  }];
  const todayUsage = data[data.length - 1];
  const weeklyAverage = Math.round(data.reduce((sum, day) => sum + day.used, 0) / data.length);
  return <Card>
      <CardHeader>
        <CardTitle>使用统计</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-2xl font-bold text-[#165DFF]">{todayUsage.used}</p>
              <p className="text-sm text-gray-500">今日已用</p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-green-500">{todayUsage.limit - todayUsage.used}</p>
              <p className="text-sm text-gray-500">今日剩余</p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-2xl font-bold text-purple-500">{weeklyAverage}</p>
              <p className="text-sm text-gray-500">周平均</p>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="used" fill="#165DFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>较上周 +12%</span>
            </div>
            <span className="text-gray-500">每日重置 00:00</span>
          </div>
        </div>
      </CardContent>
    </Card>;
}