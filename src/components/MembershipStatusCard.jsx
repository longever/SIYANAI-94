// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Crown, Clock, TrendingUp } from 'lucide-react';

export function MembershipStatusCard({
  membership
}) {
  const getLevelColor = level => {
    switch (level) {
      case 'free':
        return 'text-gray-500';
      case 'basic':
        return 'text-blue-500';
      case 'premium':
        return 'text-purple-500';
      case 'enterprise':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };
  const getLevelName = level => {
    switch (level) {
      case 'free':
        return '免费版';
      case 'basic':
        return '基础会员';
      case 'premium':
        return '高级会员';
      case 'enterprise':
        return '企业版';
      default:
        return '免费版';
    }
  };
  return <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">当前会员状态</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              到期时间：{membership.expiresAt}
            </p>
          </div>
          <Crown className={`w-8 h-8 ${getLevelColor(membership.level)}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{getLevelName(membership.level)}</p>
              <Badge variant={membership.level === 'premium' ? 'default' : 'secondary'}>
                {membership.level === 'premium' ? '高级会员' : '当前等级'}
              </Badge>
            </div>
            <Button className="bg-[#FF7D00] hover:bg-[#FF7D00]/90">
              立即升级
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold text-[#165DFF]">{membership.dailyQuota.used}</p>
              <p className="text-sm text-gray-500">今日已用</p>
            </div>
            <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold text-green-500">{membership.dailyQuota.remaining}</p>
              <p className="text-sm text-gray-500">今日剩余</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
}