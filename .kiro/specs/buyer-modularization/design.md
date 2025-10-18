# Design Document

## Overview

This design document outlines the modularization of buyer-related code into a cohesive feature structure following the established patterns used in the agent and admin features. The modularization will consolidate scattered buyer functionality into a well-organized, maintainable structure that improves code reusability and developer experience.

## Architecture

### Directory Structure

The buyer feature will follow the established pattern with the following structure:

```
frontend/src/features/buyer/
├── components/
│   ├── BuyerStatsCard.tsx           # Reusable stats display component
│   ├── QuickActionCard.tsx          # Reusable quick action component
│   ├── PropertyCard.tsx             # Property display component for favorites
│   ├── SavedSearchCard.tsx          # Saved search display component
│   ├── BuyerDashboardTabs.tsx       # Dashboard navigation tabs
│   ├── FavoritesList.tsx            # Favorites list component
│   ├── SavedSearchesList.tsx        # Saved searches list component
│   └── index.ts                     # Component exports
├── pages/
│   ├── BuyerDashboardPage.tsx       # Main buyer dashboard
│   ├── FavoritesPage.tsx            # Favorites management interface
│   ├── SavedSearchesPage.tsx        # Saved searches management
│   ├── PropertySearchPage.tsx       # Property search interface
│   └── index.ts                     # Page exports
├── services/
│   ├── buyerService.ts              # General buyer API calls
│   ├── favoritesService.ts          # Favorites related APIs
│   ├── savedSearchesService.ts      # Saved searches APIs
│   ├── propertySearchService.ts     # Property search APIs
│   └── index.ts                     # Service exports
├── hooks/
│   ├── useFavorites.ts              # Favorites management hook
│   ├── useSavedSearches.ts          # Saved searches hook
│   ├── useBuyerStats.ts             # Buyer statistics hook
│   └── index.ts                     # Hook exports
├── types/
│   ├── buyer.ts                     # Buyer-specific types
│   ├── favorites.ts                 # Favorites types
│   ├── savedSearches.ts             # Saved searches types
│   └── index.ts                     # Type exports
└── index.ts                         # Main feature exports
```

## Components and Interfaces

### Core Components

#### BuyerStatsCard
- **Purpose**: Display buyer statistics (saved properties, searches, messages)
- **Props**: `stat` object with title, value, icon, color, subtitle
- **Reusability**: Used in dashboard and other buyer pages

#### QuickActionCard
- **Purpose**: Display quick action buttons for buyer workflows
- **Props**: `action` object with title, description, icon, onClick handler
- **Features**: Navigation to search, favorites, saved searches, messages

#### PropertyCard
- **Purpose**: Display property information in favorites and search results
- **Props**: `property` object, `variant` (grid/list), selection capabilities
- **Features**: Favorite toggle, selection checkbox, property details

#### SavedSearchCard
- **Purpose**: Display saved search criteria and actions
- **Props**: `search` object with filters, name, created date
- **Features**: Run search, edit filters, delete search

### Page Components

#### BuyerDashboardPage
- **Purpose**: Main dashboard for buyers
- **Features**: Stats overview, quick actions, recent activity
- **Components**: BuyerStatsCard, QuickActionCard

#### FavoritesPage
- **Purpose**: Manage saved properties
- **Features**: Grid/list view, bulk operations, sorting, filtering
- **Components**: PropertyCard, FavoritesList

#### SavedSearchesPage
- **Purpose**: Manage saved search criteria
- **Features**: Create, edit, delete, run saved searches
- **Components**: SavedSearchCard, SavedSearchesList

## Data Models

### Buyer Statistics
```typescript
interface BuyerStats {
  savedProperties: number;
  savedSearches: number;
  messages: number;
  recentActivity: ActivityItem[];
}
```

### Favorite Property
```typescript
interface Favorite {
  id: number;
  property: Property;
  added_at: string;
  user_id: number;
}
```

### Saved Search
```typescript
interface SavedSearch {
  id: number;
  name: string;
  filters: PropertyFilters;
  created_at: string;
  updated_at: string;
  user_id: number;
}
```

### Property Filters
```typescript
interface PropertyFilters {
  location?: string;
  property_type?: string;
  listing_type?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  area_min?: number;
  area_max?: number;
}
```

## Services Architecture

### FavoritesService
- **Methods**: `getFavorites()`, `addToFavorites()`, `removeFromFavorites()`, `bulkRemoveFromFavorites()`
- **Error Handling**: Consistent error responses and retry logic
- **Caching**: Local state management with optimistic updates

### SavedSearchesService
- **Methods**: `getSavedSearches()`, `createSavedSearch()`, `updateSavedSearch()`, `deleteSavedSearch()`, `runSavedSearch()`
- **Features**: Search criteria validation, duplicate detection

### BuyerService
- **Methods**: `getBuyerStats()`, `getBuyerActivity()`, `updateBuyerPreferences()`
- **Integration**: Aggregates data from favorites and saved searches services

### PropertySearchService
- **Methods**: `searchProperties()`, `getPropertySuggestions()`, `getFilterOptions()`
- **Features**: Advanced filtering, pagination, sorting

## Hooks Architecture

### useFavorites
- **State**: favorites list, loading, error states
- **Methods**: add, remove, bulk operations, favorite status check
- **Features**: Optimistic updates, error recovery

### useSavedSearches
- **State**: saved searches list, loading, error states
- **Methods**: create, update, delete, run searches
- **Features**: Form validation, search execution

### useBuyerStats
- **State**: buyer statistics, loading state
- **Methods**: refresh stats, get activity feed
- **Features**: Real-time updates, caching

## Error Handling

### Service Layer
- Consistent error response format
- Retry logic for network failures
- Graceful degradation for partial failures

### Component Layer
- User-friendly error messages
- Fallback UI states
- Error boundaries for critical failures

### Hook Layer
- Error state management
- Recovery mechanisms
- Loading state coordination

## Testing Strategy

### Unit Tests
- Service methods with mocked API calls
- Hook behavior with various states
- Component rendering and interactions

### Integration Tests
- End-to-end buyer workflows
- Service integration with backend APIs
- Hook integration with components

### Component Tests
- Props validation and rendering
- User interaction handling
- Error state display

## Performance Optimizations

### Code Splitting
- Lazy loading for buyer feature pages
- Dynamic imports for heavy components
- Route-based code splitting

### Data Management
- Efficient caching strategies
- Optimistic updates for better UX
- Pagination for large datasets

### Bundle Optimization
- Tree shaking for unused exports
- Shared component reuse
- Minimal external dependencies

## Migration Strategy

### Phase 1: Structure Setup
1. Create buyer feature directory structure
2. Extract and organize existing types
3. Set up barrel exports and index files

### Phase 2: Component Extraction
1. Extract BuyerStatsCard from BuyerDashboard
2. Extract QuickActionCard components
3. Create reusable PropertyCard component
4. Extract SavedSearchCard component

### Phase 3: Service Organization
1. Extract favorites API calls to favoritesService
2. Extract saved searches API calls to savedSearchesService
3. Create buyerService for dashboard data
4. Organize property search service

### Phase 4: Page Migration
1. Move FavoritesPage to buyer feature
2. Move SavedSearchesPage to buyer feature
3. Refactor BuyerDashboard to use modular components
4. Update routing and imports

### Phase 5: Hook Migration
1. Move useFavorites hook to buyer feature
2. Create useSavedSearches hook
3. Create useBuyerStats hook
4. Update component imports

### Phase 6: Integration and Cleanup
1. Update App.tsx imports
2. Update routing configuration
3. Create feature barrel exports
4. Remove old file locations
5. Update documentation

## Security Considerations

- Proper authentication checks for all buyer endpoints
- User-specific data isolation
- Input validation and sanitization
- Secure handling of search criteria
- Rate limiting for search operations

## Accessibility

- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Responsive design for mobile devices

## Documentation

- Component documentation with examples
- Hook usage documentation
- Service API documentation
- Migration guide for developers
- User guide for buyer features