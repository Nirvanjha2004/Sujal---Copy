import { api } from '@/shared/lib/api';
import type { Favorite } from '../types/favorites';

export interface FavoritesResponse {
  data: {
    favorites: Favorite[];
  };
}

export interface FavoritesApiResponse {
  data: Favorite[];
}

/**
 * Service for managing user favorites
 * Handles all API calls related to favorites functionality
 */
export const favoritesService = {
  /**
   * Fetch all favorites for the authenticated user
   * @returns Promise with favorites data
   * @throws Error if the request fails
   */
  async getFavorites(): Promise<Favorite[]> {
    try {
      const response = await api.getFavorites();
      // The API returns { data: { favorites: [...] } } or { data: [...] }
      const favoritesData = response?.data?.favorites || response?.data || [];
      return Array.isArray(favoritesData) ? favoritesData : [];
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch favorites');
    }
  },

  /**
   * Add a property to user's favorites
   * @param propertyId - ID of the property to add to favorites
   * @throws Error if the request fails
   */
  async addToFavorites(propertyId: number): Promise<void> {
    try {
      await api.addToFavorites(propertyId);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to add to favorites');
    }
  },

  /**
   * Remove a property from user's favorites
   * @param propertyId - ID of the property to remove from favorites
   * @throws Error if the request fails
   */
  async removeFromFavorites(propertyId: number): Promise<void> {
    try {
      await api.removeFromFavorites(propertyId);
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to remove from favorites');
    }
  },

  /**
   * Check if a property is in user's favorites
   * @param propertyId - ID of the property to check
   * @param favorites - Array of user's favorites
   * @returns boolean indicating if property is favorited
   */
  isFavorite(propertyId: number, favorites: Favorite[]): boolean {
    if (!propertyId || !Array.isArray(favorites)) {
      return false;
    }
    // Check the nested property ID within each favorite object
    return favorites.some(fav => fav.property && fav.property.id === propertyId);
  },

  /**
   * Bulk remove multiple properties from favorites
   * @param propertyIds - Array of property IDs to remove
   * @throws Error if any request fails
   */
  async bulkRemoveFromFavorites(propertyIds: number[]): Promise<void> {
    try {
      const removePromises = propertyIds.map(id => this.removeFromFavorites(id));
      await Promise.all(removePromises);
    } catch (error) {
      console.error('Error bulk removing from favorites:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to remove properties from favorites');
    }
  }
};