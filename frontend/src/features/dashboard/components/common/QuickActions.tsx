import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'orange' | 'teal';
  isEnabled?: boolean;
  badge?: string | number;
  priority?: 'high' | 'medium' | 'low';
  shortcut?: string;
  isNew?: boolean;
  category?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: 'default' | 'compact' | 'detailed';
  showCategories?: boolean;
  className?: string;
}

// Empty state component
function EmptyQuickActions({ title }: { title: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon icon="solar:widget-bold" className="size-5 text-primary" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <Icon icon="solar:widget-2-bold" className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Actions Available</h3>
          <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Quick actions will appear here based on your role and permissions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickActions({
  actions,
  title = 'Quick Actions',
  columns = 3,
  variant = 'default',
  showCategories = false,
  className
}: QuickActionsProps) {
  const getGridCols = () => {
    const colsMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
      6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6'
    };
    return colsMap[columns] || colsMap[3];
  };

  const getColorClasses = (color?: string) => {
    const colors = {
      primary: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15',
      success: 'bg-success/10 text-success border-success/20 hover:bg-success/15',
      warning: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/15',
      error: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15',
      info: 'bg-info/10 text-info border-info/20 hover:bg-info/15',
      purple: 'bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/15',
      orange: 'bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/15',
      teal: 'bg-teal-500/10 text-teal-600 border-teal-500/20 hover:bg-teal-500/15'
    };
    return colors[color as keyof typeof colors] || colors.primary;
  };

  const getPriorityIndicator = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-l-destructive';
      case 'medium':
        return 'border-l-4 border-l-warning';
      default:
        return '';
    }
  };

  const enabledActions = actions.filter(action => action.isEnabled !== false);

  if (enabledActions.length === 0) {
    return <EmptyQuickActions title={title} />;
  }

  // Group actions by category if showCategories is true
  const groupedActions = showCategories 
    ? enabledActions.reduce((acc, action) => {
        const category = action.category || 'General';
        if (!acc[category]) acc[category] = [];
        acc[category].push(action);
        return acc;
      }, {} as Record<string, QuickAction[]>)
    : { '': enabledActions };

  const renderActionCard = (action: QuickAction) => {
    const isCompact = variant === 'compact';
    const isDetailed = variant === 'detailed';

    return (
      <Card
        key={action.id}
        className={cn(
          "group relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 ease-out",
          "cursor-pointer active:scale-[0.97] hover:scale-[1.02]",
          "bg-gradient-to-br from-card to-card/50",
          getPriorityIndicator(action.priority)
        )}
        onClick={action.action}
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-muted/5" />
        
        {/* New badge */}
        {action.isNew && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5">
              New
            </Badge>
          </div>
        )}

        <CardContent className={cn(
          "relative p-4",
          isCompact && "p-3",
          isDetailed && "p-6"
        )}>
          <div className={cn(
            "flex gap-3",
            isCompact ? "items-center" : "items-start",
            isDetailed && "flex-col items-start gap-4"
          )}>
            {/* Icon container */}
            <div className={cn(
              "relative rounded-xl border transition-all duration-300 group-hover:scale-110",
              getColorClasses(action.color),
              isCompact ? "p-2" : "p-3",
              isDetailed && "p-4 self-center"
            )}>
              <Icon 
                icon={action.icon} 
                className={cn(
                  "transition-transform duration-300 group-hover:rotate-6",
                  isCompact ? "size-4" : "size-5",
                  isDetailed && "size-6"
                )} 
              />
            </div>
            
            <div className={cn(
              "flex-1 min-w-0",
              isDetailed && "text-center"
            )}>
              {/* Title and badge row */}
              <div className={cn(
                "flex items-start gap-2 mb-1",
                isDetailed && "flex-col items-center gap-1"
              )}>
                <h3 className={cn(
                  "font-semibold text-foreground leading-tight transition-colors duration-200",
                  isCompact ? "text-sm" : "text-sm",
                  isDetailed && "text-base text-center"
                )}>
                  {action.title}
                </h3>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {action.badge && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-2 py-0.5 bg-background/50 text-muted-foreground"
                    >
                      {action.badge}
                    </Badge>
                  )}
                  {action.shortcut && !isCompact && (
                    <Badge 
                      variant="outline" 
                      className="text-xs px-2 py-0.5 font-mono bg-background/50"
                    >
                      {action.shortcut}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Description */}
              {!isCompact && (
                <p className={cn(
                  "text-muted-foreground leading-relaxed",
                  isDetailed ? "text-sm text-center" : "text-xs"
                )}>
                  {action.description}
                </p>
              )}
              
              {/* Action arrow (visible on hover) */}
              <div className={cn(
                "flex items-center justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                isCompact && "hidden",
                isDetailed && "justify-center mt-3"
              )}>
                <Icon 
                  icon="solar:arrow-right-bold" 
                  className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className={cn("border-0 shadow-sm", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon icon="solar:widget-bold" className="size-5 text-primary" />
          </div>
          {title}
          <Badge variant="secondary" className="ml-2 bg-muted/50 text-muted-foreground">
            {enabledActions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {showCategories ? (
          <div className="space-y-8">
            {Object.entries(groupedActions).map(([category, categoryActions]) => (
              <div key={category}>
                {category && (
                  <h4 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                    {category}
                  </h4>
                )}
                <div className={cn('grid gap-4', getGridCols())}>
                  {categoryActions.map(renderActionCard)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={cn('grid gap-4', getGridCols())}>
            {enabledActions.map(renderActionCard)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}