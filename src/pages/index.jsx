// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui';
// @ts-ignore;
import { ChevronRight, Play, Image, User, HelpCircle, Twitter, Facebook, Instagram } from 'lucide-react';

export default function HomePage(props) {
  const {
    $w,
    style
  } = props;
  const handleNavigate = pageId => {
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  const features = [{
    title: '文生视频',
    description: '输入文字描述，AI智能生成高质量视频内容',
    icon: <Play className="w-8 h-8" />,
    color: 'bg-blue-500'
  }, {
    title: '图生视频',
    description: '上传图片，AI将静态图片转化为动态视频',
    icon: <Image className="w-8 h-8" />,
    color: 'bg-purple-500'
  }, {
    title: '数字人视频',
    description: '创建专属数字人，生成个性化视频内容',
    icon: <User className="w-8 h-8" />,
    color: 'bg-green-500'
  }];
  const membershipTiers = [{
    name: '免费版',
    price: '¥0',
    features: ['基础文生视频', '720P输出', '每日5次生成', '基础模板库'],
    cta: '立即使用',
    popular: false
  }, {
    name: '基础会员',
    price: '¥29/月',
    features: ['高级文生视频', '1080P输出', '每日50次生成', '全部模板库', '优先处理'],
    cta: '立即开通',
    popular: true
  }, {
    name: '高级会员',
    price: '¥99/月',
    features: ['全部功能', '4K输出', '无限生成', '专属模板', 'API接口', '商业授权'],
    cta: '立即开通',
    popular: false
  }];
  const faqs = [{
    question: '思延创影支持哪些视频格式？',
    answer: '我们支持MP4、MOV、AVI等主流视频格式，输出视频默认为MP4格式，便于在各平台使用。'
  }, {
    question: '生成的视频可以用于商业用途吗？',
    answer: '免费版仅限个人使用，基础会员和高级会员可分别获得不同程度的商业授权，具体请查看会员权益说明。'
  }, {
    question: 'AI生成视频需要多长时间？',
    answer: '根据视频复杂度和当前服务器负载，通常30秒到5分钟不等。会员用户享有优先处理权。'
  }, {
    question: '如何取消会员订阅？',
    answer: '您可以在个人中心的会员管理页面随时取消订阅，取消后将在当前周期结束后停止续费。'
  }];
  return <div style={style} className="min-h-screen bg-[#F5F7FA]">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#165DFF]">思延创影</h1>
            </div>
            <nav className="flex items-center space-x-8">
              <button onClick={() => handleNavigate('membership')} className="text-gray-700 hover:text-[#165DFF] transition-colors">
                会员中心
              </button>
              <button onClick={() => handleNavigate('help')} className="text-gray-700 hover:text-[#165DFF] transition-colors">
                帮助中心
              </button>
              <Button onClick={() => handleNavigate('login')} variant="outline" className="border-[#165DFF] text-[#165DFF] hover:bg-[#165DFF] hover:text-white">
                登录
              </Button>
              <Button onClick={() => handleNavigate('register')} className="bg-[#FF7D00] hover:bg-[#FF7D00]/90 text-white">
                注册
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main>
        {/* 英雄区域 */}
        <section className="bg-gradient-to-r from-[#165DFF] to-blue-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-5xl font-bold mb-6">AI驱动的视频创作平台</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              用文字、图片或数字人，轻松生成专业级视频内容
            </p>
            <Button onClick={() => handleNavigate('create')} size="lg" className="bg-[#FF7D00] hover:bg-[#FF7D00]/90 text-white px-8 py-3 text-lg">
              立即开始创作
            </Button>
          </div>
        </section>

        {/* 核心功能 */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">核心功能</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className={`w-16 h-16 ${feature.color} rounded-lg flex items-center justify-center text-white mb-4`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                    <Button onClick={() => handleNavigate('create')} className="mt-4 w-full bg-[#165DFF] hover:bg-[#165DFF]/90 text-white">
                      立即体验
                    </Button>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </section>

        {/* 会员权益对比 */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">会员权益对比</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {membershipTiers.map((tier, index) => <Card key={index} className={`relative ${tier.popular ? 'border-[#165DFF] border-2' : ''}`}>
                  {tier.popular && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-[#165DFF] text-white px-4 py-1 rounded-full text-sm">
                        推荐
                      </span>
                    </div>}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <p className="text-3xl font-bold text-[#165DFF] mt-2">{tier.price}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {tier.features.map((feature, featureIndex) => <li key={featureIndex} className="flex items-center">
                          <ChevronRight className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-gray-700">{feature}</span>
                        </li>)}
                    </ul>
                    <Button onClick={() => handleNavigate('membership')} className={`mt-6 w-full ${tier.popular ? 'bg-[#FF7D00] hover:bg-[#FF7D00]/90' : 'bg-[#165DFF] hover:bg-[#165DFF]/90'} text-white`}>
                      {tier.cta}
                    </Button>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">常见问题</h3>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>)}
            </Accordion>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">思延创影</h4>
              <p className="text-gray-400">
                AI驱动的视频创作平台，让创意无限可能
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-3">产品</h5>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => handleNavigate('create')} className="hover:text-white transition-colors">文生视频</button></li>
                <li><button onClick={() => handleNavigate('create')} className="hover:text-white transition-colors">图生视频</button></li>
                <li><button onClick={() => handleNavigate('create')} className="hover:text-white transition-colors">数字人视频</button></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">支持</h5>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => handleNavigate('help')} className="hover:text-white transition-colors">帮助中心</button></li>
                <li><button className="hover:text-white transition-colors">联系我们</button></li>
                <li><button className="hover:text-white transition-colors">隐私政策</button></li>
                <li><button className="hover:text-white transition-colors">服务条款</button></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">关注我们</h5>
              <div className="flex space-x-4">
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 思延创影. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>;
}