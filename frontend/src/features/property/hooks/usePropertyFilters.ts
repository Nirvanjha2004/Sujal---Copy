import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PropertyFilters, PropertySortOption, SearchCriteria } from '../types';
import { useAsyncOperation } from '@/shared/hooks/useAsyncOperation';
import { useErrorHandler } from '@/shared/hooks/useErrorHandler';

export interface UsePropertyFiltersReturn {
  filters: PropertyFilters;
  sortBy: PropertySortOption;
  sortOrder: 'asc' | 'desc';
  setFilters: (filters: PropertyFilters) => void;
  updateFilter: (key: keyof PropertyFilters, value: any) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  resetFilters: () => void;
  setSorting: (sortBy: PropertySortOption, sortOrder?: 'asc' | 'desc') => void;
  activeFilterCount: number;
  hasActiveFilters: boolean;
  getSearchCriteria: () => SearchCriteria;
  loadFiltersFromUrl: () => void;
  saveFiltersToUrl: () => void;
  isLoading: boolean;
  error: string | null;
  applyFiltersAsync: () => Promise<void>;
  clearFiltersAsync: () => Promise<void>;
}

export interface UsePropertyFiltersOptions {
  initialFilters?: Partial<PropertyFilters>;
  initialSortBy?: PropertySortOption;
  initialSortOrder?: 'asc' | 'desc';
  persistToUrl?: boolean;
  persistToStorage?: boolean;
  storageKey?: string;
  onFiltersChange?: (filters: PropertyFilters) => void;
  onSortChange?: (sortBy: PropertySortOption, sortOrder: 'asc' | 'desc') => void;
  onError?: (error: Error) => void;
  debounceMs?: number;
}

const getDefaultFilters = (): PropertyFilters => ({
  location: undefined,
  propertyType: undefined,
  listingType: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  bedrooms: undefined,
  bathrooms: undefined,
  minArea: undefined,
  maxArea: undefined,
  amenities: undefined,
  features: undefined,
  isActive: true,
  isFeatured: undefined
});

export const usePropertyFilters = (options: UsePropertyFiltersOptions = {}): UsePropertyFiltersReturn => {
  const {
    initialFilters = {},
    initialSortBy = 'relevance',
    initialSortOrder = 'desc',
    persistToUrl = true,
    persistToStorage = false,
    storageKey = 'propertyFilters',
    onFiltersChange,
    onSortChange,
    onError,
    debounceMs = 300
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();
  const { handleError } = useErrorHandler();

  const [filters, setFiltersState] = useState<PropertyFilters>(() => {
    const defaultFilters = getDefaultFilters();
    
    // Load from localStorage if persistence is enabled
    if (persistToStorage) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsedFilters = JSON.parse(stored);
          return { ...defaultFilters, ...parsedFilters, ...initialFilters };
        }
      } catch (err) {
        console.warn('Failed to load filters from storage:', err);
      }
    }
    
    return { ...defaultFilters, ...initialFilters };
  });

  const [sortBy, setSortByState] = useState<PropertySortOption>(initialSortBy);
  const [sortOrder, setSortOrderState] = useState<'asc' | 'desc'>(initialSortOrder);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Async operations for filter application
  const {
    execute: executeApplyFilters,
    loading: applyLoading
  } = useAsyncOperation(async () => {
    // Apply filters operation
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  const {
    execute: executeClearFilters,
    loading: clearLoading
  } = useAsyncOperation(async () => {
    // Clear filters operation
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    const defaultFilters = getDefaultFilters();
    let count = 0;
    
    Object.entries(filters).forEach(([key, value]) => {
      const defaultValue = defaultFilters[key as keyof PropertyFilters];
      
      if (value !== undefined && value !== defaultValue) {
        if (Array.isArray(value)) {
          if (value.length > 0) count++;
        } else if (value !== '' && value !== null) {
          count++;
        }
      }
    });
    
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  const setFilters = useCallback((newFilters: PropertyFilters) => {
    setFiltersState(newFilters);
    onFiltersChange?.(newFilters);
    
    // Persist to localStorage if enabled
    if (persistToStorage) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newFilters));
      } catch (err) {
        console.warn('Failed to save filters to storage:', err);
      }
    }
  }, [onFiltersChange, persistToStorage, storageKey]);

  const updateFilter = useCallback((key: keyof PropertyFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  }, [filters, setFilters]);

  const clearFilters = useCallback(() => {
    const defaultFilters = getDefaultFilters();
    setFilters(defaultFilters);
  }, [setFilters]);

  const applyFilters = useCallback(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  const resetFilters = useCallback(() => {
    const defaultFilters = { ...getDefaultFilters(), ...initialFilters };
    setFilters(defaultFilters);
    setSortByState(initialSortBy);
    setSortOrderState(initialSortOrder);
  }, [initialFilters, initialSortBy, initialSortOrder, setFilters]);

  const setSorting = useCallback((newSortBy: PropertySortOption, newSortOrder: 'asc' | 'desc' = 'desc') => {
    setSortByState(newSortBy);
    setSortOrderState(newSortOrder);
    onSortChange?.(newSortBy, newSortOrder);
  }, [onSortChange]);

  const getSearchCriteria = useCallback((): SearchCriteria => {
    return {
      ...filters,
      sortBy,
      sortOrder
    };
  }, [filters, sortBy, sortOrder]);

  const loadFiltersFromUrl = useCallback(() => {
    if (!persistToUrl) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const newFilters = { ...getDefaultFilters() };
      let hasChanges = false;
      
      // Parse URL parameters and update filters
      if (searchParams.has('q')) {
        newFilters.location = searchParams.get('q') || undefined;
        hasChanges = true;
      }
      
      if (searchParams.has('location')) {
        newFilters.location = searchParams.get('location') || undefined;
        hasChanges = true;
      }
      
      if (searchParams.has('property_type')) {
        const types = searchParams.get('property_type')?.split(',');
        newFilters.propertyType = types as any;
        hasChanges = true;
      }
      
      if (searchParams.has('listing_type')) {
        newFilters.listingType = searchParams.get('listing_type') as any;
        hasChanges = true;
      }
      
      if (searchParams.has('min_price')) {
        const minPrice = Number(searchParams.get('min_price'));
        if (!isNaN(minPrice)) {
          newFilters.minPrice = minPrice;
          hasChanges = true;
        }
      }
      
      if (searchParams.has('max_price')) {
        const maxPrice = Number(searchParams.get('max_price'));
        if (!isNaN(maxPrice)) {
          newFilters.maxPrice = maxPrice;
          hasChanges = true;
        }
      }
      
      if (searchParams.has('bedrooms')) {
        const bedrooms = Number(searchParams.get('bedrooms'));
        if (!isNaN(bedrooms)) {
          newFilters.bedrooms = bedrooms;
          hasChanges = true;
        }
      }
      
      if (searchParams.has('bathrooms')) {
        const bathrooms = Number(searchParams.get('bathrooms'));
        if (!isNaN(bathrooms)) {
          newFilters.bathrooms = bathrooms;
          hasChanges = true;
        }
      }
      
      if (searchParams.has('min_area')) {
        const minArea = Number(searchParams.get('min_area'));
        if (!isNaN(minArea)) {
          newFilters.minArea = minArea;
          hasChanges = true;
        }
      }
      
      if (searchParams.has('max_area')) {
        const maxArea = Number(searchParams.get('max_area'));
        if (!isNaN(maxArea)) {
          newFilters.maxArea = maxArea;
          hasChanges = true;
        }
      }
      
      if (searchParams.has('amenities')) {
        const amenities = searchParams.get('amenities')?.split(',').filter(Boolean);
        if (amenities && amenities.length > 0) {
          newFilters.amenities = amenities;
          hasChanges = true;
        }
      }
      
      if (searchParams.has('features')) {
        const features = searchParams.get('features')?.split(',').filter(Boolean);
        if (features && features.length > 0) {
          newFilters.features = features;
          hasChanges = true;
        }
      }
      
      if (searchParams.has('is_featured')) {
        newFilters.isFeatured = searchParams.get('is_featured') === 'true';
        hasChanges = true;
      }
      
      // Parse sorting parameters
      if (searchParams.has('sort_by')) {
        const sortByParam = searchParams.get('sort_by') as PropertySortOption;
        setSortByState(sortByParam);
        hasChanges = true;
      }
      
      if (searchParams.has('sort_order')) {
        const sortOrderParam = searchParams.get('sort_order') as 'asc' | 'desc';
        setSortOrderState(sortOrderParam);
        hasChanges = true;
      }
      
      if (hasChanges) {
        setFiltersState(newFilters);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load filters from URL');
      setError(error.message);
      console.warn('Failed to load filters from URL:', err);
    } finally {
      setIsLoading(false);
    }
  }, [persistToUrl, searchParams]);

  const saveFiltersToUrl = useCallback(() => {
    if (!persistToUrl) return;
    
    try {
      const newParams = new URLSearchParams(searchParams);
      
      // Clear existing filter parameters
      const filterKeys = [
        'q', 'location', 'property_type', 'listing_type', 
        'min_price', 'max_price', 'bedrooms', 'bathrooms',
        'min_area', 'max_area', 'amenities', 'features', 
        'is_featured', 'sort_by', 'sort_order'
      ];
      
      filterKeys.forEach(key => newParams.delete(key));
      
      // Add current filter parameters to URL
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Map frontend filter keys to backend URL parameter names
          let urlKey = key;
          if (key === 'propertyType') urlKey = 'property_type';
          if (key === 'listingType') urlKey = 'listing_type';
          if (key === 'minPrice') urlKey = 'min_price';
          if (key === 'maxPrice') urlKey = 'max_price';
          if (key === 'minArea') urlKey = 'min_area';
          if (key === 'maxArea') urlKey = 'max_area';
          if (key === 'isFeatured') urlKey = 'is_featured';
          if (key === 'location') urlKey = 'q'; // Use 'q' for location search
          
          if (Array.isArray(value) && value.length > 0) {
            newParams.set(urlKey, value.join(','));
          } else if (!Array.isArray(value)) {
            newParams.set(urlKey, String(value));
          }
        }
      });
      
      // Add sorting parameters
      if (sortBy !== 'relevance') {
        newParams.set('sort_by', sortBy);
      }
      
      if (sortOrder !== 'desc') {
        newParams.set('sort_order', sortOrder);
      }
      
      // Update URL without page reload
      setSearchParams(newParams, { replace: true });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save filters to URL');
      setError(error.message);
      console.warn('Failed to save filters to URL:', err);
    }
  }, [persistToUrl, filters, sortBy, sortOrder, searchParams, setSearchParams]);

  // Load filters from URL on mount if persistence is enabled
  useEffect(() => {
    if (persistToUrl) {
      loadFiltersFromUrl();
    }
  }, [persistToUrl, loadFiltersFromUrl]);

  // Debounced URL saving
  useEffect(() => {
    if (persistToUrl) {
      const timeoutId = setTimeout(() => {
        saveFiltersToUrl();
      }, debounceMs);
      
      return () => clearTimeout(timeoutId);
    }
  }, [persistToUrl, filters, sortBy, sortOrder, saveFiltersToUrl, debounceMs]);

  // Async filter operations
  const applyFiltersAsync = useCallback(async () => {
    try {
      await executeApplyFilters();
      onFiltersChange?.(filters);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to apply filters');
      setError(error.message);
      handleError('Failed to apply filters');
      onError?.(error);
    }
  }, [executeApplyFilters, filters, onFiltersChange, handleError, onError]);

  const clearFiltersAsync = useCallback(async () => {
    try {
      await executeClearFilters();
      const defaultFilters = getDefaultFilters();
      setFilters(defaultFilters);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to clear filters');
      setError(error.message);
      handleError('Failed to clear filters');
      onError?.(error);
    }
  }, [executeClearFilters, setFilters, handleError, onError]);

  return {
    filters,
    sortBy,
    sortOrder,
    setFilters,
    updateFilter,
    clearFilters,
    applyFilters,
    resetFilters,
    setSorting,
    activeFilterCount,
    hasActiveFilters,
    getSearchCriteria,
    loadFiltersFromUrl,
    saveFiltersToUrl,
    isLoading: isLoading || applyLoading || clearLoading,
    error,
    applyFiltersAsync,
    clearFiltersAsync
  };
};

// Hook for managing filter presets
export interface FilterPreset {
  id: string;
  name: string;
  filters: PropertyFilters;
  sortBy: PropertySortOption;
  sortOrder: 'asc' | 'desc';
  createdAt: string;
}

export interface UseFilterPresetsReturn {
  presets: FilterPreset[];
  savePreset: (name: string, filters: PropertyFilters, sortBy: PropertySortOption, sortOrder: 'asc' | 'desc') => void;
  loadPreset: (presetId: string) => FilterPreset | null;
  deletePreset: (presetId: string) => void;
  updatePreset: (presetId: string, updates: Partial<FilterPreset>) => void;
}

export const useFilterPresets = (): UseFilterPresetsReturn => {
  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    try {
      const stored = localStorage.getItem('propertyFilterPresets');
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.warn('Failed to load filter presets:', err);
      return [];
    }
  });

  const savePresets = useCallback((newPresets: FilterPreset[]) => {
    setPresets(newPresets);
    try {
      localStorage.setItem('propertyFilterPresets', JSON.stringify(newPresets));
    } catch (err) {
      console.warn('Failed to save filter presets:', err);
    }
  }, []);

  const savePreset = useCallback((name: string, filters: PropertyFilters, sortBy: PropertySortOption, sortOrder: 'asc' | 'desc') => {
    const newPreset: FilterPreset = {
      id: `preset_${Date.now()}`,
      name,
      filters,
      sortBy,
      sortOrder,
      createdAt: new Date().toISOString()
    };
    
    const newPresets = [newPreset, ...presets];
    savePresets(newPresets);
  }, [presets, savePresets]);

  const loadPreset = useCallback((presetId: string): FilterPreset | null => {
    return presets.find(preset => preset.id === presetId) || null;
  }, [presets]);

  const deletePreset = useCallback((presetId: string) => {
    const newPresets = presets.filter(preset => preset.id !== presetId);
    savePresets(newPresets);
  }, [presets, savePresets]);

  const updatePreset = useCallback((presetId: string, updates: Partial<FilterPreset>) => {
    const newPresets = presets.map(preset =>
      preset.id === presetId ? { ...preset, ...updates } : preset
    );
    savePresets(newPresets);
  }, [presets, savePresets]);

  return {
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    updatePreset
  };
};