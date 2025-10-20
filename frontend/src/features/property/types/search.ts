import { PropertyType, ListingType, PropertyStatus, Property } from './property';

// Search and filtering types
export interface PropertyFilters {
  location?: string;
  propertyType?: PropertyType | PropertyType[];
  property_type?: PropertyType; // API field
  listingType?: ListingType;
  listing_type?: ListingType; // API field
  status?: PropertyStatus;
  minPrice?: number;
  min_price?: number; // API field
  maxPrice?: number;
  max_price?: number; // API field
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  min_area?: number; // API field
  maxArea?: number;
  max_area?: number; // API field
  amenities?: string[];
  features?: string[];
  isActive?: boolean;
  is_active?: boolean; // API field
  isFeatured?: boolean;
  is_featured?: boolean; // API field
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
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