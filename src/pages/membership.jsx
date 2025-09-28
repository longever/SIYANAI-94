// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Sun, Moon, Menu, X } from 'lucide-react';

import { MembershipStatusCard } from '@/components/MembershipStatusCard';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { UsageStatistics } from '@/components/UsageStatistics';
import { PurchaseHistory } from '@/components/PurchaseHistory';
import { ExportSettings } from '@/components/ExportSettings';
export default function MembershipPage(props) {
  const {
    $w,
    style
  } = props;
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const membershipData = {
    level: 'premium',
    expiresAt: '2024-12-31',
    dailyQuota: {
      used: 12,
      remaining: 38,
      total: 50
    }
  };
  const handlePlanChange = plan => {
    console.log('Changing to plan:', plan);
  };
  const handleSettingsChange = settings => {
    console.log('Export settings changed:', settings);
  };
  return <div style={style} className={`min-h-screen bg-[#F5F7FA] dark:bg-gray-900 ${isDarkMode ? 'dark' : ''}`}>
      {/* 顶部导航 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden">
                <Menu className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-semibold ml-2">会员中心</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧栏 */}
          <div className="lg:col-span-2 space-y-6">
            <MembershipStatusCard membership={membershipData} />
            <SubscriptionManager currentPlan="quarterly" onPlanChange={handlePlanChange} />
            <UsageStatistics />
            <PurchaseHistory />
          </div>

          {/* 右侧栏 */}
          <div className="space-y-6">
            <ExportSettings onSettingsChange={handleSettingsChange} />
          </div>
        </div>
      </main>

      {/* 移动端菜单 */}
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-800">
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="font-semibold">菜单</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4">
              <nav className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  会员状态
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  订阅管理
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  使用统计
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  购买记录
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  导出设置
                </Button>
              </nav>
            </div>
          </div>
        </div>}
    </div>;
}