import { httpClient } from '@/shared/lib/httpClient';
import type { ApiResponse, PaginatedResponse } from '@/shared/types';
import type { PropertyModerationData, PropertyModerationFilters } from '../types/moderation';

export interface PropertyModerationService {
  getProperties(params: PropertyModerationFilters & { page: number; limit: number }): Promise<ApiResponse<PaginatedResponse<PropertyModerationData>>>;
  getPropertyDetails(propertyId: number): Promise<ApiResponse<PropertyModerationData>>;
  updatePropertyStatus(propertyId: number, updates: { isActive?: boolean; isFeatured?: boolean }): Promise<ApiResponse<void>>;
  approveProperty(propertyId: number, reason?: string): Promise<ApiResponse<void>>;
  rejectProperty(propertyId: number, reason: string): Promise<ApiResponse<void>>;
  deleteProperty(propertyId: number): Promise<ApiResponse<void>>;
}

class PropertyModerationServiceImpl implements PropertyModerationService {
  async getProperties(params: PropertyModerationFilters & { page: number; limit: number }): Promise<ApiResponse<PaginatedResponse<PropertyModerationData>>> {
    try {
      const queryParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString(),
        ...Object.fromEntries(
          Object.entries(params).filter(([key, value]) => 
            key !== 'page' && key !== 'limit' && value !== undefined && value !== ''
          )
        ),
      });

      const response = await httpClient.get<{ 
        success: boolean; 
        data: { 
          properties: PropertyModerationData[]; 
          total: number; 
          totalPages: number; 
        } 
      }>(`/admin/properties?${queryParams}`);

      return {
        success: true,
        data: {
          data: response.data.properties,
          total: response.data.total,
          page: params.page,
          limit: params.limit,
          totalPages: response.data.totalPages
        },
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error fetching properties:', error);
      return {
        success: false,
        data: {
          data: [],
          total: 0,
          page: params.page,
          limit: params.limit,
          totalPages: 0
        },
        error: {
          code: 'PROPERTY_FETCH_ERROR',
          message: error.response?.data?.error?.message || 'Failed to fetch properties'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async getPropertyDetails(propertyId: number): Promise<ApiResponse<PropertyModerationData>> {
    try {
      const response = await httpClient.get<{ 
        success: boolean; 
        data: PropertyModerationData; 
      }>(`/properties/${propertyId}`);

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error fetching property details:', error);
      return {
        success: false,
        data: null as any,
        error: {
          code: 'PROPERTY_DETAIL_ERROR',
          message: error.response?.data?.error?.message || 'Failed to fetch property details'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async updatePropertyStatus(propertyId: number, updates: { isActive?: boolean; isFeatured?: boolean }): Promise<ApiResponse<void>> {
    try {
      await httpClient.put(`/admin/properties/${propertyId}/status`, updates);
      return {
        success: true,
        data: undefined,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error updating property status:', error);
      return {
        success: false,
        data: undefined,
        error: {
          code: 'PROPERTY_STATUS_ERROR',
          message: error.response?.data?.error?.message || 'Failed to update property status'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async approveProperty(propertyId: number, reason?: string): Promise<ApiResponse<void>> {
    try {
      await httpClient.post(`/admin/properties/${propertyId}/moderate`, {
        action: 'approve',
        reason
      });
      return {
        success: true,
        data: undefined,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error approving property:', error);
      return {
        success: false,
        data: undefined,
        error: {
          code: 'PROPERTY_APPROVE_ERROR',
          message: error.response?.data?.error?.message || 'Failed to approve property'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async rejectProperty(propertyId: number, reason: string): Promise<ApiResponse<void>> {
    try {
      await httpClient.post(`/admin/properties/${propertyId}/moderate`, {
        action: 'reject',
        reason
      });
      return {
        success: true,
        data: undefined,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error rejecting property:', error);
      return {
        success: false,
        data: undefined,
        error: {
          code: 'PROPERTY_REJECT_ERROR',
          message: error.response?.data?.error?.message || 'Failed to reject property'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async deleteProperty(propertyId: number): Promise<ApiResponse<void>> {
    try {
      await httpClient.delete(`/admin/properties/${propertyId}`);
      return {
        success: true,
        data: undefined,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error deleting property:', error);
      return {
        success: false,
        data: undefined,
        error: {
          code: 'PROPERTY_DELETE_ERROR',
          message: error.response?.data?.error?.message || 'Failed to delete property'
        },
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const propertyModerationService = new PropertyModerationServiceImpl();