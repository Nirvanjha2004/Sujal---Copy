// Property analytics and statistics types
export interface PropertyAnalytics {
  propertyId: number;
  totalViews: number;
  uniqueViews: number;
  viewsByDate: ViewsByDate[];
  inquiries: InquiryAnalytics[];
  favoriteCount: number;
  shareCount: number;
  performanceScore: number;
  averageViewDuration: number;
  bounceRate: number;
  conversionRate: number;
}

export interface ViewsByDate {
  date: string;
  views: number;
  uniqueViews: number;
}

export interface InquiryAnalytics {
  id: number;
  propertyId: number;
  inquiryType: InquiryType;
  source: InquirySource;
  createdAt: string;
  status: InquiryStatus;
}

export type InquiryType = 'contact' | 'site_visit' | 'phone_call' | 'email' | 'whatsapp';
export type InquirySource = 'website' | 'mobile_app' | 'social_media' | 'referral' | 'direct';
export type InquiryStatus = 'pending' | 'contacted' | 'qualified' | 'converted' | 'closed';

export interface MarketInsights {
  location: string;
  propertyType: string;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  averageArea: number;
  totalListings: number;
  activeListings: number;
  pricePerSqft: number;
  marketTrend: 'rising' | 'falling' | 'stable';
  demandScore: number;
  supplyScore: number;
}

export interface PerformanceMetrics {
  propertyId: number;
  listingAge: number; // days since listed
  viewsPerDay: number;
  inquiriesPerView: number;
  favoriteRate: number;
  shareRate: number;
  competitiveIndex: number; // compared to similar properties
  recommendedActions: string[];
}

export interface PropertyComparison {
  baseProperty: number;
  compareProperties: number[];
  metrics: ComparisonMetric[];
}

export interface ComparisonMetric {
  name: string;
  baseValue: number | string;
  compareValues: (number | string)[];
  unit?: string;
  category: 'price' | 'size' | 'location' | 'features' | 'performance';
}

export type TimePeriod = '7d' | '30d' | '90d' | '1y' | 'all';

export interface ViewStats {
  period: TimePeriod;
  totalViews: number;
  uniqueViews: number;
  averageViewDuration: number;
  topSources: Array<{
    source: string;
    views: number;
    percentage: number;
  }>;
  hourlyDistribution: Array<{
    hour: number;
    views: number;
  }>;
  dailyDistribution: Array<{
    day: string;
    views: number;
  }>;
}

// Property analytics dashboard types
export interface PropertyAnalyticsDashboard {
  propertyId: number;
  overview: PropertyAnalyticsOverview;
  performance: PerformanceMetrics;
  insights: MarketInsights;
  recommendations: PropertyRecommendation[];
}

export interface PropertyAnalyticsOverview {
  totalViews: number;
  uniqueViews: number;
  totalInquiries: number;
  favoriteCount: number;
  shareCount: number;
  conversionRate: number;
  averageViewDuration: number;
  lastUpdated: string;
}

export interface PropertyRecommendation {
  id: string;
  type: 'pricing' | 'marketing' | 'content' | 'images' | 'features';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  actionItems: string[];
}

// Lead and inquiry analytics
export interface LeadAnalytics {
  propertyId: number;
  totalLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  leadSources: Array<{
    source: InquirySource;
    count: number;
    conversionRate: number;
  }>;
  leadsByType: Array<{
    type: InquiryType;
    count: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    leads: number;
    conversions: number;
  }>;
}

// Property comparison analytics
export interface PropertyComparisonAnalytics {
  baseProperty: number;
  compareProperties: number[];
  metrics: Array<{
    name: string;
    category: 'performance' | 'features' | 'pricing' | 'location';
    baseValue: number | string;
    compareValues: Array<number | string>;
    unit?: string;
    trend?: 'better' | 'worse' | 'similar';
  }>;
  overallScore: {
    base: number;
    compare: number[];
  };
}