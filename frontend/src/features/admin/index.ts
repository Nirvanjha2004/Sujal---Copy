// Main admin feature exports

// Export all types
export * from './types';

// Export all components
export * from './components';

// Export all pages
export * from './pages';

// Export all services
export * from './services';

// Commonly used exports for convenience
export { AdminPanelPage } from './pages/AdminPanelPage';
export { AdminDashboardPage } from './pages/AdminDashboardPage';
export { UserManagementPage } from './pages/UserManagementPage';
export { PropertyModerationPage } from './pages/PropertyModerationPage';

// Key services for external use
export { adminService } from './services/adminService';
export { userService } from './services/userService';
export { analyticsService } from './services/analyticsService';
export { contentService } from './services/contentService';

// Commonly used types for external use
export type { AdminTab, QuickAction } from './types/admin';
export type { UserModerationData, UserFilters } from './types/user';
export type { AnalyticsData } from './types/analytics';
export type { ReviewModerationData } from './types/moderation';
export type { ReviewFilters } from './services/contentService';