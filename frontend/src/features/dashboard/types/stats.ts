// Statistics-related types for dashboard

export interface UserStats {
  overall: OverallStats;
  roleSpecific: RoleStats;
  trends: StatsTrend[];
  lastUpdated: string;
}

export interface OverallStats {
  totalActions: number;
  accountAge: number;
  lastLogin: string;
  profileCompletion: number;
}

export interface RoleStats {
  // Role-specific stats will be defined based on user role
  [key: string]: any;
}

export interface StatsTrend {
  period: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
}

export interface StatsHistory {
  period: TimePeriod;
  data: Array<{
    date: string;
    value: number;
  }>;
}

export type TimePeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface StatsCalculation {
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
}