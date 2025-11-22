import { useState, useEffect } from 'react';
import { api } from '@/shared/lib/api';
import { Property, PropertyFilters } from '@/features/property/types';

// DEPRECATED: Individual property hooks have been removed to prevent duplicate API calls
// Use useLandingPageData() from '@/shared/hooks/useLandingPageData' instead for optimized performance

export function useFeaturedProperties() {
  console.error('❌ useFeaturedProperties is DEPRECATED and removed! Use useLandingPageData() instead.');
  throw new Error('useFeaturedProperties is deprecated. Use useLandingPageData() instead.');
}

export function useRecentProperties() {
  console.error('❌ useRecentProperties is DEPRECATED and removed! Use useLandingPageData() instead.');
  throw new Error('useRecentProperties is deprecated. Use useLandingPageData() instead.');
}

export function useRecommendedProperties() {
  console.error('❌ useRecommendedProperties is DEPRECATED and removed! Use useLandingPageData() instead.');
  throw new Error('useRecommendedProperties is deprecated. Use useLandingPageData() instead.');
}

export function usePopularProperties(limit: number = 10) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await api.getProperties({
          status: 'ACTIVE'
        }, 1, limit);
        // For now, just return the properties as-is
        // In the future, you could sort by view count or other popularity metrics
        setProperties(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch properties');
        setProperties([]); // Fallback to empty array
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [limit]);

  return { properties, loading, error };
}

export function useProperties(filters?: PropertyFilters) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getProperties(filters);
        setProperties(response.data);
        setTotal(response.total);
        setPage(response.page);
      } catch (err: any) {
        const errorData = err.response?.data?.error || err;
        setError({
          code: errorData.code || 'UNKNOWN_ERROR',
          message: errorData.message || err.message || 'Failed to fetch properties'
        });
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters]);

  return { properties, loading, error, total, page };
}

export function useProperty(id: number) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      // Input validation
      if (!id || id <= 0) {
        setError({
          code: 'INVALID_PROPERTY_ID',
          message: 'Invalid property ID'
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api.getProperty(id);
        setProperty(response);
      } catch (err: any) {
        const errorData = err.response?.data?.error || err;
        setError({
          code: errorData.code || 'UNKNOWN_ERROR',
          message: errorData.message || err.message || 'Failed to fetch property'
        });
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  return { property, loading, error };
}

export function useSearchProperties(query: string, filters?: PropertyFilters) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const searchProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Search params:', { query, filters });

        // Consolidate all searches through a single endpoint
        // If we have a keyword query, use search API (which sends keywords parameter)
        // Otherwise, use properties API with filters
        if (query && query.trim()) {
          // Use search API when there's a text query
          const response = await api.searchProperties(query, filters);
          setProperties(response.data || []);
          setTotal(response.total || 0);
        } else {
          // Use properties API with filters (including when no filters - will return all active properties)
          const response = await api.getProperties(filters);
          setProperties(response.data || []);
          setTotal(response.total || 0);
        }
      } catch (err: any) {
        console.error('Search error:', err);
        const errorData = err.response?.data?.error || err;
        setError({
          code: errorData.code || 'UNKNOWN_ERROR',
          message: errorData.message || err.message || 'Failed to search properties'
        });
        setProperties([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    searchProperties();
  }, [query, JSON.stringify(filters)]); // Use JSON.stringify to avoid unnecessary re-renders on object reference changes

  return { properties, loading, error, total };
}