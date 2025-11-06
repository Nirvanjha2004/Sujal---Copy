import { api } from '@/shared/lib/api';
import type { ApiResponse } from '@/shared/types';
import type { AnalyticsData } from '../types/analytics';

export interface AdminService {
  getAnalytics(): Promise<ApiResponse<AnalyticsData>>;
}

class AdminServiceImpl implements AdminService {
  async getAnalytics(): Promise<ApiResponse<AnalyticsData>> {
    try {
      const response = await api.admin.getAnalytics();
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      return {
        success: false,
        data: undefined,
        error: {
          code: 'ANALYTICS_ERROR',
          message: error.message || 'Failed to fetch analytics data'
        },
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const adminService = new AdminServiceImpl();