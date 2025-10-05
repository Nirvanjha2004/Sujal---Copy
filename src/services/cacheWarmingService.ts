import CacheService from './cacheService';
import { Property } from '../models/Property';
import { PropertyImage } from '../models/PropertyImage';
import { User } from '../models/User';
import { Op } from 'sequelize';

class CacheWarmingService {
  private cacheService: CacheService;
  private warmingInterval: NodeJS.Timeout | null = null;
  private isWarming = false;

  constructor() {
    this.cacheService = new CacheService();
  }

  /**
   * Start automatic cache warming with specified interval
   */
  startAutoWarming(intervalMinutes: number = 30): void {
    if (this.warmingInterval) {
      this.stopAutoWarming();
    }

    console.log(`🔥 Cache warming: Starting auto-warming every ${intervalMinutes} minutes`);
    
    // Initial warming
    this.warmCache().catch(error => {
      console.error('Initial cache warming failed:', error);
    });

    // Set up recurring warming
    this.warmingInterval = setInterval(() => {
      this.warmCache().catch(error => {
        console.error('Scheduled cache warming failed:', error);
      });
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Stop automatic cache warming
   */
  stopAutoWarming(): void {
    if (this.warmingInterval) {
      clearInterval(this.warmingInterval);
      this.warmingInterval = null;
      console.log('🔥 Cache warming: Auto-warming stopped');
    }
  }

  /**
   * Manually trigger cache warming
   */
  async warmCache(): Promise<void> {
    if (this.isWarming) {
      console.log('🔥 Cache warming: Already in progress, skipping...');
      return;
    }

    this.isWarming = true;
    console.log('🔥 Cache warming: Starting cache warming process...');

    try {
      await Promise.all([
        this.warmPopularProperties(),
        this.warmFeaturedProperties(),
        this.warmRecentProperties(),
        this.warmPopularSearches(),
        this.warmAnalyticsData(),
      ]);

      console.log('✅ Cache warming: Process completed successfully');
    } catch (error) {
      console.error('❌ Cache warming: Process failed:', error);
    } finally {
      this.isWarming = false;
    }
  }

  /**
   * Warm popular properties based on view count
   */
  private async warmPopularProperties(): Promise<void> {
    try {
      console.log('🔥 Cache warming: Loading popular properties...');

      const popularProperties = await Property.findAll({
        include: [
          {
            model: PropertyImage,
            as: 'images',
            limit: 5,
          },
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'first_name', 'last_name', 'email', 'role'],
          },
        ],
        where: {
          is_active: true,
        },
        order: [['views_count', 'DESC']],
        limit: 50, // Top 50 most viewed properties
      });

      // Cache individual property details
      const cachePromises = popularProperties.map(property => 
        this.cacheService.cachePropertyDetails(property.id, property.toJSON())
      );

      await Promise.all(cachePromises);

      // Cache the popular properties list
      await this.cacheService.cachePopularProperties(
        popularProperties.map(p => p.toJSON())
      );

      console.log(`✅ Cache warming: Cached ${popularProperties.length} popular properties`);
    } catch (error) {
      console.error('❌ Cache warming: Failed to warm popular properties:', error);
    }
  }

  /**
   * Warm featured properties
   */
  private async warmFeaturedProperties(): Promise<void> {
    try {
      console.log('🔥 Cache warming: Loading featured properties...');

      const featuredProperties = await Property.findAll({
        include: [
          {
            model: PropertyImage,
            as: 'images',
            limit: 5,
          },
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'first_name', 'last_name', 'email', 'role'],
          },
        ],
        where: {
          is_active: true,
          is_featured: true,
        },
        order: [['created_at', 'DESC']],
        limit: 20,
      });

      // Cache individual featured properties
      const cachePromises = featuredProperties.map(property => 
        this.cacheService.cachePropertyDetails(property.id, property.toJSON())
      );

      await Promise.all(cachePromises);

      console.log(`✅ Cache warming: Cached ${featuredProperties.length} featured properties`);
    } catch (error) {
      console.error('❌ Cache warming: Failed to warm featured properties:', error);
    }
  }

  /**
   * Warm recent properties
   */
  private async warmRecentProperties(): Promise<void> {
    try {
      console.log('🔥 Cache warming: Loading recent properties...');

      const recentProperties = await Property.findAll({
        include: [
          {
            model: PropertyImage,
            as: 'images',
            limit: 3,
          },
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'first_name', 'last_name', 'email', 'role'],
          },
        ],
        where: {
          is_active: true,
          created_at: {
            [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
        order: [['created_at', 'DESC']],
        limit: 30,
      });

      // Cache individual recent properties
      const cachePromises = recentProperties.map(property => 
        this.cacheService.cachePropertyDetails(property.id, property.toJSON())
      );

      await Promise.all(cachePromises);

      console.log(`✅ Cache warming: Cached ${recentProperties.length} recent properties`);
    } catch (error) {
      console.error('❌ Cache warming: Failed to warm recent properties:', error);
    }
  }

  /**
   * Warm popular search combinations
   */
  private async warmPopularSearches(): Promise<void> {
    try {
      console.log('🔥 Cache warming: Loading popular search combinations...');

      // Define common search combinations
      const popularSearches = [
        // Property type searches
        { propertyType: 'apartment', limit: 20 },
        { propertyType: 'house', limit: 20 },
        { propertyType: 'commercial', limit: 20 },
        
        // Listing type searches
        { listingType: 'sale', limit: 20 },
        { listingType: 'rent', limit: 20 },
        
        // Price range searches
        { minPrice: 0, maxPrice: 1000000, limit: 20 },
        { minPrice: 1000000, maxPrice: 5000000, limit: 20 },
        { minPrice: 5000000, maxPrice: 10000000, limit: 20 },
        
        // Bedroom searches
        { bedrooms: 1, limit: 20 },
        { bedrooms: 2, limit: 20 },
        { bedrooms: 3, limit: 20 },
        { bedrooms: 4, limit: 20 },
      ];

      for (const searchCriteria of popularSearches) {
        try {
          const whereClause: any = { is_active: true };
          
          if (searchCriteria.propertyType) {
            whereClause.property_type = searchCriteria.propertyType;
          }
          if (searchCriteria.listingType) {
            whereClause.listing_type = searchCriteria.listingType;
          }
          if (searchCriteria.minPrice !== undefined && searchCriteria.maxPrice !== undefined) {
            whereClause.price = {
              [Op.between]: [searchCriteria.minPrice, searchCriteria.maxPrice],
            };
          }
          if (searchCriteria.bedrooms) {
            whereClause.bedrooms = searchCriteria.bedrooms;
          }

          const results = await Property.findAll({
            include: [
              {
                model: PropertyImage,
                as: 'images',
                limit: 1,
              },
            ],
            where: whereClause,
            order: [['created_at', 'DESC']],
            limit: searchCriteria.limit,
          });

          const totalCount = await Property.count({ where: whereClause });

          // Cache the search results
          await this.cacheService.cacheSearchResults(
            searchCriteria,
            results.map(r => r.toJSON()),
            totalCount
          );

        } catch (searchError) {
          console.error('Error warming search:', searchCriteria, searchError);
        }
      }

      console.log(`✅ Cache warming: Cached ${popularSearches.length} popular search combinations`);
    } catch (error) {
      console.error('❌ Cache warming: Failed to warm popular searches:', error);
    }
  }

  /**
   * Warm analytics data
   */
  private async warmAnalyticsData(): Promise<void> {
    try {
      console.log('🔥 Cache warming: Loading analytics data...');

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Get analytics data for today and yesterday
      const dates = [today, yesterday];

      for (const date of dates) {
        try {
          const startOfDay = new Date(`${date}T00:00:00.000Z`);
          const endOfDay = new Date(`${date}T23:59:59.999Z`);

          const [
            totalProperties,
            totalUsers,
            newListingsToday,
            activeUsers,
          ] = await Promise.all([
            Property.count({ where: { is_active: true } }),
            User.count({ where: { is_active: true } }),
            Property.count({
              where: {
                created_at: {
                  [Op.between]: [startOfDay, endOfDay],
                },
              },
            }),
            User.count({
              where: {
                updated_at: {
                  [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
              },
            }),
          ]);

          // Get popular cities
          const popularCities = await Property.findAll({
            attributes: [
              'city',
              [Property.sequelize!.fn('COUNT', Property.sequelize!.col('id')), 'count'],
            ],
            where: { is_active: true },
            group: ['city'],
            order: [[Property.sequelize!.fn('COUNT', Property.sequelize!.col('id')), 'DESC']],
            limit: 10,
            raw: true,
          }) as any[];

          // Get property type distribution
          const propertyTypeDistribution = await Property.findAll({
            attributes: [
              'property_type',
              [Property.sequelize!.fn('COUNT', Property.sequelize!.col('id')), 'count'],
            ],
            where: { is_active: true },
            group: ['property_type'],
            raw: true,
          }) as any[];

          const analyticsData = {
            totalProperties,
            totalUsers,
            totalInquiries: 0, // Would need to implement inquiry counting
            propertyViews: 0, // Would need to aggregate from cache
            newListingsToday,
            activeUsers,
            popularCities: popularCities.map(city => ({
              city: city.city,
              count: parseInt(city.count, 10),
            })),
            propertyTypeDistribution: propertyTypeDistribution.map(type => ({
              type: type.property_type,
              count: parseInt(type.count, 10),
            })),
          };

          await this.cacheService.cacheAnalyticsData(date, analyticsData);

        } catch (dateError) {
          console.error(`Error warming analytics for ${date}:`, dateError);
        }
      }

      console.log(`✅ Cache warming: Cached analytics data for ${dates.length} dates`);
    } catch (error) {
      console.error('❌ Cache warming: Failed to warm analytics data:', error);
    }
  }

  /**
   * Get cache warming status
   */
  getStatus(): {
    isWarming: boolean;
    autoWarmingEnabled: boolean;
    lastWarmingTime?: Date;
  } {
    return {
      isWarming: this.isWarming,
      autoWarmingEnabled: this.warmingInterval !== null,
    };
  }

  /**
   * Warm cache for specific property (useful after property updates)
   */
  async warmProperty(propertyId: number): Promise<void> {
    try {
      const property = await Property.findByPk(propertyId, {
        include: [
          {
            model: PropertyImage,
            as: 'images',
          },
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'first_name', 'last_name', 'email', 'role'],
          },
        ],
      });

      if (property) {
        await this.cacheService.cachePropertyDetails(propertyId, property.toJSON());
        console.log(`✅ Cache warming: Warmed property ${propertyId}`);
      }
    } catch (error) {
      console.error(`❌ Cache warming: Failed to warm property ${propertyId}:`, error);
    }
  }
}

export default CacheWarmingService;