import { Request, Response, NextFunction } from 'express';
import CacheService from '../services/cacheService';

interface CacheMiddlewareOptions {
  ttl?: number;
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean;
}

class CacheMiddleware {
  private cacheService: CacheService;

  constructor() {
    this.cacheService = new CacheService();
  }

  /**
   * Generic cache middleware for API responses
   */
  cache(options: CacheMiddlewareOptions = {}) {
    return async (req: Request, res: Response, next: NextFunction) => {
      // Skip caching for non-GET requests
      if (req.method !== 'GET') {
        return next();
      }

      // Check condition if provided
      if (options.condition && !options.condition(req)) {
        return next();
      }

      try {
        // Generate cache key
        const cacheKey = options.keyGenerator 
          ? options.keyGenerator(req)
          : this.generateDefaultCacheKey(req);

        // Try to get cached response
        const cachedResponse = await this.cacheService.getUserSession(0); // Using generic get method
        
        if (cachedResponse) {
          console.log(`Cache hit for key: ${cacheKey}`);
          return res.json(cachedResponse);
        }

        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to cache response
        res.json = (data: any) => {
          // Cache the response
          this.cacheService.cacheUserSession(0, data, { ttl: options.ttl })
            .catch(error => console.error('Failed to cache response:', error));

          // Send original response
          return originalJson(data);
        };

        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  }

  /**
   * Property-specific cache middleware
   */
  cacheProperty() {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'GET') {
        return next();
      }

      const propertyId = parseInt(req.params.id, 10);
      if (!propertyId) {
        return next();
      }

      try {
        // Try to get cached property
        const cachedProperty = await this.cacheService.getPropertyDetails(propertyId);
        
        if (cachedProperty) {
          console.log(`Cache hit for property: ${propertyId}`);
          return res.json({
            success: true,
            data: cachedProperty,
          });
        }

        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to cache response
        res.json = (data: any) => {
          // Cache the property if response is successful
          if (data.success && data.data) {
            this.cacheService.cachePropertyDetails(propertyId, data.data)
              .catch(error => console.error('Failed to cache property:', error));
          }

          return originalJson(data);
        };

        next();
      } catch (error) {
        console.error('Property cache middleware error:', error);
        next();
      }
    };
  }

  /**
   * Search results cache middleware
   */
  cacheSearchResults() {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'GET') {
        return next();
      }

      try {
        const searchCriteria = this.extractSearchCriteria(req);
        
        // Try to get cached search results
        const cachedResults = await this.cacheService.getSearchResults(searchCriteria);
        
        if (cachedResults) {
          console.log('Cache hit for search results');
          return res.json({
            success: true,
            data: cachedResults.results,
            totalCount: cachedResults.totalCount,
            cached: true,
            timestamp: cachedResults.timestamp,
          });
        }

        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to cache response
        res.json = (data: any) => {
          // Cache the search results if response is successful
          if (data.success && data.data) {
            this.cacheService.cacheSearchResults(
              searchCriteria,
              data.data,
              data.totalCount || data.data.length
            ).catch(error => console.error('Failed to cache search results:', error));
          }

          return originalJson(data);
        };

        next();
      } catch (error) {
        console.error('Search cache middleware error:', error);
        next();
      }
    };
  }

  /**
   * User favorites cache middleware
   */
  cacheFavorites() {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'GET') {
        return next();
      }

      const userId = (req as any).user?.id;
      if (!userId) {
        return next();
      }

      try {
        // Try to get cached favorites
        const cachedFavorites = await this.cacheService.getUserFavorites(userId);
        
        if (cachedFavorites) {
          console.log(`Cache hit for user favorites: ${userId}`);
          return res.json({
            success: true,
            data: cachedFavorites,
          });
        }

        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to cache response
        res.json = (data: any) => {
          // Cache the favorites if response is successful
          if (data.success && data.data) {
            const favoriteIds = Array.isArray(data.data) 
              ? data.data.map((fav: any) => fav.propertyId || fav.id)
              : [];
            
            this.cacheService.cacheUserFavorites(userId, favoriteIds)
              .catch(error => console.error('Failed to cache favorites:', error));
          }

          return originalJson(data);
        };

        next();
      } catch (error) {
        console.error('Favorites cache middleware error:', error);
        next();
      }
    };
  }

  /**
   * Cache invalidation middleware for property updates
   */
  invalidatePropertyCache() {
    return async (req: Request, res: Response, next: NextFunction) => {
      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to invalidate cache after successful response
      res.json = (data: any) => {
        // Invalidate cache if response is successful
        if (data.success) {
          const propertyId = parseInt(req.params.id, 10);
          if (propertyId) {
            this.cacheService.invalidatePropertyRelatedCache(propertyId)
              .catch(error => console.error('Failed to invalidate property cache:', error));
          }
        }

        return originalJson(data);
      };

      next();
    };
  }

  /**
   * Cache invalidation middleware for user updates
   */
  invalidateUserCache() {
    return async (req: Request, res: Response, next: NextFunction) => {
      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to invalidate cache after successful response
      res.json = (data: any) => {
        // Invalidate cache if response is successful
        if (data.success) {
          const userId = (req as any).user?.id || parseInt(req.params.id, 10);
          if (userId) {
            this.cacheService.invalidateUserRelatedCache(userId)
              .catch(error => console.error('Failed to invalidate user cache:', error));
          }
        }

        return originalJson(data);
      };

      next();
    };
  }

  /**
   * Utility methods
   */
  private generateDefaultCacheKey(req: Request): string {
    const { path, query } = req;
    const queryString = new URLSearchParams(query as any).toString();
    return `${path}${queryString ? `?${queryString}` : ''}`;
  }

  private extractSearchCriteria(req: Request): any {
    const {
      propertyType,
      listingType,
      minPrice,
      maxPrice,
      city,
      bedrooms,
      bathrooms,
      amenities,
      page,
      limit,
      sortBy,
      sortOrder,
    } = req.query;

    return {
      propertyType: propertyType as string,
      listingType: listingType as string,
      minPrice: minPrice ? parseInt(minPrice as string, 10) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice as string, 10) : undefined,
      city: city as string,
      bedrooms: bedrooms ? parseInt(bedrooms as string, 10) : undefined,
      bathrooms: bathrooms ? parseInt(bathrooms as string, 10) : undefined,
      amenities: amenities ? (amenities as string).split(',') : undefined,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
      sortBy: sortBy as string,
      sortOrder: (sortOrder as string) === 'DESC' ? 'DESC' : 'ASC',
    };
  }
}

export default CacheMiddleware;