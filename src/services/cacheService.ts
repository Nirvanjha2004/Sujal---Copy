import RedisConnection from '../config/redis';
import { Property } from '../models/Property';
import { User } from '../models/User';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

export interface SearchCriteria {
  propertyType?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface AnalyticsData {
  totalProperties: number;
  totalUsers: number;
  totalInquiries: number;
  propertyViews: number;
  newListingsToday: number;
  activeUsers: number;
  popularCities: Array<{ city: string; count: number }>;
  propertyTypeDistribution: Array<{ type: string; count: number }>;
}

class CacheService {
  private redis: RedisConnection;
  
  // Cache key prefixes
  private static readonly PREFIXES = {
    PROPERTY_DETAILS: 'property:details:',
    SEARCH_RESULTS: 'search:results:',
    USER_SESSION: 'user:session:',
    USER_FAVORITES: 'user:favorites:',
    ANALYTICS_DAILY: 'analytics:daily:',
    POPULAR_PROPERTIES: 'popular:properties',
    PROPERTY_VIEWS: 'property:views:',
    SEARCH_SUGGESTIONS: 'search:suggestions:',
    USER_PROFILE: 'user:profile:',
  };

  // Default TTL values (in seconds)
  private static readonly DEFAULT_TTL = {
    PROPERTY_DETAILS: 3600, // 1 hour
    SEARCH_RESULTS: 900, // 15 minutes
    USER_SESSION: 86400, // 24 hours
    USER_FAVORITES: 3600, // 1 hour
    ANALYTICS_DAILY: 604800, // 7 days
    POPULAR_PROPERTIES: 1800, // 30 minutes
    PROPERTY_VIEWS: 86400, // 24 hours
    SEARCH_SUGGESTIONS: 3600, // 1 hour
    USER_PROFILE: 1800, // 30 minutes
  };

  constructor() {
    this.redis = RedisConnection.getInstance();
  }

  /**
   * Property Details Caching
   */
  async cachePropertyDetails(propertyId: number, property: any, options?: CacheOptions): Promise<boolean> {
    const key = `${CacheService.PREFIXES.PROPERTY_DETAILS}${propertyId}`;
    const ttl = options?.ttl || CacheService.DEFAULT_TTL.PROPERTY_DETAILS;
    
    try {
      const serializedProperty = JSON.stringify(property);
      return await this.redis.setEx(key, ttl, serializedProperty);
    } catch (error) {
      console.error('Error caching property details:', error);
      return false;
    }
  }

  async getPropertyDetails(propertyId: number): Promise<any | null> {
    const key = `${CacheService.PREFIXES.PROPERTY_DETAILS}${propertyId}`;
    
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error retrieving cached property details:', error);
      return null;
    }
  }

  async invalidatePropertyDetails(propertyId: number): Promise<boolean> {
    const key = `${CacheService.PREFIXES.PROPERTY_DETAILS}${propertyId}`;
    return await this.redis.del(key);
  }

  /**
   * Search Results Caching
   */
  async cacheSearchResults(
    searchCriteria: SearchCriteria,
    results: any[],
    totalCount: number,
    options?: CacheOptions
  ): Promise<boolean> {
    const searchHash = this.generateSearchHash(searchCriteria);
    const key = `${CacheService.PREFIXES.SEARCH_RESULTS}${searchHash}`;
    const ttl = options?.ttl || CacheService.DEFAULT_TTL.SEARCH_RESULTS;
    
    try {
      const cacheData = {
        results,
        totalCount,
        timestamp: new Date().toISOString(),
        criteria: searchCriteria,
      };
      const serializedData = JSON.stringify(cacheData);
      return await this.redis.setEx(key, ttl, serializedData);
    } catch (error) {
      console.error('Error caching search results:', error);
      return false;
    }
  }

  async getSearchResults(searchCriteria: SearchCriteria): Promise<{
    results: any[];
    totalCount: number;
    timestamp: string;
  } | null> {
    const searchHash = this.generateSearchHash(searchCriteria);
    const key = `${CacheService.PREFIXES.SEARCH_RESULTS}${searchHash}`;
    
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error retrieving cached search results:', error);
      return null;
    }
  }

  /**
   * User Session Caching
   */
  async cacheUserSession(userId: number, sessionData: any, options?: CacheOptions): Promise<boolean> {
    const key = `${CacheService.PREFIXES.USER_SESSION}${userId}`;
    const ttl = options?.ttl || CacheService.DEFAULT_TTL.USER_SESSION;
    
    try {
      const serializedData = JSON.stringify({
        ...sessionData,
        lastActivity: new Date().toISOString(),
      });
      return await this.redis.setEx(key, ttl, serializedData);
    } catch (error) {
      console.error('Error caching user session:', error);
      return false;
    }
  }

  async getUserSession(userId: number): Promise<any | null> {
    const key = `${CacheService.PREFIXES.USER_SESSION}${userId}`;
    
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error retrieving cached user session:', error);
      return null;
    }
  }

  async invalidateUserSession(userId: number): Promise<boolean> {
    const key = `${CacheService.PREFIXES.USER_SESSION}${userId}`;
    return await this.redis.del(key);
  }

  /**
   * User Favorites Caching
   */
  async cacheUserFavorites(userId: number, favorites: number[], options?: CacheOptions): Promise<boolean> {
    const key = `${CacheService.PREFIXES.USER_FAVORITES}${userId}`;
    const ttl = options?.ttl || CacheService.DEFAULT_TTL.USER_FAVORITES;
    
    try {
      const serializedFavorites = JSON.stringify(favorites);
      return await this.redis.setEx(key, ttl, serializedFavorites);
    } catch (error) {
      console.error('Error caching user favorites:', error);
      return false;
    }
  }

  async getUserFavorites(userId: number): Promise<number[] | null> {
    const key = `${CacheService.PREFIXES.USER_FAVORITES}${userId}`;
    
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error retrieving cached user favorites:', error);
      return null;
    }
  }

  async invalidateUserFavorites(userId: number): Promise<boolean> {
    const key = `${CacheService.PREFIXES.USER_FAVORITES}${userId}`;
    return await this.redis.del(key);
  }

  /**
   * Analytics Data Caching
   */
  async cacheAnalyticsData(date: string, data: AnalyticsData, options?: CacheOptions): Promise<boolean> {
    const key = `${CacheService.PREFIXES.ANALYTICS_DAILY}${date}`;
    const ttl = options?.ttl || CacheService.DEFAULT_TTL.ANALYTICS_DAILY;
    
    try {
      const serializedData = JSON.stringify({
        ...data,
        cachedAt: new Date().toISOString(),
      });
      return await this.redis.setEx(key, ttl, serializedData);
    } catch (error) {
      console.error('Error caching analytics data:', error);
      return false;
    }
  }

  async getAnalyticsData(date: string): Promise<AnalyticsData | null> {
    const key = `${CacheService.PREFIXES.ANALYTICS_DAILY}${date}`;
    
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error retrieving cached analytics data:', error);
      return null;
    }
  }

  /**
   * Popular Properties Caching (Cache Warming)
   */
  async cachePopularProperties(properties: any[], options?: CacheOptions): Promise<boolean> {
    const key = CacheService.PREFIXES.POPULAR_PROPERTIES;
    const ttl = options?.ttl || CacheService.DEFAULT_TTL.POPULAR_PROPERTIES;
    
    try {
      const serializedProperties = JSON.stringify({
        properties,
        updatedAt: new Date().toISOString(),
      });
      return await this.redis.setEx(key, ttl, serializedProperties);
    } catch (error) {
      console.error('Error caching popular properties:', error);
      return false;
    }
  }

  async getPopularProperties(): Promise<any[] | null> {
    const key = CacheService.PREFIXES.POPULAR_PROPERTIES;
    
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        const data = JSON.parse(cached);
        return data.properties;
      }
      return null;
    } catch (error) {
      console.error('Error retrieving cached popular properties:', error);
      return null;
    }
  }

  /**
   * Property Views Tracking
   */
  async incrementPropertyViews(propertyId: number): Promise<number> {
    const key = `${CacheService.PREFIXES.PROPERTY_VIEWS}${propertyId}`;
    
    try {
      const client = this.redis.getClient();
      const views = await client.incr(key);
      // Set expiration if this is the first increment
      if (views === 1) {
        await client.expire(key, CacheService.DEFAULT_TTL.PROPERTY_VIEWS);
      }
      return views;
    } catch (error) {
      console.error('Error incrementing property views:', error);
      return 0;
    }
  }

  async getPropertyViews(propertyId: number): Promise<number> {
    const key = `${CacheService.PREFIXES.PROPERTY_VIEWS}${propertyId}`;
    
    try {
      const views = await this.redis.get(key);
      return views ? parseInt(views, 10) : 0;
    } catch (error) {
      console.error('Error retrieving property views:', error);
      return 0;
    }
  }

  /**
   * Cache Invalidation Strategies
   */
  async invalidateSearchCache(): Promise<boolean> {
    try {
      const client = this.redis.getClient();
      const keys = await client.keys(`${CacheService.PREFIXES.SEARCH_RESULTS}*`);
      
      if (keys.length > 0) {
        await client.del(keys);
      }
      
      return true;
    } catch (error) {
      console.error('Error invalidating search cache:', error);
      return false;
    }
  }

  async invalidatePropertyRelatedCache(propertyId: number): Promise<boolean> {
    try {
      // Invalidate property details
      await this.invalidatePropertyDetails(propertyId);
      
      // Invalidate search results (since property data changed)
      await this.invalidateSearchCache();
      
      // Invalidate popular properties cache
      await this.redis.del(CacheService.PREFIXES.POPULAR_PROPERTIES);
      
      return true;
    } catch (error) {
      console.error('Error invalidating property-related cache:', error);
      return false;
    }
  }

  async invalidateUserRelatedCache(userId: number): Promise<boolean> {
    try {
      await this.invalidateUserSession(userId);
      await this.invalidateUserFavorites(userId);
      
      // Invalidate user profile cache
      const profileKey = `${CacheService.PREFIXES.USER_PROFILE}${userId}`;
      await this.redis.del(profileKey);
      
      return true;
    } catch (error) {
      console.error('Error invalidating user-related cache:', error);
      return false;
    }
  }

  /**
   * Utility Methods
   */
  private generateSearchHash(criteria: SearchCriteria): string {
    // Create a consistent hash from search criteria
    const sortedCriteria = Object.keys(criteria)
      .sort()
      .reduce((result: any, key) => {
        result[key] = criteria[key as keyof SearchCriteria];
        return result;
      }, {});
    
    return Buffer.from(JSON.stringify(sortedCriteria)).toString('base64');
  }

  async clearAllCache(): Promise<boolean> {
    try {
      const client = this.redis.getClient();
      await client.flushDb();
      return true;
    } catch (error) {
      console.error('Error clearing all cache:', error);
      return false;
    }
  }

  async getCacheStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    hitRate?: number;
  }> {
    try {
      const client = this.redis.getClient();
      const info = await client.info('memory');
      const keyCount = await client.dbSize();
      
      return {
        totalKeys: keyCount,
        memoryUsage: this.extractMemoryUsage(info),
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalKeys: 0,
        memoryUsage: 'Unknown',
      };
    }
  }

  private extractMemoryUsage(info: string): string {
    const lines = info.split('\r\n');
    const memoryLine = lines.find(line => line.startsWith('used_memory_human:'));
    return memoryLine ? memoryLine.split(':')[1] : 'Unknown';
  }
}

export default CacheService;