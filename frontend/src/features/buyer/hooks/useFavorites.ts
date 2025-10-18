import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { favoritesService } from '../services/favoritesService';
import type { Favorite } from '../types/favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { state: authState } = useAuth();

  const fetchFavorites = useCallback(async () => {
    if (!authState.isAuthenticated) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const favoritesData = await favoritesService.getFavorites();
      setFavorites(favoritesData);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch favorites');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [authState.isAuthenticated]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addToFavorites = async (propertyId: number) => {
    try {
      await favoritesService.addToFavorites(propertyId);
      // Re-fetch the list to get the complete Favorite object from the server
      await fetchFavorites();
    } catch (err) {
      console.error('Error adding to favorites:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to add to favorites');
    }
  };

  const removeFromFavorites = async (propertyId: number) => {
    try {
      // Optimistically remove from local state for instant UI update
      setFavorites(prev => prev.filter(fav => fav.property.id !== propertyId));
      
      await favoritesService.removeFromFavorites(propertyId);
    } catch (err) {
      console.error('Error removing from favorites:', err);
      // If the API call fails, re-fetch to revert the optimistic update
      await fetchFavorites();
      throw new Error(err instanceof Error ? err.message : 'Failed to remove from favorites');
    }
  };

  const bulkRemoveFromFavorites = async (propertyIds: number[]) => {
    try {
      // Optimistically remove from local state for instant UI update
      setFavorites(prev => prev.filter(fav => !propertyIds.includes(fav.property.id)));
      
      await favoritesService.bulkRemoveFromFavorites(propertyIds);
    } catch (err) {
      console.error('Error bulk removing from favorites:', err);
      // If the API call fails, re-fetch to revert the optimistic update
      await fetchFavorites();
      throw new Error(err instanceof Error ? err.message : 'Failed to remove properties from favorites');
    }
  };

  const isFavorite = (propertyId: number) => {
    return favoritesService.isFavorite(propertyId, favorites);
  };

  const refreshFavorites = () => {
    return fetchFavorites();
  };

  return {
    favorites,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    bulkRemoveFromFavorites,
    isFavorite,
    refreshFavorites,
  };
}