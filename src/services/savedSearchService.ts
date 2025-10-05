import { SavedSearch, SearchCriteria } from '../models/SavedSearch';
import { Property } from '../models/Property';
import { PropertyImage } from '../models/PropertyImage';
import { User } from '../models/User';
import { Op } from 'sequelize';
import RedisConnection from '../config/redis';
import emailService from './emailService';

export class SavedSearchService {
  private redis: RedisConnection;

  constructor() {
    this.redis = RedisConnection.getInstance();
  }

  /**
   * Create a new saved search
   */
  async createSavedSearch(
    userId: number,
    searchName: string,
    searchCriteria: SearchCriteria
  ): Promise<SavedSearch> {
    // Validate search name uniqueness for user
    const existingSearch = await SavedSearch.findOne({
      where: {
        user_id: userId,
        search_name: searchName.trim(),
      },
    });

    if (existingSearch) {
      throw new Error('A saved search with this name already exists');
    }

    const savedSearch = await SavedSearch.createSavedSearch(userId, searchName, searchCriteria);

    // Clear user saved searches cache
    await this.clearUserSavedSearchesCache(userId);

    return savedSearch;
  }

  /**
   * Get user's saved searches
   */
  async getUserSavedSearches(userId: number, options?: {
    page?: number;
    limit?: number;
  }): Promise<{
    savedSearches: any[];
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

    // Try to get from cache first
    const cacheKey = `user:saved_searches:${userId}:${page}:${limit}`;
    const cached = await this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    const savedSearches = await SavedSearch.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    const total = await SavedSearch.count({
      where: { user_id: userId },
    });

    const result = {
      savedSearches: savedSearches.map(search => ({
        id: search.id,
        search_name: search.search_name,
        search_criteria: search.search_criteria,
        search_summary: search.searchSummary,
        created_at: search.created_at,
        formatted_created_at: search.formattedCreatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache for 30 minutes
    await this.setCachedData(cacheKey, result, 1800);

    return result;
  }

  /**
   * Get a specific saved search by ID
   */
  async getSavedSearchById(id: number, userId: number): Promise<SavedSearch | null> {
    const savedSearch = await SavedSearch.findOne({
      where: { id, user_id: userId },
    });

    return savedSearch;
  }

  /**
   * Update a saved search
   */
  async updateSavedSearch(
    id: number,
    userId: number,
    updates: {
      search_name?: string;
      search_criteria?: SearchCriteria;
    }
  ): Promise<SavedSearch | null> {
    // Check for name uniqueness if updating name
    if (updates.search_name) {
      const existingSearch = await SavedSearch.findOne({
        where: {
          user_id: userId,
          search_name: updates.search_name.trim(),
          id: { [Op.ne]: id },
        },
      });

      if (existingSearch) {
        throw new Error('A saved search with this name already exists');
      }
    }

    const updatedSearch = await SavedSearch.updateSavedSearch(id, userId, updates);

    if (updatedSearch) {
      // Clear cache
      await this.clearUserSavedSearchesCache(userId);
    }

    return updatedSearch;
  }

  /**
   * Delete a saved search
   */
  async deleteSavedSearch(id: number, userId: number): Promise<boolean> {
    const deleted = await SavedSearch.deleteSavedSearch(id, userId);

    if (deleted) {
      // Clear cache
      await this.clearUserSavedSearchesCache(userId);
    }

    return deleted;
  }

  /**
   * Execute a saved search and return matching properties
   */
  async executeSavedSearch(
    id: number,
    userId: number,
    options?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{
    properties: any[];
    searchInfo: {
      id: number;
      name: string;
      criteria: SearchCriteria;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const savedSearch = await this.getSavedSearchById(id, userId);
    if (!savedSearch) {
      throw new Error('Saved search not found');
    }

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    // Build search query from criteria
    const whereClause = this.buildSearchWhereClause(savedSearch.search_criteria);

    const properties = await Property.findAll({
      where: {
        ...whereClause,
        is_active: true,
      },
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
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    const total = await Property.count({
      where: {
        ...whereClause,
        is_active: true,
      },
    });

    return {
      properties: properties.map(property => ({
        id: property.id,
        title: property.title,
        property_type: property.property_type,
        listing_type: property.listing_type,
        price: property.price,
        area_sqft: property.area_sqft,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        city: property.city,
        state: property.state,
        is_featured: property.is_featured,
        views_count: property.views_count,
        created_at: property.created_at,
        main_image: property.images?.[0]?.image_url || null,
        owner: (property as any).owner,
      })),
      searchInfo: {
        id: savedSearch.id,
        name: savedSearch.search_name,
        criteria: savedSearch.search_criteria,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get saved searches count for user
   */
  async getSavedSearchesCount(userId: number): Promise<number> {
    const cacheKey = `user:saved_searches:count:${userId}`;
    const cached = await this.getCachedData(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const count = await SavedSearch.count({
      where: { user_id: userId },
    });

    // Cache for 30 minutes
    await this.setCachedData(cacheKey, count, 1800);

    return count;
  }

  /**
   * Check for new properties matching saved searches and send notifications
   */
  async checkForNewMatches(propertyId: number): Promise<void> {
    try {
      const property = await Property.findByPk(propertyId, {
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['first_name', 'last_name'],
          },
        ],
      });

      if (!property || !property.is_active) {
        return;
      }

      // Get all saved searches that might match this property
      const savedSearches = await SavedSearch.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'first_name', 'last_name'],
          },
        ],
      });

      for (const savedSearch of savedSearches) {
        if (this.doesPropertyMatchCriteria(property, savedSearch.search_criteria)) {
          // Send notification email
          await this.sendNewMatchNotification(savedSearch, property);
        }
      }
    } catch (error) {
      console.error('Error checking for new matches:', error);
    }
  }

  /**
   * Build Sequelize where clause from search criteria
   */
  private buildSearchWhereClause(criteria: SearchCriteria): any {
    const whereClause: any = {};

    if (criteria.property_type?.length) {
      whereClause.property_type = { [Op.in]: criteria.property_type };
    }

    if (criteria.listing_type) {
      whereClause.listing_type = criteria.listing_type;
    }

    if (criteria.min_price || criteria.max_price) {
      whereClause.price = {};
      if (criteria.min_price) {
        whereClause.price[Op.gte] = criteria.min_price;
      }
      if (criteria.max_price) {
        whereClause.price[Op.lte] = criteria.max_price;
      }
    }

    if (criteria.min_area || criteria.max_area) {
      whereClause.area_sqft = {};
      if (criteria.min_area) {
        whereClause.area_sqft[Op.gte] = criteria.min_area;
      }
      if (criteria.max_area) {
        whereClause.area_sqft[Op.lte] = criteria.max_area;
      }
    }

    if (criteria.bedrooms?.length) {
      whereClause.bedrooms = { [Op.in]: criteria.bedrooms };
    }

    if (criteria.bathrooms?.length) {
      whereClause.bathrooms = { [Op.in]: criteria.bathrooms };
    }

    if (criteria.city?.length) {
      whereClause.city = { [Op.in]: criteria.city };
    }

    if (criteria.state) {
      whereClause.state = criteria.state;
    }

    if (criteria.keywords) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${criteria.keywords}%` } },
        { description: { [Op.like]: `%${criteria.keywords}%` } },
      ];
    }

    return whereClause;
  }

  /**
   * Check if a property matches search criteria
   */
  private doesPropertyMatchCriteria(property: any, criteria: SearchCriteria): boolean {
    // Property type check
    if (criteria.property_type?.length && !criteria.property_type.includes(property.property_type)) {
      return false;
    }

    // Listing type check
    if (criteria.listing_type && criteria.listing_type !== property.listing_type) {
      return false;
    }

    // Price range check
    if (criteria.min_price && property.price < criteria.min_price) {
      return false;
    }
    if (criteria.max_price && property.price > criteria.max_price) {
      return false;
    }

    // Area range check
    if (criteria.min_area && property.area_sqft < criteria.min_area) {
      return false;
    }
    if (criteria.max_area && property.area_sqft > criteria.max_area) {
      return false;
    }

    // Bedrooms check
    if (criteria.bedrooms?.length && !criteria.bedrooms.includes(property.bedrooms)) {
      return false;
    }

    // Bathrooms check
    if (criteria.bathrooms?.length && !criteria.bathrooms.includes(property.bathrooms)) {
      return false;
    }

    // City check
    if (criteria.city?.length && !criteria.city.includes(property.city)) {
      return false;
    }

    // State check
    if (criteria.state && criteria.state !== property.state) {
      return false;
    }

    // Keywords check
    if (criteria.keywords) {
      const keywords = criteria.keywords.toLowerCase();
      const title = property.title?.toLowerCase() || '';
      const description = property.description?.toLowerCase() || '';
      
      if (!title.includes(keywords) && !description.includes(keywords)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Send notification email for new property match
   */
  private async sendNewMatchNotification(savedSearch: any, property: any): Promise<void> {
    try {
      await emailService.sendSavedSearchMatch(savedSearch.user.email, {
        userName: savedSearch.user.first_name,
        searchName: savedSearch.search_name,
        property: {
          title: property.title,
          price: property.price,
          city: property.city,
          state: property.state,
          propertyType: property.property_type,
          listingType: property.listing_type,
          url: `${process.env.FRONTEND_URL}/properties/${property.id}`,
        },
        ownerName: `${property.owner?.first_name || ''} ${property.owner?.last_name || ''}`.trim(),
      });
    } catch (error) {
      console.error('Failed to send saved search notification:', error);
    }
  }

  /**
   * Clear user saved searches cache
   */
  private async clearUserSavedSearchesCache(userId: number): Promise<void> {
    try {
      const client = this.redis.getClient();
      if (client) {
        const keys = await client.keys(`user:saved_searches:${userId}:*`);
        keys.push(`user:saved_searches:count:${userId}`);
        
        if (keys.length > 0) {
          await client.del(keys);
        }
      }
    } catch (error) {
      console.warn('Failed to clear saved searches cache:', error);
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

export default new SavedSearchService();