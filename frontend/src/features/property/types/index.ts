// Property types barrel export
export * from './property';
export * from './search';
export * from './analytics';
export * from './filters';

// Re-export commonly used types for convenience
export type {
  Property,
  PropertyType,
  ListingType,
  PropertyStatus,
  PropertyImage,
  PropertyImageType,
  PropertyStats,
  PropertyFeature,
  LocationData,
  CreatePropertyRequest,
  UpdatePropertyRequest,
  PropertyFormData,
  PaginatedResponse,
  ApiResponse,
  PropertyValidationRules,
  PropertyCardVariant,
  PropertyListLayout,
  PropertySortBy
} from './property';

export type {
  PropertyFilters,
  SearchCriteria,
  PropertySortOption,
  SavedSearch,
  SearchHistory,
  PropertySuggestion,
  QuickFilter,
  PropertySearchState,
  SearchFormState,
  LocationSuggestion,
  MapBounds,
  PropertyMapMarker
} from './search';

export type {
  PropertyAnalytics,
  ViewsByDate,
  InquiryAnalytics,
  InquiryType,
  InquirySource,
  InquiryStatus,
  MarketInsights,
  PerformanceMetrics,
  PropertyComparison,
  ComparisonMetric,
  TimePeriod,
  ViewStats,
  PropertyAnalyticsDashboard,
  PropertyAnalyticsOverview,
  PropertyRecommendation,
  LeadAnalytics,
  PropertyComparisonAnalytics
} from './analytics';

export type {
  PropertyFilterOptions,
  FilterState,
  FilterAction,
  FilterPreset,
  FilterValidation
} from './filters';