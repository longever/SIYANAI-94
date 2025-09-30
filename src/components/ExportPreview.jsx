// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
// @ts-ignore;
import { FileText, FileSpreadsheet, FileJson } from 'lucide-react';

export function ExportPreview({
  format,
  fields,
  settings
}) {
  const mockData = [{
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138000',
    department: '技术部',
    position: '工程师',
    salary: 15000,
    joinDate: '2023-01-15',
    status: '在职',
    address: '北京市朝阳区',
    notes: '优秀员工'
  }, {
    name: '李四',
    email: 'lisi@example.com',
    phone: '13900139000',
    department: '销售部',
    position: '经理',
    salary: 20000,
    joinDate: '2022-03-20',
    status: '在职',
    address: '上海市浦东新区',
    notes: '业绩突出'
  }, {
    name: '王五',
    email: 'wangwu@example.com',
    phone: '13700137000',
    department: '人事部',
    position: '专员',
    salary: 12000,
    joinDate: '2023-06-10',
    status: '在职',
    address: '广州市天河区',
    notes: '工作认真'
  }];
  const getFormatIcon = () => {
    switch (format) {
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5" />;
      case 'csv':
        return <FileJson className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };
  const getFormatName = () => {
    switch (format) {
      case 'pdf':
        return 'PDF 文档';
      case 'excel':
        return 'Excel 表格';
      case 'csv':
        return 'CSV 文件';
      default:
        return '文档';
    }
  };
  return <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getFormatIcon()}
            预览 - {getFormatName()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            {settings.includeHeader && <div className="bg-gray-50 p-4 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">员工信息报表</h3>
                    <p className="text-sm text-muted-foreground">生成时间: {new Date().toLocaleString()}</p>
                  </div>
                  {settings.watermark && <Badge variant="outline" className="opacity-50">{settings.watermark}</Badge>}
                </div>
              </div>}

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {fields.map(field => <TableHead key={field.id} className="font-medium">
                        {field.label}
                      </TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockData.map((row, index) => <TableRow key={index}>
                      {fields.map(field => <TableCell key={field.id} className="text-sm">
                          {field.type === 'number' && settings.currencyFormat === 'CNY' ? `¥${row[field.id]?.toLocaleString()}` : field.type === 'date' ? new Date(row[field.id]).toLocaleDateString() : row[field.id] || '-'}
                        </TableCell>)}
                    </TableRow>)}
                </TableBody>
              </Table>
            </div>

            {settings.includeFooter && <div className="bg-gray-50 p-3 border-t text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>共 {mockData.length} 条记录</span>
                  <span>导出设置: {settings.pageSize} | {settings.orientation}</span>
                </div>
              </div>}
          </div>

          {format === 'pdf' && settings.quality === 'high' && <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                高质量 PDF 将包含图表和详细格式
              </p>
            </div>}
        </CardContent>
      </Card>
    </div>;
}