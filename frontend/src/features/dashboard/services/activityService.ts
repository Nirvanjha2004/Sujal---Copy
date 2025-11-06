import type { 
  Activity, 
  ActivityType, 
  ActivityOptions, 
  ActivityStats
} from '../types/activity';
import type { DashboardError, DashboardErrorType } from '../types/dashboard';

/**
 * Activity Service
 * Handles activity feed management, logging, and retrieval
 */
class ActivityService {
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
   * Get activity feed for a user
   * @param userId - User ID
   * @param options - Activity options (pagination, filtering, etc.)
   * @returns Promise with activity feed
   */
  async getActivityFeed(userId: number, options: ActivityOptions = {}): Promise<Activity[]> {
    try {
      const params = new URLSearchParams();
      
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      if (options.type) params.append('type', options.type);
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);

      const queryString = params.toString();
      const endpoint = `/users/${userId}/activity${queryString ? `?${queryString}` : ''}`;
      
      const response = await this.makeRequest<any>(endpoint);
      
      if (!response.success) {
        throw this.createError(
          'ACTIVITY_LOG_ERROR',
          response.message || 'Failed to fetch activity feed'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      throw this.handleError(error, 'ACTIVITY_LOG_ERROR');
    }
  }

  /**
   * Log a new activity
   * @param userId - User ID
   * @param activityData - Activity data to log
   * @returns Promise with logged activity
   */
  async logActivity(userId: number, activityData: Omit<Activity, 'id' | 'userId' | 'timestamp' | 'isRead'>): Promise<Activity> {
    try {
      const response = await this.makeRequest<any>(`/users/${userId}/activity`, {
        method: 'POST',
        body: JSON.stringify(activityData)
      });
      
      if (!response.success) {
        throw this.createError(
          'ACTIVITY_LOG_ERROR',
          response.message || 'Failed to log activity'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw this.handleError(error, 'ACTIVITY_LOG_ERROR');
    }
  }

  /**
   * Get activities by type
   * @param userId - User ID
   * @param type - Activity type
   * @param limit - Number of activities to fetch
   * @returns Promise with filtered activities
   */
  async getActivityByType(userId: number, type: ActivityType, limit: number = 50): Promise<Activity[]> {
    try {
      const response = await this.makeRequest<any>(`/users/${userId}/activity/type/${type}?limit=${limit}`);
      
      if (!response.success) {
        throw this.createError(
          'ACTIVITY_LOG_ERROR',
          response.message || 'Failed to fetch activities by type'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching activities by type:', error);
      throw this.handleError(error, 'ACTIVITY_LOG_ERROR');
    }
  }

  /**
   * Delete an activity
   * @param activityId - Activity ID
   * @returns Promise indicating success
   */
  async deleteActivity(activityId: number): Promise<void> {
    try {
      const response = await this.makeRequest<any>(`/activity/${activityId}`, {
        method: 'DELETE'
      });
      
      if (!response.success) {
        throw this.createError(
          'ACTIVITY_LOG_ERROR',
          response.message || 'Failed to delete activity'
        );
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw this.handleError(error, 'ACTIVITY_LOG_ERROR');
    }
  }

  /**
   * Mark activity as read
   * @param activityId - Activity ID
   * @returns Promise indicating success
   */
  async markActivityAsRead(activityId: number): Promise<void> {
    try {
      const response = await this.makeRequest<any>(`/activity/${activityId}/read`, {
        method: 'PUT'
      });
      
      if (!response.success) {
        throw this.createError(
          'ACTIVITY_LOG_ERROR',
          response.message || 'Failed to mark activity as read'
        );
      }
    } catch (error) {
      console.error('Error marking activity as read:', error);
      throw this.handleError(error, 'ACTIVITY_LOG_ERROR');
    }
  }

  /**
   * Mark multiple activities as read
   * @param activityIds - Array of activity IDs
   * @returns Promise indicating success
   */
  async markActivitiesAsRead(activityIds: number[]): Promise<void> {
    try {
      const response = await this.makeRequest<any>('/activity/bulk-read', {
        method: 'PUT',
        body: JSON.stringify({ activityIds })
      });
      
      if (!response.success) {
        throw this.createError(
          'ACTIVITY_LOG_ERROR',
          response.message || 'Failed to mark activities as read'
        );
      }
    } catch (error) {
      console.error('Error marking activities as read:', error);
      throw this.handleError(error, 'ACTIVITY_LOG_ERROR');
    }
  }

  /**
   * Get activity statistics
   * @param userId - User ID
   * @param period - Time period for stats ('day' | 'week' | 'month' | 'year')
   * @returns Promise with activity statistics
   */
  async getActivityStats(userId: number, period: string = 'month'): Promise<ActivityStats> {
    try {
      const response = await this.makeRequest<any>(`/users/${userId}/activity/stats?period=${period}`);
      
      if (!response.success) {
        throw this.createError(
          'ACTIVITY_LOG_ERROR',
          response.message || 'Failed to fetch activity statistics'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      throw this.handleError(error, 'ACTIVITY_LOG_ERROR');
    }
  }

  /**
   * Get recent activity for dashboard
   * @param userId - User ID
   * @param limit - Number of recent activities to fetch
   * @returns Promise with recent activities
   */
  async getRecentActivity(userId: number, limit: number = 10): Promise<Activity[]> {
    try {
      const response = await this.makeRequest<any>(`/users/${userId}/activity/recent?limit=${limit}`);
      
      if (!response.success) {
        throw this.createError(
          'ACTIVITY_LOG_ERROR',
          response.message || 'Failed to fetch recent activity'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw this.handleError(error, 'ACTIVITY_LOG_ERROR');
    }
  }

  /**
   * Search activities
   * @param userId - User ID
   * @param query - Search query
   * @param options - Search options
   * @returns Promise with search results
   */
  async searchActivities(userId: number, query: string, options: ActivityOptions = {}): Promise<Activity[]> {
    try {
      const params = new URLSearchParams({ query });
      
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      if (options.type) params.append('type', options.type);
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);

      const response = await this.makeRequest<any>(`/users/${userId}/activity/search?${params.toString()}`);
      
      if (!response.success) {
        throw this.createError(
          'ACTIVITY_LOG_ERROR',
          response.message || 'Failed to search activities'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error searching activities:', error);
      throw this.handleError(error, 'ACTIVITY_LOG_ERROR');
    }
  }

  /**
   * Export activity data
   * @param userId - User ID
   * @param format - Export format ('json' | 'csv')
   * @param options - Export options
   * @returns Promise with export data
   */
  async exportActivities(userId: number, format: 'json' | 'csv' = 'json', options: ActivityOptions = {}): Promise<any> {
    try {
      const params = new URLSearchParams({ format });
      
      if (options.type) params.append('type', options.type);
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);

      const response = await this.makeRequest<any>(`/users/${userId}/activity/export?${params.toString()}`);
      
      if (!response.success) {
        throw this.createError(
          'ACTIVITY_LOG_ERROR',
          response.message || 'Failed to export activities'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error exporting activities:', error);
      throw this.handleError(error, 'ACTIVITY_LOG_ERROR');
    }
  }

  /**
   * Clear old activities
   * @param userId - User ID
   * @param olderThanDays - Delete activities older than specified days
   * @returns Promise indicating success
   */
  async clearOldActivities(userId: number, olderThanDays: number = 90): Promise<void> {
    try {
      const response = await this.makeRequest<any>(`/users/${userId}/activity/cleanup`, {
        method: 'DELETE',
        body: JSON.stringify({ olderThanDays })
      });
      
      if (!response.success) {
        throw this.createError(
          'ACTIVITY_LOG_ERROR',
          response.message || 'Failed to clear old activities'
        );
      }
    } catch (error) {
      console.error('Error clearing old activities:', error);
      throw this.handleError(error, 'ACTIVITY_LOG_ERROR');
    }
  }

  /**
   * Get activity count
   * @param userId - User ID
   * @param options - Count options
   * @returns Promise with activity count
   */
  async getActivityCount(userId: number, options: Omit<ActivityOptions, 'limit' | 'offset'> = {}): Promise<number> {
    try {
      const params = new URLSearchParams();
      
      if (options.type) params.append('type', options.type);
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);

      const queryString = params.toString();
      const endpoint = `/users/${userId}/activity/count${queryString ? `?${queryString}` : ''}`;
      
      const response = await this.makeRequest<any>(endpoint);
      
      if (!response.success) {
        throw this.createError(
          'ACTIVITY_LOG_ERROR',
          response.message || 'Failed to get activity count'
        );
      }

      return response.data.count;
    } catch (error) {
      console.error('Error getting activity count:', error);
      throw this.handleError(error, 'ACTIVITY_LOG_ERROR');
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
export const activityService = new ActivityService();
export default activityService;