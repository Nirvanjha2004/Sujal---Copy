// Core property types extracted from existing codebase
export interface Property {
  id: number;
  title: string;
  description: string;
  propertyType: PropertyType;
  property_type?: PropertyType; // API response field
  listingType: ListingType;
  listing_type?: ListingType; // API response field
  price: number;
  area: number;
  areaSqft?: number; // Legacy field support
  area_sqft?: number; // API response field
  bedrooms?: number;
  bathrooms?: number;
  location: LocationData;
  address?: string; // Additional field from forms
  city: string;
  state: string;
  postalCode?: string;
  postal_code?: string; // API response field
  latitude?: number;
  longitude?: number;
  amenities: string[] | Record<string, boolean>; // Support both formats
  images: PropertyImage[];
  isActive: boolean;
  is_active?: boolean; // API response field
  isFeatured: boolean;
  is_featured?: boolean; // API response field
  status: PropertyStatus;
  ownerId: number;
  owner_id?: number; // API response field
  agentId?: number;
  agent_id?: number; // API response field
  createdAt: string;
  created_at?: string; // API response field
  updatedAt: string;
  updated_at?: string; // API response field
  stats?: PropertyStats;
  features?: PropertyFeature[];
  specifications?: Record<string, any>;
  owner?: any; // User object from API
  agent?: any; // Agent object from API
}

export type PropertyType = 'apartment' | 'house' | 'villa' | 'plot' | 'commercial' | 'land';
export type ListingType = 'sale' | 'rent';
export type PropertyStatus = 'new' | 'resale' | 'under_construction' | 'active' | 'inactive' | 'sold' | 'rented';
export type AreaUnit = 'sqft' | 'sqm' | 'acres' | 'marla' | 'kanal';

export interface LocationData {
  address: string;
  city: string;
  state: string;
  pincode?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertyImage {
  id: number;
  propertyId?: number;
  property_id?: number; // API response field
  url: string;
  image_url?: string; // API response field
  thumbnailUrl?: string;
  thumbnail_url?: string; // API response field
  alt: string;
  alt_text?: string; // API response field
  caption?: string;
  order?: number;
  display_order?: number; // API response field
  isPrimary: boolean;
  is_primary?: boolean; // API response field
  uploadedAt?: string;
  uploaded_at?: string; // API response field
  imageType?: PropertyImageType;
  image_type?: PropertyImageType; // API response field
}

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

// Form and API types
export interface CreatePropertyRequest {
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  price: number;
  areaSqft: number;
  bedrooms: number;
  bathrooms: number;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  amenities: Record<string, boolean>;
}

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