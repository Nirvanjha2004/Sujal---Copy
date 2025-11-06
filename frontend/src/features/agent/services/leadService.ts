import { 
  Lead, 
  LeadStats, 
  LeadFilters, 
  LeadsResponse, 
  LeadStatsResponse,
  SiteVisit,
  SiteVisitStats,
  SiteVisitFilters,
  SiteVisitsResponse,
  SiteVisitStatsResponse,
  UpdateSiteVisitData
} from '../types';

export interface UpdateLeadStatusRequest {
  status: string;
}

export interface SendResponseRequest {
  message: string;
}

class LeadService {
  private getAuthHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    };
  }

  async fetchLeads(filters: LeadFilters = {}): Promise<Lead[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.property_id) params.append('property_id', filters.property_id);
      if (filters.search) params.append('search', filters.search);
      
      const response = await fetch(`/api/v1/inquiries?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }

      const result: LeadsResponse = await response.json();
      return result.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to load leads');
    }
  }

  async fetchLeadStats(): Promise<LeadStats> {
    try {
      const response = await fetch('/api/v1/inquiries/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lead stats');
      }

      const result: LeadStatsResponse = await response.json();
      return result.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to load lead stats');
    }
  }

  async updateLeadStatus(leadId: number, status: string): Promise<void> {
    try {
      const response = await fetch(`/api/v1/inquiries/${leadId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status } as UpdateLeadStatusRequest),
      });

      if (!response.ok) {
        throw new Error('Failed to update lead status');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update status');
    }
  }

  async sendResponse(leadId: number, message: string): Promise<void> {
    try {
      const response = await fetch(`/api/v1/inquiries/${leadId}/respond`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ message } as SendResponseRequest),
      });

      if (!response.ok) {
        throw new Error('Failed to send response');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to send response');
    }
  }

  // Site Visit Management Methods
  async fetchAgentSiteVisits(filters: SiteVisitFilters = {}): Promise<SiteVisit[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.property_id) params.append('property_id', filters.property_id.toString());
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      
      const response = await fetch(`/api/v1/site-visits/agent?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch site visits');
      }

      const result: SiteVisitsResponse = await response.json();
      return result.data.visits;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to load site visits');
    }
  }

  async fetchSiteVisitStats(): Promise<SiteVisitStats> {
    try {
      const response = await fetch('/api/v1/site-visits/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
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

  async fetchPropertySiteVisits(propertyId: number): Promise<SiteVisit[]> {
    try {
      const response = await fetch(`/api/v1/site-visits/property/${propertyId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
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

  async createSiteVisit(data: {
    property_id: number;
    visitor_name: string;
    visitor_email: string;
    visitor_phone?: string;
    scheduled_at: string;
    notes?: string;
  }): Promise<SiteVisit> {
    try {
      // This endpoint doesn't require authentication based on backend routes
      const response = await fetch('/api/v1/site-visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  // Legacy method for backward compatibility
  async fetchSiteVisits(filters: SiteVisitFilters = {}): Promise<SiteVisit[]> {
    return this.fetchAgentSiteVisits(filters);
  }
}

export const leadService = new LeadService();