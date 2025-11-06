import { useState, useEffect, useCallback } from 'react';
import type { 
  UserStats, 
  StatsHistory, 
  TimePeriod, 
  StatsTrend,
  RoleStats 
} from '../types/stats';
import type { DashboardError } from '../types/dashboard';
import { userStatsService } from '../services/userStatsService';
import { useAuth } from '@/shared/contexts/AuthContext';

export interface UseUserStatsReturn {
  stats: UserStats | null;
  isLoading: boolean;
  error: DashboardError | null;
  refreshStats: () => Promise<void>;
  getStatsByPeriod: (period: TimePeriod) => Promise<StatsHistory>;
  getStatsTrends: (periods?: TimePeriod[]) => Promise<StatsTrend[]>;
  clearError: () => void;
}

/**
 * Custom hook for managing user statistics
 * Provides user stats fetching, calculation, caching, and history functionality
 */
export const useUserStats = (): UseUserStatsReturn => {
  const { state: { user, isAuthenticated } } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<DashboardError | null>(null);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Fetch user statistics
   */
  const fetchUserStats = useCallback(async () => {
    if (!user || !isAuthenticated) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userStats = await userStatsService.getUserStats(user.id, user.role);
      setStats(userStats);
    } catch (err) {
      console.error('Error fetching user stats:', err);
      setError(err as DashboardError);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  /**
   * Refresh user statistics
   */
  const refreshStats = useCallback(async () => {
    if (!user || !isAuthenticated) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const refreshedStats = await userStatsService.refreshStats(user.id, user.role);
      setStats(refreshedStats);
    } catch (err) {
      console.error('Error refreshing user stats:', err);
      setError(err as DashboardError);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  /**
   * Get statistics for a specific period
   */
  const getStatsByPeriod = useCallback(async (period: TimePeriod): Promise<StatsHistory> => {
    if (!user || !isAuthenticated) {
      throw new Error('User not authenticated');
    }

    setError(null);

    try {
      return await userStatsService.getStatsHistory(user.id, period, user.role);
    } catch (err) {
      console.error('Error fetching stats by period:', err);
      const error = err as DashboardError;
      setError(error);
      throw error;
    }
  }, [user, isAuthenticated]);

  /**
   * Get statistics trends for comparison
   */
  const getStatsTrends = useCallback(async (periods: TimePeriod[] = ['week', 'month']): Promise<StatsTrend[]> => {
    if (!user || !isAuthenticated) {
      throw new Error('User not authenticated');
    }

    setError(null);

    try {
      return await userStatsService.getStatsTrends(user.id, user.role, periods);
    } catch (err) {
      console.error('Error fetching stats trends:', err);
      const error = err as DashboardError;
      setError(error);
      throw error;
    }
  }, [user, isAuthenticated]);

  /**
   * Initial stats fetch on mount and when user changes
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserStats();
    } else {
      // Clear stats when user logs out
      setStats(null);
      setError(null);
    }
  }, [fetchUserStats, isAuthenticated, user]);

  return {
    stats,
    isLoading,
    error,
    refreshStats,
    getStatsByPeriod,
    getStatsTrends,
    clearError
  };
};

export default useUserStats;