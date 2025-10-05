import { useState, useEffect } from 'react';
import { api, Property } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { state: authState } = useAuth();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!authState.isAuthenticated) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.getFavorites();
        console.log("Favorites response:", response);
        // Handle different possible response structures
        let favoritesData: Property[] = [];
        
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            favoritesData = response.data;
          } else if (response.data.favorites && Array.isArray(response.data.favorites)) {
            favoritesData = response.data.favorites;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            favoritesData = response.data.data;
          }
        } else if (Array.isArray(response)) {
          favoritesData = response;
        }
        
        setFavorites(favoritesData);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch favorites');
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [authState.isAuthenticated]);

  const addToFavorites = async (propertyId: number) => {
    try {
      await api.addToFavorites(propertyId);
      // Refresh favorites list
      const response = await api.getFavorites();
      
      let favoritesData: Property[] = [];
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          favoritesData = response.data;
        } else if (response.data.favorites && Array.isArray(response.data.favorites)) {
          favoritesData = response.data.favorites;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          favoritesData = response.data.data;
        }
      }
      
      setFavorites(favoritesData);
    } catch (err) {
      console.error('Error adding to favorites:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to add to favorites');
    }
  };

  const removeFromFavorites = async (propertyId: number) => {
    try {
      await api.removeFromFavorites(propertyId);
      // Remove from local state
      setFavorites(prev => {
        if (!Array.isArray(prev)) return [];
        return prev.filter(prop => prop && prop.id !== propertyId);
      });
    } catch (err) {
      console.error('Error removing from favorites:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to remove from favorites');
    }
  };

  const isFavorite = (propertyId: number) => {
    if (!Array.isArray(favorites)) {
      console.warn('Favorites is not an array:', typeof favorites, favorites);
      return false;
    }
    
    if (!propertyId) {
      return false;
    }
    
    return favorites.some(prop => prop && prop.id === propertyId);
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