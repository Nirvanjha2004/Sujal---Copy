import type { BuyerStats, BuyerActivity } from '../types/buyer';
import { favoritesService } from './favoritesService';
import { savedSearchesService } from './savedSearchesService';
import { handleBuyerError } from '../utils/errorHandler';

/**
 * Service for managing buyer-specific data and operations
 * Handles dashboard statistics, activity tracking, and buyer preferences
 */
export const buyerService = {
  /**
   * Fetch buyer dashboard statistics
   * @returns Promise with buyer stats including saved properties, searches, and messages
   * @throws Error if the request fails
   */
  async getBuyerStats(): Promise<BuyerStats> {
    try {
      // Fetch data from multiple sources
      const [favorites, savedSearches] = await Promise.all([
        favoritesService.getFavorites().catch(() => []),
        savedSearchesService.getSavedSearches().catch(() => [])
      ]);

      // Get message count (placeholder - would need actual messages API)
      const messageCount = await this.getMessageCount().catch(() => 0);

      return {
        savedProperties: favorites.length,
        savedSearches: savedSearches.length,
        messages: messageCount
      };
    } catch (error) {
      console.error('Error fetching buyer stats:', error);
      throw handleBuyerError(error);
    }
  },

  /**
   * Get buyer activity feed
   * @param limit - Number of activities to fetch (default: 10)
   * @returns Promise with array of buyer activities
   * @throws Error if the request fails
   */
  async getBuyerActivity(limit: number = 10): Promise<BuyerActivity[]> {
    try {
      // This would typically be a dedicated API endpoint
      // For now, we'll construct activity from available data
      const [favorites, savedSearches] = await Promise.all([
        favoritesService.getFavorites().catch(() => []),
        savedSearchesService.getSavedSearches().catch(() => [])
      ]);

      const activities: BuyerActivity[] = [];

      // Add favorite activities
      favorites.slice(0, Math.floor(limit / 2)).forEach((favorite) => {
        activities.push({
          id: favorite.id,
          type: 'favorite_added',
          title: 'Property Added to Favorites',
          description: `Added ${favorite.property?.title || 'property'} to favorites`,
          timestamp: favorite.added_at || favorite.created_at,
          property_id: favorite.property?.id
        });
      });

      // Add saved search activities
      savedSearches.slice(0, Math.floor(limit / 2)).forEach((search) => {
        activities.push({
          id: search.id,
          type: 'search_saved',
          title: 'Search Criteria Saved',
          description: `Saved search: ${search.name}`,
          timestamp: search.created_at,
          search_id: search.id
        });
      });

      // Sort by timestamp (most recent first)
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching buyer activity:', error);
      throw handleBuyerError(error);
    }
  },

  /**
   * Get message count for the buyer
   * @returns Promise with message count
   * @throws Error if the request fails
   */
  async getMessageCount(): Promise<number> {
    try {
      // This would be replaced with actual messages API call
      // For now, return a placeholder value
      // const response = await api.getMessages();
      // return response.data.messages.length;
      return 0;
    } catch (error) {
      console.error('Error fetching message count:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch message count');
    }
  },

  /**
   * Update buyer preferences
   * @param preferences - Buyer preferences to update
   * @returns Promise with updated preferences
   * @throws Error if the request fails
   */
  async updateBuyerPreferences(preferences: Record<string, any>): Promise<Record<string, any>> {
    try {
      // This would be replaced with actual preferences API call
      // const response = await api.updateBuyerPreferences(preferences);
      // return response.data;
      
      // For now, just return the preferences as-is
      console.log('Updating buyer preferences:', preferences);
      return preferences;
    } catch (error) {
      console.error('Error updating buyer preferences:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update buyer preferences');
    }
  },

  /**
   * Get buyer preferences
   * @returns Promise with buyer preferences
   * @throws Error if the request fails
   */
  async getBuyerPreferences(): Promise<Record<string, any>> {
    try {
      // This would be replaced with actual preferences API call
      // const response = await api.getBuyerPreferences();
      // return response.data;
      
      // For now, return default preferences
      return {
        emailNotifications: true,
        smsNotifications: false,
        priceAlerts: true,
        newListingAlerts: true,
        preferredContactTime: 'morning',
        maxBudget: null,
        preferredLocations: []
      };
    } catch (error) {
      console.error('Error fetching buyer preferences:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch buyer preferences');
    }
  },

  /**
   * Get buyer dashboard data (stats + activity)
   * @returns Promise with complete dashboard data
   * @throws Error if the request fails
   */
  async getBuyerDashboardData(): Promise<{
    stats: BuyerStats;
    activity: BuyerActivity[];
    preferences: Record<string, any>;
  }> {
    try {
      const [stats, activity, preferences] = await Promise.all([
        this.getBuyerStats(),
        this.getBuyerActivity(5),
        this.getBuyerPreferences().catch(() => ({}))
      ]);

      return {
        stats,
        activity,
        preferences
      };
    } catch (error) {
      console.error('Error fetching buyer dashboard data:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch buyer dashboard data');
    }
  },

  /**
   * Refresh buyer statistics
   * @returns Promise with refreshed buyer stats
   * @throws Error if the request fails
   */
  async refreshBuyerStats(): Promise<BuyerStats> {
    try {
      // Force refresh by bypassing any caching
      return await this.getBuyerStats();
    } catch (error) {
      console.error('Error refreshing buyer stats:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to refresh buyer statistics');
    }
  },

  /**
   * Format activity timestamp for display
   * @param timestamp - ISO timestamp string
   * @returns Formatted time string
   */
  formatActivityTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  },

  /**
   * Get activity icon based on activity type
   * @param type - Activity type
   * @returns Icon name string
   */
  getActivityIcon(type: BuyerActivity['type']): string {
    const iconMap = {
      'favorite_added': 'solar:heart-bold',
      'search_saved': 'solar:bookmark-bold',
      'inquiry_sent': 'solar:letter-bold',
      'message_received': 'solar:chat-round-bold'
    };
    
    return iconMap[type] || 'solar:info-circle-bold';
  }
};