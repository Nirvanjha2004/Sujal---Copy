// Activity-related types extracted from UserActivityPage

export enum ActivityType {
  LOGIN = 'login',
  PROFILE_UPDATE = 'profile_update',
  PROPERTY_VIEW = 'property_view',
  FAVORITE_ADD = 'favorite_add',
  FAVORITE_REMOVE = 'favorite_remove',
  SEARCH_SAVE = 'search_save',
  MESSAGE_SEND = 'message_send',
  PROPERTY_CREATE = 'property_create',
  LEAD_CONTACT = 'lead_contact',
  INQUIRY_SENT = 'inquiry_sent',
  SEARCH = 'search'
}

export interface Activity {
  id: number;
  userId: number;
  type: ActivityType;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
  isRead: boolean;
}

// Legacy interface for backward compatibility
export interface ActivityItem {
  id: number;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface ActivityFilter {
  type: ActivityType | 'all';
  label: string;
}

export interface ActivityStats {
  propertyViews: number;
  searches: number;
  favoritesAdded: number;
  inquiriesSent: number;
}

export interface ActivityOptions {
  limit?: number;
  offset?: number;
  type?: ActivityType;
  startDate?: string;
  endDate?: string;
}