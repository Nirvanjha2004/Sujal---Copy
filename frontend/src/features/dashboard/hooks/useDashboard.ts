import { useState, useEffect, useCallback } from 'react';
import type { DashboardData, DashboardError } from '../types/dashboard';
import type { DashboardPreferences } from '../types/preferences';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '@/shared/contexts/AuthContext';

export interface UseDashboardReturn {
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: DashboardError | null;
  refreshDashboard: () => Promise<void>;
  updatePreferences: (preferences: DashboardPreferences) => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for managing dashboard data and state
 * Provides dashboard data fetching, loading states, error handling, and refresh functionality
 */
export const useDashboard = (): UseDashboardReturn => {
  const { state: { user, isAuthenticated } } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<DashboardError | null>(null);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Fetch dashboard data
   */
  const fetchDashboardData = useCallback(async () => {
    if (!user || !isAuthenticated) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await dashboardService.getDashboardData(user.id, user.role);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err as DashboardError);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  /**
   * Refresh dashboard data
   */
  const refreshDashboard = useCallback(async () => {
    if (!user || !isAuthenticated) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await dashboardService.refreshDashboard(user.id, user.role);
      setDashboardData(data);
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
      setError(err as DashboardError);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  /**
   * Update dashboard preferences
   */
  const updatePreferences = useCallback(async (preferences: DashboardPreferences) => {
    if (!user || !isAuthenticated) {
      return;
    }

    setError(null);

    try {
      const updatedPreferences = await dashboardService.updateDashboardPreferences(
        user.id,
        preferences
      );
      
      // Update local dashboard data with new preferences
      setDashboardData(prev => 
        prev ? { ...prev, preferences: updatedPreferences } : null
      );
    } catch (err) {
      console.error('Error updating dashboard preferences:', err);
      setError(err as DashboardError);
      throw err; // Re-throw to allow component to handle the error
    }
  }, [user, isAuthenticated]);

  /**
   * Initial data fetch on mount and when user changes
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardData();
    } else {
      // Clear data when user logs out
      setDashboardData(null);
      setError(null);
    }
  }, [fetchDashboardData, isAuthenticated, user]);

  return {
    dashboardData,
    isLoading,
    error,
    refreshDashboard,
    updatePreferences,
    clearError
  };
};

export default useDashboard;