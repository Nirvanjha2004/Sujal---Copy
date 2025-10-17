import { api } from '@/shared/lib/api';
import type { Property, PropertyFilters, PaginatedResponse, ApiResponse } from '@/types';

class PropertyService {
  /**
   * Get all properties with optional filters
   */
  async getProperties(filters?: PropertyFilters, page = 1, limit = 20): Promise<PaginatedResponse<Property>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response = await api.get(`/properties?${params}`);
    return response.data;
  }

  /**
   * Get property by ID
   */
  async getPropertyById(id: number): Promise<Property> {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  }

  /**
   * Create new property
   */
  async createProperty(propertyData: Partial<Property>): Promise<Property> {
    const response = await api.post('/properties', propertyData);
    return response.data;
  }

  /**
   * Update property
   */
  async updateProperty(id: number, propertyData: Partial<Property>): Promise<Property> {
    const response = await api.put(`/properties/${id}`, propertyData);
    return response.data;
  }

  /**
   * Delete property
   */
  async deleteProperty(id: number): Promise<void> {
    await api.delete(`/properties/${id}`);
  }

  /**
   * Get user's properties
   */
  async getUserProperties(userId: number): Promise<Property[]> {
    const response = await api.get(`/users/${userId}/properties`);
    return response.data;
  }

  /**
   * Toggle property favorite status
   */
  async toggleFavorite(propertyId: number): Promise<{ isFavorite: boolean }> {
    const response = await api.post(`/properties/${propertyId}/favorite`);
    return response.data;
  }

  /**
   * Get user's favorite properties
   */
  async getFavoriteProperties(): Promise<Property[]> {
    const response = await api.get('/properties/favorites');
    return response.data;
  }

  /**
   * Search properties with advanced filters
   */
  async searchProperties(query: string, filters?: PropertyFilters): Promise<Property[]> {
    const params = new URLSearchParams({
      q: query,
      ...filters,
    });

    const response = await api.get(`/properties/search?${params}`);
    return response.data;
  }

  /**
   * Get property suggestions for autocomplete
   */
  async getPropertySuggestions(query: string): Promise<string[]> {
    const response = await api.get(`/properties/suggestions?q=${query}`);
    return response.data;
  }

  /**
   * Get similar properties
   */
  async getSimilarProperties(propertyId: number): Promise<Property[]> {
    const response = await api.get(`/properties/${propertyId}/similar`);
    return response.data;
  }
}

export default new PropertyService();