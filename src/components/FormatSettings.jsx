// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Input, RadioGroup, RadioGroupItem, Separator } from '@/components/ui';

export function FormatSettings({
  format,
  onFormatChange,
  settings,
  onSettingChange
}) {
  const renderPDFSettings = () => <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>页面大小</Label>
          <Select value={settings.pageSize} onValueChange={v => onSettingChange('pageSize', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A4">A4</SelectItem>
              <SelectItem value="A3">A3</SelectItem>
              <SelectItem value="A5">A5</SelectItem>
              <SelectItem value="Letter">Letter</SelectItem>
              <SelectItem value="Legal">Legal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>方向</Label>
          <Select value={settings.orientation} onValueChange={v => onSettingChange('orientation', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="portrait">纵向</SelectItem>
              <SelectItem value="landscape">横向</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>质量</Label>
        <RadioGroup value={settings.quality} onValueChange={v => onSettingChange('quality', v)} className="grid grid-cols-3 gap-2">
          <div>
            <RadioGroupItem value="low" id="low" className="peer sr-only" />
            <Label htmlFor="low" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
              低质量
            </Label>
          </div>
          <div>
            <RadioGroupItem value="medium" id="medium" className="peer sr-only" />
            <Label htmlFor="medium" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
              中等质量
            </Label>
          </div>
          <div>
            <RadioGroupItem value="high" id="high" className="peer sr-only" />
            <Label htmlFor="high" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
              高质量
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="watermark">水印文字</Label>
        <Input id="watermark" placeholder="可选：添加水印文字" value={settings.watermark} onChange={e => onSettingChange('watermark', e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">密码保护</Label>
        <Input id="password" type="password" placeholder="可选：设置打开密码" value={settings.password} onChange={e => onSettingChange('password', e.target.value)} />
      </div>
    </div>;
  const renderExcelSettings = () => <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>日期格式</Label>
          <Select value={settings.dateFormat} onValueChange={v => onSettingChange('dateFormat', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="YYYY-MM-DD">2024-01-15</SelectItem>
              <SelectItem value="DD/MM/YYYY">15/01/2024</SelectItem>
              <SelectItem value="MM/DD/YYYY">01/15/2024</SelectItem>
              <SelectItem value="DD-MM-YYYY">15-01-2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>货币格式</Label>
          <Select value={settings.currencyFormat} onValueChange={v => onSettingChange('currencyFormat', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CNY">人民币 (¥)</SelectItem>
              <SelectItem value="USD">美元 ($)</SelectItem>
              <SelectItem value="EUR">欧元 (€)</SelectItem>
              <SelectItem value="GBP">英镑 (£)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>小数位数</Label>
        <Select value={settings.decimalPlaces.toString()} onValueChange={v => onSettingChange('decimalPlaces', parseInt(v))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">0 位</SelectItem>
            <SelectItem value="1">1 位</SelectItem>
            <SelectItem value="2">2 位</SelectItem>
            <SelectItem value="3">3 位</SelectItem>
            <SelectItem value="4">4 位</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="includeCharts">包含图表</Label>
          <Switch id="includeCharts" checked={settings.includeCharts} onCheckedChange={checked => onSettingChange('includeCharts', checked)} />
        </div>
      </div>
    </div>;
  const renderCSVSettings = () => <div className="space-y-4">
      <div className="space-y-2">
        <Label>分隔符</Label>
        <Select defaultValue=",">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=",">逗号 (,)</SelectItem>
            <SelectItem value=";">分号 (;)</SelectItem>
            <SelectItem value="\t">制表符</SelectItem>
            <SelectItem value="|">竖线 (|)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>字符编码</Label>
        <Select defaultValue="UTF-8">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UTF-8">UTF-8</SelectItem>
            <SelectItem value="GBK">GBK</SelectItem>
            <SelectItem value="GB2312">GB2312</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="includeHeaderRow">包含标题行</Label>
          <Switch id="includeHeaderRow" defaultChecked />
        </div>
      </div>
    </div>;
  return <Card>
      <CardHeader>
        <CardTitle className="text-lg">导出格式设置</CardTitle>
        <CardDescription>选择导出格式并配置相关选项</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>导出格式</Label>
          <Select value={format} onValueChange={onFormatChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF 文档</SelectItem>
              <SelectItem value="excel">Excel 表格</SelectItem>
              <SelectItem value="csv">CSV 文件</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="includeHeader">包含页眉</Label>
            <Switch id="includeHeader" checked={settings.includeHeader} onCheckedChange={checked => onSettingChange('includeHeader', checked)} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="includeFooter">包含页脚</Label>
            <Switch id="includeFooter" checked={settings.includeFooter} onCheckedChange={checked => onSettingChange('includeFooter', checked)} />
          </div>
        </div>

        <Separator />

        {format === 'pdf' && renderPDFSettings()}
        {format === 'excel' && renderExcelSettings()}
        {format === 'csv' && renderCSVSettings()}
      </CardContent>
    </Card>;
}