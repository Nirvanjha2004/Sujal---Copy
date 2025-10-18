# Design Document

## Overview

The dashboard modularization feature will reorganize the existing dashboard system from a scattered structure across multiple directories into a cohesive, feature-based module. This design follows the established patterns used in the auth, agent, admin, buyer, and builder features, creating a consistent and maintainable architecture.

The current dashboard system includes:
- Main DashboardPage component that routes to role-specific dashboards
- Role-specific dashboard components (BuyerDashboard, BuilderDashboard, etc.)
- Shared dashboard utilities and components
- User activity and stats management
- Dashboard-related API calls scattered across different services

## Architecture

### Current State Analysis

**Existing Structure:**
```
frontend/src/
├── components/
│   ├── dashboard/
│   │   ├── DashboardPage.tsx
│   │   ├── UserDashboard/
│   │   │   ├── BuyerDashboard.tsx
│   │   │   └── BuilderDashboard.tsx
│   │   ├── UserActivityPage.tsx
│   │   ├── AccountSettingsPage.tsx
│   │   └── Messages.tsx
│   └── admin/
│       └── AdminDashboard.tsx
└── features/
    ├── agent/components/AgentPropertyDashboard.tsx
    ├── buyer/components/BuyerDashboard.tsx
    └── admin/pages/AdminDashboardPage.tsx
```

**Target Modular Structure:**
```
frontend/src/features/dashboard/
├── components/
│   ├── common/
│   │   ├── StatsCard.tsx
│   │   ├── WelcomeSection.tsx
│   │   ├── ActivityFeed.tsx
│   │   ├── QuickActions.tsx
│   │   ├── NotificationPanel.tsx
│   │   └── DashboardLayout.tsx
│   ├── role-specific/
│   │   ├── BuyerDashboardContent.tsx
│   │   ├── AgentDashboardContent.tsx
│   │   ├── BuilderDashboardContent.tsx
│   │   ├── AdminDashboardContent.tsx
│   │   └── UserDashboardContent.tsx
│   └── index.ts
├── pages/
│   ├── DashboardPage.tsx
│   ├── UserActivityPage.tsx
│   ├── AccountSettingsPage.tsx
│   ├── MessagesPage.tsx
│   └── index.ts
├── hooks/
│   ├── useDashboard.ts
│   ├── useUserStats.ts
│   ├── useActivityFeed.ts
│   ├── useNotifications.ts
│   └── index.ts
├── services/
│   ├── dashboardService.ts
│   ├── userStatsService.ts
│   ├── activityService.ts
│   ├── notificationService.ts
│   └── index.ts
├── utils/
│   ├── dashboardHelpers.ts
│   ├── statsCalculations.ts
│   └── index.ts
├── types/
│   ├── dashboard.ts
│   ├── stats.ts
│   ├── activity.ts
│   └── index.ts
├── constants/
│   ├── dashboardConstants.ts
│   └── index.ts
└── index.ts
```

### Integration Points

The dashboard feature will integrate with:
1. **Role-based Features**: Import and compose role-specific components from agent, buyer, builder, admin features
2. **Auth System**: Use auth hooks to determine user role and permissions
3. **React Router**: Maintain existing routing structure
4. **API Layer**: Centralize dashboard-related API calls
5. **Shared Components**: Use existing UI components and layout components

## Components and Interfaces

### Core Components

#### 1. Common Components
- **StatsCard**: Reusable card for displaying statistics with icons and trends
- **WelcomeSection**: Personalized welcome message with user info
- **ActivityFeed**: Recent activity and updates display
- **QuickActions**: Role-specific quick action buttons
- **NotificationPanel**: Notifications and alerts display
- **DashboardLayout**: Consistent layout wrapper for all dashboards

#### 2. Role-Specific Components
- **BuyerDashboardContent**: Buyer-specific dashboard content
- **AgentDashboardContent**: Agent-specific dashboard content
- **BuilderDashboardContent**: Builder-specific dashboard content
- **AdminDashboardContent**: Admin-specific dashboard content
- **UserDashboardContent**: Generic user dashboard content

#### 3. Page Components
- **DashboardPage**: Main dashboard router that determines which role-specific dashboard to show
- **UserActivityPage**: User activity and history page
- **AccountSettingsPage**: User account settings and preferences
- **MessagesPage**: User messages and communications

### Service Layer

#### DashboardService
```typescript
interface DashboardService {
  getDashboardData(userId: number, role: UserRole): Promise<DashboardData>
  getUserStats(userId: number): Promise<UserStats>
  getRecentActivity(userId: number, limit?: number): Promise<Activity[]>
  getNotifications(userId: number): Promise<Notification[]>
  markNotificationAsRead(notificationId: number): Promise<void>
  updateDashboardPreferences(userId: number, preferences: DashboardPreferences): Promise<void>
}
```

#### UserStatsService
```typescript
interface UserStatsService {
  getOverallStats(userId: number): Promise<OverallStats>
  getRoleSpecificStats(userId: number, role: UserRole): Promise<RoleStats>
  getStatsHistory(userId: number, period: TimePeriod): Promise<StatsHistory>
  refreshStats(userId: number): Promise<void>
}
```

#### ActivityService
```typescript
interface ActivityService {
  getActivityFeed(userId: number, options?: ActivityOptions): Promise<Activity[]>
  logActivity(userId: number, activity: ActivityData): Promise<void>
  getActivityByType(userId: number, type: ActivityType): Promise<Activity[]>
  deleteActivity(activityId: number): Promise<void>
}
```

### Hook Layer

#### useDashboard Hook
```typescript
interface UseDashboardReturn {
  dashboardData: DashboardData | null
  isLoading: boolean
  error: string | null
  refreshDashboard: () => Promise<void>
  updatePreferences: (preferences: DashboardPreferences) => Promise<void>
}
```

#### useUserStats Hook
```typescript
interface UseUserStatsReturn {
  stats: UserStats | null
  isLoading: boolean
  error: string | null
  refreshStats: () => Promise<void>
  getStatsByPeriod: (period: TimePeriod) => Promise<StatsHistory>
}
```

#### useActivityFeed Hook
```typescript
interface UseActivityFeedReturn {
  activities: Activity[]
  isLoading: boolean
  error: string | null
  loadMore: () => Promise<void>
  hasMore: boolean
  refreshFeed: () => Promise<void>
}
```

## Data Models

### Dashboard Interface
```typescript
interface DashboardData {
  user: User
  stats: UserStats
  recentActivity: Activity[]
  notifications: Notification[]
  quickActions: QuickAction[]
  preferences: DashboardPreferences
}
```

### User Stats Interface
```typescript
interface UserStats {
  overall: OverallStats
  roleSpecific: RoleStats
  trends: StatsTrend[]
  lastUpdated: string
}

interface OverallStats {
  totalActions: number
  accountAge: number
  lastLogin: string
  profileCompletion: number
}

interface RoleStats {
  // Role-specific stats will be defined based on user role
  [key: string]: any
}
```

### Activity Interface
```typescript
interface Activity {
  id: number
  userId: number
  type: ActivityType
  title: string
  description: string
  metadata?: Record<string, any>
  timestamp: string
  isRead: boolean
}

enum ActivityType {
  LOGIN = 'login',
  PROFILE_UPDATE = 'profile_update',
  PROPERTY_VIEW = 'property_view',
  FAVORITE_ADD = 'favorite_add',
  SEARCH_SAVE = 'search_save',
  MESSAGE_SEND = 'message_send',
  PROPERTY_CREATE = 'property_create',
  LEAD_CONTACT = 'lead_contact'
}
```

### Notification Interface
```typescript
interface Notification {
  id: number
  userId: number
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  isRead: boolean
  actionUrl?: string
  createdAt: string
  expiresAt?: string
}

enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  SUCCESS = 'success',
  ERROR = 'error',
  SYSTEM = 'system'
}

enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}
```

### Dashboard Preferences Interface
```typescript
interface DashboardPreferences {
  layout: DashboardLayout
  widgets: WidgetConfiguration[]
  notifications: NotificationSettings
  theme: ThemeSettings
}

interface WidgetConfiguration {
  id: string
  type: WidgetType
  position: WidgetPosition
  size: WidgetSize
  isVisible: boolean
  settings: Record<string, any>
}
```

## Error Handling

### Error Types
```typescript
enum DashboardErrorType {
  DATA_FETCH_ERROR = 'DATA_FETCH_ERROR',
  STATS_CALCULATION_ERROR = 'STATS_CALCULATION_ERROR',
  ACTIVITY_LOG_ERROR = 'ACTIVITY_LOG_ERROR',
  NOTIFICATION_ERROR = 'NOTIFICATION_ERROR',
  PREFERENCES_UPDATE_ERROR = 'PREFERENCES_UPDATE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR'
}

interface DashboardError {
  type: DashboardErrorType
  message: string
  details?: any
}
```

### Error Handling Strategy
1. **Service Level**: Catch and transform API errors into DashboardError objects
2. **Hook Level**: Provide error state and recovery mechanisms
3. **Component Level**: Display user-friendly error messages with retry options
4. **Global Level**: Handle critical dashboard failures gracefully

## Testing Strategy

### Unit Testing
- **Services**: Mock API calls and test business logic
- **Hooks**: Test state management and side effects
- **Utils**: Test calculation and helper functions
- **Components**: Test rendering and user interactions

### Integration Testing
- **Dashboard Flow**: Test complete dashboard loading and interaction flows
- **Role-based Content**: Test role-specific dashboard content rendering
- **Data Synchronization**: Test real-time updates and data consistency
- **Error Recovery**: Test error handling and recovery mechanisms

### Test Structure
```
frontend/src/features/dashboard/__tests__/
├── services/
│   ├── dashboardService.test.ts
│   ├── userStatsService.test.ts
│   └── activityService.test.ts
├── hooks/
│   ├── useDashboard.test.ts
│   ├── useUserStats.test.ts
│   └── useActivityFeed.test.ts
├── components/
│   ├── common/
│   │   ├── StatsCard.test.tsx
│   │   └── ActivityFeed.test.tsx
│   └── role-specific/
│       └── BuyerDashboardContent.test.tsx
├── utils/
│   └── dashboardHelpers.test.ts
└── integration/
    ├── dashboardFlow.test.tsx
    └── roleBasedAccess.test.tsx
```

## Migration Strategy

### Phase 1: Structure Setup
1. Create the new feature directory structure
2. Set up index files for clean exports
3. Create type definitions and constants

### Phase 2: Service Layer Migration
1. Extract dashboard-related API calls from existing services
2. Create dedicated dashboard services
3. Implement centralized error handling

### Phase 3: Component Migration
1. Extract reusable components from existing dashboard pages
2. Create role-specific dashboard content components
3. Implement common dashboard components

### Phase 4: Hook Layer Creation
1. Create dashboard-specific hooks for data management
2. Implement state management for dashboard features
3. Add real-time update capabilities

### Phase 5: Page Refactoring
1. Refactor existing dashboard pages to use new components and hooks
2. Move pages to the dashboard feature directory
3. Update routing imports in App.tsx

### Phase 6: Integration and Testing
1. Update all import statements across the application
2. Ensure backward compatibility is maintained
3. Add comprehensive tests for the new structure

### Backward Compatibility
- Maintain existing dashboard page exports for gradual migration
- Keep existing API interfaces unchanged
- Preserve all existing routing and navigation
- Ensure no breaking changes to existing dashboard functionality

## Performance Considerations

### Code Splitting
- Lazy load dashboard pages to reduce initial bundle size
- Split role-specific components for better caching
- Optimize imports to prevent unnecessary bundling

### Data Management
- Implement efficient caching for dashboard data
- Use pagination for activity feeds and notifications
- Optimize API calls with proper debouncing and throttling

### Real-time Updates
- Implement WebSocket connections for live updates
- Use efficient state updates to minimize re-renders
- Cache frequently accessed data locally

## Accessibility

### Dashboard Accessibility
- Proper ARIA labels for dashboard sections
- Keyboard navigation support for all interactive elements
- Screen reader compatibility for stats and data
- High contrast support for charts and graphs

### Navigation
- Proper heading structure for dashboard sections
- Skip links for dashboard navigation
- Logical tab order throughout dashboard
- Focus management for dynamic content updates