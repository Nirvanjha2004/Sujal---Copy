import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/components/ui/card';

interface BuyerStatsCardProps {
  stat: {
    title: string;
    value: number;
    icon: string;
    color: string;
    subtitle: string;
  };
}

export function BuyerStatsCard({ stat }: BuyerStatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 ${stat.color} rounded-full`}>
            <Icon icon={stat.icon} className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            <p className="text-sm font-medium">{stat.title}</p>
            <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}