// Core dashboard types extracted from existing components
import type { User } from '@/features/auth/types';
import type { UserStats } from './stats';
import type { Activity } from './activity';
import type { Notification } from './notifications';
import type { DashboardPreferences } from './preferences';

export interface Project {
  id: number;
  name: string;
  location: string;
  phase: string;
  units: number;
  sold: number;
  status: string;
}

export interface DashboardStats {
  // Common stats
  propertyViews: number;
  savedProperties: number;
  savedSearches: number;
  messages: number;
  
  // Builder-specific stats
  totalProjects: number;
  activeProjects: number;
  unitsListed: number;
  unitsAvailable: number;
  totalInquiries: number;
  
  // Owner/Agent stats
  totalListings: number;
  activeListings: number;
  inquiries: number;
}

export interface BuyerDashboardStats {
  savedProperties: number;
  savedSearches: number;
  messages: number;
}

export interface AgentDashboardStats {
  totalListings: number;
  activeListings: number;
  propertyViews: number;
  inquiries: number;
  messages: number;
}

export interface OwnerDashboardStats {
  totalListings: number;
  activeListings: number;
  propertyViews: number;
  inquiries: number;
  messages: number;
}

export interface BuilderDashboardStats {
  totalProjects: number;
  activeProjects: number;
  unitsListed: number;
  unitsAvailable: number;
  totalInquiries: number;
  messages: number;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  color: string;
  isEnabled?: boolean;
  badge?: string | number;
  priority?: 'high' | 'medium' | 'low';
}

export interface StatsCard {
  id: string;
  title: string;
  value: number;
  total?: number;
  icon: string;
  color: string;
  subtitle: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
    period: string;
  };
}

export interface DashboardData {
  user: User;
  stats: UserStats;
  recentActivity: Activity[];
  notifications: Notification[];
  quickActions: QuickAction[];
  preferences: DashboardPreferences;
}

export interface DashboardProps {
  stats: DashboardStats;
  recentProjects?: Project[];
}

// Role-specific dashboard props
export interface BuyerDashboardProps {
  stats: BuyerDashboardStats;
}

export interface AgentDashboardProps {
  stats: AgentDashboardStats;
}

export interface OwnerDashboardProps {
  stats: OwnerDashboardStats;
}

export interface BuilderDashboardProps {
  stats: BuilderDashboardStats;
  recentProjects: Project[];
}

// Dashboard error types
export enum DashboardErrorType {
  DATA_FETCH_ERROR = 'DATA_FETCH_ERROR',
  STATS_CALCULATION_ERROR = 'STATS_CALCULATION_ERROR',
  ACTIVITY_LOG_ERROR = 'ACTIVITY_LOG_ERROR',
  NOTIFICATION_ERROR = 'NOTIFICATION_ERROR',
  PREFERENCES_UPDATE_ERROR = 'PREFERENCES_UPDATE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR'
}

export interface DashboardError {
  type: DashboardErrorType;
  message: string;
  details?: any;
}