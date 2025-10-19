import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
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
    switch (type) {
      case 'login':
        return 'solar:login-3-bold';
      case 'profile_update':
        return 'solar:user-bold';
      case 'property_view':
        return 'solar:eye-bold';
      case 'favorite_add':
        return 'solar:heart-bold';
      case 'search_save':
        return 'solar:bookmark-bold';
      case 'message_send':
        return 'solar:letter-bold';
      case 'property_create':
        return 'solar:home-add-bold';
      case 'lead_contact':
        return 'solar:phone-bold';
      case 'inquiry_received':
        return 'solar:chat-round-dots-bold';
      case 'document_upload':
        return 'solar:document-add-bold';
      default:
        return 'solar:info-circle-bold';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'login':
        return 'text-green-600 bg-green-100';
      case 'profile_update':
        return 'text-blue-600 bg-blue-100';
      case 'property_view':
        return 'text-purple-600 bg-purple-100';
      case 'favorite_add':
        return 'text-red-600 bg-red-100';
      case 'search_save':
        return 'text-orange-600 bg-orange-100';
      case 'message_send':
        return 'text-indigo-600 bg-indigo-100';
      case 'property_create':
        return 'text-emerald-600 bg-emerald-100';
      case 'lead_contact':
        return 'text-cyan-600 bg-cyan-100';
      case 'inquiry_received':
        return 'text-yellow-600 bg-yellow-100';
      case 'document_upload':
        return 'text-teal-600 bg-teal-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority || priority === 'normal') return null;
    
    const variants = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge variant="secondary" className={variants[priority as keyof typeof variants]}>
        {priority}
      </Badge>
    );
  };

  const displayedActivities = showAll ? activities : activities.slice(0, maxItems);

  if (activities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:clock-circle-bold" className="size-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Icon icon="solar:inbox-bold" className="size-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
            <p className="text-gray-600">
              Your recent activities will appear here once you start using the platform.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:clock-circle-bold" className="size-5" />
            {title}
          </CardTitle>
          {activities.length > maxItems && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `View All (${activities.length})`}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {displayedActivities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  onActivityClick 
                    ? 'cursor-pointer hover:bg-gray-50' 
                    : ''
                } ${!activity.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
                onClick={() => onActivityClick?.(activity)}
              >
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  <Icon icon={getActivityIcon(activity.type)} className="size-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getPriorityBadge(activity.metadata?.priority)}
                      {!activity.isRead && (
                        <div className="size-2 bg-blue-600 rounded-full" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                    {activity.metadata?.actionUrl && (
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {showLoadMore && onLoadMore && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={onLoadMore}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icon icon="solar:loading-bold" className="size-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More Activities'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}