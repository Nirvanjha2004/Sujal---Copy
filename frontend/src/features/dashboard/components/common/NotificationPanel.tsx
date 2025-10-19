import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '@/features/dashboard/types/notifications';

interface NotificationPanelProps {
  notifications: Notification[];
  title?: string;
  maxItems?: number;
  showMarkAllRead?: boolean;
  isLoading?: boolean;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: number) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
  className?: string;
}

export function NotificationPanel({
  notifications,
  title = 'Notifications',
  maxItems = 5,
  showMarkAllRead = true,
  isLoading = false,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  className
}: NotificationPanelProps) {
  const [showAll, setShowAll] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return 'solar:info-circle-bold';
      case 'warning':
        return 'solar:danger-triangle-bold';
      case 'success':
        return 'solar:check-circle-bold';
      case 'error':
        return 'solar:close-circle-bold';
      case 'system':
        return 'solar:settings-bold';
      case 'message':
        return 'solar:letter-bold';
      case 'inquiry':
        return 'solar:chat-round-dots-bold';
      case 'property':
        return 'solar:home-bold';
      case 'user':
        return 'solar:user-bold';
      default:
        return 'solar:bell-bold';
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    const baseColors = {
      info: 'text-blue-600 bg-blue-100',
      warning: 'text-yellow-600 bg-yellow-100',
      success: 'text-green-600 bg-green-100',
      error: 'text-red-600 bg-red-100',
      system: 'text-purple-600 bg-purple-100',
      message: 'text-indigo-600 bg-indigo-100',
      inquiry: 'text-orange-600 bg-orange-100',
      property: 'text-emerald-600 bg-emerald-100',
      user: 'text-cyan-600 bg-cyan-100'
    };

    if (priority === 'urgent') {
      return 'text-red-600 bg-red-100 ring-2 ring-red-200';
    }

    return baseColors[type as keyof typeof baseColors] || 'text-gray-600 bg-gray-100';
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800'
    };

    if (priority === 'low') return null;

    return (
      <Badge variant="secondary" className={variants[priority as keyof typeof variants]}>
        {priority}
      </Badge>
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const displayedNotifications = showAll ? notifications : notifications.slice(0, maxItems);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    onNotificationClick?.(notification);
  };

  if (notifications.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:bell-bold" className="size-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Icon icon="solar:bell-off-bold" className="size-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-600">
              You're all caught up! New notifications will appear here.
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
            <Icon icon="solar:bell-bold" className="size-5" />
            {title}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {notifications.length > maxItems && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Show Less' : `View All (${notifications.length})`}
              </Button>
            )}
            
            {showMarkAllRead && unreadCount > 0 && onMarkAllAsRead && (
              <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
                Mark All Read
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {displayedNotifications.map((notification, index) => (
              <div key={notification.id}>
                <div
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    onNotificationClick 
                      ? 'cursor-pointer hover:bg-gray-50' 
                      : ''
                  } ${!notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={`p-2 rounded-full ${getNotificationColor(notification.type, notification.priority)}`}>
                    <Icon icon={getNotificationIcon(notification.type)} className="size-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getPriorityBadge(notification.priority)}
                        {!notification.isRead && (
                          <div className="size-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                      {notification.actionUrl && (
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {index < displayedNotifications.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {onClearAll && notifications.length > 0 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icon icon="solar:loading-bold" className="size-4 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Icon icon="solar:trash-bin-minimalistic-bold" className="size-4 mr-2" />
                  Clear All
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}