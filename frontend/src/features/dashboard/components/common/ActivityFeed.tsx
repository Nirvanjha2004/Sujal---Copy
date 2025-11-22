import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/shared/lib/utils';
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek } from 'date-fns';
import type { Activity } from '@/features/dashboard/types/activity';

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
  maxItems?: number;
  showLoadMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
  onActivityClick?: (activity: Activity) => void;
  className?: string;
}

// Loading skeleton component
function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 p-4 animate-pulse">
          <div className="w-10 h-10 bg-muted rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
            <div className="h-3 bg-muted rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty state component
function EmptyActivityFeed({ title }: { title: string }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon icon="solar:clock-circle-bold" className="size-5 text-primary" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <Icon icon="solar:inbox-bold" className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Recent Activity</h3>
          <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Your recent activities will appear here once you start using the platform.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivityFeed({
  activities,
  title = 'Recent Activity',
  maxItems = 10,
  showLoadMore = false,
  isLoading = false,
  onLoadMore,
  onActivityClick,
  className
}: ActivityFeedProps) {
  const [showAll, setShowAll] = useState(false);

  const getActivityIcon = (type: string) => {
    const icons = {
      login: 'solar:login-3-bold',
      logout: 'solar:logout-3-bold',
      profile_update: 'solar:user-bold',
      property_view: 'solar:eye-bold',
      favorite_add: 'solar:heart-bold',
      favorite_remove: 'solar:heart-broken-bold',
      search_save: 'solar:bookmark-bold',
      message_send: 'solar:letter-bold',
      message_receive: 'solar:letter-unread-bold',
      property_create: 'solar:home-add-bold',
      property_update: 'solar:home-bold',
      property_delete: 'solar:home-minus-bold',
      lead_contact: 'solar:phone-bold',
      inquiry_received: 'solar:chat-round-dots-bold',
      inquiry_sent: 'solar:chat-round-line-bold',
      document_upload: 'solar:document-add-bold',
      document_download: 'solar:download-bold',
      payment_success: 'solar:card-bold',
      payment_failed: 'solar:card-2-bold',
      notification: 'solar:bell-bold',
      system: 'solar:settings-bold'
    };
    return icons[type as keyof typeof icons] || 'solar:info-circle-bold';
  };

  const getActivityConfig = (type: string) => {
    const configs = {
      login: { color: 'text-success bg-success/10 border-success/20', priority: 'low' },
      logout: { color: 'text-muted-foreground bg-muted/50 border-muted', priority: 'low' },
      profile_update: { color: 'text-primary bg-primary/10 border-primary/20', priority: 'medium' },
      property_view: { color: 'text-purple-600 bg-purple-500/10 border-purple-500/20', priority: 'low' },
      favorite_add: { color: 'text-red-600 bg-red-500/10 border-red-500/20', priority: 'medium' },
      favorite_remove: { color: 'text-red-400 bg-red-400/10 border-red-400/20', priority: 'low' },
      search_save: { color: 'text-orange-600 bg-orange-500/10 border-orange-500/20', priority: 'medium' },
      message_send: { color: 'text-blue-600 bg-blue-500/10 border-blue-500/20', priority: 'medium' },
      message_receive: { color: 'text-blue-700 bg-blue-600/10 border-blue-600/20', priority: 'high' },
      property_create: { color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20', priority: 'high' },
      property_update: { color: 'text-emerald-500 bg-emerald-400/10 border-emerald-400/20', priority: 'medium' },
      property_delete: { color: 'text-red-700 bg-red-600/10 border-red-600/20', priority: 'high' },
      lead_contact: { color: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/20', priority: 'high' },
      inquiry_received: { color: 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20', priority: 'high' },
      inquiry_sent: { color: 'text-yellow-500 bg-yellow-400/10 border-yellow-400/20', priority: 'medium' },
      document_upload: { color: 'text-teal-600 bg-teal-500/10 border-teal-500/20', priority: 'medium' },
      document_download: { color: 'text-teal-500 bg-teal-400/10 border-teal-400/20', priority: 'low' },
      payment_success: { color: 'text-green-600 bg-green-500/10 border-green-500/20', priority: 'high' },
      payment_failed: { color: 'text-destructive bg-destructive/10 border-destructive/20', priority: 'high' },
      notification: { color: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20', priority: 'medium' },
      system: { color: 'text-muted-foreground bg-muted/50 border-muted', priority: 'low' }
    };
    return configs[type as keyof typeof configs] || { color: 'text-muted-foreground bg-muted/50 border-muted', priority: 'low' };
  };

  const formatTimestamp = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE, h:mm a');
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  const getRelativeTime = (timestamp: string | Date) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const getPriorityIndicator = (priority: string) => {
    const indicators = {
      high: 'w-1 h-full bg-destructive rounded-full',
      medium: 'w-1 h-full bg-warning rounded-full',
      low: 'w-1 h-full bg-muted rounded-full'
    };
    return indicators[priority as keyof typeof indicators] || indicators.low;
  };

  const displayedActivities = showAll ? activities : activities.slice(0, maxItems);

  if (isLoading && activities.length === 0) {
    return (
      <Card className={cn("border-0 shadow-sm", className)}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon icon="solar:clock-circle-bold" className="size-5 text-primary" />
            </div>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivitySkeleton />
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return <EmptyActivityFeed title={title} />;
  }

  return (
    <Card className={cn("border-0 shadow-sm", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon icon="solar:clock-circle-bold" className="size-5 text-primary" />
            </div>
            {title}
            <Badge variant="secondary" className="ml-2 bg-muted/50 text-muted-foreground">
              {activities.length}
            </Badge>
          </CardTitle>
          {activities.length > maxItems && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showAll ? (
                <>
                  <Icon icon="solar:eye-closed-bold" className="size-4 mr-2" />
                  Show Less
                </>
              ) : (
                <>
                  <Icon icon="solar:eye-bold" className="size-4 mr-2" />
                  View All ({activities.length})
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-96 pr-4">
          <div className="space-y-1">
            {displayedActivities.map((activity, index) => {
              const config = getActivityConfig(activity.type);
              const isUnread = !activity.isRead;
              
              return (
                <div
                  key={activity.id}
                  className={cn(
                    "group relative flex items-start gap-4 p-4 rounded-xl transition-all duration-200",
                    "hover:bg-muted/30 hover:shadow-sm",
                    onActivityClick && "cursor-pointer active:scale-[0.98]",
                    isUnread && "bg-primary/5 border border-primary/10",
                    index !== displayedActivities.length - 1 && "border-b border-border/50"
                  )}
                  onClick={() => onActivityClick?.(activity)}
                >
                  {/* Priority indicator */}
                  <div className={getPriorityIndicator(config.priority)} />
                  
                  {/* Activity icon */}
                  <div className={cn(
                    "relative p-2.5 rounded-xl border transition-all duration-200 group-hover:scale-105",
                    config.color
                  )}>
                    <Icon 
                      icon={getActivityIcon(activity.type)} 
                      className="size-5" 
                    />
                    {isUnread && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-semibold text-sm leading-tight",
                          isUnread ? "text-foreground" : "text-foreground/90"
                        )}>
                          {activity.title}
                        </p>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                            {activity.description}
                          </p>
                        )}
                      </div>
                      
                      {activity.metadata?.actionUrl && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-3 text-xs"
                        >
                          <Icon icon="solar:arrow-right-bold" className="size-3 mr-1" />
                          View
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-medium">
                          {formatTimestamp(activity.timestamp)}
                        </span>
                        <span className="opacity-75">
                          {getRelativeTime(activity.timestamp)}
                        </span>
                      </div>
                      
                      {activity.metadata?.priority && activity.metadata.priority !== 'low' && (
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs px-2 py-0.5",
                            activity.metadata.priority === 'high' && "bg-destructive/10 text-destructive",
                            activity.metadata.priority === 'medium' && "bg-warning/10 text-warning"
                          )}
                        >
                          {activity.metadata.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        
        {showLoadMore && onLoadMore && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={onLoadMore}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Icon icon="solar:loading-bold" className="size-4 mr-2 animate-spin" />
                  Loading more activities...
                </>
              ) : (
                <>
                  <Icon icon="solar:refresh-bold" className="size-4 mr-2" />
                  Load More Activities
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}