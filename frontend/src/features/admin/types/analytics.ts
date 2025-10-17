export interface AnalyticsData {
  totalUsers: number;
  totalProperties: number;
  totalInquiries: number;
  activeListings: number;
  featuredListings: number;
  usersByRole: Record<string, number>;
  propertiesByType: Record<string, number>;
  recentActivity: {
    newUsers: number;
    newProperties: number;
    newInquiries: number;
  };
}

export interface TrafficAnalytics {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  averageSessionDuration: number;
  topPages: Array<{
    page: string;
    views: number;
  }>;
}

export interface LeadAnalytics {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  leadsBySource: Record<string, number>;
  leadsByStatus: Record<string, number>;
}

export interface ListingAnalytics {
  totalListings: number;
  activeListings: number;
  featuredListings: number;
  listingsByType: Record<string, number>;
  listingsByStatus: Record<string, number>;
  averageListingViews: number;
}