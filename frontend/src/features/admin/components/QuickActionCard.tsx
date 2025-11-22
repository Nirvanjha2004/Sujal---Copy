import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
  count?: number;
}

interface QuickActionCardProps {
  action: QuickAction;
}

export function QuickActionCard({ action }: QuickActionCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={action.action}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${action.color}`}>
              <Icon icon={action.icon} className="size-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{action.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
            </div>
          </div>
          {action.count && (
            <Badge variant="secondary" className="text-xs">
              {action.count}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}