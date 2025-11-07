import { PropertyType, ListingType, PropertyStatus, Property } from './property';

// Search and filtering types - using backend field names for consistency
export interface PropertyFilters {
  location?: string;
  property_type?: PropertyType | PropertyType[]; // Backend field name
  listing_type?: ListingType; // Backend field name
  status?: PropertyStatus;
  min_price?: number; // Backend field name
  max_price?: number; // Backend field name
  bedrooms?: number;
  bathrooms?: number;
  min_area?: number; // Backend field name
  max_area?: number; // Backend field name
  amenities?: string[];
  features?: string[];
  is_active?: boolean; // Backend field name
  is_featured?: boolean; // Backend field name
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  
  // Deprecated - use backend field names above
  /** @deprecated Use property_type instead */
  propertyType?: PropertyType | PropertyType[];
  /** @deprecated Use listing_type instead */
  listingType?: ListingType;
  /** @deprecated Use min_price instead */
  minPrice?: number;
  /** @deprecated Use max_price instead */
  maxPrice?: number;
  /** @deprecated Use min_area instead */
  minArea?: number;
  /** @deprecated Use max_area instead */
  maxArea?: number;
  /** @deprecated Use is_active instead */
  isActive?: boolean;
  /** @deprecated Use is_featured instead */
  isFeatured?: boolean;
}

export interface SearchCriteria extends PropertyFilters {
  query?: string;
  q?: string; // API field
  sortBy?: PropertySortOption;
  sortOrder?: 'asc' | 'desc';
}

export type PropertySortOption = 
  | 'relevance' 
  | 'price_low' 
  | 'price_high' 
  | 'date_new' 
  | 'date_old' 
  | 'area_large' 
  | 'area_small'
  | 'created_at'
  | 'price'
  | 'area';

export interface SavedSearch {
  id: number;
  userId: number;
  name: string;
  criteria: SearchCriteria;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchHistory {
  id: number;
  userId: number;
  query: string;
  filters: PropertyFilters;
  resultCount: number;
  searchedAt: string;
}

export interface PropertySuggestion {
  id: string;
  text: string;
  type: 'location' | 'property_type' | 'amenity';
  count?: number;
}

// Quick filter options
export interface QuickFilter {
  key: string;
  label: string;
  filter: Partial<PropertyFilters>;
  isActive?: boolean;
}

// Advanced search types
export interface PropertySearchState {
  query: string;
  filters: PropertyFilters;
  results: Property[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  totalResults: number;
  currentPage: number;
}

export interface SearchFormState {
  location: string;
  propertyType: PropertyType | '';
  listingType: ListingType | '';
  priceRange: [number, number];
  areaRange: [number, number];
  bedrooms: number | '';
  bathrooms: number | '';
  amenities: string[];
  keywords: string;
}

// Location and map types
export interface LocationSuggestion {
  id: string;
  name: string;
  type: 'city' | 'area' | 'landmark' | 'pincode';
  state?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface PropertyMapMarker {
  id: number;
  position: {
    lat: number;
    lng: number;
  };
  price: number;
  propertyType: PropertyType;
  listingType: ListingType;
  title: string;
  image?: string;
}