import { useState, useCallback, useEffect } from 'react';
import { Property } from '../types';
import { propertyService } from '../services';

export interface UsePropertyFavoritesReturn {
  favorites: Property[];
  isLoading: boolean;
  error: string | null;
  toggleFavorite: (propertyId: number) => Promise<void>;
  isFavorite: (propertyId: number) => boolean;
  refreshFavorites: () => Promise<void>;
  addToFavorites: (propertyId: number) => Promise<void>;
  removeFromFavorites: (propertyId: number) => Promise<void>;
  favoriteIds: Set<number>;
}

export interface UsePropertyFavoritesOptions {
  autoFetch?: boolean;
  enableOptimisticUpdates?: boolean;
}

export const usePropertyFavorites = (options: UsePropertyFavoritesOptions = {}): UsePropertyFavoritesReturn => {
  const { autoFetch = true, enableOptimisticUpdates = true } = options;
  
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
  }, []); // Empty dependency array is correct here

  const refreshFavorites = useCallback(async () => {
    await fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback((propertyId: number): boolean => {
    return favoriteIds.has(propertyId);
  }, [favoriteIds]);

  const addToFavorites = useCallback(async (propertyId: number) => {
    // Optimistic update
    if (enableOptimisticUpdates) {
      setFavoriteIds(prev => new Set([...prev, propertyId]));
    }
    
    try {
      const result = await propertyService.toggleFavorite(propertyId);
      
      if (result.isFavorite) {
        setFavoriteIds(prev => new Set([...prev, propertyId]));
        // Refresh favorites to get the full property data
        await fetchFavorites();
      } else {
        // If the API says it's not a favorite, remove it
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });
      }
    } catch (err) {
      // Revert optimistic update on error
      if (enableOptimisticUpdates) {
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to add property to favorites';
      setError(errorMessage);
      throw err;
    }
  }, [enableOptimisticUpdates, fetchFavorites]);

  const removeFromFavorites = useCallback(async (propertyId: number) => {
    // Optimistic update
    if (enableOptimisticUpdates) {
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(propertyId);
        return newSet;
      });
      setFavorites(prev => prev.filter(property => property.id !== propertyId));
    }
    
    try {
      const result = await propertyService.toggleFavorite(propertyId);
      
      if (!result.isFavorite) {
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });
        setFavorites(prev => prev.filter(property => property.id !== propertyId));
      } else {
        // If the API says it's still a favorite, add it back
        setFavoriteIds(prev => new Set([...prev, propertyId]));
      }
    } catch (err) {
      // Revert optimistic update on error
      if (enableOptimisticUpdates) {
        setFavoriteIds(prev => new Set([...prev, propertyId]));
        // Refresh to get the correct state
        await fetchFavorites();
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove property from favorites';
      setError(errorMessage);
      throw err;
    }
  }, [enableOptimisticUpdates, fetchFavorites]);

  const toggleFavorite = useCallback(async (propertyId: number) => {
    const isCurrentlyFavorite = isFavorite(propertyId);
    
    if (isCurrentlyFavorite) {
      await removeFromFavorites(propertyId);
    } else {
      await addToFavorites(propertyId);
    }
  }, [isFavorite, removeFromFavorites, addToFavorites]);

  useEffect(() => {
    if (autoFetch) {
      fetchFavorites();
    }
  }, [autoFetch]); // Remove fetchFavorites from dependencies to prevent infinite loop

  return {
    favorites,
    isLoading,
    error,
    toggleFavorite,
    isFavorite,
    refreshFavorites,
    addToFavorites,
    removeFromFavorites,
    favoriteIds
  };
};

// Hook for managing favorite status of a single property
export interface UsePropertyFavoriteReturn {
  isFavorite: boolean;
  isLoading: boolean;
  error: string | null;
  toggleFavorite: () => Promise<void>;
}

export const usePropertyFavorite = (propertyId: number): UsePropertyFavoriteReturn => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleFavorite = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // Optimistic update
    const previousState = isFavorite;
    setIsFavorite(!isFavorite);
    
    try {
      const result = await propertyService.toggleFavorite(propertyId);
      setIsFavorite(result.isFavorite);
    } catch (err) {
      // Revert optimistic update on error
      setIsFavorite(previousState);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle favorite status';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, isFavorite]);

  useEffect(() => {
    let mounted = true;
    
    const fetchStatus = async () => {
      try {
        const favoriteProperties = await propertyService.getFavoriteProperties();
        if (mounted) {
          const isPropertyFavorite = favoriteProperties.some(property => property.id === propertyId);
          setIsFavorite(isPropertyFavorite);
        }
      } catch (err) {
        if (mounted) {
          setIsFavorite(false);
        }
      }
    };
    
    fetchStatus();
    
    return () => {
      mounted = false;
    };
  }, [propertyId]); // Only depend on propertyId

  return {
    isFavorite,
    isLoading,
    error,
    toggleFavorite
  };
};

// Hook for favorite statistics and insights
export interface UseFavoriteStatsReturn {
  totalFavorites: number;
  recentFavorites: Property[];
  favoritesByType: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export const useFavoriteStats = (): UseFavoriteStatsReturn => {
  const [totalFavorites, setTotalFavorites] = useState(0);
  const [recentFavorites, setRecentFavorites] = useState<Property[]>([]);
  const [favoritesByType, setFavoritesByType] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const favoriteProperties = await propertyService.getFavoriteProperties();
      
      setTotalFavorites(favoriteProperties.length);
      
      // Get recent favorites (last 5)
      const sortedByDate = [...favoriteProperties].sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      setRecentFavorites(sortedByDate.slice(0, 5));
      
      // Calculate favorites by property type
      const typeStats = favoriteProperties.reduce((acc, property) => {
        const type = property.property_type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      setFavoritesByType(typeStats);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate favorite statistics';
      setError(errorMessage);
      setTotalFavorites(0);
      setRecentFavorites([]);
      setFavoritesByType({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    await calculateStats();
  }, [calculateStats]);

  useEffect(() => {
    calculateStats();
  }, []); // Empty dependency array to only run once on mount

  return {
    totalFavorites,
    recentFavorites,
    favoritesByType,
    isLoading,
    error,
    refreshStats
  };
};