// Dashboard constants and configuration

import { ActivityType, NotificationType, NotificationPriority, WidgetType } from '../types';

// Activity type constants
export const ACTIVITY_TYPES = {
  LOGIN: ActivityType.LOGIN,
  PROFILE_UPDATE: ActivityType.PROFILE_UPDATE,
  PROPERTY_VIEW: ActivityType.PROPERTY_VIEW,
  FAVORITE_ADD: ActivityType.FAVORITE_ADD,
  FAVORITE_REMOVE: ActivityType.FAVORITE_REMOVE,
  SEARCH_SAVE: ActivityType.SEARCH_SAVE,
  MESSAGE_SEND: ActivityType.MESSAGE_SEND,
  PROPERTY_CREATE: ActivityType.PROPERTY_CREATE,
  LEAD_CONTACT: ActivityType.LEAD_CONTACT,
  INQUIRY_SENT: ActivityType.INQUIRY_SENT,
  SEARCH: ActivityType.SEARCH,
} as const;

// Activity filter options
export const ACTIVITY_FILTERS = [
  { value: 'all', label: 'All Activity' },
  { value: ActivityType.LOGIN, label: 'Login Activity' },
  { value: ActivityType.PROPERTY_VIEW, label: 'Property Views' },
  { value: ActivityType.SEARCH, label: 'Searches' },
  { value: ActivityType.FAVORITE_ADD, label: 'Favorites Added' },
  { value: ActivityType.FAVORITE_REMOVE, label: 'Favorites Removed' },
  { value: ActivityType.SEARCH_SAVE, label: 'Saved Searches' },
  { value: ActivityType.MESSAGE_SEND, label: 'Messages Sent' },
  { value: ActivityType.PROPERTY_CREATE, label: 'Properties Created' },
  { value: ActivityType.LEAD_CONTACT, label: 'Lead Contacts' },
  { value: ActivityType.INQUIRY_SENT, label: 'Inquiries Sent' },
  { value: ActivityType.PROFILE_UPDATE, label: 'Profile Updates' }
] as const;

// Notification constants
export const NOTIFICATION_TYPES = {
  INFO: NotificationType.INFO,
  WARNING: NotificationType.WARNING,
  SUCCESS: NotificationType.SUCCESS,
  ERROR: NotificationType.ERROR,
  SYSTEM: NotificationType.SYSTEM,
} as const;

export const NOTIFICATION_PRIORITIES = {
  LOW: NotificationPriority.LOW,
  MEDIUM: NotificationPriority.MEDIUM,
  HIGH: NotificationPriority.HIGH,
  URGENT: NotificationPriority.URGENT,
} as const;

// Dashboard layout constants
export const DASHBOARD_LAYOUTS = {
  GRID: 'grid',
  LIST: 'list',
  COMPACT: 'compact',
} as const;

// Widget types
export const WIDGET_TYPES = {
  STATS_CARD: WidgetType.STATS_CARD,
  ACTIVITY_FEED: WidgetType.ACTIVITY_FEED,
  QUICK_ACTIONS: WidgetType.QUICK_ACTIONS,
  NOTIFICATIONS: WidgetType.NOTIFICATIONS,
  RECENT_PROPERTIES: WidgetType.RECENT_PROPERTIES,
  PERFORMANCE_CHART: WidgetType.PERFORMANCE_CHART,
} as const;

// Widget sizes
export const WIDGET_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  FULL: 'full',
} as const;

// Dashboard refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  STATS: 5 * 60 * 1000, // 5 minutes
  ACTIVITY: 2 * 60 * 1000, // 2 minutes
  NOTIFICATIONS: 30 * 1000, // 30 seconds
  MESSAGES: 10 * 1000, // 10 seconds
} as const;

// Default pagination limits
export const DEFAULT_LIMITS = {
  ACTIVITIES: 20,
  NOTIFICATIONS: 10,
  MESSAGES: 50,
  CONVERSATIONS: 20,
} as const;

// Role-specific dashboard configurations
export const ROLE_CONFIGS = {
  buyer: {
    defaultWidgets: ['welcome_section', 'stats_card', 'quick_actions', 'activity_feed'],
    quickActions: ['search_properties', 'saved_properties', 'saved_searches', 'messages'],
    statsCards: ['saved_properties', 'saved_searches', 'messages'],
  },
  owner: {
    defaultWidgets: ['welcome_section', 'stats_card', 'quick_actions', 'activity_feed'],
    quickActions: ['add_property', 'my_properties', 'analytics', 'messages'],
    statsCards: ['active_listings', 'property_views', 'inquiries', 'messages'],
  },
  agent: {
    defaultWidgets: ['welcome_section', 'stats_card', 'quick_actions', 'activity_feed'],
    quickActions: ['add_property', 'bulk_upload', 'portfolio', 'leads', 'messages'],
    statsCards: ['active_listings', 'property_views', 'inquiries', 'messages'],
  },
  builder: {
    defaultWidgets: ['welcome_section', 'stats_card', 'quick_actions', 'activity_feed'],
    quickActions: ['new_project', 'projects', 'messages'],
    statsCards: ['active_projects', 'units_available', 'inquiries', 'messages'],
  },
  admin: {
    defaultWidgets: ['welcome_section', 'stats_card', 'quick_actions', 'activity_feed'],
    quickActions: ['user_management', 'property_moderation', 'analytics', 'settings'],
    statsCards: ['total_users', 'total_properties', 'pending_approvals', 'system_health'],
  },
} as const;

// Icon mappings for activities
export const ACTIVITY_ICONS = {
  [ACTIVITY_TYPES.LOGIN]: 'solar:login-3-bold',
  [ACTIVITY_TYPES.PROFILE_UPDATE]: 'solar:user-bold',
  [ACTIVITY_TYPES.PROPERTY_VIEW]: 'solar:eye-bold',
  [ACTIVITY_TYPES.FAVORITE_ADD]: 'solar:heart-bold',
  [ACTIVITY_TYPES.FAVORITE_REMOVE]: 'solar:heart-broken-bold',
  [ACTIVITY_TYPES.SEARCH_SAVE]: 'solar:bookmark-bold',
  [ACTIVITY_TYPES.MESSAGE_SEND]: 'solar:chat-round-bold',
  [ACTIVITY_TYPES.PROPERTY_CREATE]: 'solar:home-add-bold',
  [ACTIVITY_TYPES.LEAD_CONTACT]: 'solar:phone-bold',
  [ACTIVITY_TYPES.INQUIRY_SENT]: 'solar:chat-round-bold',
  [ACTIVITY_TYPES.SEARCH]: 'solar:magnifer-bold',
} as const;

// Color mappings for activities
export const ACTIVITY_COLORS = {
  [ACTIVITY_TYPES.LOGIN]: 'text-indigo-600 bg-indigo-50',
  [ACTIVITY_TYPES.PROFILE_UPDATE]: 'text-orange-600 bg-orange-50',
  [ACTIVITY_TYPES.PROPERTY_VIEW]: 'text-blue-600 bg-blue-50',
  [ACTIVITY_TYPES.FAVORITE_ADD]: 'text-red-600 bg-red-50',
  [ACTIVITY_TYPES.FAVORITE_REMOVE]: 'text-gray-600 bg-gray-50',
  [ACTIVITY_TYPES.SEARCH_SAVE]: 'text-yellow-600 bg-yellow-50',
  [ACTIVITY_TYPES.MESSAGE_SEND]: 'text-purple-600 bg-purple-50',
  [ACTIVITY_TYPES.PROPERTY_CREATE]: 'text-emerald-600 bg-emerald-50',
  [ACTIVITY_TYPES.LEAD_CONTACT]: 'text-cyan-600 bg-cyan-50',
  [ACTIVITY_TYPES.INQUIRY_SENT]: 'text-purple-600 bg-purple-50',
  [ACTIVITY_TYPES.SEARCH]: 'text-green-600 bg-green-50',
} as const;

// Time period constants
export const TIME_PERIODS = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
} as const;

// Dashboard grid configuration
export const GRID_CONFIG = {
  COLUMNS: {
    MOBILE: 1,
    TABLET: 2,
    DESKTOP: 3,
    LARGE: 4,
  },
  SPACING: {
    TIGHT: 2,
    NORMAL: 4,
    LOOSE: 6,
  },
} as const;

// Theme constants
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Font size constants
export const FONT_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
} as const;

// Dashboard routes
export const DASHBOARD_ROUTES = {
  MAIN: '/dashboard',
  ACTIVITY: '/dashboard/activity',
  SETTINGS: '/dashboard/settings',
  MESSAGES: '/dashboard/messages',
  PROFILE: '/dashboard/profile',
} as const;

// Dashboard permissions
export const DASHBOARD_PERMISSIONS = {
  VIEW_DASHBOARD: 'dashboard:view',
  VIEW_ANALYTICS: 'dashboard:analytics',
  MANAGE_SETTINGS: 'dashboard:settings',
  VIEW_ALL_USERS: 'dashboard:users:all',
  MODERATE_CONTENT: 'dashboard:moderate',
} as const;

// Layout breakpoints
export const LAYOUT_BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Stats periods
export const STATS_PERIODS = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
  ALL_TIME: 'all_time',
} as const;

// Default preferences
export const DEFAULT_PREFERENCES = {
  layout: DASHBOARD_LAYOUTS.GRID,
  theme: THEME_MODES.SYSTEM,
  fontSize: FONT_SIZES.MEDIUM,
  notifications: {
    email: true,
    push: true,
    inApp: true,
  },
  widgets: {
    statsCard: { enabled: true, position: { x: 0, y: 0 } },
    activityFeed: { enabled: true, position: { x: 1, y: 0 } },
    quickActions: { enabled: true, position: { x: 2, y: 0 } },
    notifications: { enabled: true, position: { x: 0, y: 1 } },
  },
} as const;

// Dashboard colors
export const DASHBOARD_COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#6B7280',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
  BACKGROUND: '#F9FAFB',
  SURFACE: '#FFFFFF',
  BORDER: '#E5E7EB',
} as const;

// Animation durations
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000,
} as const;

// Dashboard error messages
export const ERROR_MESSAGES = {
  DATA_FETCH_ERROR: 'Failed to load dashboard data. Please try again.',
  STATS_CALCULATION_ERROR: 'Error calculating statistics. Please refresh.',
  ACTIVITY_LOG_ERROR: 'Failed to load activity feed. Please try again.',
  NOTIFICATION_ERROR: 'Error loading notifications. Please refresh.',
  PREFERENCES_UPDATE_ERROR: 'Failed to update preferences. Please try again.',
  NETWORK_ERROR: 'Network connection error. Please check your connection.',
  PERMISSION_ERROR: 'You do not have permission to access this data.',
} as const;