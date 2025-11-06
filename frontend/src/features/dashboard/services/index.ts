// Dashboard Services
// Centralized exports for all dashboard-related services

export { dashboardService, default as DashboardService } from './dashboardService';
export { userStatsService, default as UserStatsService } from './userStatsService';
export { activityService, default as ActivityService } from './activityService';
export { notificationService, default as NotificationService } from './notificationService';

// Re-export types for convenience
export type { 
  DashboardData, 
  DashboardStats,
  BuyerDashboardStats,
  AgentDashboardStats,
  OwnerDashboardStats,
  BuilderDashboardStats,
  DashboardError,
  DashboardErrorType 
} from '../types/dashboard';

export type { 
  UserStats, 
  OverallStats, 
  RoleStats, 
  StatsHistory, 
  TimePeriod, 
  StatsCalculation,
  StatsTrend 
} from '../types/stats';

export type { 
  Activity, 
  ActivityType, 
  ActivityOptions, 
  ActivityStats 
} from '../types/activity';

export type { 
  Notification, 
  NotificationType, 
  NotificationPriority, 
  NotificationOptions,
  NotificationPreferences 
} from '../types/notifications';