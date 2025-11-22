// Agent-related TypeScript interfaces and types

// Property types for agent dashboard
export interface Property {
  id: number;
  title: string;
  price: number;
  property_type: string;
  status: string;
  images?: any[];
}

// Dashboard statistics
export interface DashboardStats {
  totalProperties: number;
  activeClients: number;
  propertiesSold: number;
  pendingDocuments: number;
}

// Quick action interface for dashboard
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  action: () => void;
}

// Lead Management types
export interface Lead {
  id: number;
  property_id: number;
  user_id?: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed' | 'spam';
  created_at: string;
  updated_at: string;
  property?: {
    id: number;
    title: string;
    price: number;
    address: string;
    city: string;
    state: string;
  };
  user?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  closed: number;
  conversionRate: number;
}

// Site Visit types
export interface SiteVisit {
  id: number;
  property_id: number;
  visitor_id: number | null;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string | null;
  scheduled_at: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  agent_notes: string | null;
  created_at: string;
  updated_at: string;
  property?: {
    id: number;
    title: string;
    address: string;
    city: string;
    state: string;
  };
  visitor?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    avatar: string | null;
  };
}

export interface SiteVisitStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  no_show: number;
  upcoming: number;
}

// Performance Analytics types
export interface PropertyAnalytics {
  propertyId: number;
  title: string;
  views: number;
  inquiries: number;
  favorites: number;
  imagesCount: number;
  daysSinceListing: number;
  avgViewsPerDay: number;
  createdAt: string;
  lastUpdated: string;
  isActive: boolean;
  isFeatured: boolean;
  price: number;
  propertyType: string;
  listingType: string;
  city: string;
  state: string;
}

export interface PerformanceMetrics {
  propertyId: number;
  views: number;
  daysSinceListing: number;
  avgViewsPerDay: number;
  performanceScore: number;
  comparisonData: {
    avgViewsOfSimilarProperties: number;
    totalSimilarProperties: number;
  };
  recommendations: string[];
}

export interface UserAnalytics {
  summary: {
    totalProperties: number;
    activeProperties: number;
    featuredProperties: number;
    totalViews: number;
    avgViewsPerProperty: number;
  };
  topProperties: Array<{
    id: number;
    title: string;
    views: number;
    price: number;
    type: string;
    listingType: string;
    isActive: boolean;
    isFeatured: boolean;
  }>;
  recentProperties: Array<{
    id: number;
    title: string;
    views: number;
    createdAt: string;
    isActive: boolean;
    isFeatured: boolean;
  }>;
}

// API Response types
export interface LeadsResponse {
  success: boolean;
  data: Lead[];
  error?: {
    message: string;
    details?: any;
  };
}

export interface LeadStatsResponse {
  success: boolean;
  data: LeadStats;
  error?: {
    message: string;
    details?: any;
  };
}

export interface SiteVisitsResponse {
  success: boolean;
  data: {
    visits: SiteVisit[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: {
    message: string;
    details?: any;
  };
}

export interface SiteVisitStatsResponse {
  success: boolean;
  data: SiteVisitStats;
  error?: {
    message: string;
    details?: any;
  };
}

export interface UserAnalyticsResponse {
  success: boolean;
  data: UserAnalytics;
  error?: {
    message: string;
    details?: any;
  };
}

export interface PropertyMetricsResponse {
  success: boolean;
  data: PerformanceMetrics;
  error?: {
    message: string;
    details?: any;
  };
}

// Filter and search types
export interface LeadFilters {
  status?: string;
  property_id?: string;
  search?: string;
}

export interface SiteVisitFilters {
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'all';
  property_id?: number;
  date_from?: string;
  date_to?: string;
}

// Form data types
export interface UpdateSiteVisitData {
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  scheduled_at: string;
  agent_notes?: string;
}

export interface LeadResponseData {
  message: string;
}

// Status type unions for type safety
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed' | 'spam';
export type SiteVisitStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';