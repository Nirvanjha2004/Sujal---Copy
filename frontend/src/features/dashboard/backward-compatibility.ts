/**
 * Backward Compatibility Exports
 * 
 * This file maintains backward compatibility for existing imports
 * while the application transitions to the new modular structure
 */

// Re-export dashboard pages for backward compatibility
export { DashboardPage } from './pages/DashboardPage';
export { UserActivityPage } from './pages/UserActivityPage';
export { AccountSettingsPage } from './pages/AccountSettingsPage';
export { MessagesPage } from './pages/MessagesPage';

// Legacy aliases for existing imports
export { DashboardPage as Dashboard } from './pages/DashboardPage';
export { UserActivityPage as UserActivity } from './pages/UserActivityPage';
export { AccountSettingsPage as AccountSettings } from './pages/AccountSettingsPage';
export { MessagesPage as Messages } from './pages/MessagesPage';

// Re-export components for backward compatibility
export * from './components/role-specific/BuyerDashboardContent';
export * from './components/role-specific/AgentDashboardContent';
export * from './components/role-specific/BuilderDashboardContent';
export * from './components/role-specific/AdminDashboardContent';
export * from './components/role-specific/UserDashboardContent';

// Re-export common components
export * from './components/common/StatsCard';
export * from './components/common/WelcomeSection';
export * from './components/common/ActivityFeed';
export * from './components/common/QuickActions';
export * from './components/common/NotificationPanel';
export * from './components/common/DashboardLayout';

// Re-export hooks
export * from './hooks/useDashboard';
export * from './hooks/useUserStats';
export * from './hooks/useActivityFeed';
export * from './hooks/useNotifications';

// Re-export services
export * from './services/dashboardService';
export * from './services/userStatsService';
export * from './services/activityService';
export * from './services/notificationService';

// Re-export types
export * from './types/dashboard';
export * from './types/activity';
export * from './types/messages';