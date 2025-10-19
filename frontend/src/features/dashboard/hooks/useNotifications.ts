import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  Notification, 
  NotificationType, 
  NotificationPriority, 
  NotificationOptions,
  NotificationPreferences 
} from '../types/notifications';
import type { DashboardError } from '../types/dashboard';
import { notificationService } from '../services/notificationService';
import { useAuth } from '@/shared/contexts/AuthContext';

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: DashboardError | null;
  preferences: NotificationPreferences | null;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  deleteMultiple: (notificationIds: number[]) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  filterByType: (type: NotificationType | null) => void;
  filterByPriority: (priority: NotificationPriority | null) => void;
  clearError: () => void;
}

/**
 * Custom hook for managing notifications
 * Provides notification state management, preferences handling, and real-time updates
 */
export const useNotifications = (initialOptions: NotificationOptions = {}): UseNotificationsReturn => {
  const { state: { user, isAuthenticated } } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<DashboardError | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [currentTypeFilter, setCurrentTypeFilter] = useState<NotificationType | null>(null);
  const [currentPriorityFilter, setCurrentPriorityFilter] = useState<NotificationPriority | null>(null);
  
  // Ref to store WebSocket unsubscribe function
  const unsubscribeRef = useRef<(() => void) | null>(null);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Fetch notifications with current filters
   */
  const fetchNotifications = useCallback(async () => {
    if (!user || !isAuthenticated) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const options: NotificationOptions = {
        ...initialOptions,
        type: currentTypeFilter || undefined,
        priority: currentPriorityFilter || undefined
      };

      const [notificationsData, unreadCountData] = await Promise.all([
        notificationService.getNotifications(user.id, options),
        notificationService.getUnreadCount(user.id)
      ]);

      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err as DashboardError);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, initialOptions, currentTypeFilter, currentPriorityFilter]);

  /**
   * Fetch notification preferences
   */
  const fetchPreferences = useCallback(async () => {
    if (!user || !isAuthenticated) {
      return;
    }

    try {
      const preferencesData = await notificationService.getNotificationPreferences(user.id);
      setPreferences(preferencesData);
    } catch (err) {
      console.error('Error fetching notification preferences:', err);
      // Don't set error for preferences fetch failure as it's not critical
    }
  }, [user, isAuthenticated]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId: number) => {
    if (!user || !isAuthenticated) {
      return;
    }

    setError(null);

    try {
      await notificationService.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err as DashboardError);
    }
  }, [user, isAuthenticated]);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    if (!user || !isAuthenticated) {
      return;
    }

    setError(null);

    try {
      await notificationService.markAllNotificationsAsRead(user.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(err as DashboardError);
    }
  }, [user, isAuthenticated]);

  /**
   * Delete a notification
   */
  const deleteNotification = useCallback(async (notificationId: number) => {
    if (!user || !isAuthenticated) {
      return;
    }

    setError(null);

    try {
      await notificationService.deleteNotification(notificationId);
      
      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
      
      // Update unread count if deleted notification was unread
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError(err as DashboardError);
    }
  }, [user, isAuthenticated, notifications]);

  /**
   * Delete multiple notifications
   */
  const deleteMultiple = useCallback(async (notificationIds: number[]) => {
    if (!user || !isAuthenticated) {
      return;
    }

    setError(null);

    try {
      await notificationService.deleteNotifications(notificationIds);
      
      // Count unread notifications being deleted
      const unreadBeingDeleted = notifications.filter(
        n => notificationIds.includes(n.id) && !n.isRead
      ).length;
      
      // Update local state
      setNotifications(prev => 
        prev.filter(notification => !notificationIds.includes(notification.id))
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - unreadBeingDeleted));
    } catch (err) {
      console.error('Error deleting notifications:', err);
      setError(err as DashboardError);
    }
  }, [user, isAuthenticated, notifications]);

  /**
   * Refresh notifications
   */
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  /**
   * Update notification preferences
   */
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    if (!user || !isAuthenticated) {
      return;
    }

    setError(null);

    try {
      const updatedPreferences = await notificationService.updateNotificationPreferences(
        user.id,
        newPreferences
      );
      setPreferences(updatedPreferences);
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      setError(err as DashboardError);
      throw err; // Re-throw to allow component to handle the error
    }
  }, [user, isAuthenticated]);

  /**
   * Filter notifications by type
   */
  const filterByType = useCallback((type: NotificationType | null) => {
    setCurrentTypeFilter(type);
  }, []);

  /**
   * Filter notifications by priority
   */
  const filterByPriority = useCallback((priority: NotificationPriority | null) => {
    setCurrentPriorityFilter(priority);
  }, []);

  /**
   * Handle new notification from real-time updates
   */
  const handleNewNotification = useCallback((newNotification: Notification) => {
    setNotifications(prev => [newNotification, ...prev]);
    
    if (!newNotification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  /**
   * Set up real-time notification updates
   */
  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    // Subscribe to real-time notifications
    const unsubscribe = notificationService.subscribeToNotifications(
      user.id,
      handleNewNotification
    );
    
    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isAuthenticated, user, handleNewNotification]);

  /**
   * Initial data fetch on mount and when dependencies change
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
      fetchPreferences();
    } else {
      // Clear data when user logs out
      setNotifications([]);
      setUnreadCount(0);
      setPreferences(null);
      setError(null);
    }
  }, [isAuthenticated, user, currentTypeFilter, currentPriorityFilter]); // Note: fetch functions not in deps to avoid infinite loop

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    preferences,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteMultiple,
    refreshNotifications,
    updatePreferences,
    filterByType,
    filterByPriority,
    clearError
  };
};

export default useNotifications;