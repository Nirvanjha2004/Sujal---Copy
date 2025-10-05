import { Op } from 'sequelize';
import { User } from '../models/User';
import { Property } from '../models/Property';
import { Inquiry } from '../models/Inquiry';
import { UserFavorite } from '../models/UserFavorite';
import { SavedSearch } from '../models/SavedSearch';
import { UserRole } from '../types';

interface DashboardAnalytics {
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
  monthlyStats: {
    month: string;
    users: number;
    properties: number;
    inquiries: number;
  }[];
}

interface UserModerationData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  propertiesCount: number;
  inquiriesCount: number;
}

interface PropertyModerationData {
  id: number;
  title: string;
  propertyType: string;
  listingType: string;
  price: number;
  city: string;
  isActive: boolean;
  isFeatured: boolean;
  viewsCount: number;
  createdAt: Date;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface BannerAnnouncement {
  id: number;
  type: 'banner' | 'announcement';
  title: string;
  content: string;
  targetAudience: 'all' | 'buyers' | 'sellers' | 'agents';
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

class AdminService {
  /**
   * Get dashboard analytics
   */
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get total counts
    const [
      totalUsers,
      totalProperties,
      totalInquiries,
      activeListings,
      featuredListings,
    ] = await Promise.all([
      User.count(),
      Property.count(),
      Inquiry.count(),
      Property.count({ where: { is_active: true } }),
      Property.count({ where: { is_featured: true, is_active: true } }),
    ]);

    // Get users by role
    const userRoles = await User.findAll({
      attributes: ['role'],
      group: ['role'],
      raw: true,
    }) as any[];

    const usersByRole: Record<string, number> = {};
    for (const roleData of userRoles) {
      const count = await User.count({ where: { role: roleData.role } });
      usersByRole[roleData.role] = count;
    }

    // Get properties by type
    const propertyTypes = await Property.findAll({
      attributes: ['propertyType'],
      group: ['propertyType'],
      raw: true,
    }) as any[];

    const propertiesByType: Record<string, number> = {};
    for (const typeData of propertyTypes) {
      const count = await Property.count({ where: { propertyType: typeData.propertyType } });
      propertiesByType[typeData.propertyType] = count;
    }

    // Get recent activity (last 7 days)
    const [newUsers, newProperties, newInquiries] = await Promise.all([
      User.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } }),
      Property.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } }),
      Inquiry.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } }),
    ]);

    // Get monthly stats for the last 6 months
    const monthlyStats = await this.getMonthlyStats(6);

    return {
      totalUsers,
      totalProperties,
      totalInquiries,
      activeListings,
      featuredListings,
      usersByRole,
      propertiesByType,
      recentActivity: {
        newUsers,
        newProperties,
        newInquiries,
      },
      monthlyStats,
    };
  }

  /**
   * Get users for moderation
   */
  async getUsersForModeration(
    page: number = 1,
    limit: number = 20,
    filters?: {
      role?: UserRole;
      isVerified?: boolean;
      isActive?: boolean;
      search?: string;
    }
  ): Promise<{ users: UserModerationData[]; total: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    const whereClause: any = {};

    if (filters) {
      if (filters.role) {
        whereClause.role = filters.role;
      }
      if (filters.isVerified !== undefined) {
        whereClause.isVerified = filters.isVerified;
      }
      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }
      if (filters.search) {
        whereClause[Op.or] = [
          { firstName: { [Op.like]: `%${filters.search}%` } },
          { lastName: { [Op.like]: `%${filters.search}%` } },
          { email: { [Op.like]: `%${filters.search}%` } },
        ];
      }
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'isVerified', 'isActive', 'createdAt'],
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    // Get additional data for each user
    const usersWithStats = await Promise.all(
      rows.map(async (user: any) => {
        const [propertiesCount, inquiriesCount] = await Promise.all([
          Property.count({ where: { userId: user.id } }),
          Inquiry.count({ where: { inquirerId: user.id } }),
        ]);

        return {
          ...user.toJSON(),
          propertiesCount,
          inquiriesCount,
        } as UserModerationData;
      })
    );

    return {
      users: usersWithStats,
      total: count,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get properties for moderation
   */
  async getPropertiesForModeration(
    page: number = 1,
    limit: number = 20,
    filters?: {
      propertyType?: string;
      isActive?: boolean;
      isFeatured?: boolean;
      search?: string;
    }
  ): Promise<{ properties: PropertyModerationData[]; total: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    const whereClause: any = {};

    if (filters) {
      if (filters.propertyType) {
        whereClause.propertyType = filters.propertyType;
      }
      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }
      if (filters.isFeatured !== undefined) {
        whereClause.isFeatured = filters.isFeatured;
      }
      if (filters.search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${filters.search}%` } },
          { city: { [Op.like]: `%${filters.search}%` } },
          { address: { [Op.like]: `%${filters.search}%` } },
        ];
      }
    }

    const { count, rows } = await Property.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    const properties = rows.map((property: any) => ({
      id: property.id,
      title: property.title,
      propertyType: property.propertyType,
      listingType: property.listingType,
      price: property.price,
      city: property.city,
      isActive: property.isActive,
      isFeatured: property.isFeatured,
      viewsCount: property.viewsCount,
      createdAt: property.createdAt,
      user: property.user,
    })) as PropertyModerationData[];

    return {
      properties,
      total: count,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Update user status
   */
  async updateUserStatus(
    userId: number,
    updates: {
      isActive?: boolean;
      isVerified?: boolean;
      role?: UserRole;
    }
  ): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await user.update(updates);
    return user;
  }

  /**
   * Update property status
   */
  async updatePropertyStatus(
    propertyId: number,
    updates: {
      isActive?: boolean;
      isFeatured?: boolean;
    }
  ): Promise<Property> {
    const property = await Property.findByPk(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    await property.update(updates);
    return property;
  }

  /**
   * Delete user (soft delete by deactivating)
   */
  async deleteUser(userId: number): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Deactivate user instead of hard delete
    await user.update({ isActive: false });
  }

  /**
   * Delete property
   */
  async deleteProperty(propertyId: number): Promise<void> {
    const property = await Property.findByPk(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    await property.destroy();
  }

  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<{
    database: {
      totalUsers: number;
      totalProperties: number;
      totalInquiries: number;
      totalFavorites: number;
      totalSavedSearches: number;
    };
    activity: {
      dailyActiveUsers: number;
      weeklyActiveUsers: number;
      monthlyActiveUsers: number;
    };
  }> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalProperties,
      totalInquiries,
      totalFavorites,
      totalSavedSearches,
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,
    ] = await Promise.all([
      User.count(),
      Property.count(),
      Inquiry.count(),
      UserFavorite.count(),
      SavedSearch.count(),
      User.count({ where: { updatedAt: { [Op.gte]: oneDayAgo } } }),
      User.count({ where: { updatedAt: { [Op.gte]: oneWeekAgo } } }),
      User.count({ where: { updatedAt: { [Op.gte]: oneMonthAgo } } }),
    ]);

    return {
      database: {
        totalUsers,
        totalProperties,
        totalInquiries,
        totalFavorites,
        totalSavedSearches,
      },
      activity: {
        dailyActiveUsers,
        weeklyActiveUsers,
        monthlyActiveUsers,
      },
    };
  }

  /**
   * Get monthly statistics for the last N months
   */
  private async getMonthlyStats(months: number): Promise<{
    month: string;
    users: number;
    properties: number;
    inquiries: number;
  }[]> {
    const stats = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const [users, properties, inquiries] = await Promise.all([
        User.count({
          where: {
            createdAt: {
              [Op.gte]: monthStart,
              [Op.lte]: monthEnd,
            },
          },
        }),
        Property.count({
          where: {
            createdAt: {
              [Op.gte]: monthStart,
              [Op.lte]: monthEnd,
            },
          },
        }),
        Inquiry.count({
          where: {
            createdAt: {
              [Op.gte]: monthStart,
              [Op.lte]: monthEnd,
            },
          },
        }),
      ]);

      stats.push({
        month: monthStart.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        users,
        properties,
        inquiries,
      });
    }

    return stats;
  }

  /**
   * Get traffic analytics (mock implementation - would integrate with analytics service)
   */
  async getTrafficAnalytics(range: string): Promise<any> {
    // Mock data - in production this would integrate with Google Analytics, Mixpanel, etc.
    const mockData = {
      totalPageViews: 125000,
      uniqueVisitors: 45000,
      bounceRate: 35.5,
      avgSessionDuration: 180,
      topPages: [
        { path: '/properties', views: 25000, uniqueViews: 18000 },
        { path: '/', views: 20000, uniqueViews: 15000 },
        { path: '/search', views: 18000, uniqueViews: 13000 },
        { path: '/property/123', views: 8500, uniqueViews: 7200 },
        { path: '/calculators', views: 7200, uniqueViews: 6100 },
      ],
      referralSources: [
        { source: 'Direct', visits: 35000, percentage: 45.2 },
        { source: 'Google', visits: 28000, percentage: 36.1 },
        { source: 'Facebook', visits: 8500, percentage: 11.0 },
        { source: 'Other', visits: 6000, percentage: 7.7 },
      ],
      deviceBreakdown: {
        desktop: 55.3,
        mobile: 38.7,
        tablet: 6.0,
      },
    };

    // Adjust based on range
    const multiplier = range === '7d' ? 0.25 : range === '90d' ? 3 : range === '1y' ? 12 : 1;
    
    return {
      ...mockData,
      totalPageViews: Math.round(mockData.totalPageViews * multiplier),
      uniqueVisitors: Math.round(mockData.uniqueVisitors * multiplier),
      topPages: mockData.topPages.map(page => ({
        ...page,
        views: Math.round(page.views * multiplier),
        uniqueViews: Math.round(page.uniqueViews * multiplier),
      })),
      referralSources: mockData.referralSources.map(source => ({
        ...source,
        visits: Math.round(source.visits * multiplier),
      })),
    };
  }

  /**
   * Get lead analytics
   */
  async getLeadAnalytics(range: string): Promise<any> {
    const daysBack = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Get real inquiry data
    const totalLeads = await Inquiry.count({
      where: {
        createdAt: { [Op.gte]: startDate },
      },
    });

    const leadsByStatus = await Inquiry.findAll({
      attributes: [
        'status',
        [Inquiry.sequelize!.fn('COUNT', Inquiry.sequelize!.col('id')), 'count'],
      ],
      where: {
        createdAt: { [Op.gte]: startDate },
      },
      group: ['status'],
      raw: true,
    }) as any[];

    // Calculate lead conversion rate
    const convertedLeads = leadsByStatus.find(s => s.status === 'closed')?.count || 0;
    const leadConversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Mock additional data
    const leadsBySource = [
      { source: 'Property Page', count: Math.round(totalLeads * 0.6), percentage: 60 },
      { source: 'Search Results', count: Math.round(totalLeads * 0.25), percentage: 25 },
      { source: 'Direct Contact', count: Math.round(totalLeads * 0.15), percentage: 15 },
    ];

    const statusData = leadsByStatus.map(status => ({
      status: status.status,
      count: status.count,
      percentage: (status.count / totalLeads) * 100,
    }));

    // Get top performing properties
    const topProperties = await Inquiry.findAll({
      attributes: [
        'property_id',
        [Inquiry.sequelize!.fn('COUNT', Inquiry.sequelize!.col('id')), 'leads'],
      ],
      include: [{
        model: Property,
        as: 'property',
        attributes: ['title'],
      }],
      where: {
        createdAt: { [Op.gte]: startDate },
      },
      group: ['property_id', 'property.id'],
      order: [[Inquiry.sequelize!.fn('COUNT', Inquiry.sequelize!.col('id')), 'DESC']],
      limit: 5,
      raw: true,
    }) as any[];

    return {
      totalLeads,
      leadConversionRate,
      leadsBySource,
      leadsByStatus: statusData,
      topPerformingProperties: topProperties.map(prop => ({
        id: prop.property_id,
        title: prop['property.title'],
        leads: prop.leads,
        conversions: Math.round(prop.leads * 0.15), // Mock conversion data
      })),
    };
  }

  /**
   * Get listing analytics
   */
  async getListingAnalytics(range: string): Promise<any> {
    const daysBack = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    const monthStart = new Date();
    monthStart.setDate(1); // First day of current month

    const [
      totalActiveListings,
      newListingsThisMonth,
      expiredListings,
      featuredListings,
    ] = await Promise.all([
      Property.count({ where: { is_active: true } }),
      Property.count({
        where: {
          is_active: true,
          createdAt: { [Op.gte]: monthStart },
        },
      }),
      Property.count({ where: { is_active: false } }),
      Property.count({ where: { is_featured: true, is_active: true } }),
    ]);

    const propertiesByType = await Property.findAll({
      attributes: [
        'property_type',
        [Property.sequelize!.fn('COUNT', Property.sequelize!.col('id')), 'count'],
      ],
      where: { is_active: true },
      group: ['property_type'],
      raw: true,
    }) as any[];

    const propertiesByCity = await Property.findAll({
      attributes: [
        'city',
        [Property.sequelize!.fn('COUNT', Property.sequelize!.col('id')), 'count'],
        [Property.sequelize!.fn('AVG', Property.sequelize!.col('price')), 'averagePrice'],
      ],
      where: { is_active: true },
      group: ['city'],
      order: [[Property.sequelize!.fn('COUNT', Property.sequelize!.col('id')), 'DESC']],
      limit: 10,
      raw: true,
    }) as any[];

    const totalListings = propertiesByType.reduce((sum, type) => sum + parseInt(type.count), 0);

    return {
      totalActiveListings,
      newListingsThisMonth,
      expiredListings,
      featuredListings,
      averageListingViews: 150, // Mock data
      listingsByType: propertiesByType.map(type => ({
        type: type.property_type,
        count: parseInt(type.count),
        percentage: (parseInt(type.count) / totalListings) * 100,
      })),
      listingsByCity: propertiesByCity.map(city => ({
        city: city.city,
        count: parseInt(city.count),
        averagePrice: parseFloat(city.averagePrice),
      })),
    };
  }
}

export default AdminService;