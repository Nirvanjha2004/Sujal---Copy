/**
 * Dashboard Pages Index
 * 
 * Centralized exports for all dashboard pages
 * Provides clean import structure and maintains backward compatibility
 */

// Main dashboard page
export { DashboardPage } from './DashboardPage';

// Additional dashboard pages
export { UserActivityPage } from './UserActivityPage';
export { AccountSettingsPage } from './AccountSettingsPage';
export { MessagesPage } from './MessagesPage';

// Re-export for backward compatibility
export { DashboardPage as Dashboard } from './DashboardPage';
export { UserActivityPage as UserActivity } from './UserActivityPage';
export { AccountSettingsPage as AccountSettings } from './AccountSettingsPage';
export { MessagesPage as Messages } from './MessagesPage';