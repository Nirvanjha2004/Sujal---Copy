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
  first_name: string;  // Updated to match DB
  last_name: string;   // Updated to match DB
  role: UserRole;
  phone: string;
  profile_image: string;
  is_verified: boolean;  // Updated to match DB
  is_active: boolean;    // Updated to match DB
  created_at: Date;      // Updated to match DB
  updated_at: Date;      // Updated to match DB
  propertiesCount: number;
  inquiriesCount: number;
}

interface PropertyModerationData {
  id: number;
  title: string;
  property_type: string;  // Updated to match DB
  listing_type: string;   // Updated to match DB
  price: number;
  city: string;
  is_active: boolean;     // Updated to match DB
  is_featured: boolean;   // Updated to match DB
  views_count: number;    // Updated to match DB
  created_at: Date;       // Updated to match DB
  user: {
    id: number;
    first_name: string;   // Updated to match DB
    last_name: string;    // Updated to match DB
    email: string;
  };
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

    console.log('Total users:', totalUsers);
    console.log('Total properties:', totalProperties);
    console.log('Total inquiries:', totalInquiries);
    console.log('Active listings:', activeListings);
    console.log('Featured listings:', featuredListings);

    // Get users by role
    const userRoles = await User.findAll({
      attributes: ['role'],
      group: ['role'],
      raw: true,
    }) as any[];

    console.log('User roles found:', userRoles);

    const usersByRole: Record<string, number> = {};
    for (const roleData of userRoles) {
      const count = await User.count({ where: { role: roleData.role } });
      usersByRole[roleData.role] = count;
    }

    console.log('Users by role:', usersByRole);

    // Get properties by type
    const propertyTypes = await Property.findAll({
      attributes: ['property_type'],
      group: ['property_type'],
      raw: true,
    }) as any[];

    console.log('Property types found:', propertyTypes);

    const propertiesByType: Record<string, number> = {};
    for (const typeData of propertyTypes) {
      const count = await Property.count({ where: { property_type: typeData.property_type } });
      propertiesByType[typeData.property_type] = count;
    }

    console.log('Properties by type:', propertiesByType);

    // Get recent activity (last 7 days)
    const [newUsers, newProperties, newInquiries] = await Promise.all([
      User.count({ where: { created_at: { [Op.gte]: sevenDaysAgo } } }),
      Property.count({ where: { created_at: { [Op.gte]: sevenDaysAgo } } }),
      Inquiry.count({ where: { created_at: { [Op.gte]: sevenDaysAgo } } }),
    ]);

    console.log("Recent activity - New users:", newUsers);
    console.log("Recent activity - New properties:", newProperties);
    console.log("Recent activity - New inquiries:", newInquiries);

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
   * Get users for moderation - FIXED with correct column names
   */
  async getUsersForModeration(
    page: number = 1,
    limit: number = 20,
    filters?: {
      role?: UserRole;
      is_verified?: boolean;    // Fixed: snake_case
      is_active?: boolean;      // Fixed: snake_case
      search?: string;
    }
  ): Promise<{ users: UserModerationData[]; total: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    const whereClause: any = {};

    console.log('getUsersForModeration called with page:', page, 'limit:', limit, 'filters:', filters);
    if (filters) {
      if (filters.role) {
        whereClause.role = filters.role;
      }
      if (filters.is_verified !== undefined) {    // Fixed: snake_case
        whereClause.is_verified = filters.is_verified;
      }
      if (filters.is_active !== undefined) {      // Fixed: snake_case
        whereClause.is_active = filters.is_active;
      }
      if (filters.search) {
        whereClause[Op.or] = [
          { first_name: { [Op.like]: `%${filters.search}%` } },   // Fixed: snake_case
          { last_name: { [Op.like]: `%${filters.search}%` } },    // Fixed: snake_case
          { email: { [Op.like]: `%${filters.search}%` } },
        ];
      }
    }

    console.log('reached inside getUsersForModeration with filters:', filters);
    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: [
        'id', 
        'email', 
        'first_name',     // Fixed: snake_case
        'last_name',      // Fixed: snake_case
        'role', 
        'phone',
        'profile_image',  // Fixed: snake_case
        'is_verified',    // Fixed: snake_case
        'is_active',      // Fixed: snake_case
        'created_at',     // Fixed: snake_case
        'updated_at'      // Fixed: snake_case
      ],
      offset,
      limit,
      order: [['created_at', 'DESC']],
    });

    console.log('Fetched users count:', count);
    console.log('Fetched users rows:', rows);
    // Get additional data for each user
    const usersWithStats = await Promise.all(
      rows.map(async (user: any) => {
        const [propertiesCount, inquiriesCount] = await Promise.all([
          Property.count({ where: { user_id: user.id } }),        // Fixed: snake_case
          Inquiry.count({ where: { inquirer_id: user.id } }),     // Fixed: snake_case (assuming this column exists)
        ]);

        return {
          ...user.toJSON(),
          propertiesCount,
          inquiriesCount,
        } as UserModerationData;
      })
    );

    console.log('Users with stats:', usersWithStats);

    return {
      users: usersWithStats,
      total: count,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get properties for moderation - FIXED with correct association alias
   */
  async getPropertiesForModeration(
    page: number = 1,
    limit: number = 20,
    filters?: {
      property_type?: string;   // Fixed: snake_case
      is_active?: boolean;      // Fixed: snake_case
      is_featured?: boolean;    // Fixed: snake_case
      search?: string;
    }
  ): Promise<{ properties: PropertyModerationData[]; total: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    const whereClause: any = {};

    console.log('getPropertiesForModeration called with filters:', filters);

    if (filters) {
      if (filters.property_type) {              // Fixed: snake_case
        whereClause.property_type = filters.property_type;
      }
      if (filters.is_active !== undefined) {    // Fixed: snake_case
        whereClause.is_active = filters.is_active;
      }
      if (filters.is_featured !== undefined) {  // Fixed: snake_case
        whereClause.is_featured = filters.is_featured;
      }
      if (filters.search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${filters.search}%` } },
          { city: { [Op.like]: `%${filters.search}%` } },
          { address: { [Op.like]: `%${filters.search}%` } },
        ];
      }
    }

    console.log('WHERE clause for properties:', whereClause);

    try {
      const { count, rows } = await Property.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'owner',  // FIXED: Changed from 'user' to 'owner' to match association
            attributes: ['id', 'first_name', 'last_name', 'email'],  // Fixed: snake_case
          },
        ],
        attributes: [
          'id',
          'title',
          'property_type',    // Fixed: snake_case
          'listing_type',     // Fixed: snake_case
          'price',
          'city',
          'is_active',        // Fixed: snake_case
          'is_featured',      // Fixed: snake_case
          'views_count',      // Fixed: snake_case
          'created_at',       // Fixed: snake_case
          'user_id'           // Fixed: snake_case
        ],
        offset,
        limit,
        order: [['created_at', 'DESC']],
      });

      console.log('Fetched properties count:', count);
      console.log('Fetched properties rows:', rows.length);

      const properties = rows.map((property: any) => ({
        id: property.id,
        title: property.title,
        property_type: property.property_type,      // Fixed: snake_case
        listing_type: property.listing_type,        // Fixed: snake_case
        price: property.price,
        city: property.city,
        is_active: property.is_active,              // Fixed: snake_case
        is_featured: property.is_featured,          // Fixed: snake_case
        views_count: property.views_count || 0,     // Fixed: snake_case
        created_at: property.created_at,            // Fixed: snake_case
        user: property.owner,  // FIXED: Map 'owner' association to 'user' for frontend compatibility
      })) as PropertyModerationData[];

      console.log('Processed properties:', properties.length);

      return {
        properties,
        total: count,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      console.error('Error in getPropertiesForModeration:', error);
      throw error;
    }
  }

  /**
   * Update user status - FIXED with correct column names
   */
  async updateUserStatus(
    userId: number,
    updates: {
      is_active?: boolean;     // Fixed: snake_case
      is_verified?: boolean;   // Fixed: snake_case
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
   * Update property status - FIXED with correct column names
   */
  async updatePropertyStatus(
    propertyId: number,
    updates: {
      is_active?: boolean;     // Fixed: snake_case
      is_featured?: boolean;   // Fixed: snake_case
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
   * Delete user (soft delete by deactivating) - FIXED with correct column names
   */
  async deleteUser(userId: number): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Deactivate user instead of hard delete
    await user.update({ is_active: false });  // Fixed: snake_case
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
   * Get system statistics - FIXED with correct column names
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
      User.count({ where: { updated_at: { [Op.gte]: oneDayAgo } } }),    // Fixed: snake_case
      User.count({ where: { updated_at: { [Op.gte]: oneWeekAgo } } }),   // Fixed: snake_case
      User.count({ where: { updated_at: { [Op.gte]: oneMonthAgo } } }),  // Fixed: snake_case
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
   * Get monthly statistics for the last N months - FIXED with correct column names
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
            created_at: {   // Fixed: snake_case
              [Op.gte]: monthStart,
              [Op.lte]: monthEnd,
            },
          },
        }),
        Property.count({
          where: {
            created_at: {   // Fixed: snake_case
              [Op.gte]: monthStart,
              [Op.lte]: monthEnd,
            },
          },
        }),
        Inquiry.count({
          where: {
            created_at: {   // Fixed: snake_case
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
   * Get traffic analytics (mock implementation)
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
   * Get lead analytics - FIXED with correct column names
   */
  async getLeadAnalytics(range: string): Promise<any> {
    const daysBack = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Get real inquiry data
    const totalLeads = await Inquiry.count({
      where: {
        created_at: { [Op.gte]: startDate },  // Fixed: snake_case
      },
    });

    const leadsByStatus = await Inquiry.findAll({
      attributes: [
        'status',
        [Inquiry.sequelize!.fn('COUNT', Inquiry.sequelize!.col('id')), 'count'],
      ],
      where: {
        created_at: { [Op.gte]: startDate },  // Fixed: snake_case
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

    // Get top performing properties - FIXED with correct column names
    const topProperties = await Inquiry.findAll({
      attributes: [
        'property_id',  // Fixed: snake_case
        [Inquiry.sequelize!.fn('COUNT', Inquiry.sequelize!.col('id')), 'leads'],
      ],
      include: [{
        model: Property,
        as: 'property',
        attributes: ['title'],
      }],
      where: {
        created_at: { [Op.gte]: startDate },  // Fixed: snake_case
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
   * Get listing analytics - FIXED with correct column names
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
          created_at: { [Op.gte]: monthStart },  // Fixed: snake_case
        },
      }),
      Property.count({ where: { is_active: false } }),
      Property.count({ where: { is_featured: true, is_active: true } }),
    ]);

    const propertiesByType = await Property.findAll({
      attributes: [
        'property_type',  // Fixed: snake_case
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
        type: type.property_type,  // Fixed: snake_case
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