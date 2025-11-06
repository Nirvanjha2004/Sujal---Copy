import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Property } from '../types';
import { propertyService } from '../services';

interface FavoritesContextType {
  favorites: Property[];
  favoriteIds: Set<number>;
  isLoading: boolean;
  error: string | null;
  isFavorite: (propertyId: number) => boolean;
  toggleFavorite: (propertyId: number) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const favoriteProperties = await propertyService.getFavoriteProperties();
      setFavorites(favoriteProperties);
      setFavoriteIds(new Set(favoriteProperties.map(property => property.id)));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch favorite properties';
      setError(errorMessage);
      setFavorites([]);
      setFavoriteIds(new Set());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isFavorite = useCallback((propertyId: number): boolean => {
    return favoriteIds.has(propertyId);
  }, [favoriteIds]);

  const toggleFavorite = useCallback(async (propertyId: number) => {
    // Optimistic update
    const wasAlreadyFavorite = favoriteIds.has(propertyId);
    
    if (wasAlreadyFavorite) {
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(propertyId);
        return newSet;
      });
      setFavorites(prev => prev.filter(property => property.id !== propertyId));
    } else {
      setFavoriteIds(prev => new Set([...prev, propertyId]));
    }
    
    try {
      const result = await propertyService.toggleFavorite(propertyId);
      
      // Update based on server response
      if (result.isFavorite) {
        setFavoriteIds(prev => new Set([...prev, propertyId]));
        // Refresh to get the full property data if it's a new favorite
        if (!wasAlreadyFavorite) {
          await fetchFavorites();
        }
      } else {
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });
        setFavorites(prev => prev.filter(property => property.id !== propertyId));
      }
    } catch (err) {
      // Revert optimistic update on error
      if (wasAlreadyFavorite) {
        setFavoriteIds(prev => new Set([...prev, propertyId]));
        await fetchFavorites(); // Refresh to get correct state
      } else {
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle favorite status';
      setError(errorMessage);
      throw err;
    }
  }, [favoriteIds, fetchFavorites]);

  const refreshFavorites = useCallback(async () => {
    await fetchFavorites();
  }, [fetchFavorites]);

  // Fetch favorites once when the provider mounts
  useEffect(() => {
    fetchFavorites();
  }, []);

  const value: FavoritesContextType = {
    favorites,
    favoriteIds,
    isLoading,
    error,
    isFavorite,
    toggleFavorite,
    refreshFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};