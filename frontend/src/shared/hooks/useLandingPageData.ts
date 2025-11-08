import { useState, useEffect } from 'react';
import { api } from '@/shared/lib/api';
import { Property } from '@/features/property/types';

interface LandingPageData {
  featuredProperties: Property[];
  recentProperties: Property[];
  recommendedProperties: Property[];
  recentProjects: any[];
}

interface UseLandingPageDataReturn {
  data: LandingPageData;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useLandingPageData(): UseLandingPageDataReturn {
  const [data, setData] = useState<LandingPageData>({
    featuredProperties: [],
    recentProperties: [],
    recommendedProperties: [],
    recentProjects: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // OPTIMIZED: Only 2 API calls instead of 4
      const [propertiesResponse, projectsResponse] = await Promise.allSettled([
        // Single call to get all properties (limit 20 to cover all needs)
        api.getProperties({ status: 'active' }, 1, 20),
        
        // Single call to get recent projects
        api.getRecentProjects(6)
      ]);

      console.log("The properties and projects are",propertiesResponse,projectsResponse)

      const newData: LandingPageData = {
        featuredProperties: [],
        recentProperties: [],
        recommendedProperties: [],
        recentProjects: []
      };

      // Process properties response and derive all property lists client-side
      if (propertiesResponse.status === 'fulfilled') {
        const properties = propertiesResponse.value.data || [];
        
        // Sort by date for recent properties
        const sortedByDate = [...properties].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        // Featured properties (is_featured = true)
        newData.featuredProperties = properties.filter(p => p.is_featured).slice(0, 4);
        
        // Recent properties (latest 8)
        newData.recentProperties = sortedByDate.slice(0, 8);
        
        // Recommended properties (featured first, then recent)
        const featured = newData.featuredProperties;
        const recommended = [
          ...featured,
          ...sortedByDate.filter(p => !p.is_featured).slice(0, 4 - featured.length)
        ].slice(0, 4);
        newData.recommendedProperties = recommended;
      } else {
        console.warn('Failed to fetch properties:', propertiesResponse.reason);
      }

      // Process recent projects
      if (projectsResponse.status === 'fulfilled') {
        newData.recentProjects = projectsResponse.value.data || [];
      } else {
        console.warn('Failed to fetch recent projects:', projectsResponse.reason);
      }

      setData(newData);

      // Set error only if both requests failed
      const allFailed = [propertiesResponse, projectsResponse]
        .every(response => response.status === 'rejected');
      
      if (allFailed) {
        setError('Failed to load landing page data. Please refresh the page.');
      }

    } catch (err) {
      console.error('Landing page data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load landing page data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

// Individual hooks for backward compatibility - OPTIMIZED to avoid duplicate calls
export function useFeaturedProperties(limit: number = 10) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        // Get more properties and filter client-side to reduce API calls
        const response = await api.getProperties({ status: 'ACTIVE' }, 1, Math.max(limit * 2, 20));
        const featuredProperties = (response.data || [])
          .filter(p => p.is_featured)
          .slice(0, limit);
        setProperties(featuredProperties);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch featured properties');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [limit]);

  return { properties, loading, error };
}

export function useRecommendedProperties(limit: number = 8) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await api.getRecommendedProperties(limit);
        setProperties(response.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch recommended properties');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [limit]);

  return { properties, loading, error };
}

export function useRecentProperties(limit: number = 10) {
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
        
        // Sort by created_at descending to get most recent
        const sortedProperties = (response.data || []).sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setProperties(sortedProperties);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch recent properties');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [limit]);

  return { properties, loading, error };
}