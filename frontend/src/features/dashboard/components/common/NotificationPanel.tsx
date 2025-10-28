import { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';
import { cn } from '@/shared/lib/utils';
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

  // Group notifications by date for better organization
  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: Notification[] } = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.createdAt);
      let groupKey: string;
      
      if (isToday(date)) {
        groupKey = 'Today';
      } else if (isYesterday(date)) {
        groupKey = 'Yesterday';
      } else {
        groupKey = format(date, 'MMM dd, yyyy');
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });
    
    return groups;
  }, [notifications]);

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

  const getNotificationColor = (type: string, priority: string, isRead: boolean) => {
    const baseColors = {
      info: isRead ? 'text-blue-500 bg-blue-50' : 'text-blue-600 bg-blue-100',
      warning: isRead ? 'text-amber-500 bg-amber-50' : 'text-amber-600 bg-amber-100',
      success: isRead ? 'text-emerald-500 bg-emerald-50' : 'text-emerald-600 bg-emerald-100',
      error: isRead ? 'text-red-500 bg-red-50' : 'text-red-600 bg-red-100',
      system: isRead ? 'text-purple-500 bg-purple-50' : 'text-purple-600 bg-purple-100',
      message: isRead ? 'text-indigo-500 bg-indigo-50' : 'text-indigo-600 bg-indigo-100',
      inquiry: isRead ? 'text-orange-500 bg-orange-50' : 'text-orange-600 bg-orange-100',
      property: isRead ? 'text-emerald-500 bg-emerald-50' : 'text-emerald-600 bg-emerald-100',
      user: isRead ? 'text-cyan-500 bg-cyan-50' : 'text-cyan-600 bg-cyan-100'
    };

    if (priority === 'urgent') {
      return isRead 
        ? 'text-red-500 bg-red-50 ring-1 ring-red-200' 
        : 'text-red-600 bg-red-100 ring-2 ring-red-300 shadow-sm';
    }

    return baseColors[type as keyof typeof baseColors] || (isRead ? 'text-gray-500 bg-gray-50' : 'text-gray-600 bg-gray-100');
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-amber-100 text-amber-800 border-amber-200',
      low: 'bg-gray-100 text-gray-600 border-gray-200'
    };

    if (priority === 'low') return null;

    return (
      <Badge 
        variant="outline" 
        className={cn(
          'text-xs font-medium border',
          variants[priority as keyof typeof variants]
        )}
      >
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
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
      <Card className={cn("shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50", className)}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-gray-900">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Icon icon="solar:bell-bold" className="size-5 text-gray-600" />
            </div>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full blur-xl opacity-30"></div>
              <div className="relative p-4 bg-white rounded-full shadow-sm border border-gray-100">
                <Icon icon="solar:bell-off-bold" className="size-8 text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600 text-sm max-w-sm mx-auto leading-relaxed">
              You have no new notifications. We'll let you know when something important happens.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-gray-900">
            <div className="relative">
              <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <Icon icon="solar:bell-bold" className="size-5 text-blue-600" />
              </div>
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </div>
            <div>
              <div className="font-semibold">{title}</div>
              {unreadCount > 0 && (
                <div className="text-xs text-gray-500 font-normal">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {notifications.length > maxItems && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="text-xs hover:bg-gray-100 transition-colors"
              >
                {showAll ? (
                  <>
                    <Icon icon="solar:eye-closed-bold" className="size-3 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <Icon icon="solar:eye-bold" className="size-3 mr-1" />
                    View All ({notifications.length})
                  </>
                )}
              </Button>
            )}
            
            {showMarkAllRead && unreadCount > 0 && onMarkAllAsRead && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onMarkAllAsRead}
                className="text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <Icon icon="solar:check-read-bold" className="size-3 mr-1" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ScrollArea className="h-96">
          <div className="space-y-1">
            {Object.entries(groupedNotifications).map(([dateGroup, groupNotifications]) => {
              const visibleNotifications = showAll 
                ? groupNotifications 
                : groupNotifications.slice(0, maxItems);
              
              return (
                <div key={dateGroup} className="space-y-1">
                  <div className="sticky top-0 bg-gray-50/80 backdrop-blur-sm px-3 py-2 rounded-md mb-2">
                    <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      {dateGroup}
                    </h4>
                  </div>
                  
                  {visibleNotifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "group relative flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ease-out",
                        onNotificationClick && "cursor-pointer",
                        !notification.isRead 
                          ? "bg-gradient-to-r from-blue-50/50 to-white border-blue-200/60 hover:from-blue-50 hover:to-blue-25 hover:border-blue-300/60 hover:shadow-sm" 
                          : "bg-white border-gray-100 hover:bg-gray-50/50 hover:border-gray-200",
                        "hover:scale-[1.01] hover:-translate-y-0.5"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {/* Notification Icon */}
                      <div className={cn(
                        "relative p-2.5 rounded-xl transition-all duration-200",
                        getNotificationColor(notification.type, notification.priority, notification.isRead)
                      )}>
                        <Icon 
                          icon={getNotificationIcon(notification.type)} 
                          className="size-4" 
                        />
                        {notification.priority === 'urgent' && (
                          <div className="absolute -top-1 -right-1 size-3 bg-red-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      
                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "font-medium text-sm leading-snug",
                              !notification.isRead ? "text-gray-900" : "text-gray-700"
                            )}>
                              {notification.title}
                            </p>
                            <p className={cn(
                              "text-sm mt-1 leading-relaxed",
                              !notification.isRead ? "text-gray-600" : "text-gray-500"
                            )}>
                              {notification.message}
                            </p>
                          </div>
                          
                          {/* Status Indicators */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {getPriorityBadge(notification.priority)}
                            {!notification.isRead && (
                              <div className="size-2.5 bg-blue-500 rounded-full shadow-sm animate-pulse" />
                            )}
                          </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-xs text-gray-500 font-medium">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                          {notification.actionUrl && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-3 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100 hover:text-blue-700"
                            >
                              <Icon icon="solar:arrow-right-bold" className="size-3 mr-1" />
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Unread Indicator Line */}
                      {!notification.isRead && (
                        <div className="absolute left-0 top-4 bottom-4 w-1 bg-gradient-to-b from-blue-500 to-blue-400 rounded-r-full" />
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </ScrollArea>
        
        {/* Footer Actions */}
        {onClearAll && notifications.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAll}
                disabled={isLoading}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                {isLoading ? (
                  <>
                    <Icon icon="solar:loading-bold" className="size-4 mr-2 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Icon icon="solar:trash-bin-minimalistic-bold" className="size-4 mr-2" />
                    Clear All Notifications
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}