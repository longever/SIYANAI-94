// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Progress, Alert, AlertDescription, Skeleton, useToast } from '@/components/ui';
// @ts-ignore;
import { Crown, Clock, CheckCircle, XCircle, TrendingUp, Package, CreditCard, RefreshCw, AlertCircle } from 'lucide-react';

import { MembershipStatusCard } from '@/components/MembershipStatusCard';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { UsageStatistics } from '@/components/UsageStatistics';
import { PurchaseHistory } from '@/components/PurchaseHistory';
export default function MembershipPage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [plans, setPlans] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usageStats, setUsageStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
 
  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      const result = await $w.cloud.callFunction({
        name: 'user-service',
        data: {
          action: 'getMe',
          userId: $w.auth.currentUser?.userId
        }
      });
      if (result.success) {
        setUserInfo(result.data);
      } else {
        throw new Error(result.error || '获取用户信息失败');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      toast({
        title: '获取用户信息失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 获取套餐列表
  const fetchPlans = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'plans',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              is_active: {
                $eq: true
              }
            }
          },
          orderBy: [{
            sort_order: 'asc'
          }],
          select: {
            $master: true
          }
        }
      });
      if (result.records) {
        setPlans(result.records);
      }
    } catch (error) {
      console.error('获取套餐列表失败:', error);
      toast({
        title: '获取套餐列表失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 获取订单列表
  const fetchOrders = async () => {
    try {
      const result = await $w.cloud.callFunction({
        name: 'order-service',
        data: {
          action: 'getOrders',
          userId: $w.auth.currentUser?.userId
        }
      });
      if (result.success) {
        setOrders(result.data.orders || []);
      }
    } catch (error) {
      console.error('获取订单列表失败:', error);
      toast({
        title: '获取订单列表失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 获取使用统计
  const fetchUsageStats = async () => {
    try {
      const result = await $w.cloud.callFunction({
        name: 'user-service',
        data: {
          action: 'getUsageStats'
        }
      });
      if (result.success) {
        setUsageStats(result.data);
      }
    } catch (error) {
      console.error('获取使用统计失败:', error);
      // 静默失败，不影响主要功能
    }
  };

  // 刷新所有数据
  const refreshAllData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchUserInfo(), fetchPlans(), fetchOrders(), fetchUsageStats()]);
      toast({
        title: '数据已更新',
        description: '所有信息已同步到最新状态'
      });
    } catch (error) {
      toast({
        title: '更新失败',
        description: '部分数据更新失败，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setRefreshing(false);
    }
  };

  // 订阅套餐
  const handleSubscribe = async planId => {
    try {
      const result = await $w.cloud.callFunction({
        name: 'user-service',
        data: {
          action: 'subscribe',
          planId
        }
      });
      if (result.success) {
        toast({
          title: '订阅成功',
          description: '您已成功订阅该套餐',
          variant: 'success'
        });
        await refreshAllData();
      } else {
        throw new Error(result.error || '订阅失败');
      }
    } catch (error) {
      toast({
        title: '订阅失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 初始化加载
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchUserInfo(), fetchPlans(), fetchOrders(), fetchUsageStats()]);
      } finally {
        setLoading(false);
      }
    };
    if ($w.auth.currentUser) {
      loadData();
    }
  }, [$w.auth.currentUser]);
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>;
  }
  if (!$w.auth.currentUser) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>请先登录</CardTitle>
              <CardDescription>登录后即可查看您的会员信息</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => $w.utils.navigateTo({
              pageId: 'login'
            })} className="w-full">
                前往登录
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              会员中心
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              管理您的订阅和查看使用情况
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refreshAllData} disabled={refreshing} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? '更新中...' : '刷新'}
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">总览</TabsTrigger>
            <TabsTrigger value="plans">套餐</TabsTrigger>
            <TabsTrigger value="orders">订单</TabsTrigger>
            <TabsTrigger value="usage">使用统计</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <MembershipStatusCard userInfo={userInfo} onRefresh={refreshAllData} />
            <UsageStatistics stats={usageStats} subscription={userInfo?.subscription} />
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plans.map(plan => <Card key={plan._id} className="relative">
                  {plan.is_popular && <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500">
                      推荐
                    </Badge>}
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-3xl font-bold">
                      ¥{plan.price}
                      <span className="text-sm font-normal text-slate-500">
                        /{plan.duration}天
                      </span>
                    </div>
                    
                    <ul className="space-y-2">
                      {plan.features?.map((feature, index) => <li key={index} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </li>)}
                    </ul>

                    <Button className="w-full" onClick={() => handleSubscribe(plan._id)} disabled={userInfo?.subscription?.planId === plan._id && userInfo?.subscription?.status === 'active'}>
                      {userInfo?.subscription?.planId === plan._id && userInfo?.subscription?.status === 'active' ? '当前套餐' : '立即订阅'}
                    </Button>
                  </CardContent>
                </Card>)}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <PurchaseHistory orders={orders} />
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <UsageStatistics stats={usageStats} subscription={userInfo?.subscription} />
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}