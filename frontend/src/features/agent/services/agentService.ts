import { DashboardStats, Property } from '../types';

export interface DashboardResponse {
  success: boolean;
  data: {
    stats: DashboardStats;
    recentProperties?: Property[];
  };
  error?: {
    message: string;
    details?: any;
  };
}

export interface PropertiesResponse {
  success: boolean;
  data: Property[];
  error?: {
    message: string;
    details?: any;
  };
}

class AgentService {

  async fetchDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch('/api/agent/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const result: DashboardResponse = await response.json();
      return result.data.stats;
    } catch (error) {
      // For now, return mock data if API fails (as seen in the original component)
      console.error('Failed to fetch dashboard stats:', error);
      return {
        totalProperties: 324,
        activeClients: 4,
        propertiesSold: 5,
        pendingDocuments: 6
      };
    }
  }

  async fetchAgentProperties(): Promise<Property[]> {
    try {
      const response = await fetch('/api/agent/properties', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch agent properties');
      }

      const result: PropertiesResponse = await response.json();
      return result.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to load properties');
    }
  }

  async fetchDashboardData(): Promise<{ stats: DashboardStats; properties: Property[] }> {
    try {
      const [stats, properties] = await Promise.all([
        this.fetchDashboardStats(),
        this.fetchAgentProperties()
      ]);

      return { stats, properties };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to load dashboard data');
    }
  }
}

export const agentService = new AgentService();