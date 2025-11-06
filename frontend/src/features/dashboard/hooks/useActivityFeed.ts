import { useState, useEffect, useCallback, useRef } from 'react';
import type { Activity, ActivityType, ActivityOptions } from '../types/activity';
import type { DashboardError } from '../types/dashboard';
import { activityService } from '../services/activityService';
import { useAuth } from '@/shared/contexts/AuthContext';

export interface UseActivityFeedReturn {
  activities: Activity[];
  isLoading: boolean;
  error: DashboardError | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  markAsRead: (activityId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  filterByType: (type: ActivityType | null) => void;
  clearError: () => void;
}

const DEFAULT_PAGE_SIZE = 20;

/**
 * Custom hook for managing activity feed
 * Provides activity loading, pagination, real-time updates, and filtering
 */
export const useActivityFeed = (initialOptions: ActivityOptions = {}): UseActivityFeedReturn => {
  const { state: { user, isAuthenticated } } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<DashboardError | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentFilter, setCurrentFilter] = useState<ActivityType | null>(null);
  
  // Use ref to track current offset for pagination
  const offsetRef = useRef(0);
  const isInitialLoadRef = useRef(true);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset pagination state
   */
  const resetPagination = useCallback(() => {
    offsetRef.current = 0;
    setHasMore(true);
    isInitialLoadRef.current = true;
  }, []);

  /**
   * Fetch activities with current options
   */
  const fetchActivities = useCallback(async (append: boolean = false) => {
    if (!user || !isAuthenticated) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const options: ActivityOptions = {
        ...initialOptions,
        limit: DEFAULT_PAGE_SIZE,
        offset: append ? offsetRef.current : 0,
        type: currentFilter || undefined
      };

      const newActivities = await activityService.getActivityFeed(user.id, options);
      
      if (append) {
        setActivities(prev => [...prev, ...newActivities]);
      } else {
        setActivities(newActivities);
        resetPagination();
      }

      // Update pagination state
      if (newActivities.length < DEFAULT_PAGE_SIZE) {
        setHasMore(false);
      } else {
        offsetRef.current += newActivities.length;
      }

      isInitialLoadRef.current = false;
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err as DashboardError);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, initialOptions, currentFilter, resetPagination]);

  /**
   * Load more activities (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) {
      return;
    }

    await fetchActivities(true);
  }, [hasMore, isLoading, fetchActivities]);

  /**
   * Refresh activity feed
   */
  const refreshFeed = useCallback(async () => {
    resetPagination();
    await fetchActivities(false);
  }, [fetchActivities, resetPagination]);

  /**
   * Mark activity as read
   */
  const markAsRead = useCallback(async (activityId: number) => {
    if (!user || !isAuthenticated) {
      return;
    }

    setError(null);

    try {
      await activityService.markActivityAsRead(activityId);
      
      // Update local state
      setActivities(prev => 
        prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, isRead: true }
            : activity
        )
      );
    } catch (err) {
      console.error('Error marking activity as read:', err);
      setError(err as DashboardError);
    }
  }, [user, isAuthenticated]);

  /**
   * Mark all activities as read
   */
  const markAllAsRead = useCallback(async () => {
    if (!user || !isAuthenticated) {
      return;
    }

    setError(null);

    try {
      const unreadActivityIds = activities
        .filter(activity => !activity.isRead)
        .map(activity => activity.id);

      if (unreadActivityIds.length === 0) {
        return;
      }

      await activityService.markActivitiesAsRead(unreadActivityIds);
      
      // Update local state
      setActivities(prev => 
        prev.map(activity => ({ ...activity, isRead: true }))
      );
    } catch (err) {
      console.error('Error marking all activities as read:', err);
      setError(err as DashboardError);
    }
  }, [user, isAuthenticated, activities]);

  /**
   * Filter activities by type
   */
  const filterByType = useCallback((type: ActivityType | null) => {
    setCurrentFilter(type);
    resetPagination();
  }, [resetPagination]);

  /**
   * Initial activities fetch on mount and when dependencies change
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchActivities(false);
    } else {
      // Clear activities when user logs out
      setActivities([]);
      setError(null);
      resetPagination();
    }
  }, [isAuthenticated, user, currentFilter]); // Note: fetchActivities is not in deps to avoid infinite loop

  /**
   * Set up real-time updates (WebSocket or polling)
   * This is a placeholder for real-time functionality
   */
  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    // TODO: Implement WebSocket connection for real-time activity updates
    // For now, we can implement polling as a fallback
    const pollInterval = setInterval(() => {
      // Only poll if we're not currently loading and it's not the initial load
      if (!isLoading && !isInitialLoadRef.current) {
        // Silently refresh to get new activities
        fetchActivities(false).catch(console.error);
      }
    }, 30000); // Poll every 30 seconds

    return () => {
      clearInterval(pollInterval);
    };
  }, [isAuthenticated, user, isLoading, fetchActivities]);

  return {
    activities,
    isLoading,
    error,
    hasMore,
    loadMore,
    refreshFeed,
    markAsRead,
    markAllAsRead,
    filterByType,
    clearError
  };
};

export default useActivityFeed;