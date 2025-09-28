// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
// @ts-ignore;
import { ChevronDown, ChevronUp } from 'lucide-react';

export function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState(null);
  const faqs = [{
    question: '如何升级会员？',
    answer: '选择您需要的会员计划，点击"立即升级"按钮，完成支付即可立即生效。支持微信、支付宝、银行卡等多种支付方式。'
  }, {
    question: '可以随时取消订阅吗？',
    answer: '是的，您可以随时在"个人中心-会员管理"中取消订阅。取消后，会员权益将持续到当前计费周期结束。'
  }, {
    question: '会员到期后会自动续费吗？',
    answer: '是的，默认开启自动续费。您可以在到期前3天关闭自动续费，关闭后不会自动扣费。'
  }, {
    question: '升级后剩余的免费次数还能用吗？',
    answer: '升级后，免费次数将保留，但会优先使用会员权益。例如：基础会员每天有20次生成机会，不会消耗免费次数。'
  }, {
    question: '支持退款吗？',
    answer: '首次购买7天内可申请全额退款。续费用户如需退款，将按照剩余天数比例退款。请联系客服处理。'
  }, {
    question: '商用授权包含什么？',
    answer: '高级会员的商用授权允许您将生成的视频用于商业用途，包括广告、营销、产品演示等，无需额外付费。'
  }];
  const toggleFAQ = index => {
    setOpenFAQ(openFAQ === index ? null : index);
  };
  return <Card>
      <CardHeader>
        <CardTitle>常见问题</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {faqs.map((faq, index) => <div key={index} className="border rounded-lg">
              <Button variant="ghost" className="w-full justify-between text-left font-normal" onClick={() => toggleFAQ(index)}>
                <span>{faq.question}</span>
                {openFAQ === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              {openFAQ === index && <div className="px-4 pb-4 text-sm text-gray-600">
                  {faq.answer}
                </div>}
            </div>)}
        </div>
      </CardContent>
    </Card>;
}