import type { 
  UserStats, 
  OverallStats, 
  RoleStats, 
  StatsHistory, 
  TimePeriod, 
  StatsCalculation,
  StatsTrend 
} from '../types/stats';
import type { UserRole } from '@/features/auth/types';
import type { DashboardError, DashboardErrorType } from '../types/dashboard';

/**
 * User Stats Service
 * Handles user statistics calculation, retrieval, and management
 */
class UserStatsService {
  private readonly baseUrl = '/api/v1';

  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get overall user statistics
   * @param userId - User ID
   * @returns Promise with overall user stats
   */
  async getOverallStats(userId: number): Promise<OverallStats> {
    try {
      const response = await this.makeRequest<any>(`/users/${userId}/stats/overall`);
      
      if (!response.success) {
        throw this.createError(
          'STATS_CALCULATION_ERROR',
          response.message || 'Failed to fetch overall statistics'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching overall stats:', error);
      throw this.handleError(error, 'STATS_CALCULATION_ERROR');
    }
  }

  /**
   * Get role-specific statistics
   * @param userId - User ID
   * @param role - User role
   * @returns Promise with role-specific stats
   */
  async getRoleSpecificStats(userId: number, role: UserRole): Promise<RoleStats> {
    try {
      const response = await this.makeRequest<any>(`/users/${userId}/stats/role?role=${role}`);
      
      if (!response.success) {
        throw this.createError(
          'STATS_CALCULATION_ERROR',
          response.message || 'Failed to fetch role-specific statistics'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching role-specific stats:', error);
      throw this.handleError(error, 'STATS_CALCULATION_ERROR');
    }
  }

  /**
   * Get complete user statistics
   * @param userId - User ID
   * @param role - User role
   * @returns Promise with complete user stats
   */
  async getUserStats(userId: number, role: UserRole): Promise<UserStats> {
    try {
      const response = await this.makeRequest<any>(`/users/${userId}/stats?role=${role}`);
      
      if (!response.success) {
        throw this.createError(
          'STATS_CALCULATION_ERROR',
          response.message || 'Failed to fetch user statistics'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw this.handleError(error, 'STATS_CALCULATION_ERROR');
    }
  }

  /**
   * Get statistics history for a specific period
   * @param userId - User ID
   * @param period - Time period
   * @param role - User role (optional)
   * @returns Promise with stats history
   */
  async getStatsHistory(userId: number, period: TimePeriod, role?: UserRole): Promise<StatsHistory> {
    try {
      const roleParam = role ? `&role=${role}` : '';
      const response = await this.makeRequest<any>(`/users/${userId}/stats/history?period=${period}${roleParam}`);
      
      if (!response.success) {
        throw this.createError(
          'STATS_CALCULATION_ERROR',
          response.message || 'Failed to fetch statistics history'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching stats history:', error);
      throw this.handleError(error, 'STATS_CALCULATION_ERROR');
    }
  }

  /**
   * Get statistics trends
   * @param userId - User ID
   * @param role - User role
   * @param periods - Array of time periods to compare
   * @returns Promise with stats trends
   */
  async getStatsTrends(userId: number, role: UserRole, periods: TimePeriod[] = ['week', 'month']): Promise<StatsTrend[]> {
    try {
      const periodsParam = periods.join(',');
      const response = await this.makeRequest<any>(`/users/${userId}/stats/trends?role=${role}&periods=${periodsParam}`);
      
      if (!response.success) {
        throw this.createError(
          'STATS_CALCULATION_ERROR',
          response.message || 'Failed to fetch statistics trends'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching stats trends:', error);
      throw this.handleError(error, 'STATS_CALCULATION_ERROR');
    }
  }

  /**
   * Refresh user statistics
   * @param userId - User ID
   * @param role - User role
   * @returns Promise with refreshed stats
   */
  async refreshStats(userId: number, role: UserRole): Promise<UserStats> {
    try {
      const response = await this.makeRequest<any>(`/users/${userId}/stats/refresh`, {
        method: 'POST',
        body: JSON.stringify({ role })
      });
      
      if (!response.success) {
        throw this.createError(
          'STATS_CALCULATION_ERROR',
          response.message || 'Failed to refresh statistics'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error refreshing stats:', error);
      throw this.handleError(error, 'STATS_CALCULATION_ERROR');
    }
  }

  /**
   * Calculate statistics comparison between periods
   * @param current - Current period stats
   * @param previous - Previous period stats
   * @returns Stats calculation with trends
   */
  calculateStatsComparison(current: number, previous: number): StatsCalculation {
    const change = current - previous;
    const changePercentage = previous > 0 ? (change / previous) * 100 : 0;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (change > 0) trend = 'up';
    else if (change < 0) trend = 'down';

    return {
      current,
      previous,
      change,
      changePercentage: Math.round(changePercentage * 100) / 100,
      trend
    };
  }

  /**
   * Aggregate role-specific statistics
   * @param userId - User ID
   * @param role - User role
   * @param period - Time period for aggregation
   * @returns Promise with aggregated stats
   */
  async aggregateRoleStats(userId: number, role: UserRole, period: TimePeriod = 'month'): Promise<RoleStats> {
    try {
      const response = await this.makeRequest<any>(`/users/${userId}/stats/aggregate?role=${role}&period=${period}`);
      
      if (!response.success) {
        throw this.createError(
          'STATS_CALCULATION_ERROR',
          response.message || 'Failed to aggregate role statistics'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error aggregating role stats:', error);
      throw this.handleError(error, 'STATS_CALCULATION_ERROR');
    }
  }

  /**
   * Get comparative statistics across roles (for admin users)
   * @param period - Time period for comparison
   * @returns Promise with comparative stats
   */
  async getComparativeStats(period: TimePeriod = 'month'): Promise<Record<UserRole, RoleStats>> {
    try {
      const response = await this.makeRequest<any>(`/admin/stats/comparative?period=${period}`);
      
      if (!response.success) {
        throw this.createError(
          'STATS_CALCULATION_ERROR',
          response.message || 'Failed to fetch comparative statistics'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching comparative stats:', error);
      throw this.handleError(error, 'STATS_CALCULATION_ERROR');
    }
  }

  /**
   * Export user statistics
   * @param userId - User ID
   * @param role - User role
   * @param format - Export format ('json' | 'csv')
   * @param period - Time period for export
   * @returns Promise with export data
   */
  async exportStats(userId: number, role: UserRole, format: 'json' | 'csv' = 'json', period: TimePeriod = 'month'): Promise<any> {
    try {
      const response = await this.makeRequest<any>(`/users/${userId}/stats/export?role=${role}&format=${format}&period=${period}`);
      
      if (!response.success) {
        throw this.createError(
          'STATS_CALCULATION_ERROR',
          response.message || 'Failed to export statistics'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error exporting stats:', error);
      throw this.handleError(error, 'STATS_CALCULATION_ERROR');
    }
  }

  /**
   * Get statistics summary for dashboard widgets
   * @param userId - User ID
   * @param role - User role
   * @returns Promise with stats summary
   */
  async getStatsSummary(userId: number, role: UserRole): Promise<Record<string, number>> {
    try {
      const response = await this.makeRequest<any>(`/users/${userId}/stats/summary?role=${role}`);
      
      if (!response.success) {
        throw this.createError(
          'STATS_CALCULATION_ERROR',
          response.message || 'Failed to fetch statistics summary'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching stats summary:', error);
      throw this.handleError(error, 'STATS_CALCULATION_ERROR');
    }
  }

  /**
   * Create a dashboard error object
   * @param type - Error type
   * @param message - Error message
   * @param details - Additional error details
   * @returns DashboardError object
   */
  private createError(type: string, message: string, details?: any): DashboardError {
    return {
      type: type as DashboardErrorType,
      message,
      details
    };
  }

  /**
   * Handle and transform errors
   * @param error - Original error
   * @param defaultType - Default error type
   * @returns DashboardError object
   */
  private handleError(error: any, defaultType: string): DashboardError {
    if (error instanceof Error) {
      // Check if it's a network error
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return this.createError('NETWORK_ERROR', error.message);
      }
      
      // Check if it's a permission error
      if (error.message.includes('unauthorized') || error.message.includes('forbidden')) {
        return this.createError('PERMISSION_ERROR', error.message);
      }
      
      return this.createError(defaultType, error.message);
    }
    
    return this.createError(defaultType, 'An unexpected error occurred');
  }
}

// Export singleton instance
export const userStatsService = new UserStatsService();
export default userStatsService;