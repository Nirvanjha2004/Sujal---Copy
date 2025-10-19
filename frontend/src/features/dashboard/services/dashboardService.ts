import type { 
  DashboardData, 
  DashboardStats,
  DashboardError,
  DashboardErrorType 
} from '../types/dashboard';
import type { UserStats } from '../types/stats';
import type { Activity } from '../types/activity';
import type { UserRole } from '@/features/auth/types';

/**
 * Dashboard Service
 * Handles all dashboard-related API calls and data management
 */
class DashboardService {
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
   * Get complete dashboard data for a user
   * @param userId - User ID
   * @param role - User role
   * @returns Promise with complete dashboard data
   */
  async getDashboardData(userId: number, role: UserRole): Promise<DashboardData> {
    try {
      const data = await this.makeRequest<any>(`/dashboard/${userId}?role=${role}`);
      
      if (!data.success) {
        throw this.createError(
          'DATA_FETCH_ERROR',
          data.message || 'Failed to fetch dashboard data'
        );
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw this.handleError(error, 'DATA_FETCH_ERROR');
    }
  }

  /**
   * Get user statistics based on role
   * @param userId - User ID
   * @param role - User role
   * @returns Promise with user statistics
   */
  async getUserStats(userId: number, role: UserRole): Promise<UserStats> {
    try {
      const data = await this.makeRequest<any>(`/dashboard/${userId}/stats?role=${role}`);
      
      if (!data.success) {
        throw this.createError(
          'STATS_CALCULATION_ERROR',
          data.message || 'Failed to fetch user statistics'
        );
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw this.handleError(error, 'STATS_CALCULATION_ERROR');
    }
  }

  /**
   * Get role-specific dashboard statistics
   * @param userId - User ID
   * @param role - User role
   * @returns Promise with role-specific stats
   */
  async getRoleSpecificStats(userId: number, role: UserRole): Promise<DashboardStats> {
    try {
      let endpoint = '';
      
      switch (role) {
        case 'buyer':
          endpoint = `/dashboard/${userId}/buyer-stats`;
          break;
        case 'agent':
          endpoint = `/dashboard/${userId}/agent-stats`;
          break;
        case 'owner':
          endpoint = `/dashboard/${userId}/owner-stats`;
          break;
        case 'builder':
          endpoint = `/dashboard/${userId}/builder-stats`;
          break;
        case 'admin':
          endpoint = `/admin/dashboard/stats`;
          break;
        default:
          endpoint = `/dashboard/${userId}/stats`;
      }

      const data = await this.makeRequest<any>(endpoint);
      
      if (!data.success) {
        throw this.createError(
          'STATS_CALCULATION_ERROR',
          data.message || 'Failed to fetch role-specific statistics'
        );
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching role-specific stats:', error);
      throw this.handleError(error, 'STATS_CALCULATION_ERROR');
    }
  }

  /**
   * Get recent activity for dashboard
   * @param userId - User ID
   * @param limit - Number of activities to fetch (default: 10)
   * @returns Promise with recent activities
   */
  async getRecentActivity(userId: number, limit: number = 10): Promise<Activity[]> {
    try {
      const data = await this.makeRequest<any>(`/dashboard/${userId}/activity?limit=${limit}`);
      
      if (!data.success) {
        throw this.createError(
          'ACTIVITY_LOG_ERROR',
          data.message || 'Failed to fetch recent activity'
        );
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw this.handleError(error, 'ACTIVITY_LOG_ERROR');
    }
  }

  /**
   * Refresh dashboard data
   * @param userId - User ID
   * @param role - User role
   * @returns Promise with refreshed dashboard data
   */
  async refreshDashboard(userId: number, role: UserRole): Promise<DashboardData> {
    try {
      const data = await this.makeRequest<any>(`/dashboard/${userId}/refresh?role=${role}`, {
        method: 'POST'
      });
      
      if (!data.success) {
        throw this.createError(
          'DATA_FETCH_ERROR',
          data.message || 'Failed to refresh dashboard data'
        );
      }

      return data.data;
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      throw this.handleError(error, 'DATA_FETCH_ERROR');
    }
  }

  /**
   * Update dashboard preferences
   * @param userId - User ID
   * @param preferences - Dashboard preferences to update
   * @returns Promise with updated preferences
   */
  async updateDashboardPreferences(userId: number, preferences: any): Promise<any> {
    try {
      const data = await this.makeRequest<any>(`/dashboard/${userId}/preferences`, {
        method: 'PUT',
        body: JSON.stringify(preferences)
      });
      
      if (!data.success) {
        throw this.createError(
          'PREFERENCES_UPDATE_ERROR',
          data.message || 'Failed to update dashboard preferences'
        );
      }

      return data.data;
    } catch (error) {
      console.error('Error updating dashboard preferences:', error);
      throw this.handleError(error, 'PREFERENCES_UPDATE_ERROR');
    }
  }

  /**
   * Get dashboard analytics data
   * @param userId - User ID
   * @param role - User role
   * @param period - Time period for analytics (optional)
   * @returns Promise with analytics data
   */
  async getDashboardAnalytics(userId: number, role: UserRole, period?: string): Promise<any> {
    try {
      const params = period ? `?period=${period}` : '';
      const data = await this.makeRequest<any>(`/dashboard/${userId}/analytics${params}&role=${role}`);
      
      if (!data.success) {
        throw this.createError(
          'DATA_FETCH_ERROR',
          data.message || 'Failed to fetch dashboard analytics'
        );
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw this.handleError(error, 'DATA_FETCH_ERROR');
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
export const dashboardService = new DashboardService();
export default dashboardService;