// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Tabs, TabsContent, TabsList, TabsTrigger, Label, Switch, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Separator, Badge } from '@/components/ui';
// @ts-ignore;
import { Download, Settings, Eye, Save, RotateCcw } from 'lucide-react';

import { ExportPreview } from './ExportPreview';
import { FieldSelector } from './FieldSelector';
import { FormatSettings } from './FormatSettings';
export function ExportSettings() {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [selectedFields, setSelectedFields] = useState([]);
  const [settings, setSettings] = useState({
    includeHeader: true,
    includeFooter: true,
    pageSize: 'A4',
    orientation: 'portrait',
    dateFormat: 'YYYY-MM-DD',
    currencyFormat: 'CNY',
    decimalPlaces: 2,
    includeCharts: false,
    watermark: '',
    password: '',
    quality: 'high'
  });
  const availableFields = [{
    id: 'name',
    label: '姓名',
    type: 'text',
    required: true
  }, {
    id: 'email',
    label: '邮箱',
    type: 'text',
    required: true
  }, {
    id: 'phone',
    label: '电话',
    type: 'text'
  }, {
    id: 'department',
    label: '部门',
    type: 'text'
  }, {
    id: 'position',
    label: '职位',
    type: 'text'
  }, {
    id: 'salary',
    label: '薪资',
    type: 'number'
  }, {
    id: 'joinDate',
    label: '入职日期',
    type: 'date'
  }, {
    id: 'status',
    label: '状态',
    type: 'text'
  }, {
    id: 'address',
    label: '地址',
    type: 'text'
  }, {
    id: 'notes',
    label: '备注',
    type: 'text'
  }];
  useEffect(() => {
    // 默认选择所有必填字段
    const requiredFields = availableFields.filter(f => f.required).map(f => f.id);
    setSelectedFields(requiredFields);
  }, []);
  const handleFieldToggle = fieldId => {
    setSelectedFields(prev => prev.includes(fieldId) ? prev.filter(id => id !== fieldId) : [...prev, fieldId]);
  };
  const handleSelectAll = () => {
    if (selectedFields.length === availableFields.length) {
      setSelectedFields(availableFields.filter(f => f.required).map(f => f.id));
    } else {
      setSelectedFields(availableFields.map(f => f.id));
    }
  };
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  const handleReset = () => {
    const requiredFields = availableFields.filter(f => f.required).map(f => f.id);
    setSelectedFields(requiredFields);
    setSettings({
      includeHeader: true,
      includeFooter: true,
      pageSize: 'A4',
      orientation: 'portrait',
      dateFormat: 'YYYY-MM-DD',
      currencyFormat: 'CNY',
      decimalPlaces: 2,
      includeCharts: false,
      watermark: '',
      password: '',
      quality: 'high'
    });
  };
  const handleExport = () => {
    console.log('Exporting with settings:', {
      format: exportFormat,
      fields: selectedFields,
      settings
    });
    // 实际导出逻辑
  };
  const handleSaveTemplate = () => {
    console.log('Saving template:', {
      format: exportFormat,
      fields: selectedFields,
      settings
    });
    // 保存模板逻辑
  };
  return <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">导出设置</h1>
          <p className="text-muted-foreground mt-1">配置您的数据导出格式和选项</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            重置
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveTemplate}>
            <Save className="w-4 h-4 mr-2" />
            保存模板
          </Button>
          <Button size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
        </div>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            设置
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            预览
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <FormatSettings format={exportFormat} onFormatChange={setExportFormat} settings={settings} onSettingChange={handleSettingChange} />

              <FieldSelector fields={availableFields} selectedFields={selectedFields} onFieldToggle={handleFieldToggle} onSelectAll={handleSelectAll} />
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">导出信息</CardTitle>
                  <CardDescription>当前配置摘要</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">格式:</span>
                      <Badge variant="secondary" className="uppercase">{exportFormat}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">字段数:</span>
                      <span>{selectedFields.length} / {availableFields.length}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">已选字段</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedFields.map(fieldId => {
                      const field = availableFields.find(f => f.id === fieldId);
                      return field ? <Badge key={fieldId} variant="outline" className="text-xs">
                            {field.label}
                          </Badge> : null;
                    })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <ExportPreview format={exportFormat} fields={availableFields.filter(f => selectedFields.includes(f.id))} settings={settings} />
        </TabsContent>
      </Tabs>
    </div>;
}