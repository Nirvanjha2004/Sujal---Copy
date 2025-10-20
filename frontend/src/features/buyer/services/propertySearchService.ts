import { api } from '@/shared/lib/api';
import { Property } from '@/features/property/types';
import type { PropertyFilters } from '../types/savedSearches';

export interface PropertySearchResponse {
  data: Property[];
  total: number;
  page?: number;
  limit?: number;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'location' | 'property_type' | 'keyword';
  count?: number;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterOptions {
  propertyTypes: FilterOption[];
  listingTypes: FilterOption[];
  locations: FilterOption[];
  priceRanges: FilterOption[];
  bedroomOptions: FilterOption[];
  bathroomOptions: FilterOption[];
}

/**
 * Service for property search functionality
 * Handles property searches, filters, suggestions, and search-related operations
 */
export const propertySearchService = {
  /**
   * Search properties with filters
   * @param filters - Property search filters
   * @returns Promise with search results
   * @throws Error if the request fails
   */
  async searchProperties(filters?: PropertyFilters): Promise<PropertySearchResponse> {
    try {
      const response = await api.getProperties(filters);
      return {
        data: response.data || [],
        total: response.total || 0,
        page: response.page,
        limit: response.limit
      };
    } catch (error) {
      console.error('Error searching properties:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to search properties');
    }
  },

  /**
   * Search properties by keyword with filters
   * @param query - Search query/keywords
   * @param filters - Additional property filters
   * @returns Promise with search results
   * @throws Error if the request fails
   */
  async searchPropertiesByKeyword(query: string, filters?: PropertyFilters): Promise<PropertySearchResponse> {
    try {
      const response = await api.searchProperties(query, filters);
      return {
        data: response.data || [],
        total: response.total || 0
      };
    } catch (error) {
      console.error('Error searching properties by keyword:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to search properties');
    }
  },

  /**
   * Get a single property by ID
   * @param propertyId - ID of the property to fetch
   * @returns Promise with property data
   * @throws Error if the request fails
   */
  async getProperty(propertyId: number): Promise<Property> {
    try {
      return await api.getProperty(propertyId);
    } catch (error) {
      console.error('Error fetching property:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch property');
    }
  },

  /**
   * Get search suggestions based on query
   * @param query - Search query for suggestions
   * @param type - Type of suggestions to get
   * @returns Promise with search suggestions
   * @throws Error if the request fails
   */
  async getSearchSuggestions(query: string, type?: 'location' | 'property_type' | 'keyword'): Promise<SearchSuggestion[]> {
    try {
      // This would typically be a dedicated API endpoint
      // For now, we'll return mock suggestions based on common search patterns
      const suggestions: SearchSuggestion[] = [];
      
      if (!type || type === 'location') {
        const locationSuggestions = [
          'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad'
        ].filter(location => location.toLowerCase().includes(query.toLowerCase()))
         .map(location => ({
           id: `location_${location}`,
           text: location,
           type: 'location' as const,
           count: Math.floor(Math.random() * 100) + 10
         }));
        suggestions.push(...locationSuggestions);
      }

      if (!type || type === 'property_type') {
        const propertyTypeSuggestions = [
          'Apartment', 'Villa', 'Independent House', 'Plot', 'Commercial'
        ].filter(type => type.toLowerCase().includes(query.toLowerCase()))
         .map(propertyType => ({
           id: `type_${propertyType}`,
           text: propertyType,
           type: 'property_type' as const,
           count: Math.floor(Math.random() * 50) + 5
         }));
        suggestions.push(...propertyTypeSuggestions);
      }

      return suggestions.slice(0, 10); // Limit to 10 suggestions
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch search suggestions');
    }
  },

  /**
   * Get filter options for property search
   * @returns Promise with available filter options
   * @throws Error if the request fails
   */
  async getFilterOptions(): Promise<FilterOptions> {
    try {
      // This would typically be fetched from the API
      // For now, return static options
      return {
        propertyTypes: [
          { value: 'apartment', label: 'Apartment', count: 150 },
          { value: 'villa', label: 'Villa', count: 75 },
          { value: 'independent_house', label: 'Independent House', count: 120 },
          { value: 'plot', label: 'Plot', count: 45 },
          { value: 'commercial', label: 'Commercial', count: 30 }
        ],
        listingTypes: [
          { value: 'sale', label: 'For Sale', count: 300 },
          { value: 'rent', label: 'For Rent', count: 120 }
        ],
        locations: [
          { value: 'mumbai', label: 'Mumbai', count: 180 },
          { value: 'delhi', label: 'Delhi', count: 150 },
          { value: 'bangalore', label: 'Bangalore', count: 200 },
          { value: 'chennai', label: 'Chennai', count: 90 },
          { value: 'hyderabad', label: 'Hyderabad', count: 110 }
        ],
        priceRanges: [
          { value: '0-1000000', label: 'Under ₹10 Lakh', count: 50 },
          { value: '1000000-2500000', label: '₹10-25 Lakh', count: 80 },
          { value: '2500000-5000000', label: '₹25-50 Lakh', count: 120 },
          { value: '5000000-10000000', label: '₹50 Lakh - ₹1 Crore', count: 100 },
          { value: '10000000-99999999', label: 'Above ₹1 Crore', count: 70 }
        ],
        bedroomOptions: [
          { value: '1', label: '1 BHK', count: 80 },
          { value: '2', label: '2 BHK', count: 150 },
          { value: '3', label: '3 BHK', count: 120 },
          { value: '4', label: '4 BHK', count: 60 },
          { value: '5', label: '5+ BHK', count: 20 }
        ],
        bathroomOptions: [
          { value: '1', label: '1 Bathroom', count: 100 },
          { value: '2', label: '2 Bathrooms', count: 180 },
          { value: '3', label: '3 Bathrooms', count: 90 },
          { value: '4', label: '4+ Bathrooms', count: 50 }
        ]
      };
    } catch (error) {
      console.error('Error fetching filter options:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch filter options');
    }
  },

  /**
   * Build search URL with filters
   * @param filters - Property filters
   * @returns URL string with search parameters
   */
  buildSearchUrl(filters: PropertyFilters): string {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Use 'q' for the location parameter, as expected by the search page
        if (key === 'location') {
          params.append('q', value.toString());
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    return `/search?${params.toString()}`;
  },

  /**
   * Parse search URL parameters to filters
   * @param searchParams - URLSearchParams object
   * @returns PropertyFilters object
   */
  parseSearchUrl(searchParams: URLSearchParams): PropertyFilters {
    const filters: PropertyFilters = {};
    
    for (const [key, value] of searchParams.entries()) {
      if (key === 'q') {
        filters.location = value;
      } else if (key === 'min_price' || key === 'max_price') {
        filters[key] = parseInt(value, 10);
      } else if (key === 'bedrooms' || key === 'bathrooms') {
        filters[key] = parseInt(value, 10);
      } else if (key === 'min_area' || key === 'max_area') {
        filters[key] = parseInt(value, 10);
      } else {
        (filters as any)[key] = value;
      }
    }
    
    return filters;
  },

  /**
   * Validate search filters
   * @param filters - Property filters to validate
   * @returns Validation result with errors if any
   */
  validateFilters(filters: PropertyFilters): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Price validation
    if (filters.min_price && filters.max_price && filters.min_price > filters.max_price) {
      errors.push('Minimum price cannot be greater than maximum price');
    }
    
    // Area validation
    const minArea = filters.min_area || filters.area_min;
    const maxArea = filters.max_area || filters.area_max;
    if (minArea && maxArea && minArea > maxArea) {
      errors.push('Minimum area cannot be greater than maximum area');
    }
    
    // Bedroom/bathroom validation
    if (filters.bedrooms && (filters.bedrooms < 0 || filters.bedrooms > 10)) {
      errors.push('Bedrooms must be between 0 and 10');
    }
    
    if (filters.bathrooms && (filters.bathrooms < 0 || filters.bathrooms > 10)) {
      errors.push('Bathrooms must be between 0 and 10');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Format price for display
   * @param price - Price in rupees
   * @returns Formatted price string
   */
  formatPrice(price: number): string {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    } else if (price >= 1000) {
      return `₹${(price / 1000).toFixed(1)} K`;
    } else {
      return `₹${price}`;
    }
  },

  /**
   * Format area for display
   * @param area - Area in square feet
   * @returns Formatted area string
   */
  formatArea(area: number): string {
    return `${area.toLocaleString()} sq ft`;
  }
};