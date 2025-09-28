// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Check, Crown, ArrowRight } from 'lucide-react';

export function MembershipCard({
  plan,
  billingCycle,
  onUpgrade
}) {
  const getDiscount = () => {
    if (!plan.originalPrice) return null;
    const discount = Math.round((plan.originalPrice - parseInt(plan.price.replace('¥', ''))) / plan.originalPrice * 100);
    return `${discount}% 优惠`;
  };
  return <Card className={`relative ${plan.color} ${plan.popular ? 'scale-105 shadow-lg' : ''}`}>
      {plan.popular && <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
          <Crown className="w-4 h-4 mr-1" />
          推荐
        </Badge>}

      {getDiscount() && <Badge className="absolute -top-3 right-4 bg-red-500 text-white">
          {getDiscount()}
        </Badge>}

      <CardHeader>
        <CardTitle className="text-center">
          <div className="text-2xl mb-2">{plan.name}</div>
          <div className="text-3xl font-bold">
            {plan.price}
            <span className="text-sm font-normal text-gray-500">{plan.period}</span>
          </div>
          {plan.originalPrice && <div className="text-sm text-gray-500 line-through">
              原价 ¥{plan.originalPrice}
            </div>}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, idx) => <li key={idx} className="flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>)}
          
          {plan.limitations?.map((limitation, idx) => <li key={idx} className="flex items-center">
              <span className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0">×</span>
              <span className="text-sm text-gray-400">{limitation}</span>
            </li>)}
        </ul>

        <Button className="w-full" variant={plan.popular ? "default" : "outline"} disabled={plan.disabled} onClick={() => onUpgrade(plan.name)}>
          {plan.buttonText}
          {!plan.disabled && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      </CardContent>
    </Card>;
}