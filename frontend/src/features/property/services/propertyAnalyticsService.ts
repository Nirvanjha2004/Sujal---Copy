import { api } from '@/shared/lib/api';
import type { 
  PropertyAnalytics,
  PropertyStats,
  ViewStats,
  MarketInsights,
  PerformanceMetrics,
  TimePeriod,
  LeadAnalytics,
  PropertyComparisonAnalytics,
  PropertyRecommendation
} from '../types';

/**
 * Property analytics service for statistics, performance tracking, and market insights
 */
class PropertyAnalyticsService {
  /**
   * Get comprehensive property analytics
   */
  async getPropertyAnalytics(propertyId: number): Promise<PropertyAnalytics> {
    try {
      const response = await api.getPropertyAnalytics(propertyId);
      
      return {
        propertyId,
        totalViews: response.data?.totalViews || 0,
        uniqueViews: response.data?.uniqueViews || 0,
        viewsByDate: response.data?.viewsByDate || [],
        inquiries: response.data?.inquiries || [],
        favoriteCount: response.data?.favoriteCount || 0,
        shareCount: response.data?.shareCount || 0,
        performanceScore: response.data?.performanceScore || 0,
        averageViewDuration: response.data?.averageViewDuration || 0,
        bounceRate: response.data?.bounceRate || 0,
        conversionRate: response.data?.conversionRate || 0
      };
    } catch (error: any) {
      // Return default analytics if API fails
      return this.getDefaultAnalytics(propertyId);
    }
  }

  /**
   * Get property statistics
   */
  async getPropertyStats(propertyId: number): Promise<PropertyStats> {
    try {
      const response = await api.getPropertyAnalytics(propertyId);
      
      return {
        views: response.data?.views || 0,
        favorites: response.data?.favorites || 0,
        inquiries: response.data?.inquiries || 0,
        shares: response.data?.shares || 0,
        lastViewed: response.data?.lastViewed,
        averageViewDuration: response.data?.averageViewDuration || 0
      };
    } catch (error: any) {
      // Return default stats if API fails
      return {
        views: 0,
        favorites: 0,
        inquiries: 0,
        shares: 0
      };
    }
  }

  /**
   * Get property view statistics for a specific period
   */
  async getPropertyViews(propertyId: number, period: TimePeriod = '30d'): Promise<ViewStats> {
    try {
      const response = await api.getPropertyAnalytics(propertyId);
      
      // Generate mock data based on period for now
      const mockData = this.generateMockViewStats(period);
      
      return {
        period,
        totalViews: response.data?.totalViews || mockData.totalViews,
        uniqueViews: response.data?.uniqueViews || mockData.uniqueViews,
        averageViewDuration: response.data?.averageViewDuration || mockData.averageViewDuration,
        topSources: mockData.topSources,
        hourlyDistribution: mockData.hourlyDistribution,
        dailyDistribution: mockData.dailyDistribution
      };
    } catch (error: any) {
      return this.generateMockViewStats(period);
    }
  }

  /**
   * Get property performance metrics
   */
  async getPropertyPerformance(propertyId: number): Promise<PerformanceMetrics> {
    try {
      const response = await api.getPropertyPerformance(propertyId);
      
      return {
        propertyId,
        listingAge: response.data?.listingAge || 0,
        viewsPerDay: response.data?.viewsPerDay || 0,
        inquiriesPerView: response.data?.inquiriesPerView || 0,
        favoriteRate: response.data?.favoriteRate || 0,
        shareRate: response.data?.shareRate || 0,
        competitiveIndex: response.data?.competitiveIndex || 50,
        recommendedActions: response.data?.recommendedActions || []
      };
    } catch (error: any) {
      return this.generateMockPerformanceMetrics(propertyId);
    }
  }

  /**
   * Get market insights for location and property type
   */
  async getMarketInsights(
    location: string, 
    propertyType: string
  ): Promise<MarketInsights> {
    try {
      // For now, generate mock market insights
      // This would be replaced with actual market data API
      return this.generateMockMarketInsights(location, propertyType);
    } catch (error: any) {
      throw new Error(`Failed to get market insights: ${error.message}`);
    }
  }

  /**
   * Track property view
   */
  async trackPropertyView(
    propertyId: number, 
    source: string = 'website',
    duration?: number
  ): Promise<void> {
    try {
      // For now, we'll store view tracking in localStorage
      // This should be replaced with actual analytics API
      const viewData = {
        propertyId,
        timestamp: new Date().toISOString(),
        source,
        duration: duration || 0
      };

      const existingViews = localStorage.getItem('propertyViews');
      const views = existingViews ? JSON.parse(existingViews) : [];
      views.push(viewData);
      
      // Keep only last 1000 views
      if (views.length > 1000) {
        views.splice(0, views.length - 1000);
      }
      
      localStorage.setItem('propertyViews', JSON.stringify(views));
    } catch (error: any) {
      console.error('Failed to track property view:', error);
    }
  }

  /**
   * Get lead analytics for property
   */
  async getLeadAnalytics(propertyId: number): Promise<LeadAnalytics> {
    try {
      // Mock lead analytics data
      return {
        propertyId,
        totalLeads: Math.floor(Math.random() * 50) + 10,
        qualifiedLeads: Math.floor(Math.random() * 20) + 5,
        convertedLeads: Math.floor(Math.random() * 5) + 1,
        leadSources: [
          { source: 'website', count: 15, conversionRate: 0.12 },
          { source: 'mobile_app', count: 8, conversionRate: 0.15 },
          { source: 'social_media', count: 5, conversionRate: 0.08 },
          { source: 'referral', count: 3, conversionRate: 0.25 }
        ],
        leadsByType: [
          { type: 'contact', count: 20 },
          { type: 'site_visit', count: 8 },
          { type: 'phone_call', count: 3 }
        ],
        monthlyTrend: this.generateMonthlyTrend()
      };
    } catch (error: any) {
      throw new Error(`Failed to get lead analytics: ${error.message}`);
    }
  }

  /**
   * Compare properties
   */
  async compareProperties(
    basePropertyId: number, 
    comparePropertyIds: number[]
  ): Promise<PropertyComparisonAnalytics> {
    try {
      // Mock comparison data
      return {
        baseProperty: basePropertyId,
        compareProperties: comparePropertyIds,
        metrics: [
          {
            name: 'Views per Day',
            category: 'performance',
            baseValue: 15,
            compareValues: [12, 18, 8],
            unit: 'views',
            trend: 'better'
          },
          {
            name: 'Inquiry Rate',
            category: 'performance',
            baseValue: 0.08,
            compareValues: [0.06, 0.12, 0.04],
            unit: '%',
            trend: 'similar'
          },
          {
            name: 'Price per Sq Ft',
            category: 'pricing',
            baseValue: 5500,
            compareValues: [5200, 6000, 4800],
            unit: '₹/sqft',
            trend: 'similar'
          }
        ],
        overallScore: {
          base: 75,
          compare: [68, 82, 55]
        }
      };
    } catch (error: any) {
      throw new Error(`Failed to compare properties: ${error.message}`);
    }
  }

  /**
   * Get property recommendations
   */
  async getPropertyRecommendations(propertyId: number): Promise<PropertyRecommendation[]> {
    try {
      const performance = await this.getPropertyPerformance(propertyId);
      const recommendations: PropertyRecommendation[] = [];

      // Generate recommendations based on performance
      if (performance.viewsPerDay < 5) {
        recommendations.push({
          id: 'improve_visibility',
          type: 'marketing',
          priority: 'high',
          title: 'Improve Property Visibility',
          description: 'Your property is receiving fewer views than average. Consider improving photos and description.',
          impact: 'Could increase views by 40-60%',
          effort: 'medium',
          actionItems: [
            'Add high-quality photos',
            'Update property description',
            'Add virtual tour',
            'Feature the property'
          ]
        });
      }

      if (performance.inquiriesPerView < 0.05) {
        recommendations.push({
          id: 'improve_conversion',
          type: 'content',
          priority: 'medium',
          title: 'Improve Inquiry Conversion',
          description: 'Visitors are viewing but not inquiring. Enhance your property details.',
          impact: 'Could increase inquiries by 25-35%',
          effort: 'low',
          actionItems: [
            'Add detailed amenities list',
            'Include floor plans',
            'Add neighborhood information',
            'Highlight unique features'
          ]
        });
      }

      if (performance.competitiveIndex < 40) {
        recommendations.push({
          id: 'pricing_review',
          type: 'pricing',
          priority: 'high',
          title: 'Review Pricing Strategy',
          description: 'Your property may be overpriced compared to similar properties.',
          impact: 'Could increase interest by 50-70%',
          effort: 'low',
          actionItems: [
            'Research comparable properties',
            'Consider price adjustment',
            'Highlight value propositions',
            'Offer flexible terms'
          ]
        });
      }

      return recommendations;
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Generate default analytics for fallback
   */
  private getDefaultAnalytics(propertyId: number): PropertyAnalytics {
    return {
      propertyId,
      totalViews: 0,
      uniqueViews: 0,
      viewsByDate: [],
      inquiries: [],
      favoriteCount: 0,
      shareCount: 0,
      performanceScore: 0,
      averageViewDuration: 0,
      bounceRate: 0,
      conversionRate: 0
    };
  }

  /**
   * Generate mock view statistics
   */
  private generateMockViewStats(period: TimePeriod): ViewStats {
    const days = this.getPeriodDays(period);
    const totalViews = Math.floor(Math.random() * days * 10) + days;
    const uniqueViews = Math.floor(totalViews * 0.7);

    return {
      period,
      totalViews,
      uniqueViews,
      averageViewDuration: Math.floor(Math.random() * 180) + 60, // 60-240 seconds
      topSources: [
        { source: 'Direct', views: Math.floor(totalViews * 0.4), percentage: 40 },
        { source: 'Search', views: Math.floor(totalViews * 0.3), percentage: 30 },
        { source: 'Social Media', views: Math.floor(totalViews * 0.2), percentage: 20 },
        { source: 'Referral', views: Math.floor(totalViews * 0.1), percentage: 10 }
      ],
      hourlyDistribution: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        views: Math.floor(Math.random() * 20) + 1
      })),
      dailyDistribution: Array.from({ length: Math.min(days, 30) }, (_, i) => ({
        day: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        views: Math.floor(Math.random() * 50) + 1
      }))
    };
  }

  /**
   * Generate mock performance metrics
   */
  private generateMockPerformanceMetrics(propertyId: number): PerformanceMetrics {
    return {
      propertyId,
      listingAge: Math.floor(Math.random() * 90) + 1,
      viewsPerDay: Math.floor(Math.random() * 20) + 1,
      inquiriesPerView: Math.random() * 0.1 + 0.02,
      favoriteRate: Math.random() * 0.05 + 0.01,
      shareRate: Math.random() * 0.02 + 0.005,
      competitiveIndex: Math.floor(Math.random() * 60) + 20,
      recommendedActions: [
        'Add more high-quality photos',
        'Update property description',
        'Consider price adjustment'
      ]
    };
  }

  /**
   * Generate mock market insights
   */
  private generateMockMarketInsights(location: string, propertyType: string): MarketInsights {
    const basePrice = Math.floor(Math.random() * 5000) + 3000;
    
    return {
      location,
      propertyType,
      averagePrice: basePrice * 1000,
      priceRange: {
        min: basePrice * 800,
        max: basePrice * 1200
      },
      averageArea: Math.floor(Math.random() * 1000) + 800,
      totalListings: Math.floor(Math.random() * 500) + 100,
      activeListings: Math.floor(Math.random() * 300) + 50,
      pricePerSqft: basePrice,
      marketTrend: ['rising', 'falling', 'stable'][Math.floor(Math.random() * 3)] as any,
      demandScore: Math.floor(Math.random() * 40) + 60,
      supplyScore: Math.floor(Math.random() * 40) + 30
    };
  }

  /**
   * Generate monthly trend data
   */
  private generateMonthlyTrend(): Array<{ month: string; leads: number; conversions: number }> {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      leads: Math.floor(Math.random() * 20) + 5,
      conversions: Math.floor(Math.random() * 5) + 1
    }));
  }

  /**
   * Get number of days for a time period
   */
  private getPeriodDays(period: TimePeriod): number {
    switch (period) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      case 'all': return 365;
      default: return 30;
    }
  }
}

export default new PropertyAnalyticsService();