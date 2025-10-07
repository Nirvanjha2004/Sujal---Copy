import { useState, useEffect, useCallback } from 'react';
import { api, Favorite } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

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
      const response = await api.getFavorites();
      // The API returns { data: { favorites: [...] } }
      const favoritesData = response?.data?.favorites || [];
      setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
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
      await api.addToFavorites(propertyId);
      // Re-fetch the list to get the complete Favorite object from the server
      await fetchFavorites();
    } catch (err) {
      console.error('Error adding to favorites:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to add to favorites');
    }
  };

  const removeFromFavorites = async (propertyId: number) => {
    try {
      await api.removeFromFavorites(propertyId);
      // Optimistically remove from local state for instant UI update
      setFavorites(prev => prev.filter(fav => fav.property.id !== propertyId));
    } catch (err) {
      console.error('Error removing from favorites:', err);
      // If the API call fails, we can re-fetch to revert the optimistic update
      await fetchFavorites();
      throw new Error(err instanceof Error ? err.message : 'Failed to remove from favorites');
    }
  };

  const isFavorite = (propertyId: number) => {
    if (!propertyId || !Array.isArray(favorites)) {
      return false;
    }
    // Correctly check the nested property ID within each favorite object
    return favorites.some(fav => fav.property && fav.property.id === propertyId);
  };

  return {
    favorites,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };
}