# Design Document

## Overview

The property modularization feature will reorganize the existing property system from a scattered structure across multiple directories into a cohesive, feature-based module. This design follows the established patterns used in the auth, dashboard, agent, admin, buyer, and builder features, creating a consistent and maintainable architecture.

The current property system includes:
- Property listing and detail pages scattered across landing and property directories
- Property components mixed with other functionality
- Property search and filtering components in separate search directory
- Property services and utilities spread across different locations
- Property-related API calls distributed across various service files

## Architecture

### Current State Analysis

**Existing Structure:**
```
frontend/src/
├── components/
│   ├── property/
│   │   ├── AddPropertyPage.tsx
│   │   ├── MyPropertiesPage.tsx
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyDetailsPage.tsx
│   │   ├── ImageGallery.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── AmenitiesSelector.tsx
│   │   └── PropertyLocationInput.tsx
│   ├── properties/
│   │   ├── BulkUpload.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── LeadManagement.tsx
│   │   └── PerformanceAnalytics.tsx
│   ├── landing/
│   │   ├── PropertyListingPage.tsx
│   │   ├── PropertyListingGrid2.tsx
│   │   ├── PropertyListingSearchPage.tsx
│   │   └── SearchViewedDashboard.tsx
│   └── search/
│       ├── AdvancedSearchForm.tsx
│       ├── PropertyMap.tsx
│       ├── SearchResults.tsx
│       └── SavedSearches.tsx
├── shared/
│   └── services/
│       └── propertyService.ts
└── shared/
    └── types/
        └── index.ts (contains Property types)
```

**Target Modular Structure:**
```
frontend/src/features/property/
├── components/
│   ├── common/
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyGallery.tsx
│   │   ├── PropertyImageUpload.tsx
│   │   ├── PropertyStats.tsx
│   │   ├── PropertyFilters.tsx
│   │   ├── PropertyMap.tsx
│   │   ├── AmenitiesSelector.tsx
│   │   └── PropertyLocationInput.tsx
│   ├── forms/
│   │   ├── AddPropertyForm.tsx
│   │   ├── EditPropertyForm.tsx
│   │   ├── PropertySearchForm.tsx
│   │   └── PropertyFiltersForm.tsx
│   ├── lists/
│   │   ├── PropertyGrid.tsx
│   │   ├── PropertyList.tsx
│   │   ├── SearchResults.tsx
│   │   └── FeaturedProperties.tsx
│   ├── details/
│   │   ├── PropertyDetails.tsx
│   │   ├── PropertyOverview.tsx
│   │   ├── PropertyFeatures.tsx
│   │   └── PropertyContact.tsx
│   └── index.ts
├── pages/
│   ├── PropertyListingPage.tsx
│   ├── PropertyDetailsPage.tsx
│   ├── AddPropertyPage.tsx
│   ├── EditPropertyPage.tsx
│   ├── MyPropertiesPage.tsx
│   ├── PropertySearchPage.tsx
│   ├── PropertyComparisonPage.tsx
│   └── index.ts
├── hooks/
│   ├── useProperty.ts
│   ├── usePropertySearch.ts
│   ├── usePropertyFilters.ts
│   ├── usePropertyFavorites.ts
│   ├── usePropertyForm.ts
│   ├── usePropertyAnalytics.ts
│   └── index.ts
├── services/
│   ├── propertyService.ts
│   ├── propertySearchService.ts
│   ├── propertyImageService.ts
│   ├── propertyAnalyticsService.ts
│   └── index.ts
├── utils/
│   ├── propertyHelpers.ts
│   ├── propertyValidation.ts
│   ├── propertyFormatters.ts
│   ├── propertyCalculations.ts
│   └── index.ts
├── types/
│   ├── property.ts
│   ├── search.ts
│   ├── filters.ts
│   ├── analytics.ts
│   └── index.ts
├── constants/
│   ├── propertyConstants.ts
│   ├── propertyTypes.ts
│   └── index.ts
└── index.ts
```

### Integration Points

The property feature will integrate with:
1. **Role-based Features**: Import property components in agent, buyer, builder, admin dashboards
2. **Auth System**: Use auth hooks to determine user permissions for property operations
3. **React Router**: Maintain existing routing structure for property pages
4. **API Layer**: Centralize property-related API calls
5. **Shared Components**: Use existing UI components and layout components
6. **Search System**: Integrate with location services and mapping APIs

## Components and Interfaces

### Core Components

#### 1. Common Components
- **PropertyCard**: Reusable card for displaying property summary with image, price, location
- **PropertyGallery**: Image gallery with lightbox functionality and image navigation
- **PropertyImageUpload**: Drag-and-drop image upload with preview and validation
- **PropertyStats**: Display property statistics like views, favorites, inquiries
- **PropertyFilters**: Reusable filter component for price, type, location, amenities
- **PropertyMap**: Interactive map showing property locations with markers
- **AmenitiesSelector**: Multi-select component for property amenities
- **PropertyLocationInput**: Location input with autocomplete and map integration

#### 2. Form Components
- **AddPropertyForm**: Complete form for adding new properties with validation
- **EditPropertyForm**: Form for editing existing property details
- **PropertySearchForm**: Search form with basic and advanced search options
- **PropertyFiltersForm**: Advanced filters form for property search

#### 3. List Components
- **PropertyGrid**: Grid layout for displaying multiple properties
- **PropertyList**: List layout for property results with sorting options
- **SearchResults**: Search results with pagination and filtering
- **FeaturedProperties**: Carousel or grid of featured/promoted properties

#### 4. Detail Components
- **PropertyDetails**: Main property details component with all information
- **PropertyOverview**: Basic property information and key details
- **PropertyFeatures**: Property features, amenities, and specifications
- **PropertyContact**: Contact form and agent/owner information

### Service Layer

#### PropertyService
```typescript
interface PropertyService {
  getProperties(filters?: PropertyFilters, pagination?: PaginationOptions): Promise<PaginatedResponse<Property>>
  getPropertyById(id: number): Promise<Property>
  createProperty(propertyData: CreatePropertyRequest): Promise<Property>
  updateProperty(id: number, propertyData: UpdatePropertyRequest): Promise<Property>
  deleteProperty(id: number): Promise<void>
  getUserProperties(userId: number): Promise<Property[]>
  toggleFavorite(propertyId: number): Promise<{ isFavorite: boolean }>
  getFavoriteProperties(): Promise<Property[]>
  getSimilarProperties(propertyId: number): Promise<Property[]>
}
```

#### PropertySearchService
```typescript
interface PropertySearchService {
  searchProperties(query: string, filters?: PropertyFilters): Promise<Property[]>
  getPropertySuggestions(query: string): Promise<string[]>
  saveSearch(searchCriteria: SearchCriteria): Promise<SavedSearch>
  getSavedSearches(): Promise<SavedSearch[]>
  deleteSavedSearch(searchId: number): Promise<void>
  getSearchHistory(): Promise<SearchHistory[]>
}
```

#### PropertyImageService
```typescript
interface PropertyImageService {
  uploadPropertyImage(propertyId: number, imageFile: File): Promise<PropertyImage>
  uploadMultipleImages(propertyId: number, imageFiles: File[]): Promise<PropertyImage[]>
  deletePropertyImage(imageId: number): Promise<void>
  reorderPropertyImages(propertyId: number, imageOrder: number[]): Promise<PropertyImage[]>
  optimizeImage(imageFile: File): Promise<File>
}
```

#### PropertyAnalyticsService
```typescript
interface PropertyAnalyticsService {
  getPropertyStats(propertyId: number): Promise<PropertyStats>
  getPropertyViews(propertyId: number, period?: TimePeriod): Promise<ViewStats>
  getPropertyInquiries(propertyId: number): Promise<InquiryStats>
  getMarketInsights(location: string, propertyType: PropertyType): Promise<MarketInsights>
  getPropertyPerformance(propertyId: number): Promise<PerformanceMetrics>
}
```

### Hook Layer

#### useProperty Hook
```typescript
interface UsePropertyReturn {
  property: Property | null
  isLoading: boolean
  error: string | null
  refetchProperty: () => Promise<void>
  updateProperty: (data: Partial<Property>) => Promise<void>
  deleteProperty: () => Promise<void>
}
```

#### usePropertySearch Hook
```typescript
interface UsePropertySearchReturn {
  properties: Property[]
  isLoading: boolean
  error: string | null
  searchProperties: (query: string, filters?: PropertyFilters) => Promise<void>
  clearSearch: () => void
  hasMore: boolean
  loadMore: () => Promise<void>
}
```

#### usePropertyFilters Hook
```typescript
interface UsePropertyFiltersReturn {
  filters: PropertyFilters
  setFilters: (filters: PropertyFilters) => void
  clearFilters: () => void
  applyFilters: () => void
  resetFilters: () => void
  activeFilterCount: number
}
```

#### usePropertyFavorites Hook
```typescript
interface UsePropertyFavoritesReturn {
  favorites: Property[]
  isLoading: boolean
  error: string | null
  toggleFavorite: (propertyId: number) => Promise<void>
  isFavorite: (propertyId: number) => boolean
  refreshFavorites: () => Promise<void>
}
```

## Data Models

### Property Interface
```typescript
interface Property {
  id: number
  title: string
  description: string
  propertyType: PropertyType
  listingType: ListingType
  price: number
  currency: string
  bedrooms?: number
  bathrooms?: number
  area: number
  areaUnit: AreaUnit
  location: PropertyLocation
  amenities: string[]
  images: PropertyImage[]
  features: PropertyFeature[]
  isActive: boolean
  isFeatured: boolean
  ownerId: number
  agentId?: number
  createdAt: string
  updatedAt: string
  stats: PropertyStats
}
```

### Property Search Interface
```typescript
interface PropertyFilters {
  location?: string
  propertyType?: PropertyType[]
  listingType?: ListingType
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  minArea?: number
  maxArea?: number
  amenities?: string[]
  features?: string[]
  isActive?: boolean
  isFeatured?: boolean
}

interface SearchCriteria extends PropertyFilters {
  query?: string
  sortBy?: PropertySortOption
  sortOrder?: 'asc' | 'desc'
}
```

### Property Analytics Interface
```typescript
interface PropertyStats {
  views: number
  favorites: number
  inquiries: number
  shares: number
  lastViewed?: string
  averageViewDuration?: number
}

interface PropertyAnalytics {
  propertyId: number
  totalViews: number
  uniqueViews: number
  viewsByDate: ViewsByDate[]
  inquiries: InquiryAnalytics[]
  favoriteCount: number
  shareCount: number
  performanceScore: number
}
```

### Property Image Interface
```typescript
interface PropertyImage {
  id: number
  propertyId: number
  url: string
  thumbnailUrl: string
  alt: string
  caption?: string
  order: number
  isPrimary: boolean
  uploadedAt: string
}
```

## Error Handling

### Error Types
```typescript
enum PropertyErrorType {
  PROPERTY_NOT_FOUND = 'PROPERTY_NOT_FOUND',
  PROPERTY_ACCESS_DENIED = 'PROPERTY_ACCESS_DENIED',
  PROPERTY_VALIDATION_ERROR = 'PROPERTY_VALIDATION_ERROR',
  PROPERTY_IMAGE_UPLOAD_ERROR = 'PROPERTY_IMAGE_UPLOAD_ERROR',
  PROPERTY_SEARCH_ERROR = 'PROPERTY_SEARCH_ERROR',
  PROPERTY_FAVORITE_ERROR = 'PROPERTY_FAVORITE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR'
}

interface PropertyError {
  type: PropertyErrorType
  message: string
  details?: any
}
```

### Error Handling Strategy
1. **Service Level**: Catch and transform API errors into PropertyError objects
2. **Hook Level**: Provide error state and recovery mechanisms
3. **Component Level**: Display user-friendly error messages with retry options
4. **Global Level**: Handle critical property failures gracefully

## Testing Strategy

### Unit Testing
- **Services**: Mock API calls and test business logic
- **Hooks**: Test state management and side effects
- **Utils**: Test calculation and helper functions
- **Components**: Test rendering and user interactions

### Integration Testing
- **Property Flow**: Test complete property creation, editing, and deletion flows
- **Search Flow**: Test property search and filtering functionality
- **Favorites Flow**: Test property favorite and unfavorite operations
- **Image Upload**: Test property image upload and management

### Test Structure
```
frontend/src/features/property/__tests__/
├── services/
│   ├── propertyService.test.ts
│   ├── propertySearchService.test.ts
│   └── propertyImageService.test.ts
├── hooks/
│   ├── useProperty.test.ts
│   ├── usePropertySearch.test.ts
│   └── usePropertyFavorites.test.ts
├── components/
│   ├── common/
│   │   ├── PropertyCard.test.tsx
│   │   └── PropertyGallery.test.tsx
│   └── forms/
│       └── AddPropertyForm.test.tsx
├── utils/
│   └── propertyHelpers.test.ts
└── integration/
    ├── propertyFlow.test.tsx
    └── propertySearch.test.tsx
```

## Migration Strategy

### Phase 1: Structure Setup
1. Create the new feature directory structure
2. Set up index files for clean exports
3. Create type definitions and constants

### Phase 2: Service Layer Migration
1. Move and refactor propertyService.ts to the new structure
2. Create specialized services for search, images, and analytics
3. Implement centralized error handling

### Phase 3: Component Migration
1. Extract reusable components from existing property pages
2. Create common property components (PropertyCard, PropertyGallery, etc.)
3. Implement form components with proper validation

### Phase 4: Hook Layer Creation
1. Create property-specific hooks for data management
2. Implement state management for property features
3. Add real-time update capabilities

### Phase 5: Page Refactoring
1. Refactor existing property pages to use new components and hooks
2. Move pages to the property feature directory
3. Update routing imports in App.tsx

### Phase 6: Integration and Testing
1. Update all import statements across the application
2. Ensure backward compatibility is maintained
3. Add comprehensive tests for the new structure

### Backward Compatibility
- Maintain existing property page exports for gradual migration
- Keep existing API interfaces unchanged
- Preserve all existing routing and navigation
- Ensure no breaking changes to existing property functionality

## Performance Considerations

### Code Splitting
- Lazy load property pages to reduce initial bundle size
- Split property components for better caching
- Optimize imports to prevent unnecessary bundling

### Data Management
- Implement efficient caching for property data
- Use pagination for property lists and search results
- Optimize API calls with proper debouncing and throttling

### Image Optimization
- Implement lazy loading for property images
- Use responsive images with multiple sizes
- Cache property images locally for better performance

### Search Optimization
- Implement search result caching
- Use debounced search input to reduce API calls
- Optimize filter combinations for better performance

## Accessibility

### Property Accessibility
- Proper ARIA labels for property information
- Keyboard navigation support for property galleries
- Screen reader compatibility for property details
- High contrast support for property images and text

### Search Accessibility
- Proper form labels and descriptions for search inputs
- Keyboard navigation for filter options
- Screen reader announcements for search results
- Focus management for search interactions

### Navigation
- Proper heading structure for property pages
- Skip links for property content sections
- Logical tab order throughout property interfaces
- Focus management for dynamic property content updates