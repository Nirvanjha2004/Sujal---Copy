import { createPreloadableLazyComponent } from '@/shared/utils/lazyImports';

// Lazy load dashboard pages
export const LazyDashboardPage = createPreloadableLazyComponent(
  () => import('../../../dashboard/pages/DashboardPage')
);

export const LazyUserActivityPage = createPreloadableLazyComponent(
  () => import('../../../dashboard/pages/UserActivityPage')
);

export const LazyAccountSettingsPage = createPreloadableLazyComponent(
  () => import('../../../dashboard/pages/AccountSettingsPage')
);

export const LazyMessagesPage = createPreloadableLazyComponent(
  () => import('../../../dashboard/pages/MessagesPage')
);

// Lazy load dashboard components
export const LazyDashboardSidebar = createPreloadableLazyComponent(
  () => import('../common/DashboardSidebar')
);

export const LazyStatsCard = createPreloadableLazyComponent(
  () => import('../common/StatsCard')
);

export const LazyActivityFeed = createPreloadableLazyComponent(
  () => import('../common/ActivityFeed')
);

export const LazyNotificationPanel = createPreloadableLazyComponent(
  () => import('../common/NotificationPanel')
);

export const LazyQuickActions = createPreloadableLazyComponent(
  () => import('../common/QuickActions')
);

// Lazy load role-specific dashboard content
export const LazyBuyerDashboardContent = createPreloadableLazyComponent(
  () => import('../role-specific/BuyerDashboardContent')
);

export const LazyAgentDashboardContent = createPreloadableLazyComponent(
  () => import('../role-specific/AgentDashboardContent')
);

export const LazyBuilderDashboardContent = createPreloadableLazyComponent(
  () => import('../role-specific/BuilderDashboardContent')
);

export const LazyAdminDashboardContent = createPreloadableLazyComponent(
  () => import('../role-specific/AdminDashboardContent')
);

export const LazyUserDashboardContent = createPreloadableLazyComponent(
  () => import('../role-specific/UserDashboardContent')
);