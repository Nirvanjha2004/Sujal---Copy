/**
 * Dashboard Feature Module
 * 
 * Comprehensive exports for the dashboard feature module.
 * Organized by category for better developer experience.
 */

// =============================================================================
// COMPONENTS
// =============================================================================

// Common Components
export {
  StatsCard,
  WelcomeSection,
  ActivityFeed,
  QuickActions,
  NotificationPanel,
  DashboardGrid,
  GridItem,
  DashboardNavigation,
  DashboardSidebar
} from './components/common';

export { DashboardLayout } from './components/common/DashboardLayout';

// Role-Specific Components
export {
  BuyerDashboardContent,
  AgentDashboardContent,
  BuilderDashboardContent,
  AdminDashboardContent,
  UserDashboardContent
} from './components/role-specific';

// =============================================================================
// PAGES
// =============================================================================

export {
  DashboardPage,
  UserActivityPage,
  AccountSettingsPage,
  MessagesPage,
  // Backward compatibility aliases
  DashboardPage as Dashboard,
  UserActivityPage as UserActivity,
  AccountSettingsPage as AccountSettings,
  MessagesPage as Messages
} from './pages';

// =============================================================================
// HOOKS
// =============================================================================

export {
  useDashboard,
  useUserStats,
  useActivityFeed,
  useNotifications,
  // Hook return types
  type UseDashboardReturn,
  type UseUserStatsReturn,
  type UseActivityFeedReturn,
  type UseNotificationsReturn
} from './hooks';

// =============================================================================
// SERVICES
// =============================================================================

export {
  dashboardService,
  userStatsService,
  activityService,
  notificationService,
  // Service class exports
  DashboardService,
  UserStatsService,
  ActivityService,
  NotificationService
} from './services';

// =============================================================================
// UTILITIES
// =============================================================================

export {
  formatDate,
  layoutHelpers,
  widgetHelpers,
  dataHelpers,
  preferencesHelpers,
  numberHelpers,
  colorHelpers,
  validationHelpers,
  statsCalculations,
  timePeriodHelpers,
  activityStats,
  trendAnalysis,
  dataAggregation,
  statsFormatting,
  calculateDashboardStats
} from './utils';

// =============================================================================
// TYPES
// =============================================================================

// Dashboard Types
export type {
  DashboardData,
  DashboardStats,
  BuyerDashboardStats,
  AgentDashboardStats,
  OwnerDashboardStats,
  BuilderDashboardStats,
  DashboardError,
  DashboardErrorType
} from './types/dashboard';

// Stats Types
export type {
  UserStats,
  OverallStats,
  RoleStats,
  StatsHistory,
  TimePeriod,
  StatsCalculation,
  StatsTrend
} from './types/stats';

// Activity Types
export type {
  Activity,
  ActivityType,
  ActivityOptions,
  ActivityStats
} from './types/activity';

// Notification Types
export type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationOptions,
  NotificationPreferences
} from './types/notifications';

// Settings Types
export type {
  DashboardSettings,
  UserSettings,
  NotificationSettings,
  PrivacySettings,
  DisplaySettings,
  SecuritySettings
} from './types/settings';

// Preferences Types
export type {
  DashboardPreferences,
  WidgetConfiguration,
  WidgetType,
  WidgetPosition,
  WidgetSize,
  DashboardLayoutConfig,
  ThemeSettings
} from './types/preferences';

// Messages Types
export type {
  Message,
  MessageOptions,
  Conversation,
  ConversationOptions,
  Property,
  PropertyImage
} from './types/messages';

// =============================================================================
// CONSTANTS
// =============================================================================

export {
  DASHBOARD_ROUTES,
  DASHBOARD_PERMISSIONS,
  ACTIVITY_TYPES,
  NOTIFICATION_TYPES,
  WIDGET_TYPES,
  LAYOUT_BREAKPOINTS,
  STATS_PERIODS,
  DEFAULT_PREFERENCES,
  DASHBOARD_COLORS,
  ANIMATION_DURATIONS
} from './constants';

// =============================================================================
// BACKWARD COMPATIBILITY
// =============================================================================

// Note: Specific exports above provide better tree-shaking and avoid duplicate exports
// Individual module exports are available through their respective paths