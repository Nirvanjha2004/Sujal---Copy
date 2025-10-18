import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/components/ui/card';

interface QuickActionCardProps {
  action: {
    title: string;
    description: string;
    icon: string;
    action: () => void;
    color: string;
  };
}

export function QuickActionCard({ action }: QuickActionCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardContent className="p-6" onClick={action.action}>
        <div className="flex items-start gap-4">
          <div className={`p-3 ${action.color} rounded-full`}>
            <Icon icon={action.icon} className="size-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">{action.title}</h3>
            <p className="text-sm text-muted-foreground">{action.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}