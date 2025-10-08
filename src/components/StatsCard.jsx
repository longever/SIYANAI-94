// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

const StatsCard = ({
  title,
  value,
  color = 'purple'
}) => {
  const colorClasses = {
    purple: 'text-purple-400',
    green: 'text-green-400',
    blue: 'text-blue-400',
    red: 'text-red-400'
  };
  return <Card className="bg-gray-800/50 border-purple-800/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</div>
      </CardContent>
    </Card>;
};
export default StatsCard;