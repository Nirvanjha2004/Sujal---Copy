import { api } from '@/shared/lib/api';
import type { SavedSearch, PropertyFilters } from '../types/savedSearches';

export interface SavedSearchesResponse {
  data: {
    savedSearches: Array<{
      id: number;
      search_name: string;
      search_criteria: PropertyFilters;
      created_at: string;
      updated_at?: string;
    }>;
  };
}

/**
 * Service for managing user saved searches
 * Handles all API calls related to saved searches functionality
 */
export const savedSearchesService = {
  /**
   * Fetch all saved searches for the authenticated user
   * @returns Promise with saved searches data
   * @throws Error if the request fails
   */
  async getSavedSearches(): Promise<SavedSearch[]> {
    try {
      const response = await api.getSavedSearches();
      // Map the API response to the expected frontend structure
      const mappedSearches = response.data.savedSearches?.map((item: any) => ({
        id: item.id,
        name: item.search_name, // Use search_name from API
        created_at: item.created_at,
        updated_at: item.updated_at,
        filters: item.search_criteria, // Use search_criteria from API
        user_id: item.user_id,
      })) || [];
      
      return mappedSearches;
    } catch (error) {
      console.error('Error fetching saved searches:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch saved searches');
    }
  },

  /**
   * Create a new saved search
   * @param name - Name for the saved search
   * @param filters - Search criteria/filters
   * @returns Promise with created saved search
   * @throws Error if the request fails
   */
  async createSavedSearch(name: string, filters: PropertyFilters): Promise<SavedSearch> {
    try {
      const response = await api.createSavedSearch(name, filters);
      return {
        id: response.id,
        name: response.name,
        filters: response.filters,
        created_at: response.created_at,
      };
    } catch (error) {
      console.error('Error creating saved search:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create saved search');
    }
  },

  /**
   * Delete a saved search
   * @param searchId - ID of the saved search to delete
   * @throws Error if the request fails
   */
  async deleteSavedSearch(searchId: number): Promise<void> {
    try {
      await api.deleteSavedSearch(searchId);
    } catch (error) {
      console.error('Error deleting saved search:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete saved search');
    }
  },

  /**
   * Update an existing saved search
   * @param searchId - ID of the saved search to update
   * @param name - Updated name for the saved search
   * @param filters - Updated search criteria/filters
   * @returns Promise with updated saved search
   * @throws Error if the request fails
   */
  async updateSavedSearch(searchId: number, name: string, filters: PropertyFilters): Promise<SavedSearch> {
    try {
      // Note: This assumes the API has an update endpoint. If not, this would need to be implemented.
      const response = await api.updateSavedSearch?.(searchId, name, filters);
      if (!response) {
        throw new Error('Update saved search endpoint not available');
      }
      return {
        id: response.id,
        name: response.name,
        filters: response.filters,
        created_at: response.created_at,
        updated_at: response.updated_at,
      };
    } catch (error) {
      console.error('Error updating saved search:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update saved search');
    }
  },

  /**
   * Format filters for display
   * @param filters - Property filters to format
   * @returns Array of formatted filter strings
   */
  formatFilters(filters: PropertyFilters): string[] {
    const filterLabels: string[] = [];
    
    if (filters.location) filterLabels.push(`Location: ${filters.location}`);
    if (filters.property_type) filterLabels.push(`Type: ${filters.property_type}`);
    if (filters.listing_type) filterLabels.push(`For: ${filters.listing_type}`);
    if (filters.min_price || filters.max_price) {
      const priceRange = `₹${filters.min_price || '0'} - ₹${filters.max_price || 'Any'}`;
      filterLabels.push(`Price: ${priceRange}`);
    }
    if (filters.bedrooms) filterLabels.push(`${filters.bedrooms} BHK`);
    if (filters.min_area || filters.max_area || filters.area_min || filters.area_max) {
      const minArea = filters.min_area || filters.area_min;
      const maxArea = filters.max_area || filters.area_max;
      if (minArea || maxArea) {
        const areaRange = `${minArea || '0'} - ${maxArea || 'Any'} sq ft`;
        filterLabels.push(`Area: ${areaRange}`);
      }
    }
    
    return filterLabels;
  },

  /**
   * Convert filters to URL search parameters
   * @param filters - Property filters to convert
   * @returns URLSearchParams object
   */
  filtersToSearchParams(filters: PropertyFilters): URLSearchParams {
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
    
    return params;
  },

  /**
   * Validate saved search data
   * @param name - Name of the saved search
   * @param filters - Search filters
   * @returns Validation result with errors if any
   */
  validateSavedSearch(name: string, filters: PropertyFilters): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!name || name.trim().length === 0) {
      errors.push('Search name is required');
    }
    
    if (name && name.length > 100) {
      errors.push('Search name must be less than 100 characters');
    }
    
    // Check if at least one filter is provided
    const hasFilters = Object.values(filters).some(value => 
      value !== undefined && value !== null && value !== ''
    );
    
    if (!hasFilters) {
      errors.push('At least one search filter must be provided');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};