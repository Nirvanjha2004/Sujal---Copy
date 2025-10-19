import type { 
  Notification, 
  NotificationType, 
  NotificationPriority, 
  NotificationOptions,
  NotificationPreferences 
} from '../types/notifications';
import type { DashboardError, DashboardErrorType } from '../types/dashboard';

/**
 * Notification Service
 * Handles notification management, creation, reading, and preferences
 */
class NotificationService {
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
   * Get notifications for a user
   * @param userId - User ID
   * @param options - Notification options (pagination, filtering, etc.)
   * @returns Promise with notifications
   */
  async getNotifications(userId: number, options: NotificationOptions = {}): Promise<Notification[]> {
    try {
      const params = new URLSearchParams();
      
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      if (options.type) params.append('type', options.type);
      if (options.priority) params.append('priority', options.priority);
      if (options.isRead !== undefined) params.append('isRead', options.isRead.toString());

      const queryString = params.toString();
      const endpoint = `/users/${userId}/notifications${queryString ? `?${queryString}` : ''}`;
      
      const response = await this.makeRequest<any>(endpoint);
      
      if (!response.success) {
        throw this.createError(
          'NOTIFICATION_ERROR',
          response.message || 'Failed to fetch notifications'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw this.handleError(error, 'NOTIFICATION_ERROR');
    }
  }

  /**
   * Create a new notification
   * @param userId - User ID
   * @param notificationData - Notification data
   * @returns Promise with created notification
   */
  async createNotification(userId: number, notificationData: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'isRead'>): Promise<Notification> {
    try {
      const response = await this.makeRequest<any>(`/users/${userId}/notifications`, {
        method: 'POST',
        body: JSON.stringify(notificationData)
      });
      
      if (!response.success) {
        throw this.createError(
          'NOTIFICATION_ERROR',
          response.message || 'Failed to create notification'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw this.handleError(error, 'NOTIFICATION_ERROR');
    }
  }

  /**
   * Mark notification as read
   * @param notificationId - Notification ID
   * @returns Promise indicating success
   */
  async markNotificationAsRead(notificationId: number): Promise<void> {
    try {
      const response = await this.makeRequest<any>(`/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      
      if (!response.success) {
        throw this.createError(
          'NOTIFICATION_ERROR',
          response.message || 'Failed to mark notification as read'
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw this.handleError(error, 'NOTIFICATION_ERROR');
    }
  }

  /**
   * Mark multiple notifications as read
   * @param notificationIds - Array of notification IDs
   * @returns Promise indicating success
   */
  async markNotificationsAsRead(notificationIds: number[]): Promise<void> {
    try {
      const response = await this.makeRequest<any>('/notifications/bulk-read', {
        method: 'PUT',
        body: JSON.stringify({ notificationIds })
      });
      
      if (!response.success) {
        throw this.createError(
          'NOTIFICATION_ERROR',
          response.message || 'Failed to mark notifications as read'
        );
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw this.handleError(error, 'NOTIFICATION_ERROR');
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param userId - User ID
   * @returns Promise indicating success
   */
  async markAllNotificationsAsRead(userId: number): Promise<void> {
    try {
      const response = await this.makeRequest<any>(`/users/${userId}/notifications/read-all`, {
        method: 'PUT'
      });
      
      if (!response.success) {
        throw this.createError(
          'NOTIFICATION_ERROR',
          response.message || 'Failed to mark all notifications as read'
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw this.handleError(error, 'NOTIFICATION_ERROR');
    }
  }

  /**
   * Delete a notification
   * @param notificationId - Notification ID
   * @returns Promise indicating success
   */
  async deleteNotification(notificationId: number): Promise<void> {
    try {
      const response = await this.makeRequest<any>(`/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      
      if (!response.success) {
        throw this.createError(
          'NOTIFICATION_ERROR',
          response.message || 'Failed to delete notification'
        );
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw this.handleError(error, 'NOTIFICATION_ERROR');
    }
  }

  /**
   * Delete multiple notifications
   * @param notificationIds - Array of notification IDs
   * @returns Promise indicating success
   */
  async deleteNotifications(notificationIds: number[]): Promise<void> {
    try {
      const response = await this.makeRequest<any>('/notifications/bulk-delete', {
        method: 'DELETE',
        body: JSON.stringify({ notificationIds })
      });
      
      if (!response.success) {
        throw this.createError(
          'NOTIFICATION_ERROR',
          response.message || 'Failed to delete notifications'
        );
      }
    } catch (error) {
      console.error('Error deleting notifications:', error);
      throw this.handleError(error, 'NOTIFICATION_ERROR');
    }
  }

  /**
   * Get unread notification count
   * @param userId - User ID
   * @returns Promise with unread count
   */
  async getUnreadCount(userId: number): Promise<number> {
    try {
      const response = await this.makeRequest<any>(`/users/${userId}/notifications/unread-count`);
      
      if (!response.success) {
        throw this.createError(
          'NOTIFICATION_ERROR',
          response.message || 'Failed to get unread notification count'
        );
      }

      return response.data.count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw this.handleError(error, 'NOTIFICATION_ERROR');
    }
  }

  /**
   * Get notification preferences
   * @param userId - User ID
   * @returns Promise with notification preferences
   */
  async getNotificationPreferences(userId: number): Promise<NotificationPreferences> {
    try {
      const response = await this.makeRequest<any>(`/users/${userId}/notification-preferences`);
      
      if (!response.success) {
        throw this.createError(
          'NOTIFICATION_ERROR',
          response.message || 'Failed to fetch notification preferences'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw this.handleError(error, 'NOTIFICATION_ERROR');
    }
  }

  /**
   * Update notification preferences
   * @param userId - User ID
   * @param preferences - Notification preferences to update
   * @returns Promise with updated preferences
   */
  async updateNotificationPreferences(userId: number, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    try {
      const response = await this.makeRequest<any>(`/users/${userId}/notification-preferences`, {
        method: 'PUT',
        body: JSON.stringify(preferences)
      });
      
      if (!response.success) {
        throw this.createError(
          'NOTIFICATION_ERROR',
          response.message || 'Failed to update notification preferences'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw this.handleError(error, 'NOTIFICATION_ERROR');
    }
  }

  /**
   * Get notifications by type
   * @param userId - User ID
   * @param type - Notification type
   * @param limit - Number of notifications to fetch
   * @returns Promise with filtered notifications
   */
  async getNotificationsByType(userId: number, type: NotificationType, limit: number = 50): Promise<Notification[]> {
    try {
      const response = await this.makeRequest<any>(`/users/${userId}/notifications/type/${type}?limit=${limit}`);
      
      if (!response.success) {
        throw this.createError(
          'NOTIFICATION_ERROR',
          response.message || 'Failed to fetch notifications by type'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching notifications by type:', error);
      throw this.handleError(error, 'NOTIFICATION_ERROR');
    }
  }

  /**
   * Get notifications by priority
   * @param userId - User ID
   * @param priority - Notification priority
   * @param limit - Number of notifications to fetch
   * @returns Promise with filtered notifications
   */
  async getNotificationsByPriority(userId: number, priority: NotificationPriority, limit: number = 50): Promise<Notification[]> {
    try {
      const response = await this.makeRequest<any>(`/users/${userId}/notifications/priority/${priority}?limit=${limit}`);
      
      if (!response.success) {
        throw this.createError(
          'NOTIFICATION_ERROR',
          response.message || 'Failed to fetch notifications by priority'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching notifications by priority:', error);
      throw this.handleError(error, 'NOTIFICATION_ERROR');
    }
  }

  /**
   * Send push notification
   * @param userId - User ID
   * @param title - Notification title
   * @param message - Notification message
   * @param data - Additional notification data
   * @returns Promise indicating success
   */
  async sendPushNotification(userId: number, title: string, message: string, data?: any): Promise<void> {
    try {
      const response = await this.makeRequest<any>(`/users/${userId}/notifications/push`, {
        method: 'POST',
        body: JSON.stringify({ title, message, data })
      });
      
      if (!response.success) {
        throw this.createError(
          'NOTIFICATION_ERROR',
          response.message || 'Failed to send push notification'
        );
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw this.handleError(error, 'NOTIFICATION_ERROR');
    }
  }

  /**
   * Clear expired notifications
   * @param userId - User ID
   * @returns Promise indicating success
   */
  async clearExpiredNotifications(userId: number): Promise<void> {
    try {
      const response = await this.makeRequest<any>(`/users/${userId}/notifications/cleanup-expired`, {
        method: 'DELETE'
      });
      
      if (!response.success) {
        throw this.createError(
          'NOTIFICATION_ERROR',
          response.message || 'Failed to clear expired notifications'
        );
      }
    } catch (error) {
      console.error('Error clearing expired notifications:', error);
      throw this.handleError(error, 'NOTIFICATION_ERROR');
    }
  }

  /**
   * Get notification statistics
   * @param userId - User ID
   * @returns Promise with notification statistics
   */
  async getNotificationStats(userId: number): Promise<Record<string, number>> {
    try {
      const response = await this.makeRequest<any>(`/users/${userId}/notifications/stats`);
      
      if (!response.success) {
        throw this.createError(
          'NOTIFICATION_ERROR',
          response.message || 'Failed to fetch notification statistics'
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw this.handleError(error, 'NOTIFICATION_ERROR');
    }
  }

  /**
   * Subscribe to notification updates (WebSocket)
   * @param userId - User ID
   * @param callback - Callback function for new notifications
   * @returns Unsubscribe function
   */
  subscribeToNotifications(userId: number, callback: (notification: Notification) => void): () => void {
    // This would typically set up a WebSocket connection
    // For now, we'll return a placeholder unsubscribe function
    console.log(`Subscribing to notifications for user ${userId}`);
    
    // Placeholder implementation - in a real app, this would set up WebSocket
    // const ws = new WebSocket(`ws://localhost:3001/notifications/${userId}`);
    // ws.onmessage = (event) => {
    //   const notification = JSON.parse(event.data);
    //   callback(notification);
    // };
    
    const unsubscribe = () => {
      console.log(`Unsubscribing from notifications for user ${userId}`);
      // ws.close();
    };
    
    return unsubscribe;
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
export const notificationService = new NotificationService();
export default notificationService;