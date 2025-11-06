import {
  SiteVisit,
  SiteVisitStats,
  SiteVisitFilters,
  SiteVisitsResponse,
  SiteVisitStatsResponse,
  UpdateSiteVisitData
} from '../types';

export interface CreateSiteVisitRequest {
  property_id: number;
  visitor_name: string;
  visitor_email: string;
  visitor_phone?: string;
  scheduled_at: string;
  notes?: string;
}

class SiteVisitService {
  private getAuthHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    };
  }

  private getPublicHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Create a new site visit (public endpoint - no auth required)
   */
  async createSiteVisit(data: CreateSiteVisitRequest): Promise<SiteVisit> {
    try {
      const response = await fetch('/api/v1/site-visits', {
        method: 'POST',
        headers: this.getPublicHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create site visit');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create site visit');
    }
  }

  /**
   * Fetch all site visits for the authenticated agent
   */
  async fetchAgentSiteVisits(filters: SiteVisitFilters = {}): Promise<SiteVisit[]> {
    try {
      const params = new URLSearchParams();

      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.property_id) params.append('property_id', filters.property_id.toString());
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await fetch(`/api/v1/site-visits/agent?${params.toString()}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch agent site visits');
      }

      const result: SiteVisitsResponse = await response.json();
      return result.data.visits;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to load agent site visits');
    }
  }

  /**
   * Fetch site visit statistics for the authenticated agent
   */
  async fetchSiteVisitStats(): Promise<SiteVisitStats> {
    try {
      const response = await fetch('/api/v1/site-visits/stats', {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch site visit stats');
      }

      const result: SiteVisitStatsResponse = await response.json();
      return result.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to load site visit stats');
    }
  }

  /**
   * Fetch site visits for a specific property
   */
  async fetchPropertySiteVisits(propertyId: number): Promise<SiteVisit[]> {
    try {
      const response = await fetch(`/api/v1/site-visits/property/${propertyId}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch property site visits');
      }

      const result: SiteVisitsResponse = await response.json();
      return result.data.visits;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to load property site visits');
    }
  }

  /**
   * Update an existing site visit
   */
  async updateSiteVisit(visitId: number, data: UpdateSiteVisitData): Promise<void> {
    try {
      const response = await fetch(`/api/v1/site-visits/${visitId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update site visit');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update site visit');
    }
  }

  /**
   * Get site visits with pagination support
   */
  async fetchSiteVisitsWithPagination(
    filters: SiteVisitFilters & { page?: number; limit?: number } = {}
  ): Promise<{ visits: SiteVisit[]; pagination: any }> {
    try {
      const params = new URLSearchParams();

      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.property_id) params.append('property_id', filters.property_id.toString());
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/v1/site-visits/agent?${params.toString()}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch site visits');
      }

      const result: SiteVisitsResponse = await response.json();
      return {
        visits: result.data.visits,
        pagination: result.data.pagination
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to load site visits');
    }
  }
}

export const siteVisitService = new SiteVisitService();