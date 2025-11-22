import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  total?: number;
  icon: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
    period: string;
  };
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

// Loading skeleton component
function StatsCardSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <Card className="animate-pulse">
      <CardContent className={sizeClasses[size]}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-muted rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-8 bg-muted rounded w-24" />
            <div className="h-4 bg-muted rounded w-32" />
            <div className="flex items-center justify-between">
              <div className="h-3 bg-muted rounded w-20" />
              <div className="h-3 bg-muted rounded w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCard({
  title,
  value,
  total,
  icon,
  color = 'primary',
  subtitle,
  trend,
  size = 'md',
  loading = false,
  className,
  onClick
}: StatsCardProps) {
  if (loading) {
    return <StatsCardSkeleton size={size} />;
  }

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
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'bg-primary/10 text-primary';
      case 'success':
        return 'bg-success/10 text-success';
      case 'warning':
        return 'bg-warning/10 text-warning';
      case 'error':
        return 'bg-destructive/10 text-destructive';
      case 'info':
        return 'bg-info/10 text-info';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          card: 'p-4',
          icon: 'p-2 size-8',
          iconSize: 'size-4',
          value: 'text-xl',
          title: 'text-xs',
          subtitle: 'text-xs',
          trend: 'text-xs'
        };
      case 'lg':
        return {
          card: 'p-8',
          icon: 'p-4 size-16',
          iconSize: 'size-8',
          value: 'text-4xl',
          title: 'text-base',
          subtitle: 'text-sm',
          trend: 'text-sm'
        };
      default:
        return {
          card: 'p-6',
          icon: 'p-3 size-12',
          iconSize: 'size-6',
          value: 'text-2xl',
          title: 'text-sm',
          subtitle: 'text-xs',
          trend: 'text-xs'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 ease-out h-full",
        "bg-gradient-to-br from-card to-card/50",
        onClick && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-muted/5" />
      
      <CardContent className={cn(sizeClasses.card, "h-full flex flex-col justify-between")}>
        <div className="relative flex items-start gap-4 flex-1">
          {/* Enhanced icon container with animation */}
          <div className={cn(
            "rounded-xl transition-all duration-300 group-hover:scale-110",
            getColorClasses(),
            sizeClasses.icon
          )}>
            <Icon 
              icon={icon} 
              className={cn(
                "transition-transform duration-300 group-hover:rotate-6",
                sizeClasses.iconSize
              )} 
            />
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Value with enhanced typography */}
            <div className="flex items-baseline gap-2 mb-1">
              <p className={cn(
                "font-bold text-foreground transition-colors duration-200",
                sizeClasses.value
              )}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {total && (
                <span className={cn(
                  "text-muted-foreground font-medium",
                  size === 'sm' ? 'text-xs' : 'text-sm'
                )}>
                  / {total.toLocaleString()}
                </span>
              )}
            </div>
            
            {/* Title with better spacing */}
            <p className={cn(
              "font-semibold text-foreground mb-2",
              sizeClasses.title
            )}>
              {title}
            </p>
            
            {/* Bottom section with subtitle and trend */}
            <div className="flex items-center justify-between">
              {subtitle && (
                <p className={cn(
                  "text-muted-foreground font-medium",
                  sizeClasses.subtitle
                )}>
                  {subtitle}
                </p>
              )}
              
              {trend && (
                <div className={cn(
                  "flex items-center gap-1 font-medium transition-all duration-300",
                  "px-2 py-1 rounded-full bg-background/50",
                  getTrendColor(),
                  sizeClasses.trend
                )}>
                  <Icon 
                    icon={getTrendIcon()} 
                    className={cn(
                      "transition-transform duration-300",
                      trend.direction === 'up' && "animate-bounce",
                      size === 'sm' ? 'size-3' : 'size-4'
                    )} 
                  />
                  <span className="font-semibold">
                    {Math.abs(trend.value)}%
                  </span>
                  <span className="opacity-75">
                    {trend.period}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}