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
  PROPERTY_STATUSES
} from './constants';

// =============================================================================
// COMPONENTS
// =============================================================================
export { PropertyCard, PropertyGallery, PropertyImageUpload, PropertyFilters } from './components/common';
export { PropertyDetails, PropertyOverview, PropertyFeatures, PropertyContact } from './components/details';
export { AddPropertyForm, EditPropertyForm, PropertySearchForm, PropertyFiltersForm } from './components/forms';
export { PropertyGrid, PropertyList, SearchResults, FeaturedProperties } from './components/lists';

// =============================================================================
// PAGES
// =============================================================================
export { 
  PropertyListingPage, 
  PropertyDetailsPage, 
  AddPropertyPage, 
  EditPropertyPage,
  MyPropertiesPage,
  PropertySearchPage
} from './pages';

// =============================================================================
// HOOKS
// =============================================================================
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
  propertyService,
  propertySearchService,
  propertyImageService,
  propertyAnalyticsService
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