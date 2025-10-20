import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

interface StatsCardProps {
  title: string;
  value: number;
  total?: number;
  icon: string;
  color: string;
  subtitle: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
    period: string;
  };
  className?: string;
  onClick?: () => void;
}

export function StatsCard({
  title,
  value,
  total,
  icon,
  color,
  subtitle,
  trend,
  className,
  onClick
}: StatsCardProps) {
  const getTrendIcon = () => {
    switch (trend?.direction) {
      case 'up':
        return 'solar:arrow-up-bold';
      case 'down':
        return 'solar:arrow-down-bold';
      default:
        return 'solar:minus-bold';
    }
  };

  const getTrendColor = () => {
    switch (trend?.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-lg transition-shadow duration-200",
        onClick && "hover:bg-gray-50",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-full", color)}>
            <Icon icon={icon} className="size-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{value.toLocaleString()}</p>
              {total && (
                <span className="text-sm text-muted-foreground">
                  / {total.toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-sm font-medium">{title}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground">{subtitle}</p>
              {trend && (
                <div className={cn("flex items-center gap-1 text-xs", getTrendColor())}>
                  <Icon icon={getTrendIcon()} className="size-3" />
                  <span>{trend.value}% {trend.period}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}