// Property feature barrel export
// Main entry point for the property feature module

// =============================================================================
// TYPES
// =============================================================================
export * from './types';

// Commonly used types for convenience
export type {
  Property,
  PropertyType,
  ListingType,
  PropertyStatus,
  PropertyFilters,
  SearchCriteria,
  PropertyAnalytics,
  CreatePropertyRequest,
  UpdatePropertyRequest,
  PropertyFormData
} from './types';

// =============================================================================
// CONSTANTS
// =============================================================================
export * from './constants';

// Commonly used constants for convenience
export {
  PROPERTY_TYPES,
  LISTING_TYPES,
  AMENITIES_LIST,
  VALIDATION_RULES,
  PROPERTY_STATUS,
  CURRENCY_OPTIONS
} from './constants';

// =============================================================================
// COMPONENTS
// =============================================================================
export * from './components';

// =============================================================================
// PAGES
// =============================================================================
export * from './pages';

// =============================================================================
// HOOKS
// =============================================================================
export * from './hooks';

// Commonly used hooks for convenience
export {
  useProperty,
  usePropertySearch,
  usePropertyFavorites,
  usePropertyForm,
  usePropertyFilters
} from './hooks';

// =============================================================================
// SERVICES
// =============================================================================
export * from './services';

// Service instances for convenience
export {
  default as propertyService,
  default as propertySearchService,
  default as propertyImageService,
  default as propertyAnalyticsService
} from './services';

// =============================================================================
// UTILITIES
// =============================================================================
export * from './utils';

// Commonly used utilities for convenience
export {
  formatPrice,
  formatArea,
  calculateEMI,
  validatePropertyForm,
  getPropertyTypeLabel,
  formatCurrency
} from './utils';