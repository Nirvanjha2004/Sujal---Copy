// Constants barrel export
export * from './propertyConstants';
export * from './propertyTypes';
export * from './amenities';

// Re-export commonly used constants for convenience
export {
  PROPERTY_TYPES,
  LISTING_TYPES,
  BEDROOM_OPTIONS,
  BATHROOM_OPTIONS,
  AMENITIES_LIST,
  PRICE_RANGES,
  AREA_RANGES,
  SORT_OPTIONS,
  QUICK_FILTERS,
  VALIDATION_RULES,
  DEFAULT_VALUES,
  FEATURE_FLAGS,
  API_ENDPOINTS
} from './propertyConstants';

export {
  PROPERTY_TYPE_CONFIG,
  LISTING_TYPE_CONFIG,
  AREA_UNIT_CONFIG,
  PROPERTY_IMAGE_TYPE_CONFIG,
  PROPERTY_CATEGORIES,
  PROPERTY_SIZE_CATEGORIES,
  INVESTMENT_CATEGORIES
} from './propertyTypes';

export {
  AMENITY_CATEGORIES,
  AMENITIES_CONFIG,
  AMENITY_IMPORTANCE_BY_TYPE,
  AMENITY_FILTERS
} from './amenities';