import { 
  UserAnalytics, 
  PerformanceMetrics, 
  UserAnalyticsResponse, 
  PropertyMetricsResponse 
} from '../types';

class AgentAnalyticsService {

  async fetchUserAnalytics(): Promise<UserAnalytics> {
    try {
      const response = await fetch('/api/properties/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result: UserAnalyticsResponse = await response.json();
      return result.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to load analytics');
    }
  }

  async fetchPropertyMetrics(propertyId: number): Promise<PerformanceMetrics> {
    try {
      const response = await fetch(`/api/properties/${propertyId}/performance`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch property metrics');
      }

      const result: PropertyMetricsResponse = await response.json();
      return result.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to load property metrics');
    }
  }
}

export const agentAnalyticsService = new AgentAnalyticsService();