import { PropertyType, ListingType } from './property';
import { PropertyFilters } from './search';

// Advanced filter types
export interface PropertyFilterOptions {
  propertyTypes: Array<{
    value: PropertyType;
    label: string;
    count?: number;
  }>;
  listingTypes: Array<{
    value: ListingType;
    label: string;
    count?: number;
  }>;
  priceRanges: Array<{
    min: number;
    max: number;
    label: string;
  }>;
  areaRanges: Array<{
    min: number;
    max: number;
    label: string;
    unit: string;
  }>;
  bedroomOptions: Array<{
    value: number;
    label: string;
    count?: number;
  }>;
  bathroomOptions: Array<{
    value: number;
    label: string;
    count?: number;
  }>;
  amenityOptions: Array<{
    value: string;
    label: string;
    category: string;
    count?: number;
  }>;
  locationOptions: Array<{
    value: string;
    label: string;
    type: 'city' | 'area' | 'pincode';
    count?: number;
  }>;
}

// Filter state management
export interface FilterState {
  activeFilters: PropertyFilters;
  availableOptions: PropertyFilterOptions;
  isLoading: boolean;
  error: string | null;
}

export interface FilterAction {
  type: 'SET_FILTER' | 'CLEAR_FILTER' | 'RESET_FILTERS' | 'SET_OPTIONS' | 'SET_LOADING' | 'SET_ERROR';
  payload?: any;
}

// Filter presets
export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: PropertyFilters;
  isDefault?: boolean;
  category: 'popular' | 'budget' | 'luxury' | 'investment' | 'custom';
}

// Filter validation
export interface FilterValidation {
  isValid: boolean;
  errors: Array<{
    field: keyof PropertyFilters;
    message: string;
  }>;
  warnings: Array<{
    field: keyof PropertyFilters;
    message: string;
  }>;
}

// Re-export from search for convenience
export type { PropertyFilters } from './search';