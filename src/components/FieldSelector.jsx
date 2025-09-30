// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Button, Checkbox, Label } from '@/components/ui';
// @ts-ignore;
import { Search, CheckSquare, Square } from 'lucide-react';

export function FieldSelector({
  fields,
  selectedFields,
  onFieldToggle,
  onSelectAll
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredFields = fields.filter(field => field.label.toLowerCase().includes(searchTerm.toLowerCase()) || field.id.toLowerCase().includes(searchTerm.toLowerCase()));
  const allSelected = selectedFields.length === fields.length;
  const someSelected = selectedFields.length > 0 && selectedFields.length < fields.length;
  return <Card>
      <CardHeader>
        <CardTitle className="text-lg">选择导出字段</CardTitle>
        <CardDescription>选择要包含在导出文件中的字段</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder="搜索字段..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>

        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onSelectAll} className="text-sm">
            {allSelected ? <>
                <CheckSquare className="w-4 h-4 mr-2" />
                取消全选
              </> : <>
                <Square className="w-4 h-4 mr-2" />
                全选
              </>}
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedFields.length} / {fields.length} 已选择
          </span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredFields.map(field => <div key={field.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent/50">
              <Checkbox id={field.id} checked={selectedFields.includes(field.id)} onCheckedChange={() => onFieldToggle(field.id)} disabled={field.required} />
              <Label htmlFor={field.id} className={`flex-1 cursor-pointer ${field.required ? 'font-medium' : ''}`}>
                <div className="flex items-center justify-between">
                  <span>{field.label}</span>
                  {field.required && <span className="text-xs text-muted-foreground">必填</span>}
                </div>
                <span className="text-xs text-muted-foreground">{field.type}</span>
              </Label>
            </div>)}
        </div>

        {filteredFields.length === 0 && <div className="text-center py-8 text-muted-foreground">
            没有找到匹配的字段
          </div>}
      </CardContent>
    </Card>;
}