// Saved searches-related types and interfaces

export interface PropertyFilters {
  location?: string;
  property_type?: string;
  listing_type?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
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