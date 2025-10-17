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
        message: 'Properties retrieved successfully'
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
        message: error.response?.data?.error?.message || 'Failed to fetch properties'
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
        message: 'Property details retrieved successfully'
      };
    } catch (error: any) {
      console.error('Error fetching property details:', error);
      return {
        success: false,
        data: null as any,
        message: error.response?.data?.error?.message || 'Failed to fetch property details'
      };
    }
  }

  async updatePropertyStatus(propertyId: number, updates: { isActive?: boolean; isFeatured?: boolean }): Promise<ApiResponse<void>> {
    try {
      await httpClient.put(`/admin/properties/${propertyId}/status`, updates);
      return {
        success: true,
        data: undefined,
        message: 'Property status updated successfully'
      };
    } catch (error: any) {
      console.error('Error updating property status:', error);
      return {
        success: false,
        data: undefined,
        message: error.response?.data?.error?.message || 'Failed to update property status'
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
        message: 'Property approved successfully'
      };
    } catch (error: any) {
      console.error('Error approving property:', error);
      return {
        success: false,
        data: undefined,
        message: error.response?.data?.error?.message || 'Failed to approve property'
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
        message: 'Property rejected successfully'
      };
    } catch (error: any) {
      console.error('Error rejecting property:', error);
      return {
        success: false,
        data: undefined,
        message: error.response?.data?.error?.message || 'Failed to reject property'
      };
    }
  }

  async deleteProperty(propertyId: number): Promise<ApiResponse<void>> {
    try {
      await httpClient.delete(`/admin/properties/${propertyId}`);
      return {
        success: true,
        data: undefined,
        message: 'Property deleted successfully'
      };
    } catch (error: any) {
      console.error('Error deleting property:', error);
      return {
        success: false,
        data: undefined,
        message: error.response?.data?.error?.message || 'Failed to delete property'
      };
    }
  }
}

export const propertyModerationService = new PropertyModerationServiceImpl();