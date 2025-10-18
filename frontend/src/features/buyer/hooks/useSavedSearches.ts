import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { savedSearchesService } from '../services/savedSearchesService';
import type { SavedSearch, PropertyFilters } from '../types/savedSearches';

export function useSavedSearches() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const { state: authState } = useAuth();

  const fetchSavedSearches = useCallback(async () => {
    if (!authState.isAuthenticated) {
      setSavedSearches([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const searchesData = await savedSearchesService.getSavedSearches();
      setSavedSearches(searchesData);
    } catch (err) {
      console.error('Error fetching saved searches:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch saved searches');
      setSavedSearches([]);
    } finally {
      setLoading(false);
    }
  }, [authState.isAuthenticated]);

  useEffect(() => {
    fetchSavedSearches();
  }, [fetchSavedSearches]);

  const createSavedSearch = async (name: string, filters: PropertyFilters) => {
    // Validate the saved search data
    const validation = savedSearchesService.validateSavedSearch(name, filters);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    try {
      setCreating(true);
      setError(null);
      const newSearch = await savedSearchesService.createSavedSearch(name, filters);
      
      // Optimistically add to local state
      setSavedSearches(prev => [newSearch, ...prev]);
      
      return newSearch;
    } catch (err) {
      console.error('Error creating saved search:', err);
      // Re-fetch to ensure consistency
      await fetchSavedSearches();
      throw new Error(err instanceof Error ? err.message : 'Failed to create saved search');
    } finally {
      setCreating(false);
    }
  };

  const updateSavedSearch = async (searchId: number, name: string, filters: PropertyFilters) => {
    // Validate the saved search data
    const validation = savedSearchesService.validateSavedSearch(name, filters);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    try {
      setUpdating(true);
      setError(null);
      const updatedSearch = await savedSearchesService.updateSavedSearch(searchId, name, filters);
      
      // Optimistically update local state
      setSavedSearches(prev => 
        prev.map(search => 
          search.id === searchId ? updatedSearch : search
        )
      );
      
      return updatedSearch;
    } catch (err) {
      console.error('Error updating saved search:', err);
      // Re-fetch to ensure consistency
      await fetchSavedSearches();
      throw new Error(err instanceof Error ? err.message : 'Failed to update saved search');
    } finally {
      setUpdating(false);
    }
  };

  const deleteSavedSearch = async (searchId: number) => {
    try {
      setDeleting(searchId);
      setError(null);
      
      // Optimistically remove from local state
      setSavedSearches(prev => prev.filter(search => search.id !== searchId));
      
      await savedSearchesService.deleteSavedSearch(searchId);
    } catch (err) {
      console.error('Error deleting saved search:', err);
      // Re-fetch to revert optimistic update
      await fetchSavedSearches();
      throw new Error(err instanceof Error ? err.message : 'Failed to delete saved search');
    } finally {
      setDeleting(null);
    }
  };

  const runSavedSearch = (filters: PropertyFilters) => {
    // Convert filters to search parameters for navigation
    const searchParams = savedSearchesService.filtersToSearchParams(filters);
    
    // Navigate to search page with filters
    // This would typically use router navigation
    const searchUrl = `/search?${searchParams.toString()}`;
    window.location.href = searchUrl;
  };

  const formatFilters = (filters: PropertyFilters) => {
    return savedSearchesService.formatFilters(filters);
  };

  const validateSavedSearch = (name: string, filters: PropertyFilters) => {
    return savedSearchesService.validateSavedSearch(name, filters);
  };

  const refreshSavedSearches = () => {
    return fetchSavedSearches();
  };

  return {
    savedSearches,
    loading,
    error,
    creating,
    updating,
    deleting,
    createSavedSearch,
    updateSavedSearch,
    deleteSavedSearch,
    runSavedSearch,
    formatFilters,
    validateSavedSearch,
    refreshSavedSearches,
  };
}