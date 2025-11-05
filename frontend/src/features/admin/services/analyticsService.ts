import { api } from '@/shared/lib/api';
import type { ApiResponse } from '@/shared/types';

export interface AnalyticsService {
  getTrafficAnalytics(range: string): Promise<ApiResponse<any>>;
  getLeadAnalytics(range: string): Promise<ApiResponse<any>>;
  getListingAnalytics(range: string): Promise<ApiResponse<any>>;
  getSystemStats(): Promise<ApiResponse<any>>;
}

class AnalyticsServiceImpl implements AnalyticsService {
  async getTrafficAnalytics(range: string = '30d'): Promise<ApiResponse<any>> {
    try {
      const response = await api.admin.getTrafficAnalytics(range);
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error fetching traffic analytics:', error);
      return {
        success: false,
        error: {
          code: 'ANALYTICS_ERROR',
          message: error.message || 'Failed to fetch traffic analytics'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async getLeadAnalytics(range: string = '30d'): Promise<ApiResponse<any>> {
    try {
      const response = await api.admin.getLeadAnalytics(range);
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error fetching lead analytics:', error);
      return {
        success: false,
        error: {
          code: 'ANALYTICS_ERROR',
          message: error.message || 'Failed to fetch lead analytics'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async getListingAnalytics(range: string = '30d'): Promise<ApiResponse<any>> {
    try {
      const response = await api.admin.getListingAnalytics(range);
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error fetching listing analytics:', error);
      return {
        success: false,
        error: {
          code: 'ANALYTICS_ERROR',
          message: error.message || 'Failed to fetch listing analytics'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async getSystemStats(): Promise<ApiResponse<any>> {
    try {
      const response = await api.admin.getSystemStats();
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error fetching system stats:', error);
      return {
        success: false,
        error: {
          code: 'ANALYTICS_ERROR',
          message: error.message || 'Failed to fetch system stats'
        },
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const analyticsService = new AnalyticsServiceImpl();