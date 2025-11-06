import { useState, useCallback, useEffect, useMemo } from 'react';
import { PropertyFilters, PropertySortOption, SearchCriteria } from '../types';

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
    initialSortBy = 'created_at',
    initialSortOrder = 'desc',
    persistToUrl = false,
    persistToStorage = false,
    storageKey = 'propertyFilters',
    onFiltersChange,
    onSortChange
  } = options;

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
      const urlParams = new URLSearchParams(window.location.search);
      const newFilters = { ...filters };
      let hasChanges = false;
      
      // Parse URL parameters and update filters
      if (urlParams.has('location')) {
        newFilters.location = urlParams.get('location') || undefined;
        hasChanges = true;
      }
      
      if (urlParams.has('propertyType')) {
        const types = urlParams.get('propertyType')?.split(',');
        newFilters.propertyType = types as any;
        hasChanges = true;
      }
      
      if (urlParams.has('listingType')) {
        newFilters.listingType = urlParams.get('listingType') as any;
        hasChanges = true;
      }
      
      if (urlParams.has('minPrice')) {
        const minPrice = Number(urlParams.get('minPrice'));
        if (!isNaN(minPrice)) {
          newFilters.minPrice = minPrice;
          hasChanges = true;
        }
      }
      
      if (urlParams.has('maxPrice')) {
        const maxPrice = Number(urlParams.get('maxPrice'));
        if (!isNaN(maxPrice)) {
          newFilters.maxPrice = maxPrice;
          hasChanges = true;
        }
      }
      
      if (urlParams.has('bedrooms')) {
        const bedrooms = Number(urlParams.get('bedrooms'));
        if (!isNaN(bedrooms)) {
          newFilters.bedrooms = bedrooms;
          hasChanges = true;
        }
      }
      
      if (urlParams.has('bathrooms')) {
        const bathrooms = Number(urlParams.get('bathrooms'));
        if (!isNaN(bathrooms)) {
          newFilters.bathrooms = bathrooms;
          hasChanges = true;
        }
      }
      
      if (urlParams.has('minArea')) {
        const minArea = Number(urlParams.get('minArea'));
        if (!isNaN(minArea)) {
          newFilters.minArea = minArea;
          hasChanges = true;
        }
      }
      
      if (urlParams.has('maxArea')) {
        const maxArea = Number(urlParams.get('maxArea'));
        if (!isNaN(maxArea)) {
          newFilters.maxArea = maxArea;
          hasChanges = true;
        }
      }
      
      if (urlParams.has('amenities')) {
        const amenities = urlParams.get('amenities')?.split(',');
        newFilters.amenities = amenities;
        hasChanges = true;
      }
      
      if (urlParams.has('features')) {
        const features = urlParams.get('features')?.split(',');
        newFilters.features = features;
        hasChanges = true;
      }
      
      if (urlParams.has('isFeatured')) {
        newFilters.isFeatured = urlParams.get('isFeatured') === 'true';
        hasChanges = true;
      }
      
      // Parse sorting parameters
      if (urlParams.has('sortBy')) {
        const sortByParam = urlParams.get('sortBy') as PropertySortOption;
        setSortByState(sortByParam);
        hasChanges = true;
      }
      
      if (urlParams.has('sortOrder')) {
        const sortOrderParam = urlParams.get('sortOrder') as 'asc' | 'desc';
        setSortOrderState(sortOrderParam);
        hasChanges = true;
      }
      
      if (hasChanges) {
        setFiltersState(newFilters);
      }
    } catch (err) {
      console.warn('Failed to load filters from URL:', err);
    }
  }, [persistToUrl, filters]);

  const saveFiltersToUrl = useCallback(() => {
    if (!persistToUrl) return;
    
    try {
      const urlParams = new URLSearchParams();
      
      // Add filter parameters to URL
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value) && value.length > 0) {
            urlParams.set(key, value.join(','));
          } else if (!Array.isArray(value)) {
            urlParams.set(key, String(value));
          }
        }
      });
      
      // Add sorting parameters
      if (sortBy !== 'created_at') {
        urlParams.set('sortBy', sortBy);
      }
      
      if (sortOrder !== 'desc') {
        urlParams.set('sortOrder', sortOrder);
      }
      
      // Update URL without page reload
      const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
      window.history.replaceState({}, '', newUrl);
    } catch (err) {
      console.warn('Failed to save filters to URL:', err);
    }
  }, [persistToUrl, filters, sortBy, sortOrder]);

  // Load filters from URL on mount if persistence is enabled
  useEffect(() => {
    if (persistToUrl) {
      loadFiltersFromUrl();
    }
  }, [persistToUrl, loadFiltersFromUrl]);

  // Save filters to URL when they change
  useEffect(() => {
    if (persistToUrl) {
      saveFiltersToUrl();
    }
  }, [persistToUrl, filters, sortBy, sortOrder, saveFiltersToUrl]);

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
    saveFiltersToUrl
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