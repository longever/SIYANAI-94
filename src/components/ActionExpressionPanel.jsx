// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { User, Smile, Hand, Eye } from 'lucide-react';
// @ts-ignore;
import { Card, CardContent, Tabs, TabsContent, TabsList, TabsTrigger, Button, Slider, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui';

export function ActionExpressionPanel({
  onActionChange,
  onExpressionChange
}) {
  const [selectedAction, setSelectedAction] = useState('standing');
  const [selectedExpression, setSelectedExpression] = useState('neutral');
  const [gestureIntensity, setGestureIntensity] = useState(50);
  const [eyeContact, setEyeContact] = useState(70);
  const [isActionOpen, setIsActionOpen] = useState(true);
  const [isExpressionOpen, setIsExpressionOpen] = useState(true);
  const actions = [{
    id: 'standing',
    name: '站立',
    icon: User
  }, {
    id: 'gesturing',
    name: '手势',
    icon: Hand
  }, {
    id: 'walking',
    name: '行走',
    icon: User
  }, {
    id: 'pointing',
    name: '指向',
    icon: Hand
  }];
  const expressions = [{
    id: 'neutral',
    name: '中性',
    icon: Smile
  }, {
    id: 'smile',
    name: '微笑',
    icon: Smile
  }, {
    id: 'serious',
    name: '严肃',
    icon: Smile
  }, {
    id: 'surprised',
    name: '惊讶',
    icon: Smile
  }];
  const handleActionSelect = action => {
    setSelectedAction(action.id);
    onActionChange(action);
  };
  const handleExpressionSelect = expression => {
    setSelectedExpression(expression.id);
    onExpressionChange(expression);
  };
  return <div className="space-y-4">
      <Tabs defaultValue="actions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="actions" className="flex items-center gap-1">
            <User className="w-4 h-4" />
            动作模板
          </TabsTrigger>
          <TabsTrigger value="expressions" className="flex items-center gap-1">
            <Smile className="w-4 h-4" />
            表情调节
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="actions" className="space-y-3">
          <Collapsible open={isActionOpen} onOpenChange={setIsActionOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span>动作选择</span>
                <span className="text-xs text-muted-foreground">
                  {isActionOpen ? '收起' : '展开'}
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {actions.map(action => <Button key={action.id} variant={selectedAction === action.id ? "default" : "outline"} size="sm" className="flex items-center gap-1" onClick={() => handleActionSelect(action)}>
                    <action.icon className="w-3 h-3" />
                    {action.name}
                  </Button>)}
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span>高级设置</span>
                <span className="text-xs text-muted-foreground">展开</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-3 pt-3 border-t">
                <div>
                  <div className="flex justify-between text-sm">
                    <label>手势强度</label>
                    <span>{gestureIntensity}%</span>
                  </div>
                  <Slider value={[gestureIntensity]} onValueChange={v => setGestureIntensity(v[0])} max={100} />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <label>眼神互动</label>
                    <span>{eyeContact}%</span>
                  </div>
                  <Slider value={[eyeContact]} onValueChange={v => setEyeContact(v[0])} max={100} />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>
        
        <TabsContent value="expressions" className="space-y-3">
          <Collapsible open={isExpressionOpen} onOpenChange={setIsExpressionOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span>表情选择</span>
                <span className="text-xs text-muted-foreground">
                  {isExpressionOpen ? '收起' : '展开'}
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {expressions.map(expression => <Button key={expression.id} variant={selectedExpression === expression.id ? "default" : "outline"} size="sm" className="flex items-center gap-1" onClick={() => handleExpressionSelect(expression)}>
                    <expression.icon className="w-3 h-3" />
                    {expression.name}
                  </Button>)}
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span>表情细节</span>
                <span className="text-xs text-muted-foreground">展开</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-3 pt-3 border-t">
                <div>
                  <div className="flex justify-between text-sm">
                    <label>表情强度</label>
                    <span>75%</span>
                  </div>
                  <Slider defaultValue={[75]} max={100} />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <label>微表情</label>
                    <span>开启</span>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>
      </Tabs>
    </div>;
}