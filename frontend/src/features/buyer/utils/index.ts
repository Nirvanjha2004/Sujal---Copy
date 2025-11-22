import { PropertyFilters, Favorite, SavedSearch } from '../types';

/**
 * Price formatting utilities
 */
export const formatPrice = (price: number): string => {
  if (price >= 10000000) {
    return `₹ ${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹ ${(price / 100000).toFixed(2)} Lakh`;
  } else {
    return `₹ ${price.toLocaleString()}`;
  }
};

export const formatPriceRange = (minPrice?: number, maxPrice?: number): string => {
  if (!minPrice && !maxPrice) return 'Any Price';
  if (!minPrice) return `Up to ${formatPrice(maxPrice!)}`;
  if (!maxPrice) return `From ${formatPrice(minPrice)}`;
  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
};

/**
 * Area calculation and formatting utilities
 */
export const formatArea = (area: number): string => {
  if (area >= 10000) {
    return `${(area / 10000).toFixed(2)} acres`;
  } else if (area >= 1000) {
    return `${(area / 1000).toFixed(1)}K sq ft`;
  } else {
    return `${area} sq ft`;
  }
};

export const formatAreaRange = (minArea?: number, maxArea?: number): string => {
  if (!minArea && !maxArea) return 'Any Area';
  if (!minArea) return `Up to ${formatArea(maxArea!)}`;
  if (!maxArea) return `From ${formatArea(minArea)}`;
  return `${formatArea(minArea)} - ${formatArea(maxArea)}`;
};

export const calculateAverageArea = (favorites: Favorite[]): number => {
  if (favorites.length === 0) return 0;
  const totalArea = favorites.reduce((sum, fav) => sum + (fav.property?.area_sqft || 0), 0);
  return Math.round(totalArea / favorites.length);
};

/**
 * Property filter formatting utilities
 */
export const formatFilters = (filters: PropertyFilters): string[] => {
  const filterLabels: string[] = [];
  
  if (filters.location) filterLabels.push(`Location: ${filters.location}`);
  if (filters.property_type) filterLabels.push(`Type: ${filters.property_type}`);
  if (filters.listing_type) filterLabels.push(`For: ${filters.listing_type}`);
  
  if (filters.min_price || filters.max_price) {
    filterLabels.push(`Price: ${formatPriceRange(filters.min_price, filters.max_price)}`);
  }
  
  if (filters.bedrooms) filterLabels.push(`${filters.bedrooms} BHK`);
  if (filters.bathrooms) filterLabels.push(`${filters.bathrooms} Bath`);
  
  if (filters.min_area || filters.max_area || filters.area_min || filters.area_max) {
    const minArea = filters.min_area || filters.area_min;
    const maxArea = filters.max_area || filters.area_max;
    filterLabels.push(`Area: ${formatAreaRange(minArea, maxArea)}`);
  }
  
  if (filters.status) filterLabels.push(`Status: ${filters.status}`);
  if (filters.is_featured) filterLabels.push('Featured Only');
  if (filters.keywords) filterLabels.push(`Keywords: ${filters.keywords}`);
  
  return filterLabels;
};

export const hasActiveFilters = (filters: PropertyFilters): boolean => {
  return Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== '' && value !== false
  );
};

export const countActiveFilters = (filters: PropertyFilters): number => {
  return Object.values(filters).filter(value => 
    value !== undefined && value !== null && value !== '' && value !== false
  ).length;
};

/**
 * Date formatting utilities
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

export const formatDateRelative = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

export const isRecentlyAdded = (dateString: string, daysThreshold: number = 7): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  return diffInDays <= daysThreshold;
};

/**
 * Statistics calculation utilities
 */
export const calculateFavoritesStats = (favorites: Favorite[]) => {
  if (favorites.length === 0) {
    return {
      totalSaved: 0,
      averagePrice: 0,
      averageArea: 0,
      recentlyAdded: 0,
      priceRange: { min: 0, max: 0 },
      areaRange: { min: 0, max: 0 }
    };
  }

  const prices = favorites.map(fav => fav.property?.price || 0).filter(price => price > 0);
  const areas = favorites.map(fav => fav.property?.area_sqft || 0).filter(area => area > 0);
  const recentlyAdded = favorites.filter(fav => isRecentlyAdded(fav.added_at)).length;

  return {
    totalSaved: favorites.length,
    averagePrice: prices.length > 0 ? Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length) : 0,
    averageArea: areas.length > 0 ? Math.round(areas.reduce((sum, area) => sum + area, 0) / areas.length) : 0,
    recentlyAdded,
    priceRange: {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0
    },
    areaRange: {
      min: areas.length > 0 ? Math.min(...areas) : 0,
      max: areas.length > 0 ? Math.max(...areas) : 0
    }
  };
};

export const calculateSavedSearchesStats = (savedSearches: SavedSearch[]) => {
  if (savedSearches.length === 0) {
    return {
      totalSearches: 0,
      withFilters: 0,
      recentlyCreated: 0,
      mostCommonFilters: []
    };
  }

  const withFilters = savedSearches.filter(search => hasActiveFilters(search.filters)).length;
  const recentlyCreated = savedSearches.filter(search => isRecentlyAdded(search.created_at)).length;

  // Count most common filter types
  const filterCounts: Record<string, number> = {};
  savedSearches.forEach(search => {
    Object.keys(search.filters).forEach(filterKey => {
      const value = search.filters[filterKey as keyof PropertyFilters];
      if (value !== undefined && value !== null && value !== '' && value !== false) {
        filterCounts[filterKey] = (filterCounts[filterKey] || 0) + 1;
      }
    });
  });

  const mostCommonFilters = Object.entries(filterCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([filter, count]) => ({ filter, count }));

  return {
    totalSearches: savedSearches.length,
    withFilters,
    recentlyCreated,
    mostCommonFilters
  };
};

/**
 * Sorting utilities
 */
export const sortFavorites = (favorites: Favorite[], sortBy: 'date_added' | 'price' | 'title') => {
  return [...favorites].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return (a.property?.price || 0) - (b.property?.price || 0);
      case 'title':
        return (a.property?.title || '').localeCompare(b.property?.title || '');
      case 'date_added':
      default:
        return new Date(b.added_at).getTime() - new Date(a.added_at).getTime();
    }
  });
};

export const sortSavedSearches = (searches: SavedSearch[], sortBy: 'date_created' | 'name' | 'last_used') => {
  return [...searches].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'last_used':
        return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
      case 'date_created':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });
};

/**
 * URL parameter utilities for search
 */
export const filtersToUrlParams = (filters: PropertyFilters): URLSearchParams => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== false) {
      // Use 'q' for the location parameter, as expected by the search page
      if (key === 'location') {
        params.append('q', value.toString());
      } else {
        params.append(key, value.toString());
      }
    }
  });
  
  return params;
};

export const urlParamsToFilters = (params: URLSearchParams): PropertyFilters => {
  const filters: PropertyFilters = {};
  
  for (const [key, value] of params.entries()) {
    if (key === 'q') {
      filters.location = value;
    } else if (key in filters) {
      const filterKey = key as keyof PropertyFilters;
      // Convert string values to appropriate types
      if (key.includes('price') || key.includes('area') || key === 'bedrooms' || key === 'bathrooms') {
        filters[filterKey] = parseInt(value) as any;
      } else if (key === 'is_featured') {
        (filters as any)[filterKey] = value === 'true';
      } else {
        filters[filterKey] = value as any;
      }
    }
  }
  
  return filters;
};

/**
 * Validation utilities
 */
export const validatePropertyFilters = (filters: PropertyFilters): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (filters.min_price && filters.max_price && filters.min_price > filters.max_price) {
    errors.push('Minimum price cannot be greater than maximum price');
  }
  
  if (filters.min_area && filters.max_area && filters.min_area > filters.max_area) {
    errors.push('Minimum area cannot be greater than maximum area');
  }
  
  if (filters.area_min && filters.area_max && filters.area_min > filters.area_max) {
    errors.push('Minimum area cannot be greater than maximum area');
  }
  
  if (filters.bedrooms) {
    const bedroomValues = Array.isArray(filters.bedrooms) ? filters.bedrooms : [filters.bedrooms];
    if (bedroomValues.some(val => val < 0)) {
      errors.push('Number of bedrooms cannot be negative');
    }
  }
  
  if (filters.bathrooms) {
    const bathroomValues = Array.isArray(filters.bathrooms) ? filters.bathrooms : [filters.bathrooms];
    if (bathroomValues.some(val => val < 0)) {
      errors.push('Number of bathrooms cannot be negative');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Property display utilities
 */
export const getPropertyDisplayText = (property: any): string => {
  const parts = [];
  
  if (property.area_sqft) parts.push(`${property.area_sqft} sq ft`);
  if (property.bedrooms) parts.push(`${property.bedrooms} BHK`);
  if (property.bathrooms) parts.push(`${property.bathrooms} Bath`);
  
  return parts.join(' | ');
};

export const getPropertyLocationText = (property: any): string => {
  const parts = [];
  
  if (property.city) parts.push(property.city);
  if (property.state) parts.push(property.state);
  
  return parts.join(', ');
};