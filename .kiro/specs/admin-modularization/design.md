# Design Document

## Overview

This design outlines the migration of admin-related code from `frontend/src/components/admin` to `frontend/src/features/admin` to follow the established feature-based architecture pattern. The migration will organize admin functionality into a cohesive feature module with proper separation of concerns while maintaining all existing functionality and design.

## Architecture

### Current State
- All admin components are located in `frontend/src/components/admin/`
- Components include both page-level and reusable UI components
- Business logic is mixed within components
- No clear separation between services, types, and UI components
- API calls are embedded directly in components

### Target State
- Admin functionality organized as a feature module in `frontend/src/features/admin/`
- Clear separation between pages, components, services, and types
- Extracted business logic into dedicated service files
- Proper TypeScript interfaces and types
- Clean barrel exports for external consumption

## Components and Interfaces

### Directory Structure
```
frontend/src/features/admin/
├── components/           # Reusable UI components
│   ├── AdminSidebar.tsx
│   ├── AdminTopBar.tsx
│   ├── QuickActionCard.tsx
│   ├── UserTable.tsx
│   ├── PropertyModerationCard.tsx
│   ├── AnalyticsChart.tsx
│   └── index.ts
├── pages/               # Page-level components
│   ├── AdminPanelPage.tsx
│   ├── AdminDashboardPage.tsx
│   ├── UserManagementPage.tsx
│   ├── PropertyModerationPage.tsx
│   ├── ContentManagementPage.tsx
│   ├── BannerManagementPage.tsx
│   ├── SeoManagementPage.tsx
│   ├── AnalyticsDashboardPage.tsx
│   ├── ReviewModerationPage.tsx
│   ├── UrlRedirectManagementPage.tsx
│   ├── RoleAssignmentPage.tsx
│   └── index.ts
├── services/            # Business logic and API calls
│   ├── adminService.ts
│   ├── userService.ts
│   ├── propertyModerationService.ts
│   ├── analyticsService.ts
│   ├── contentService.ts
│   └── index.ts
├── types/               # TypeScript interfaces and types
│   ├── admin.ts
│   ├── user.ts
│   ├── analytics.ts
│   ├── moderation.ts
│   └── index.ts
└── index.ts            # Barrel export
```

### Component Classification

#### Page Components (to be moved to `pages/`)
- `AdminPanel.tsx` → `AdminPanelPage.tsx` (Main admin layout with navigation)
- `AdminDashboard.tsx` → `AdminDashboardPage.tsx` (Dashboard overview)
- `UserManagement.tsx` → `UserManagementPage.tsx`
- `PropertyModeration.tsx` → `PropertyModerationPage.tsx`
- `ContentManagement.tsx` → `ContentManagementPage.tsx`
- `BannerManagement.tsx` → `BannerManagementPage.tsx`
- `SeoManagement.tsx` → `SeoManagementPage.tsx`
- `AnalyticsDashboard.tsx` → `AnalyticsDashboardPage.tsx`
- `ReviewModeration.tsx` → `ReviewModerationPage.tsx`
- `UrlRedirectManagement.tsx` → `UrlRedirectManagementPage.tsx`
- `RoleAssignment.tsx` → `RoleAssignmentPage.tsx`

#### Reusable Components (to be extracted to `components/`)
- Admin sidebar navigation (extracted from AdminPanel)
- Admin top bar with breadcrumbs (extracted from AdminPanel)
- Quick action cards (extracted from AdminDashboard)
- User data table (extracted from UserManagement)
- Property moderation cards
- Analytics charts and widgets
- Common admin UI patterns

## Data Models

### Core Types (to be defined in `types/`)

```typescript
// types/admin.ts
export interface AdminTab {
  id: string;
  label: string;
  icon: string;
  description: string;
  badge?: string;
  color?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
  count?: number;
}

// types/analytics.ts
export interface AnalyticsData {
  totalUsers: number;
  totalProperties: number;
  totalInquiries: number;
  activeListings: number;
  featuredListings: number;
  usersByRole: Record<string, number>;
  propertiesByType: Record<string, number>;
  recentActivity: {
    newUsers: number;
    newProperties: number;
    newInquiries: number;
  };
}

// types/user.ts
export interface UserModerationData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  propertiesCount: number;
  inquiriesCount: number;
}

export interface UserFilters {
  role?: string;
  isVerified?: boolean;
  isActive?: boolean;
  search?: string;
}
```

### Service Interfaces

```typescript
// services/adminService.ts
export interface AdminService {
  getAnalytics(): Promise<ApiResponse<AnalyticsData>>;
  getTrafficAnalytics(range: string): Promise<ApiResponse<any>>;
  getLeadAnalytics(range: string): Promise<ApiResponse<any>>;
  getListingAnalytics(range: string): Promise<ApiResponse<any>>;
}

// services/userService.ts
export interface UserService {
  getUsers(params: UserFilters & { page: number; limit: number }): Promise<ApiResponse<{ users: UserModerationData[]; total: number; totalPages: number }>>;
  updateUserStatus(userId: number, updates: any): Promise<ApiResponse<void>>;
  deleteUser(userId: number): Promise<ApiResponse<void>>;
}
```

## Error Handling

### Service Layer Error Handling
- All service methods will implement consistent error handling
- Errors will be properly typed and propagated to components
- Loading states will be managed at the service level where appropriate

### Component Error Boundaries
- Each page component will handle its own error states
- Common error UI patterns will be extracted to reusable components
- Graceful degradation for failed API calls

## Testing Strategy

### Unit Testing Approach
- Service functions will be unit tested with mocked API calls
- Component logic will be tested with React Testing Library
- Type definitions will be validated through TypeScript compilation

### Integration Testing
- Page components will be tested with mock services
- Navigation between admin sections will be tested
- API integration will be tested with mock backends

### Migration Testing
- Before/after functionality comparison
- Import path validation
- Build system verification

## Migration Strategy

### Phase 1: Structure Setup
1. Create the new directory structure in `frontend/src/features/admin/`
2. Set up barrel exports and index files
3. Create type definitions based on existing interfaces

### Phase 2: Service Extraction
1. Extract API calls from components into service files
2. Implement proper error handling and response typing
3. Create service interfaces and implementations

### Phase 3: Component Migration
1. Move page components to `pages/` directory
2. Extract reusable components to `components/` directory
3. Update imports to use new service layer

### Phase 4: Import Updates
1. Update all external references to use new feature exports
2. Remove old component directory
3. Verify all functionality works as expected

### Phase 5: Cleanup and Optimization
1. Remove unused imports and dependencies
2. Optimize component structure and performance
3. Update documentation and type exports

## Import Path Strategy

### External Imports (from other parts of the app)
```typescript
// Before
import { AdminPanel } from '@/components/admin/AdminPanel';

// After
import { AdminPanelPage } from '@/features/admin';
```

### Internal Imports (within admin feature)
```typescript
// Services
import { adminService } from '../services/adminService';
import { userService } from '../services/userService';

// Types
import type { AnalyticsData, UserModerationData } from '../types';

// Components
import { AdminSidebar, AdminTopBar } from '../components';
```

### Barrel Export Structure
```typescript
// frontend/src/features/admin/index.ts
export * from './pages';
export * from './components';
export * from './services';
export * from './types';

// Specific exports for commonly used items
export { AdminPanelPage } from './pages/AdminPanelPage';
export { AdminDashboardPage } from './pages/AdminDashboardPage';
```

## Compatibility Considerations

### Backward Compatibility
- All existing functionality must remain identical
- No changes to component props or behavior
- Styling and UI must remain exactly the same

### Build System Impact
- No changes to build configuration required
- TypeScript paths will be updated automatically
- Bundle size should remain similar or improve

### Performance Considerations
- Code splitting opportunities with feature-based structure
- Lazy loading potential for admin pages
- Service layer caching possibilities

## Risk Mitigation

### Import Resolution Issues
- Comprehensive testing of all import paths
- Gradual migration with verification at each step
- Rollback plan if issues are discovered

### Functionality Regression
- Thorough testing of all admin features
- Side-by-side comparison during migration
- User acceptance testing for critical workflows

### Type Safety
- Strict TypeScript compilation
- Interface validation for all service methods
- Proper error type definitions