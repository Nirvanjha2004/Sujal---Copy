import { useState, useCallback, useEffect } from 'react';
import { Property, PropertyFilters, SearchCriteria, SavedSearch, SearchHistory } from '../types';
import { propertySearchService } from '../services';

export interface UsePropertySearchReturn {
  properties: Property[];
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  total: number;
  searchProperties: (query: string, filters?: PropertyFilters) => Promise<void>;
  clearSearch: () => void;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  totalResults: number;
  currentPage: number;
}

export interface UsePropertySearchOptions {
  pageSize?: number;
  enableCaching?: boolean;
  filters?: PropertyFilters;
}

export const usePropertySearch = (filtersOrOptions?: PropertyFilters | UsePropertySearchOptions): UsePropertySearchReturn => {
  // Handle both old and new calling patterns
  let options: UsePropertySearchOptions = {};
  let initialFilters: PropertyFilters | undefined;
  
  if (filtersOrOptions) {
    // Check if it's filters (has property-like keys) or options (has pageSize, enableCaching)
    if ('pageSize' in filtersOrOptions || 'enableCaching' in filtersOrOptions) {
      options = filtersOrOptions as UsePropertySearchOptions;
      initialFilters = options.filters;
    } else {
      // It's filters
      initialFilters = filtersOrOptions as PropertyFilters;
      options = { pageSize: 20, enableCaching: true };
    }
  }
  const { pageSize = 20, enableCaching = true } = options;
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [currentFilters, setCurrentFilters] = useState<PropertyFilters | undefined>(initialFilters);
  
  // Auto-search when initial filters are provided - moved after searchProperties definition
  
  // Cache for search results
  const [searchCache, setSearchCache] = useState<Map<string, Property[]>>(new Map());

  const generateCacheKey = useCallback((query: string, filters?: PropertyFilters, page: number = 1) => {
    return `${query}-${JSON.stringify(filters || {})}-${page}`;
  }, []);

  const searchProperties = useCallback(async (query: string, filters?: PropertyFilters) => {
    setIsLoading(true);
    setError(null);
    setCurrentPage(1);
    setCurrentQuery(query);
    setCurrentFilters(filters);
    
    const cacheKey = generateCacheKey(query, filters, 1);
    
    // Check cache first if caching is enabled
    if (enableCaching && searchCache.has(cacheKey)) {
      const cachedResults = searchCache.get(cacheKey)!;
      setProperties(cachedResults);
      setHasMore(cachedResults.length >= pageSize);
      setTotalResults(cachedResults.length);
      setIsLoading(false);
      return;
    }
    
    try {
      let results: Property[];
      let total: number;
      
      if (query.trim()) {
        // Use search service for query-based searches
        const searchResult = await propertySearchService.searchProperties(query, filters);
        results = searchResult.properties;
        total = searchResult.total;
      } else {
        // Use filtered properties service for filter-only searches
        const filterResult = await propertySearchService.getFilteredProperties(filters || {}, 1, pageSize);
        results = filterResult.properties;
        total = filterResult.total;
        setHasMore(filterResult.hasMore);
      }
      
      setProperties(results);
      setTotalResults(total);
      
      if (!query.trim()) {
        // hasMore is already set above for filtered searches
      } else {
        setHasMore(results.length >= pageSize);
      }
      
      // Cache results if caching is enabled
      if (enableCaching) {
        setSearchCache(prev => new Map(prev).set(cacheKey, results));
      }
      
      // Add to search history if there's a query
      if (query.trim()) {
        await propertySearchService.addToSearchHistory(query, filters || {}, total);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search properties';
      setError(errorMessage);
      setProperties([]);
      setTotalResults(0);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, enableCaching, searchCache, generateCacheKey]);

  // Auto-search when initial filters are provided
  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      const query = initialFilters.location || '';
      searchProperties(query, initialFilters);
    }
  }, [initialFilters, searchProperties]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    const nextPage = currentPage + 1;
    const cacheKey = generateCacheKey(currentQuery, currentFilters, nextPage);
    
    try {
      let newProperties: Property[];
      let newHasMore: boolean;
      
      if (currentQuery.trim()) {
        // For query-based searches, we need to implement proper pagination
        // For now, we'll simulate it by getting more results
        const searchResult = await propertySearchService.searchProperties(currentQuery, currentFilters);
        const startIndex = (nextPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        newProperties = searchResult.properties.slice(startIndex, endIndex);
        newHasMore = endIndex < searchResult.total;
      } else {
        // For filter-only searches, use proper pagination
        const filterResult = await propertySearchService.getFilteredProperties(
          currentFilters || {}, 
          nextPage, 
          pageSize
        );
        newProperties = filterResult.properties;
        newHasMore = filterResult.hasMore;
      }
      
      if (newProperties.length > 0) {
        setProperties(prev => [...prev, ...newProperties]);
        setCurrentPage(nextPage);
        setHasMore(newHasMore);
        
        // Cache the new page if caching is enabled
        if (enableCaching) {
          setSearchCache(prev => new Map(prev).set(cacheKey, newProperties));
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more properties';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, currentQuery, currentFilters, currentPage, pageSize, enableCaching, generateCacheKey]);

  const clearSearch = useCallback(() => {
    setProperties([]);
    setCurrentQuery('');
    setCurrentFilters(undefined);
    setCurrentPage(1);
    setHasMore(false);
    setTotalResults(0);
    setError(null);
  }, []);

  return {
    properties,
    loading: isLoading,
    isLoading,
    error,
    total: totalResults,
    searchProperties,
    clearSearch,
    hasMore,
    loadMore,
    totalResults,
    currentPage
  };
};

// Hook for property suggestions and autocomplete
export interface UsePropertySuggestionsReturn {
  suggestions: string[];
  isLoading: boolean;
  error: string | null;
  getSuggestions: (query: string) => Promise<void>;
  clearSuggestions: () => void;
}

export const usePropertySuggestions = (): UsePropertySuggestionsReturn => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await propertySearchService.getPropertySuggestions(query);
      setSuggestions(results.map(suggestion => 
        typeof suggestion === 'string' ? suggestion : suggestion.text
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get suggestions';
      setError(errorMessage);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    getSuggestions,
    clearSuggestions
  };
};

// Hook for saved searches management
export interface UseSavedSearchesReturn {
  savedSearches: SavedSearch[];
  isLoading: boolean;
  error: string | null;
  saveSearch: (searchCriteria: SearchCriteria, name?: string) => Promise<void>;
  deleteSavedSearch: (searchId: number) => Promise<void>;
  refetchSavedSearches: () => Promise<void>;
}

export const useSavedSearches = (): UseSavedSearchesReturn => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedSearches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const searches = await propertySearchService.getSavedSearches();
      setSavedSearches(searches);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch saved searches';
      setError(errorMessage);
      setSavedSearches([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSearch = useCallback(async (searchCriteria: SearchCriteria, name: string = 'Saved Search') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newSavedSearch = await propertySearchService.saveSearch(searchCriteria, name);
      setSavedSearches(prev => [newSavedSearch, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save search';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSavedSearch = useCallback(async (searchId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await propertySearchService.deleteSavedSearch(searchId);
      setSavedSearches(prev => prev.filter(search => search.id !== searchId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete saved search';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetchSavedSearches = useCallback(async () => {
    await fetchSavedSearches();
  }, [fetchSavedSearches]);

  useEffect(() => {
    fetchSavedSearches();
  }, [fetchSavedSearches]);

  return {
    savedSearches,
    isLoading,
    error,
    saveSearch,
    deleteSavedSearch,
    refetchSavedSearches
  };
};

// Hook for search history management
export interface UseSearchHistoryReturn {
  searchHistory: SearchHistory[];
  isLoading: boolean;
  error: string | null;
  addToHistory: (query: string, filters?: PropertyFilters) => void;
  clearHistory: () => void;
  refetchHistory: () => Promise<void>;
}

export const useSearchHistory = (): UseSearchHistoryReturn => {
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSearchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const history = await propertySearchService.getSearchHistory();
      setSearchHistory(history);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch search history';
      setError(errorMessage);
      setSearchHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToHistory = useCallback((query: string, filters?: PropertyFilters) => {
    const historyItem: SearchHistory = {
      id: Date.now(), // Simple ID generation for local state
      userId: 0, // This would be set from auth context
      query,
      filters: filters || {},
      searchedAt: new Date().toISOString(),
      resultCount: 0 // This would be updated with actual results
    };
    
    setSearchHistory(prev => [historyItem, ...prev.slice(0, 19)]); // Keep last 20 searches
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  const refetchHistory = useCallback(async () => {
    await fetchSearchHistory();
  }, [fetchSearchHistory]);

  useEffect(() => {
    fetchSearchHistory();
  }, [fetchSearchHistory]);

  return {
    searchHistory,
    isLoading,
    error,
    addToHistory,
    clearHistory,
    refetchHistory
  };
};