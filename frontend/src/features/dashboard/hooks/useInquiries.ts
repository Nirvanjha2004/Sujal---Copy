import { useState, useEffect } from 'react';
import { api } from '@/shared/lib/api';

export interface Inquiry {
  id: number;
  property_id?: number;
  project_id?: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'new' | 'contacted' | 'closed';
  created_at: string;
  property?: {
    id: number;
    title: string;
    property_type: string;
    listing_type: string;
    price: number;
  };
  project?: {
    id: number;
    name: string;
    project_type: string;
    status: string;
    city: string;
    state: string;
  };
  inquirer?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface InquiryStats {
  total: number;
  new: number;
  contacted: number;
  closed: number;
}

export interface UseInquiriesResult {
  inquiries: Inquiry[];
  stats: InquiryStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useInquiries(params?: {
  page?: number;
  limit?: number;
  status?: string;
  property_id?: number;
  project_id?: number;
}): UseInquiriesResult {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [stats, setStats] = useState<InquiryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInquiries = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch inquiries
      const inquiriesResponse = await api.communication.getInquiries(params);
      console.log('Inquiries API Response:', inquiriesResponse);
      
      // Handle different possible response structures
      const inquiriesData = inquiriesResponse.data?.inquiries || inquiriesResponse.data || [];
      console.log('Processed inquiries data:', inquiriesData);
      
      setInquiries(Array.isArray(inquiriesData) ? inquiriesData : []);

      // Fetch stats
      const statsResponse = await api.communication.getInquiryStats(params?.property_id);
      console.log('Stats API Response:', statsResponse);
      setStats(statsResponse.data || null);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch inquiries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [params?.page, params?.limit, params?.status, params?.property_id, params?.project_id]);

  return {
    inquiries,
    stats,
    isLoading,
    error,
    refetch: fetchInquiries,
  };
}