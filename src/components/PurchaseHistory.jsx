// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Clock, Download, Gift } from 'lucide-react';

export function PurchaseHistory({
  orders,
  coupons
}) {
  const [activeTab, setActiveTab] = useState('orders');
  const mockOrders = [{
    id: 'ORD-2024-001',
    date: '2024-01-15',
    plan: '高级会员',
    amount: 299,
    status: 'completed',
    period: '年度'
  }, {
    id: 'ORD-2024-002',
    date: '2024-01-01',
    plan: '基础会员',
    amount: 79,
    status: 'completed',
    period: '季度'
  }];
  const mockCoupons = [{
    id: 'CPN-001',
    code: 'NEWYEAR2024',
    discount: 20,
    type: 'percentage',
    expiry: '2024-03-31',
    used: false
  }, {
    id: 'CPN-002',
    code: 'WELCOME10',
    discount: 10,
    type: 'fixed',
    expiry: '2024-02-28',
    used: true
  }];
  return <Card>
      <CardHeader>
        <CardTitle>购买记录与优惠券</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Button variant={activeTab === 'orders' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('orders')}>
            购买记录
          </Button>
          <Button variant={activeTab === 'coupons' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('coupons')}>
            优惠券
          </Button>
        </div>

        {activeTab === 'orders' && <div className="space-y-3">
            {mockOrders.map(order => <div key={order.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{order.plan} ({order.period})</p>
                    <p className="text-sm text-gray-500">{order.id}</p>
                    <p className="text-xs text-gray-400">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">¥{order.amount}</p>
                    <Badge variant="outline" className="text-xs">
                      {order.status === 'completed' ? '已完成' : '处理中'}
                    </Badge>
                  </div>
                </div>
              </div>)}
          </div>}

        {activeTab === 'coupons' && <div className="space-y-3">
            {mockCoupons.map(coupon => <div key={coupon.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{coupon.code}</p>
                    <p className="text-sm text-gray-500">
                      {coupon.type === 'percentage' ? `${coupon.discount}%` : `¥${coupon.discount}`} 折扣
                    </p>
                    <p className="text-xs text-gray-400">有效期至 {coupon.expiry}</p>
                  </div>
                  <div>
                    {coupon.used ? <Badge variant="secondary">已使用</Badge> : <Button size="sm" variant="outline">
                        <Gift className="w-3 h-3 mr-1" />
                        使用
                      </Button>}
                  </div>
                </div>
              </div>)}
            
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <Gift className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">兑换优惠券</p>
              <div className="flex gap-2 mt-2">
                <input type="text" placeholder="输入优惠码" className="flex-1 px-3 py-1 text-sm border rounded" />
                <Button size="sm">兑换</Button>
              </div>
            </div>
          </div>}
      </CardContent>
    </Card>;
}