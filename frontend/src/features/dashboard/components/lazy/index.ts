import { createPreloadableLazyComponent } from '@/shared/utils/lazyImports';

// Lazy load dashboard pages
export const LazyDashboardPage = createPreloadableLazyComponent(
  () => import('../../../dashboard/pages/DashboardPage'),
  'DashboardPage'
);

export const LazyUserActivityPage = createPreloadableLazyComponent(
  () => import('../../../dashboard/pages/UserActivityPage'),
  'UserActivityPage'
);

export const LazyAccountSettingsPage = createPreloadableLazyComponent(
  () => import('../../../dashboard/pages/AccountSettingsPage'),
  'AccountSettingsPage'
);

export const LazyMessagesPage = createPreloadableLazyComponent(
  () => import('../../../dashboard/pages/MessagesPage'),
  'MessagesPage'
);

// Lazy load dashboard components
export const LazyDashboardSidebar = createPreloadableLazyComponent(
  () => import('../common/DashboardSidebar'),
  'DashboardSidebar'
);

export const LazyStatsCard = createPreloadableLazyComponent(
  () => import('../common/StatsCard'),
  'StatsCard'
);

export const LazyActivityFeed = createPreloadableLazyComponent(
  () => import('../common/ActivityFeed'),
  'ActivityFeed'
);

export const LazyNotificationPanel = createPreloadableLazyComponent(
  () => import('../common/NotificationPanel'),
  'NotificationPanel'
);

export const LazyQuickActions = createPreloadableLazyComponent(
  () => import('../common/QuickActions'),
  'QuickActions'
);

// Lazy load role-specific dashboard content
export const LazyBuyerDashboardContent = createPreloadableLazyComponent(
  () => import('../role-specific/BuyerDashboardContent'),
  'BuyerDashboardContent'
);

export const LazyAgentDashboardContent = createPreloadableLazyComponent(
  () => import('../role-specific/AgentDashboardContent'),
  'AgentDashboardContent'
);

export const LazyBuilderDashboardContent = createPreloadableLazyComponent(
  () => import('../role-specific/BuilderDashboardContent'),
  'BuilderDashboardContent'
);

export const LazyAdminDashboardContent = createPreloadableLazyComponent(
  () => import('../role-specific/AdminDashboardContent'),
  'AdminDashboardContent'
);

export const LazyUserDashboardContent = createPreloadableLazyComponent(
  () => import('../role-specific/UserDashboardContent'),
  'UserDashboardContent'
);

// Preload functions for route-based preloading
export const preloadDashboardComponents = () => {
  LazyDashboardPage.preload();
  LazyDashboardSidebar.preload();
  LazyStatsCard.preload();
};

export const preloadRoleSpecificContent = (role: string) => {
  switch (role) {
    case 'buyer':
      LazyBuyerDashboardContent.preload();
      break;
    case 'agent':
      LazyAgentDashboardContent.preload();
      break;
    case 'builder':
      LazyBuilderDashboardContent.preload();
      break;
    case 'admin':
      LazyAdminDashboardContent.preload();
      break;
    default:
      LazyUserDashboardContent.preload();
  }
};