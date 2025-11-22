import { Property } from '../models/Property';
import { User } from '../models/User';
import { Inquiry } from '../models/Inquiry';
import { Op } from 'sequelize';
import CacheService, { AnalyticsData } from './cacheService';

export interface DashboardAnalytics {
  totalProperties: number;
  totalUsers: number;
  totalInquiries: number;
  propertyViews: number;
  newListingsToday: number;
  newListingsThisWeek: number;
  newListingsThisMonth: number;
  activeUsers: number;
  popularCities: Array<{ city: string; count: number }>;
  propertyTypeDistribution: Array<{ type: string; count: number }>;
  listingTypeDistribution: Array<{ type: string; count: number }>;
  priceRangeDistribution: Array<{ range: string; count: number }>;
  monthlyTrends: Array<{ month: string; properties: number; users: number; inquiries: number }>;
}

export interface PropertyAnalytics {
  propertyId: number;
  views: number;
  inquiries: number;
  favorites: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  averageViewsPerDay: number;
  conversionRate: number; // inquiries/views ratio
}

class AnalyticsService {
  private cacheService: CacheService;

  constructor() {
    this.cacheService = new CacheService();
  }

  /**
   * Get dashboard analytics with caching
   */
  async getDashboardAnalytics(date?: string): Promise<DashboardAnalytics> {
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Try to get from cache first
    const cachedData = await this.cacheService.getAnalyticsData(targetDate);
    if (cachedData) {
      return this.formatDashboardAnalytics(cachedData);
    }

    // Calculate analytics data
    const analyticsData = await this.calculateDashboardAnalytics(targetDate);

    // Cache the results
    await this.cacheService.cacheAnalyticsData(targetDate, analyticsData);

    return this.formatDashboardAnalytics(analyticsData);
  }

  /**
   * Calculate dashboard analytics from database
   */
  private async calculateDashboardAnalytics(date: string): Promise<AnalyticsData> {
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - 7);
    const startOfMonth = new Date(startOfDay);
    startOfMonth.setMonth(startOfDay.getMonth() - 1);

    try {
      const [
        totalProperties,
        totalUsers,
        totalInquiries,
        newListingsToday,
        activeUsers,
        popularCities,
        propertyTypeDistribution,
      ] = await Promise.all([
        // Total active properties
        Property.count({ where: { is_active: true } }),

        // Total active users
        User.count({ where: { is_active: true } }),

        // Total inquiries
        Inquiry.count(),

        // New listings today
        Property.count({
          where: {
            created_at: {
              [Op.between]: [startOfDay, endOfDay],
            },
          },
        }),

        // Active users (users who logged in within last 24 hours)
        User.count({
          where: {
            updated_at: {
              [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        }),

        // Popular cities
        Property.findAll({
          attributes: [
            'city',
            [Property.sequelize!.fn('COUNT', Property.sequelize!.col('id')), 'count'],
          ],
          where: { is_active: true },
          group: ['city'],
          order: [[Property.sequelize!.fn('COUNT', Property.sequelize!.col('id')), 'DESC']],
          limit: 10,
          raw: true,
        }),

        // Property type distribution
        Property.findAll({
          attributes: [
            'property_type',
            [Property.sequelize!.fn('COUNT', Property.sequelize!.col('id')), 'count'],
          ],
          where: { is_active: true },
          group: ['property_type'],
          raw: true,
        }),
      ]);

      // Get property views from cache (sum all cached views)
      const propertyViews = await this.getTotalPropertyViews();

      return {
        totalProperties,
        totalUsers,
        totalInquiries,
        propertyViews,
        newListingsToday,
        activeUsers,
        popularCities: popularCities.map((city: any) => ({
          city: city.city,
          count: parseInt(city.count, 10),
        })),
        propertyTypeDistribution: propertyTypeDistribution.map((type: any) => ({
          type: type.property_type,
          count: parseInt(type.count, 10),
        })),
      };
    } catch (error) {
      console.error('Error calculating dashboard analytics:', error);
      throw error;
    }
  }

  /**
   * Format analytics data for dashboard
   */
  private formatDashboardAnalytics(data: AnalyticsData): DashboardAnalytics {
    return {
      totalProperties: data.totalProperties,
      totalUsers: data.totalUsers,
      totalInquiries: data.totalInquiries,
      propertyViews: data.propertyViews,
      newListingsToday: data.newListingsToday,
      newListingsThisWeek: 0, // Would need additional calculation
      newListingsThisMonth: 0, // Would need additional calculation
      activeUsers: data.activeUsers,
      popularCities: data.popularCities,
      propertyTypeDistribution: data.propertyTypeDistribution,
      listingTypeDistribution: [], // Would need additional calculation
      priceRangeDistribution: [], // Would need additional calculation
      monthlyTrends: [], // Would need additional calculation
    };
  }

  /**
   * Get property-specific analytics
   */
  async getPropertyAnalytics(propertyId: number): Promise<PropertyAnalytics> {
    try {
      const [property, views, inquiryCount] = await Promise.all([
        Property.findByPk(propertyId),
        this.cacheService.getPropertyViews(propertyId),
        Inquiry.count({ where: { property_id: propertyId } }),
      ]);

      if (!property) {
        throw new Error('Property not found');
      }

      // Calculate additional metrics
      const daysSinceCreated = Math.max(
        1,
        Math.floor((Date.now() - property.created_at.getTime()) / (1000 * 60 * 60 * 24))
      );
      const averageViewsPerDay = views / daysSinceCreated;
      const conversionRate = views > 0 ? (inquiryCount / views) * 100 : 0;

      return {
        propertyId,
        views,
        inquiries: inquiryCount,
        favorites: 0, // Would need to implement favorites count
        viewsThisWeek: 0, // Would need weekly tracking
        viewsThisMonth: 0, // Would need monthly tracking
        averageViewsPerDay,
        conversionRate,
      };
    } catch (error) {
      console.error('Error getting property analytics:', error);
      throw error;
    }
  }

  /**
   * Track property view
   */
  async trackPropertyView(propertyId: number): Promise<number> {
    try {
      // Increment in cache
      const views = await this.cacheService.incrementPropertyViews(propertyId);

      // Also update database periodically (could be done in background job)
      if (views % 10 === 0) { // Update DB every 10 views
        await Property.increment('views_count', {
          by: 10,
          where: { id: propertyId },
        });
      }

      return views;
    } catch (error) {
      console.error('Error tracking property view:', error);
      return 0;
    }
  }

  /**
   * Get total property views from cache
   */
  private async getTotalPropertyViews(): Promise<number> {
    try {
      // This would require iterating through all property view keys
      // For now, return 0 - in production, you might want to maintain a separate counter
      return 0;
    } catch (error) {
      console.error('Error getting total property views:', error);
      return 0;
    }
  }

  /**
   * Get popular properties based on views
   */
  async getPopularProperties(limit: number = 10): Promise<any[]> {
    try {
      // Try to get from cache first
      const cachedPopular = await this.cacheService.getPopularProperties();
      if (cachedPopular) {
        return cachedPopular.slice(0, limit);
      }

      // Fallback to database
      const popularProperties = await Property.findAll({
        where: { is_active: true },
        order: [['views_count', 'DESC']],
        limit,
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'first_name', 'last_name', 'role'],
          },
        ],
      });

      return popularProperties.map(p => p.toJSON());
    } catch (error) {
      console.error('Error getting popular properties:', error);
      return [];
    }
  }

  /**
   * Get analytics for a specific user's properties
   */
  async getUserPropertyAnalytics(userId: number): Promise<{
    totalProperties: number;
    activeProperties: number;
    totalViews: number;
    totalInquiries: number;
    averageViewsPerProperty: number;
    topPerformingProperty?: any;
  }> {
    try {
      const userProperties = await Property.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Inquiry,
            as: 'inquiries',
          },
        ],
      });

      const totalProperties = userProperties.length;
      const activeProperties = userProperties.filter(p => p.is_active).length;

      // Get views from cache for each property
      const viewsPromises = userProperties.map(p =>
        this.cacheService.getPropertyViews(p.id)
      );
      const viewsArray = await Promise.all(viewsPromises);
      const totalViews = viewsArray.reduce((sum, views) => sum + views, 0);

      const totalInquiries = userProperties.reduce(
        (sum, p) => sum + (p.inquiries?.length || 0),
        0
      );

      const averageViewsPerProperty = totalProperties > 0 ? totalViews / totalProperties : 0;

      // Find top performing property
      let topPerformingProperty;
      if (viewsArray.length > 0) {
        const maxViewsIndex = viewsArray.indexOf(Math.max(...viewsArray));
        topPerformingProperty = {
          ...userProperties[maxViewsIndex].toJSON(),
          views: viewsArray[maxViewsIndex],
        };
      }

      return {
        totalProperties,
        activeProperties,
        totalViews,
        totalInquiries,
        averageViewsPerProperty,
        topPerformingProperty,
      };
    } catch (error) {
      console.error('Error getting user property analytics:', error);
      throw error;
    }
  }

  /**
   * Clear analytics cache
   */
  async clearAnalyticsCache(): Promise<void> {
    // This would clear all analytics-related cache keys
    // Implementation depends on your specific cache key patterns
    console.log('Analytics cache cleared');
  }
}

export default AnalyticsService;