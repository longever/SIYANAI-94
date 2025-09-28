// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, RadioGroup, RadioGroupItem, Label, Badge } from '@/components/ui';
// @ts-ignore;
import { Calendar, CreditCard, Bell } from 'lucide-react';

export function SubscriptionManager({
  currentPlan,
  onPlanChange
}) {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [autoRenew, setAutoRenew] = useState(true);
  const plans = [{
    id: 'monthly',
    name: '月度订阅',
    price: 29,
    originalPrice: 39,
    period: '月',
    features: ['每日50次生成', '1080P输出', '优先处理', '全部模板'],
    popular: false
  }, {
    id: 'quarterly',
    name: '季度订阅',
    price: 79,
    originalPrice: 117,
    period: '季度',
    features: ['每日100次生成', '4K输出', '优先处理', '全部模板', '商业授权'],
    popular: true,
    discount: '省33%'
  }, {
    id: 'yearly',
    name: '年度订阅',
    price: 299,
    originalPrice: 468,
    period: '年',
    features: ['无限生成', '4K输出', '优先处理', '全部模板', '商业授权', 'API接口'],
    popular: false,
    discount: '省36%'
  }];
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>订阅管理</span>
          <Badge variant="outline" className="flex items-center gap-1">
            <Bell className="w-3 h-3" />
            7天后到期
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
            {plans.map(plan => <div key={plan.id} className={`relative border rounded-lg p-4 cursor-pointer transition-all hover:border-[#165DFF] ${selectedPlan === plan.id ? 'border-[#165DFF] bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                {plan.popular && <Badge className="absolute -top-2 left-4 bg-[#FF7D00]">推荐</Badge>}
                {plan.discount && <Badge className="absolute -top-2 right-4 bg-green-500">{plan.discount}</Badge>}
                
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={plan.id} id={plan.id} />
                      <Label htmlFor={plan.id} className="cursor-pointer">
                        <p className="font-medium">{plan.name}</p>
                        <p className="text-sm text-gray-500">
                          ¥{plan.price}/{plan.period}
                          {plan.originalPrice && <span className="line-through text-gray-400 ml-2">
                              ¥{plan.originalPrice}
                            </span>}
                        </p>
                      </Label>
                    </div>
                    
                    <ul className="mt-2 space-y-1">
                      {plan.features.map((feature, idx) => <li key={idx} className="text-xs text-gray-600">• {feature}</li>)}
                    </ul>
                  </div>
                </div>
              </div>)}
          </RadioGroup>

          <div className="flex items-center justify-between pt-4 border-t">
            <Label htmlFor="auto-renew" className="flex items-center gap-2">
              <input type="checkbox" id="auto-renew" checked={autoRenew} onChange={e => setAutoRenew(e.target.checked)} className="rounded" />
              自动续费
            </Label>
            <Button onClick={() => onPlanChange(selectedPlan)} className="bg-[#165DFF] hover:bg-[#165DFF]/90">
              立即切换
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>;
}