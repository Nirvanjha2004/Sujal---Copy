import { UserFavorite } from '../models/UserFavorite';
import { Property } from '../models/Property';
import { User } from '../models/User';
import { PropertyImage } from '../models/PropertyImage';
import RedisConnection from '../config/redis';
import CacheService from './cacheService';
import config from '../config';

export class FavoritesService {
  private redis: RedisConnection;
  private cacheService: CacheService;

  constructor() {
    this.redis = RedisConnection.getInstance();
    this.cacheService = new CacheService();
  }

  /**
   * Add a property to user's favorites
   */
  async addToFavorites(userId: number, propertyId: number): Promise<UserFavorite> {
    try {
      // Check if property exists and is active
      const property = await Property.findOne({
        where: { id: propertyId, is_active: true },
      });

      if (!property) {
        throw new Error('Property not found or inactive');
      }

      // Add to favorites using model method
      const favorite = await UserFavorite.addToFavorites(userId, propertyId);

      // Clear user favorites cache
      await this.cacheService.invalidateUserFavorites(userId);

      return favorite;
    } catch (error) {
      if (error instanceof Error && error.message === 'Property is already in favorites') {
        throw new Error('Property is already in your favorites');
      }
      throw error;
    }
  }

  /**
   * Remove a property from user's favorites
   */
  async removeFromFavorites(userId: number, propertyId: number): Promise<boolean> {
    const removed = await UserFavorite.removeFromFavorites(userId, propertyId);
    
    if (!removed) {
      throw new Error('Property not found in favorites');
    }

    // Clear user favorites cache
    await this.cacheService.invalidateUserFavorites(userId);

    return true;
  }

  /**
   * Check if a property is in user's favorites
   */
  async isFavorite(userId: number, propertyId: number): Promise<boolean> {
    return UserFavorite.isFavorite(userId, propertyId);
  }

  /**
   * Get user's favorite properties with pagination
   */
  async getUserFavorites(userId: number, options?: {
    page?: number;
    limit?: number;
    includeInactive?: boolean;
  }): Promise<{
    favorites: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    // Try to get from cache first (simplified - just get favorite IDs)
    const cachedFavoriteIds = await this.cacheService.getUserFavorites(userId);
    if (cachedFavoriteIds && cachedFavoriteIds.length === 0) {
      return {
        favorites: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }

    // Get favorites with property details
    const favorites = await UserFavorite.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Property,
          as: 'property',
          where: options?.includeInactive ? {} : { is_active: true },
          include: [
            {
              model: PropertyImage,
              as: 'images',
              limit: 1,
              order: [['display_order', 'ASC']],
            },
            {
              model: User,
              as: 'owner',
              attributes: ['id', 'first_name', 'last_name', 'role'],
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    // Get total count
    const total = await UserFavorite.count({
      where: { user_id: userId },
      include: [
        {
          model: Property,
          as: 'property',
          where: options?.includeInactive ? {} : { is_active: true },
        },
      ],
    });

    const result = {
      favorites: favorites.map(fav => ({
        id: fav.id,
        added_at: fav.created_at,
        property: {
          id: fav.property.id,
          title: fav.property.title,
          property_type: fav.property.property_type,
          listing_type: fav.property.listing_type,
          price: fav.property.price,
          area_sqft: fav.property.area_sqft,
          bedrooms: fav.property.bedrooms,
          bathrooms: fav.property.bathrooms,
          city: fav.property.city,
          state: fav.property.state,
          is_featured: fav.property.is_featured,
          views_count: fav.property.views_count,
          created_at: fav.property.created_at,
          main_image: fav.property.images?.[0]?.image_url 
            ? `${process.env.BASE_URL || `http://localhost:${config.server.port}`}/uploads/properties/${fav.property.images[0].image_url}` 
            : null,
          owner: fav.property.owner,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache the favorite IDs
    const favoriteIds = favorites.map(fav => fav.property_id);
    await this.cacheService.cacheUserFavorites(userId, favoriteIds);

    return result;
  }

  /**
   * Get user's favorites count
   */
  async getFavoritesCount(userId: number): Promise<number> {
    const cacheKey = `user:favorites:count:${userId}`;
    const cached = await this.getCachedData(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const count = await UserFavorite.count({
      where: { user_id: userId },
      include: [
        {
          model: Property,
          as: 'property',
          where: { is_active: true },
        },
      ],
    });

    // Cache for 30 minutes
    await this.setCachedData(cacheKey, count, 1800);

    return count;
  }

  /**
   * Get property's favorites count
   */
  async getPropertyFavoritesCount(propertyId: number): Promise<number> {
    const cacheKey = `property:favorites:count:${propertyId}`;
    const cached = await this.getCachedData(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const count = await UserFavorite.getPropertyFavoriteCount(propertyId);

    // Cache for 30 minutes
    await this.setCachedData(cacheKey, count, 1800);

    return count;
  }

  /**
   * Clear all user favorites
   */
  async clearUserFavorites(userId: number): Promise<number> {
    const deletedCount = await UserFavorite.clearUserFavorites(userId);
    
    // Clear cache
    await this.clearUserFavoritesCache(userId);

    return deletedCount;
  }

  /**
   * Get user's favorite property IDs (for quick lookup)
   */
  async getUserFavoriteIds(userId: number): Promise<number[]> {
    const cacheKey = `user:favorite:ids:${userId}`;
    const cached = await this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    const favorites = await UserFavorite.findAll({
      where: { user_id: userId },
      attributes: ['property_id'],
      include: [
        {
          model: Property,
          as: 'property',
          where: { is_active: true },
          attributes: [],
        },
      ],
    });

    const ids = favorites.map(fav => fav.property_id);

    // Cache for 1 hour
    await this.setCachedData(cacheKey, ids, 3600);

    return ids;
  }

  /**
   * Clear user favorites cache
   */
  private async clearUserFavoritesCache(userId: number): Promise<void> {
    try {
      const client = this.redis.getClient();
      if (client) {
        // Clear all cache keys related to user favorites
        const keys = await client.keys(`user:favorites:${userId}:*`);
        keys.push(`user:favorites:count:${userId}`);
        keys.push(`user:favorite:ids:${userId}`);
        
        if (keys.length > 0) {
          await client.del(keys);
        }
      }
    } catch (error) {
      console.warn('Failed to clear favorites cache:', error);
    }
  }

  /**
   * Get cached data
   */
  private async getCachedData(key: string): Promise<any> {
    try {
      const client = this.redis.getClient();
      if (client) {
        const cached = await client.get(key);
        return cached ? JSON.parse(cached) : null;
      }
    } catch (error) {
      console.warn('Failed to get cached data:', error);
    }
    return null;
  }

  /**
   * Set cached data
   */
  private async setCachedData(key: string, data: any, ttl: number): Promise<void> {
    try {
      const client = this.redis.getClient();
      if (client) {
        await client.setEx(key, ttl, JSON.stringify(data));
      }
    } catch (error) {
      console.warn('Failed to set cached data:', error);
    }
  }
}

export default new FavoritesService();