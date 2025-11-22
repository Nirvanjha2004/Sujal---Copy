import { SearchCriteria } from '../models/SavedSearch';
import RedisConnection from '../config/redis';

export interface SearchHistoryEntry {
  id: string;
  criteria: SearchCriteria;
  timestamp: Date;
  resultsCount: number;
}

export class SearchHistoryService {
  private redis: RedisConnection;
  private readonly MAX_HISTORY_ENTRIES = 50;
  private readonly HISTORY_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

  constructor() {
    this.redis = RedisConnection.getInstance();
  }

  /**
   * Add a search to user's search history
   */
  async addToSearchHistory(
    userId: number,
    criteria: SearchCriteria,
    resultsCount: number
  ): Promise<void> {
    try {
      const client = this.redis.getClient();
      if (!client) {
        return; // Skip if Redis is not available
      }

      const searchEntry: SearchHistoryEntry = {
        id: this.generateSearchId(),
        criteria,
        timestamp: new Date(),
        resultsCount,
      };

      const key = `user:search_history:${userId}`;
      
      // Add to the beginning of the list
      await client.lPush(key, JSON.stringify(searchEntry));
      
      // Trim to keep only the latest entries
      await client.lTrim(key, 0, this.MAX_HISTORY_ENTRIES - 1);
      
      // Set expiration
      await client.expire(key, this.HISTORY_TTL);
    } catch (error) {
      console.warn('Failed to add search to history:', error);
    }
  }

  /**
   * Get user's search history
   */
  async getSearchHistory(userId: number, options?: {
    limit?: number;
    offset?: number;
  }): Promise<SearchHistoryEntry[]> {
    try {
      const client = this.redis.getClient();
      if (!client) {
        return [];
      }

      const limit = options?.limit || 20;
      const offset = options?.offset || 0;
      const key = `user:search_history:${userId}`;

      const entries = await client.lRange(key, offset, offset + limit - 1);
      
      return entries.map((entry: string) => {
        const parsed = JSON.parse(entry);
        return {
          ...parsed,
          timestamp: new Date(parsed.timestamp),
        };
      });
    } catch (error) {
      console.warn('Failed to get search history:', error);
      return [];
    }
  }

  /**
   * Clear user's search history
   */
  async clearSearchHistory(userId: number): Promise<void> {
    try {
      const client = this.redis.getClient();
      if (!client) {
        return;
      }

      const key = `user:search_history:${userId}`;
      await client.del(key);
    } catch (error) {
      console.warn('Failed to clear search history:', error);
    }
  }

  /**
   * Get search history count
   */
  async getSearchHistoryCount(userId: number): Promise<number> {
    try {
      const client = this.redis.getClient();
      if (!client) {
        return 0;
      }

      const key = `user:search_history:${userId}`;
      return await client.lLen(key);
    } catch (error) {
      console.warn('Failed to get search history count:', error);
      return 0;
    }
  }

  /**
   * Get popular search terms (aggregated across all users)
   */
  async getPopularSearchTerms(limit: number = 10): Promise<Array<{
    term: string;
    count: number;
  }>> {
    try {
      const client = this.redis.getClient();
      if (!client) {
        return [];
      }

      const key = 'popular_search_terms';
      const results = await client.zRangeWithScores(key, 0, limit - 1, { REV: true });
      
      const terms: Array<{ term: string; count: number }> = results.map((result: any) => ({
        term: result.value,
        count: result.score,
      }));
      
      return terms;
    } catch (error) {
      console.warn('Failed to get popular search terms:', error);
      return [];
    }
  }

  /**
   * Track search terms for popularity analysis
   */
  async trackSearchTerm(term: string): Promise<void> {
    try {
      const client = this.redis.getClient();
      if (!client) {
        return;
      }

      if (!term || term.trim().length < 2) {
        return; // Skip very short terms
      }

      const key = 'popular_search_terms';
      const normalizedTerm = term.toLowerCase().trim();
      
      // Increment the count for this term
      await client.zIncrBy(key, 1, normalizedTerm);
      
      // Set expiration for the popular terms key (refresh weekly)
      await client.expire(key, 7 * 24 * 60 * 60);
    } catch (error) {
      console.warn('Failed to track search term:', error);
    }
  }

  /**
   * Get recent searches with similar criteria
   */
  async getSimilarSearches(
    userId: number,
    criteria: SearchCriteria,
    limit: number = 5
  ): Promise<SearchHistoryEntry[]> {
    try {
      const history = await this.getSearchHistory(userId, { limit: 50 });
      
      // Filter for similar searches based on key criteria
      const similar = history.filter(entry => {
        return this.areCriteriaSimilar(criteria, entry.criteria);
      });

      return similar.slice(0, limit);
    } catch (error) {
      console.warn('Failed to get similar searches:', error);
      return [];
    }
  }

  /**
   * Generate a unique search ID
   */
  private generateSearchId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if two search criteria are similar
   */
  private areCriteriaSimilar(criteria1: SearchCriteria, criteria2: SearchCriteria): boolean {
    // Check property type similarity
    if (criteria1.property_type && criteria2.property_type) {
      const overlap = criteria1.property_type.filter(type => 
        criteria2.property_type?.includes(type)
      );
      if (overlap.length === 0) {
        return false;
      }
    }

    // Check listing type
    if (criteria1.listing_type && criteria2.listing_type) {
      if (criteria1.listing_type !== criteria2.listing_type) {
        return false;
      }
    }

    // Check city similarity
    if (criteria1.city && criteria2.city) {
      const overlap = criteria1.city.filter(city => 
        criteria2.city?.includes(city)
      );
      if (overlap.length === 0) {
        return false;
      }
    }

    // Check price range overlap
    if ((criteria1.min_price || criteria1.max_price) && 
        (criteria2.min_price || criteria2.max_price)) {
      const range1 = {
        min: criteria1.min_price || 0,
        max: criteria1.max_price || Infinity,
      };
      const range2 = {
        min: criteria2.min_price || 0,
        max: criteria2.max_price || Infinity,
      };
      
      // Check if ranges overlap
      if (range1.max < range2.min || range2.max < range1.min) {
        return false;
      }
    }

    return true;
  }
}

export default new SearchHistoryService();