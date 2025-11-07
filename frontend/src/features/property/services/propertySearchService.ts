import { api } from '@/shared/lib/api';
import type { Property as ApiProperty, PropertyFilters as ApiPropertyFilters, SavedSearch as ApiSavedSearch } from '@/shared/lib/api';
import type { 
  Property, 
  PropertyFilters, 
  SearchCriteria,
  SavedSearch,
  SearchHistory,
  PropertySuggestion
} from '../types';

/**
 * Property search service for search functionality, saved searches, and search history
 */
class PropertySearchService {
  /**
   * Search properties with query and filters
   */
  async searchProperties(
    query: string, 
    filters?: PropertyFilters
  ): Promise<{ properties: Property[]; total: number }> {
    try {
      const apiFilters = this.transformFiltersToApi(filters);
      const response = await api.searchProperties(query, apiFilters);
      
      // The API returns { data: Property[], total: number }
      const properties = response.data || [];
      const total = response.total || 0;
      
      // Ensure we have an array to work with
      if (!Array.isArray(properties)) {
        console.warn('Expected properties array but got:', properties);
        return { properties: [], total: 0 };
      }
      
      let transformedProperties = properties.map(this.transformApiPropertyToProperty);
      
      // Apply client-side sorting if specified
      if (filters?.sort_by) {
        transformedProperties = this.sortProperties(transformedProperties, filters);
      }
      
      return { 
        properties: transformedProperties, 
        total 
      };
    } catch (error: any) {
      console.error('Property search error:', error);
      throw new Error(`Failed to search properties: ${error.message}`);
    }
  }

  /**
   * Get filtered properties with advanced filtering and sorting
   */
  async getFilteredProperties(
    filters: PropertyFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ properties: Property[]; total: number; hasMore: boolean }> {
    try {
      const apiFilters = this.transformFiltersToApi(filters);
      
      // Use the general property service for filtered results
      const { default: propertyService } = await import('./propertyService');
      const response = await propertyService.getProperties(apiFilters as any, { page, limit });
      
      let properties = response.data.map(this.transformApiPropertyToProperty);
      
      // Apply client-side sorting if specified
      if (filters?.sort_by) {
        properties = this.sortProperties(properties, filters);
      }
      
      // Apply client-side filtering for features not supported by API
      properties = this.applyClientSideFilters(properties, filters);
      
      const total = response.total || properties.length;
      const hasMore = page * limit < total;
      
      return { 
        properties, 
        total, 
        hasMore 
      };
    } catch (error: any) {
      console.error('Property filtering error:', error);
      throw new Error(`Failed to filter properties: ${error.message}`);
    }
  }

  /**
   * Get property suggestions for autocomplete
   */
  async getPropertySuggestions(query: string): Promise<PropertySuggestion[]> {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      // For now, we'll create suggestions based on common property-related terms
      // This can be enhanced with a dedicated suggestions API endpoint
      const suggestions: PropertySuggestion[] = [];

      // Location-based suggestions
      if (query.toLowerCase().includes('bangalore') || query.toLowerCase().includes('bengaluru')) {
        suggestions.push({
          id: 'loc_bangalore',
          text: 'Bangalore, Karnataka',
          type: 'location',
          count: 150
        });
      }

      if (query.toLowerCase().includes('mumbai')) {
        suggestions.push({
          id: 'loc_mumbai',
          text: 'Mumbai, Maharashtra',
          type: 'location',
          count: 200
        });
      }

      if (query.toLowerCase().includes('delhi')) {
        suggestions.push({
          id: 'loc_delhi',
          text: 'Delhi, Delhi',
          type: 'location',
          count: 180
        });
      }

      // Property type suggestions
      if (query.toLowerCase().includes('apartment') || query.toLowerCase().includes('flat')) {
        suggestions.push({
          id: 'type_apartment',
          text: 'Apartment',
          type: 'property_type',
          count: 300
        });
      }

      if (query.toLowerCase().includes('villa')) {
        suggestions.push({
          id: 'type_villa',
          text: 'Villa',
          type: 'property_type',
          count: 80
        });
      }

      if (query.toLowerCase().includes('house')) {
        suggestions.push({
          id: 'type_house',
          text: 'House',
          type: 'property_type',
          count: 120
        });
      }

      // Amenity suggestions
      if (query.toLowerCase().includes('pool') || query.toLowerCase().includes('swimming')) {
        suggestions.push({
          id: 'amenity_pool',
          text: 'Swimming Pool',
          type: 'amenity',
          count: 45
        });
      }

      if (query.toLowerCase().includes('gym') || query.toLowerCase().includes('fitness')) {
        suggestions.push({
          id: 'amenity_gym',
          text: 'Gym/Fitness Center',
          type: 'amenity',
          count: 60
        });
      }

      return suggestions.slice(0, 8); // Limit to 8 suggestions
    } catch (error: any) {
      console.error('Failed to get property suggestions:', error);
      return [];
    }
  }

  /**
   * Save a search with criteria
   */
  async saveSearch(searchCriteria: SearchCriteria, name: string): Promise<SavedSearch> {
    try {
      const apiFilters = this.transformFiltersToApi(searchCriteria);
      const response = await api.createSavedSearch(name, apiFilters || {});
      return this.transformApiSavedSearchToSavedSearch(response);
    } catch (error: any) {
      throw new Error(`Failed to save search: ${error.message}`);
    }
  }

  /**
   * Get user's saved searches
   */
  async getSavedSearches(): Promise<SavedSearch[]> {
    try {
      const response = await api.getSavedSearches();
      return (response.data.savedSearches || []).map(this.transformApiSavedSearchToSavedSearch);
    } catch (error: any) {
      throw new Error(`Failed to fetch saved searches: ${error.message}`);
    }
  }

  /**
   * Delete a saved search
   */
  async deleteSavedSearch(searchId: number): Promise<void> {
    try {
      await api.deleteSavedSearch(searchId);
    } catch (error: any) {
      throw new Error(`Failed to delete saved search: ${error.message}`);
    }
  }

  /**
   * Get search history for the user
   */
  async getSearchHistory(): Promise<SearchHistory[]> {
    try {
      // For now, we'll return search history from localStorage
      // This can be enhanced with a backend API endpoint
      const history = localStorage.getItem('propertySearchHistory');
      if (history) {
        return JSON.parse(history);
      }
      return [];
    } catch (error: any) {
      console.error('Failed to get search history:', error);
      return [];
    }
  }

  /**
   * Add search to history
   */
  async addToSearchHistory(query: string, filters: PropertyFilters, resultCount: number): Promise<void> {
    try {
      const historyItem: SearchHistory = {
        id: Date.now(),
        userId: 0, // Will be set when user management is available
        query,
        filters,
        resultCount,
        searchedAt: new Date().toISOString()
      };

      const existingHistory = await this.getSearchHistory();
      const updatedHistory = [historyItem, ...existingHistory.slice(0, 19)]; // Keep last 20 searches

      localStorage.setItem('propertySearchHistory', JSON.stringify(updatedHistory));
    } catch (error: any) {
      console.error('Failed to add to search history:', error);
    }
  }

  /**
   * Clear search history
   */
  async clearSearchHistory(): Promise<void> {
    try {
      localStorage.removeItem('propertySearchHistory');
    } catch (error: any) {
      console.error('Failed to clear search history:', error);
    }
  }

  /**
   * Execute a saved search
   */
  async executeSavedSearch(savedSearch: SavedSearch): Promise<Property[]> {
    try {
      const { query, ...filters } = savedSearch.criteria;
      
      if (query) {
        const result = await this.searchProperties(query, filters);
        return result.properties;
      } else {
        // If no query, use the property service to get filtered properties
        const { default: propertyService } = await import('./propertyService');
        const response = await propertyService.getProperties(filters);
        return response.data;
      }
    } catch (error: any) {
      throw new Error(`Failed to execute saved search: ${error.message}`);
    }
  }

  /**
   * Get popular search terms
   */
  async getPopularSearchTerms(): Promise<string[]> {
    try {
      // For now, return static popular terms
      // This can be enhanced with analytics from backend
      return [
        '2 BHK Apartment',
        '3 BHK Villa',
        'Bangalore Properties',
        'Mumbai Flats',
        'Delhi Houses',
        'Gurgaon Apartments',
        'Pune Villas',
        'Hyderabad Properties'
      ];
    } catch (error: any) {
      console.error('Failed to get popular search terms:', error);
      return [];
    }
  }

  /**
   * Get trending locations
   */
  async getTrendingLocations(): Promise<Array<{ name: string; count: number }>> {
    try {
      // For now, return static trending locations
      // This can be enhanced with real analytics data
      return [
        { name: 'Whitefield, Bangalore', count: 45 },
        { name: 'Andheri, Mumbai', count: 38 },
        { name: 'Gurgaon, Haryana', count: 32 },
        { name: 'Banjara Hills, Hyderabad', count: 28 },
        { name: 'Koramangala, Bangalore', count: 25 },
        { name: 'Powai, Mumbai', count: 22 },
        { name: 'Cyber City, Gurgaon', count: 20 },
        { name: 'Hitech City, Hyderabad', count: 18 }
      ];
    } catch (error: any) {
      console.error('Failed to get trending locations:', error);
      return [];
    }
  }

  /**
   * Build search filters from query string
   */
  parseSearchQuery(query: string): { cleanQuery: string; extractedFilters: Partial<PropertyFilters> } {
    const extractedFilters: Partial<PropertyFilters> = {};
    let cleanQuery = query.toLowerCase();

    // Extract property type from query
    const propertyTypes = ['apartment', 'villa', 'house', 'plot', 'commercial'];
    for (const type of propertyTypes) {
      if (cleanQuery.includes(type)) {
        extractedFilters.propertyType = type as any;
        cleanQuery = cleanQuery.replace(new RegExp(type, 'gi'), '').trim();
        break;
      }
    }

    // Extract listing type from query
    if (cleanQuery.includes('rent') || cleanQuery.includes('rental')) {
      extractedFilters.listingType = 'rent';
      cleanQuery = cleanQuery.replace(/rent(al)?/gi, '').trim();
    } else if (cleanQuery.includes('sale') || cleanQuery.includes('buy')) {
      extractedFilters.listingType = 'sale';
      cleanQuery = cleanQuery.replace(/(sale|buy)/gi, '').trim();
    }

    // Extract bedroom count
    const bedroomMatch = cleanQuery.match(/(\d+)\s*(bhk|bedroom|bed)/i);
    if (bedroomMatch) {
      extractedFilters.bedrooms = parseInt(bedroomMatch[1]);
      cleanQuery = cleanQuery.replace(bedroomMatch[0], '').trim();
    }

    // Clean up extra spaces
    cleanQuery = cleanQuery.replace(/\s+/g, ' ').trim();

    return {
      cleanQuery: cleanQuery || query, // Return original if cleaned query is empty
      extractedFilters
    };
  }

  /**
   * Transform API property to feature property type
   */
  private transformApiPropertyToProperty(apiProperty: ApiProperty): Property {
    return {
      id: apiProperty.id,
      title: apiProperty.title,
      description: apiProperty.description || '',
      property_type: (apiProperty.property_type || 'apartment') as any,
      listing_type: (apiProperty.listing_type || 'sale') as any,
      price: apiProperty.price,


      area_sqft: apiProperty.area_sqft,
      bedrooms: apiProperty.bedrooms,
      bathrooms: apiProperty.bathrooms,
      address: apiProperty.address,
      city: apiProperty.city,
      state: apiProperty.state,
      postal_code: apiProperty.postal_code,
      latitude: apiProperty.latitude,
      longitude: apiProperty.longitude,
      amenities: apiProperty.amenities || {},
      images: apiProperty.images?.map(img => ({
        id: img.id,
        property_id: img.property_id,
        image_url: img.image_url,
        alt_text: img.alt_text || 'Property image',
        display_order: img.display_order || 0,
        is_primary: img.is_primary || false,
        created_at: apiProperty.created_at,
        updated_at: apiProperty.updated_at
      })) || [],
      is_active: apiProperty.is_active ?? true,
      is_featured: apiProperty.is_featured ?? false,
      status: (apiProperty.status || 'active') as any,
      user_id: apiProperty.user_id || 0,
      created_at: apiProperty.created_at,
      updated_at: apiProperty.updated_at,
      expires_at: apiProperty.expires_at
    };
  }

  /**
   * Sort properties based on sort criteria
   */
  private sortProperties(properties: Property[], filters: PropertyFilters): Property[] {
    const sortBy = filters.sort_by || 'relevance';
    const sortOrder = filters.sort_order || 'desc';
    
    const sorted = [...properties].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'price_low':
        case 'price_high':
        case 'price':
          comparison = (a.price || 0) - (b.price || 0);
          if (sortBy === 'price_high') comparison = -comparison;
          break;
          
        case 'area_large':
        case 'area_small':
        case 'area':
          comparison = (a.area_sqft || 0) - (b.area_sqft || 0);
          if (sortBy === 'area_large') comparison = -comparison;
          break;
          
        case 'date_new':
        case 'date_old':
        case 'created_at':
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          comparison = dateA - dateB;
          if (sortBy === 'date_new') comparison = -comparison;
          break;
          
        case 'relevance':
        default:
          // For relevance, prioritize featured properties, then by date
          if (a.is_featured && !b.is_featured) comparison = -1;
          else if (!a.is_featured && b.is_featured) comparison = 1;
          else {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            comparison = dateB - dateA; // Newer first for relevance
          }
          break;
      }
      
      // Apply sort order
      if (sortOrder === 'asc' && sortBy !== 'relevance') {
        comparison = -comparison;
      }
      
      return comparison;
    });
    
    return sorted;
  }

  /**
   * Apply client-side filters for features not supported by API
   */
  private applyClientSideFilters(properties: Property[], filters: PropertyFilters): Property[] {
    let filtered = [...properties];
    
    // Filter by amenities if specified
    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter(property => {
        if (!property.amenities || typeof property.amenities !== 'object') {
          return false;
        }
        
        // Check if property has all required amenities
        return filters.amenities!.every(amenity => {
          return property.amenities[amenity] === true;
        });
      });
    }
    
    // Filter by features if specified
    if (filters.features && filters.features.length > 0) {
      filtered = filtered.filter(property => {
        // This would depend on how features are stored in the property object
        // For now, we'll check if the feature exists in the property description or amenities
        const searchText = `${property.description} ${JSON.stringify(property.amenities)}`.toLowerCase();
        
        return filters.features!.some(feature => 
          searchText.includes(feature.toLowerCase())
        );
      });
    }
    
    // Filter by active status - skip for now as this field doesn't exist in PropertyFilters
    // if (filters.isActive !== undefined) {
    //   const isActive = filters.isActive;
    //   filtered = filtered.filter(property => property.is_active === isActive);
    // }
    
    // Filter by featured status
    if (filters.isFeatured !== undefined) {
      const isFeatured = filters.isFeatured;
      filtered = filtered.filter(property => property.is_featured === isFeatured);
    }
    
    return filtered;
  }

  /**
   * Transform feature filters to API filters
   */
  private transformFiltersToApi(filters?: PropertyFilters): ApiPropertyFilters | undefined {
    if (!filters) return undefined;

    const apiFilters: ApiPropertyFilters = {};

    // Handle both old and new filter field names
    if (filters.location) apiFilters.location = filters.location;
    
    // Property type - handle both single and array values
    const propertyType = filters.property_type || filters.propertyType;
    if (propertyType) {
      apiFilters.property_type = Array.isArray(propertyType) 
        ? propertyType[0] 
        : propertyType;
    }
    
    // Listing type
    const listingType = filters.listing_type || filters.listingType;
    if (listingType) apiFilters.listing_type = listingType;
    
    // Price range
    const minPrice = filters.min_price || filters.minPrice;
    const maxPrice = filters.max_price || filters.maxPrice;
    if (minPrice) apiFilters.min_price = minPrice;
    if (maxPrice) apiFilters.max_price = maxPrice;
    
    // Bedrooms and bathrooms
    if (filters.bedrooms) apiFilters.bedrooms = filters.bedrooms;
    if (filters.bathrooms) apiFilters.bathrooms = filters.bathrooms;
    
    // Area range
    const minArea = filters.min_area || filters.minArea;
    const maxArea = filters.max_area || filters.maxArea;
    if (minArea) apiFilters.min_area = minArea;
    if (maxArea) apiFilters.max_area = maxArea;
    
    // Status filters
    const isFeatured = filters.isFeatured;
    if (isFeatured !== undefined) apiFilters.is_featured = isFeatured;
    
    // Sorting - these will be handled client-side, not passed to API
    // const sortBy = filters.sort_by;
    // const sortOrder = filters.sort_order || 'desc';

    return apiFilters;
  }

  /**
   * Transform API saved search to feature saved search type
   */
  private transformApiSavedSearchToSavedSearch(apiSavedSearch: ApiSavedSearch): SavedSearch {
    return {
      id: apiSavedSearch.id,
      userId: 0, // Will be populated when user management is available
      name: apiSavedSearch.name,
      criteria: (apiSavedSearch.filters || {}) as SearchCriteria,
      isActive: true,
      createdAt: apiSavedSearch.created_at,
      updatedAt: apiSavedSearch.created_at
    };
  }
}

export default new PropertySearchService();