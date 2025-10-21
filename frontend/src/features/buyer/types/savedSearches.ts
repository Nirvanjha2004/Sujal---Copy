// Saved searches-related types and interfaces

export interface PropertyFilters {
  location?: string;
  city?: string | string[]; // Backend uses city field, can be string or array
  property_type?: string | string[]; // Backend can send as array
  listing_type?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number | number[]; // Backend can send as array
  bathrooms?: number | number[]; // Backend can send as array
  min_area?: number;
  max_area?: number;
  area_min?: number;
  area_max?: number;
  status?: string;
  is_featured?: boolean;
  keywords?: string;
}

export interface SavedSearch {
  id: number;
  name: string;
  filters: PropertyFilters;
  created_at: string;
  updated_at?: string;
  user_id?: number;
}

export interface SavedSearchCard {
  search: SavedSearch;
  onDelete: (id: number) => void;
  onRun: (filters: PropertyFilters) => void;
}

export interface SavedSearchesPageState {
  savedSearches: SavedSearch[];
  loading: boolean;
  error: string | null;
}