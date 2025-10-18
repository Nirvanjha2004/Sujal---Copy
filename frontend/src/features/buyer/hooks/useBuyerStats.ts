import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { buyerService } from '../services/buyerService';
import type { BuyerStats, BuyerActivity } from '../types/buyer';

interface UseBuyerStatsReturn {
  stats: BuyerStats | null;
  activity: BuyerActivity[];
  preferences: Record<string, any>;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  refreshStats: () => Promise<void>;
  refreshActivity: () => Promise<void>;
  refreshAll: () => Promise<void>;
  updatePreferences: (preferences: Record<string, any>) => Promise<void>;
  formatActivityTime: (timestamp: string) => string;
  getActivityIcon: (type: BuyerActivity['type']) => string;
}

export function useBuyerStats(): UseBuyerStatsReturn {
  const [stats, setStats] = useState<BuyerStats | null>(null);
  const [activity, setActivity] = useState<BuyerActivity[]>([]);
  const [preferences, setPreferences] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { state: authState } = useAuth();

  const fetchBuyerStats = useCallback(async () => {
    if (!authState.isAuthenticated) {
      setStats(null);
      setActivity([]);
      setPreferences({});
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const statsData = await buyerService.getBuyerStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching buyer stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch buyer statistics');
      setStats(null);
    }
  }, [authState.isAuthenticated]);

  const fetchBuyerActivity = useCallback(async () => {
    if (!authState.isAuthenticated) {
      return;
    }

    try {
      const activityData = await buyerService.getBuyerActivity(10);
      setActivity(activityData);
    } catch (err) {
      console.error('Error fetching buyer activity:', err);
      // Don't set error for activity as it's not critical
      setActivity([]);
    }
  }, [authState.isAuthenticated]);

  const fetchBuyerPreferences = useCallback(async () => {
    if (!authState.isAuthenticated) {
      return;
    }

    try {
      const preferencesData = await buyerService.getBuyerPreferences();
      setPreferences(preferencesData);
    } catch (err) {
      console.error('Error fetching buyer preferences:', err);
      // Don't set error for preferences as it's not critical
      setPreferences({});
    }
  }, [authState.isAuthenticated]);

  const fetchAllData = useCallback(async () => {
    if (!authState.isAuthenticated) {
      setStats(null);
      setActivity([]);
      setPreferences({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch dashboard data all at once for better performance
      const dashboardData = await buyerService.getBuyerDashboardData();
      
      setStats(dashboardData.stats);
      setActivity(dashboardData.activity);
      setPreferences(dashboardData.preferences);
    } catch (err) {
      console.error('Error fetching buyer dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch buyer data');
      
      // Try to fetch individual pieces if the combined call fails
      await Promise.allSettled([
        fetchBuyerStats(),
        fetchBuyerActivity(),
        fetchBuyerPreferences()
      ]);
    } finally {
      setLoading(false);
    }
  }, [authState.isAuthenticated, fetchBuyerStats, fetchBuyerActivity, fetchBuyerPreferences]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const refreshStats = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const statsData = await buyerService.refreshBuyerStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error refreshing buyer stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh buyer statistics');
    } finally {
      setRefreshing(false);
    }
  };

  const refreshActivity = async () => {
    try {
      setRefreshing(true);
      const activityData = await buyerService.getBuyerActivity(10);
      setActivity(activityData);
    } catch (err) {
      console.error('Error refreshing buyer activity:', err);
      // Don't set error for activity refresh
    } finally {
      setRefreshing(false);
    }
  };

  const refreshAll = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      const dashboardData = await buyerService.getBuyerDashboardData();
      
      setStats(dashboardData.stats);
      setActivity(dashboardData.activity);
      setPreferences(dashboardData.preferences);
    } catch (err) {
      console.error('Error refreshing buyer data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh buyer data');
    } finally {
      setRefreshing(false);
    }
  };

  const updatePreferences = async (newPreferences: Record<string, any>) => {
    try {
      const updatedPreferences = await buyerService.updateBuyerPreferences(newPreferences);
      setPreferences(updatedPreferences);
    } catch (err) {
      console.error('Error updating buyer preferences:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to update buyer preferences');
    }
  };

  const formatActivityTime = (timestamp: string) => {
    return buyerService.formatActivityTime(timestamp);
  };

  const getActivityIcon = (type: BuyerActivity['type']) => {
    return buyerService.getActivityIcon(type);
  };

  return {
    stats,
    activity,
    preferences,
    loading,
    error,
    refreshing,
    refreshStats,
    refreshActivity,
    refreshAll,
    updatePreferences,
    formatActivityTime,
    getActivityIcon,
  };
}