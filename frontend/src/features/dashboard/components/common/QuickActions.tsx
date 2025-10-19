import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/shared/lib/utils';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  color: string;
  isEnabled?: boolean;
  badge?: string | number;
  priority?: 'high' | 'medium' | 'low';
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function QuickActions({
  actions,
  title = 'Quick Actions',
  columns = 3,
  className
}: QuickActionsProps) {
  const getGridCols = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  const getPriorityRing = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'ring-2 ring-red-200 ring-offset-2';
      case 'medium':
        return 'ring-2 ring-yellow-200 ring-offset-2';
      default:
        return '';
    }
  };

  const enabledActions = actions.filter(action => action.isEnabled !== false);

  if (enabledActions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:widget-bold" className="size-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Icon icon="solar:widget-2-bold" className="size-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Actions Available</h3>
            <p className="text-gray-600">
              Quick actions will appear here based on your role and permissions.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon icon="solar:widget-bold" className="size-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn('grid gap-4', getGridCols())}>
          {enabledActions.map((action) => (
            <Card
              key={action.id}
              className={cn(
                'cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105',
                getPriorityRing(action.priority)
              )}
              onClick={action.action}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn('p-3 rounded-full', action.color)}>
                    <Icon icon={action.icon} className="size-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm leading-tight">
                        {action.title}
                      </h3>
                      {action.badge && (
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}