# Implementation Plan

- [ ] 1. Set up buyer feature directory structure and extract existing types





  - Create the `frontend/src/features/buyer/` directory with subdirectories for components, pages, services, hooks, and types
  - Extract existing TypeScript interfaces from BuyerDashboard, FavoritesPage, and SavedSearchesPage
  - Create index.ts files for proper exports in each subdirectory
  - _Requirements: 1.1, 1.2, 5.1, 5.3_

- [ ] 2. Extract and modularize existing dashboard components





- [x] 2.1 Extract BuyerStatsCard from BuyerDashboard


  - Create reusable BuyerStatsCard component from existing stats cards in BuyerDashboard
  - Preserve existing styling and functionality
  - _Requirements: 2.2, 6.1, 6.3_

- [x] 2.2 Extract QuickActionCard from BuyerDashboard


  - Create reusable QuickActionCard component from existing quick actions section
  - Maintain existing click handlers and navigation logic
  - _Requirements: 2.2, 6.1, 6.3_

- [x] 2.3 Create PropertyCard component for favorites


  - Extract and enhance PropertyCard component from FavoritesPage
  - Add support for selection, bulk operations, and different view modes
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 2.4 Create SavedSearchCard component


  - Extract SavedSearchCard component from SavedSearchesPage
  - Include filter display, run search, and delete functionality
  - _Requirements: 6.1, 6.2, 6.3_

- [ ]* 2.5 Write unit tests for extracted dashboard components
  - Create unit tests for BuyerStatsCard, QuickActionCard, PropertyCard, and SavedSearchCard components
  - Test component props, rendering, and user interactions
  - _Requirements: 2.3, 6.2_

- [ ] 3. Extract and organize existing API calls into services





- [x] 3.1 Extract favorites API calls from useFavorites hook


  - Create favoritesService with existing API calls from useFavorites hook
  - Preserve existing error handling and response formatting
  - _Requirements: 4.1, 4.3, 4.4_

- [x] 3.2 Extract saved searches API calls from SavedSearchesPage


  - Create savedSearchesService with existing API calls from SavedSearchesPage
  - Maintain existing data fetching logic and error handling
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 3.3 Create buyerService for dashboard data


  - Extract dashboard data fetching logic and create service functions for buyer stats
  - Create service functions for buyer activity and preferences
  - _Requirements: 4.1, 4.3, 4.4_

- [x] 3.4 Create propertySearchService for search functionality


  - Extract property search logic into dedicated service
  - Include search suggestions and filter options
  - _Requirements: 4.1, 4.2, 4.4_

- [ ]* 3.5 Write unit tests for extracted services
  - Create unit tests for favoritesService, savedSearchesService, and buyerService
  - Mock existing API calls and test error handling
  - _Requirements: 4.3_

- [ ] 4. Move and refactor existing hooks to buyer feature





- [x] 4.1 Move useFavorites hook to buyer feature directory


  - Move existing useFavorites hook from `frontend/src/shared/hooks/` to `frontend/src/features/buyer/hooks/`
  - Update imports to use new favoritesService
  - Preserve all existing functionality
  - _Requirements: 8.1, 8.3, 7.1_

- [x] 4.2 Create useSavedSearches hook


  - Create new useSavedSearches hook using savedSearchesService
  - Include state management for searches, loading, and error states
  - Add methods for CRUD operations on saved searches
  - _Requirements: 8.2, 8.3, 8.4_

- [x] 4.3 Create useBuyerStats hook


  - Create useBuyerStats hook using buyerService
  - Include state management for buyer statistics and activity
  - Add refresh and caching functionality
  - _Requirements: 8.2, 8.3, 8.4_

- [ ]* 4.4 Write unit tests for buyer hooks
  - Create unit tests for useFavorites, useSavedSearches, and useBuyerStats hooks
  - Test hook state management and API integration
  - _Requirements: 8.4_

- [ ] 5. Move and refactor existing pages to buyer feature





- [x] 5.1 Move FavoritesPage to buyer feature directory


  - Move existing FavoritesPage from `frontend/src/components/dashboard/` to `frontend/src/features/buyer/pages/`
  - Update imports to use new services and hooks
  - Preserve all existing functionality
  - _Requirements: 3.1, 3.2, 7.1_

- [x] 5.2 Move SavedSearchesPage to buyer feature directory


  - Move existing SavedSearchesPage from `frontend/src/components/dashboard/` to `frontend/src/features/buyer/pages/`
  - Update imports to use new savedSearchesService and useSavedSearches hook
  - Preserve all existing functionality
  - _Requirements: 3.1, 3.2, 7.1_

- [x] 5.3 Refactor BuyerDashboard to use modular components


  - Update BuyerDashboard to use extracted BuyerStatsCard and QuickActionCard components
  - Integrate with new buyerService and useBuyerStats hook for data fetching
  - Maintain existing functionality and styling
  - _Requirements: 2.1, 3.2, 7.1, 7.4_

- [x] 5.4 Create BuyerDashboardPage wrapper


  - Create BuyerDashboardPage that wraps the refactored BuyerDashboard component
  - Ensure consistent page structure with other features
  - _Requirements: 3.1, 3.2, 7.1_

- [ ]* 5.5 Write integration tests for refactored pages
  - Create tests for page routing and component integration
  - Test user interactions and data flow
  - _Requirements: 3.3, 7.4_

- [ ] 6. Update application integration and remove duplicates





- [x] 6.1 Update import statements in App.tsx


  - Update imports in App.tsx to use new modular structure for FavoritesPage and SavedSearchesPage
  - Ensure all existing routes continue to work
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 6.2 Update imports in DashboardPage.tsx


  - Update imports for BuyerDashboard to use new location
  - Ensure all existing functionality is preserved
  - _Requirements: 2.4, 7.3, 7.4_

- [x] 6.3 Create feature index files for clean exports


  - Create main feature index.ts file exporting all buyer components, pages, hooks, and services
  - Update component exports in subdirectory index files
  - _Requirements: 3.4, 5.3, 7.1_

- [x] 6.4 Remove old file locations and update references


  - Remove old FavoritesPage and SavedSearchesPage from components/dashboard directory
  - Remove old useFavorites hook from shared/hooks directory
  - Update any remaining references to old paths
  - _Requirements: 7.1, 7.3_

- [ ]* 6.5 Write end-to-end tests for buyer feature integration
  - Test complete buyer workflows from dashboard to favorites and saved searches
  - Verify backward compatibility and existing functionality
  - _Requirements: 7.4_

- [ ] 7. Create additional buyer-specific components and utilities





- [x] 7.1 Create FavoritesList component


  - Extract list functionality from FavoritesPage into reusable component
  - Include sorting, filtering, and bulk operations
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 7.2 Create SavedSearchesList component


  - Extract list functionality from SavedSearchesPage into reusable component
  - Include search management and execution features
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 7.3 Create buyer utility functions


  - Extract common buyer-related utility functions
  - Include price formatting, area calculations, and filter helpers
  - _Requirements: 8.2, 8.3_

- [ ]* 7.4 Write component tests for new buyer components
  - Create tests for FavoritesList and SavedSearchesList components
  - Test utility functions and helper methods
  - _Requirements: 6.2, 6.4_