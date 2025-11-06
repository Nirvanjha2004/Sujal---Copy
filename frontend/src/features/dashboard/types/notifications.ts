// Notification-related types for dashboard

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
  expiresAt?: string;
}

export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  SUCCESS = 'success',
  ERROR = 'error',
  SYSTEM = 'system'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface NotificationOptions {
  limit?: number;
  offset?: number;
  type?: NotificationType;
  priority?: NotificationPriority;
  isRead?: boolean;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  types: {
    [key in NotificationType]: boolean;
  };
}