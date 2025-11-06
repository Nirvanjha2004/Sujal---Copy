import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Icon } from '@iconify/react';

interface AgentAnalyticsChartProps {
  title: string;
  height?: string;
  iconSize?: string;
  className?: string;
}

const AgentAnalyticsChart = ({ 
  title, 
  height = 'h-64', 
  iconSize = 'size-12',
  className 
}: AgentAnalyticsChartProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`${height} flex items-center justify-center bg-gray-50 rounded-lg`}>
          <div className="text-center">
            <Icon icon="solar:chart-2-bold" className={`${iconSize} text-gray-400 mx-auto mb-2`} />
            <p className="text-gray-500">Chart visualization will be implemented</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentAnalyticsChart;