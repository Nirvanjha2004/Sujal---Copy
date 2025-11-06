// Dashboard preferences and configuration types

export interface DashboardPreferences {
  layout: DashboardLayoutConfig;
  widgets: WidgetConfiguration[];
  notifications: DashboardNotificationSettings;
  theme: ThemeSettings;
}

export interface DashboardLayoutConfig {
  type: 'grid' | 'list' | 'compact';
  columns: number;
  spacing: 'tight' | 'normal' | 'loose';
}

export interface WidgetConfiguration {
  id: string;
  type: WidgetType;
  position: WidgetPosition;
  size: WidgetSize;
  isVisible: boolean;
  settings: Record<string, any>;
}

export interface WidgetPosition {
  row: number;
  column: number;
  span?: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export enum WidgetType {
  STATS_CARD = 'stats_card',
  ACTIVITY_FEED = 'activity_feed',
  QUICK_ACTIONS = 'quick_actions',
  NOTIFICATIONS = 'notifications',
  RECENT_PROPERTIES = 'recent_properties',
  PERFORMANCE_CHART = 'performance_chart'
}

export interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
}

export interface DashboardNotificationSettings {
  showInDashboard: boolean;
  maxItems: number;
  autoRefresh: boolean;
  refreshInterval: number;
}