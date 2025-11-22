// Enums - must match backend exactly
export type PropertyType = 'apartment' | 'house' | 'villa' | 'plot' | 'commercial' | 'land';
export type ListingType = 'sale' | 'rent';
export type PropertyStatus = 'new' | 'resale' | 'under_construction' | 'rented' | 'sold' | 'pending' | 'active';
export type AreaUnit = 'sqft' | 'sqm' | 'acres' | 'marla' | 'kanal';

// Backend amenities interface
export interface PropertyAmenities {
  parking?: boolean;
  gym?: boolean;
  swimming_pool?: boolean;
  garden?: boolean;
  security?: boolean;
  elevator?: boolean;
  power_backup?: boolean;
  water_supply?: boolean;
  internet?: boolean;
  air_conditioning?: boolean;
  furnished?: boolean;
  pet_friendly?: boolean;
  balcony?: boolean;
  terrace?: boolean;
  club_house?: boolean;
  playground?: boolean;
  [key: string]: boolean | undefined;
}

export interface LocationData {
  address: string;
  city: string;
  state: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
}

// Property Image - matches backend
export interface PropertyImage {
  id: number;
  property_id: number;
  image_url: string;
  thumbnail_url?: string;
  large_url?: string;
  medium_url?: string;
  thumbnail_webp_url?: string;
  medium_webp_url?: string;
  large_webp_url?: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

// Core Property interface - matches backend API response
export interface Property {
  id: number;
  user_id: number;          // Backend field name
  title: string;
  description?: string;
  property_type: PropertyType;  // Backend field name
  listing_type: ListingType;    // Backend field name
  status: PropertyStatus;
  price: number;
  area_sqft?: number;       // Backend field name
  bedrooms?: number;
  bathrooms?: number;
  address: string;
  city: string;
  state: string;
  postal_code?: string;     // Backend field name
  latitude?: number;
  longitude?: number;
  amenities: PropertyAmenities;  // JSON field in backend
  is_active: boolean;       // Backend field name
  is_featured: boolean;     // Backend field name
  created_at: string;       // Backend field name
  updated_at: string;       // Backend field name
  expires_at?: string;      // Backend field name
  
  // Related data
  images?: PropertyImage[];
  owner?: any;
  inquiries?: any[];
}

// For form submissions - uses backend naming for consistency
export interface CreatePropertyRequest {
  title: string;
  description?: string;
  property_type: PropertyType;
  listing_type: ListingType;
  price: number;
  area_sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  status: string;
  address: string;
  city: string;
  state: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  amenities: PropertyAmenities;
}

// Utility functions for backward compatibility
export const getPropertyUserId = (property: Property): number => property.user_id;
export const getPropertyType = (property: Property): PropertyType => property.property_type;
export const getPropertyListingType = (property: Property): ListingType => property.listing_type;
export const getPropertyAreaSqft = (property: Property): number | undefined => property.area_sqft;
export const getPropertyIsActive = (property: Property): boolean => property.is_active;
export const getPropertyIsFeatured = (property: Property): boolean => property.is_featured;
export const getPropertyCreatedAt = (property: Property): string => property.created_at;
export const getPropertyUpdatedAt = (property: Property): string => property.updated_at;

export type PropertyImageType = 'exterior' | 'interior' | 'amenity' | 'floor_plan' | 'gallery' | 'virtual_tour';

export interface PropertyStats {
  views: number;
  favorites: number;
  inquiries: number;
  shares: number;
  lastViewed?: string;
  averageViewDuration?: number;
}

export interface PropertyFeature {
  id: number;
  name: string;
  category: string;
  isAvailable: boolean;
}

// Additional property types

export interface UpdatePropertyRequest extends Partial<CreatePropertyRequest> {
  id: number;
}

export interface PropertyFormData {
  title: string;
  description: string;
  property_type: string;
  listing_type: string;
  status: string;
  price: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  amenities: string[];
  images: File[];
  latitude?: string;
  longitude?: string;
  specifications?: Record<string, any>;
}

// Pagination and API response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Property validation types
export interface PropertyValidationRules {
  title: {
    minLength: number;
    maxLength: number;
    required: boolean;
  };
  description: {
    minLength: number;
    maxLength: number;
    required: boolean;
  };
  price: {
    min: number;
    max: number;
    required: boolean;
  };
  area: {
    min: number;
    max: number;
    required: boolean;
  };
  images: {
    maxCount: number;
    maxSize: number; // in bytes
    allowedTypes: string[];
    required: boolean;
  };
}

// Property display and UI types
export interface PropertyCardVariant {
  type: 'grid' | 'list' | 'compact' | 'featured';
  showFavorite?: boolean;
  showStats?: boolean;
  showAgent?: boolean;
  showDescription?: boolean;
}

export interface PropertyListLayout {
  variant: 'grid' | 'list';
  itemsPerPage: number;
  sortBy: PropertySortBy;
  sortOrder: 'asc' | 'desc';
}

export type PropertySortBy = 'price' | 'area' | 'created_at' | 'updated_at' | 'title' | 'relevance';