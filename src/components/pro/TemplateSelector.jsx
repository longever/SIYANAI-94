// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardHeader, CardContent, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';

export function TemplateSelector({
  templates,
  selectedTemplate,
  onSelectTemplate
}) {
  return <Card>
      <CardHeader>
        <CardTitle className="text-sm">脚本模板</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedTemplate?._id} onValueChange={value => {
        const template = templates.find(t => t._id === value);
        if (template) onSelectTemplate(template);
      }}>
          <SelectTrigger>
            <SelectValue placeholder="选择模板" />
          </SelectTrigger>
          <SelectContent>
            {templates.map(template => <SelectItem key={template._id} value={template._id}>
                {template.name}
              </SelectItem>)}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>;
}