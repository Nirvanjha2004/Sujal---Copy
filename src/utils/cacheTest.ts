import CacheService from '../services/cacheService';
import CacheWarmingService from '../services/cacheWarmingService';
import CacheManagementService from '../services/cacheManagementService';

/**
 * Simple test utility to verify cache functionality
 */
export class CacheTestUtil {
  private cacheService: CacheService;
  private warmingService: CacheWarmingService;
  private managementService: CacheManagementService;

  constructor() {
    this.cacheService = new CacheService();
    this.warmingService = new CacheWarmingService();
    this.managementService = new CacheManagementService();
  }

  /**
   * Test basic cache operations
   */
  async testBasicOperations(): Promise<boolean> {
    console.log('🧪 Testing basic cache operations...');

    try {
      // Test property details caching
      const testProperty = {
        id: 999,
        title: 'Test Property',
        price: 100000,
        city: 'Test City',
      };

      // Cache property
      const cached = await this.cacheService.cachePropertyDetails(999, testProperty);
      if (!cached) {
        console.error('❌ Failed to cache property details');
        return false;
      }

      // Retrieve property
      const retrieved = await this.cacheService.getPropertyDetails(999);
      if (!retrieved || retrieved.id !== 999) {
        console.error('❌ Failed to retrieve cached property details');
        return false;
      }

      // Test search results caching
      const searchCriteria = {
        propertyType: 'apartment',
        city: 'Test City',
        page: 1,
        limit: 10,
      };

      const searchResults = [testProperty];
      const searchCached = await this.cacheService.cacheSearchResults(
        searchCriteria,
        searchResults,
        1
      );

      if (!searchCached) {
        console.error('❌ Failed to cache search results');
        return false;
      }

      const searchRetrieved = await this.cacheService.getSearchResults(searchCriteria);
      if (!searchRetrieved || searchRetrieved.results.length !== 1) {
        console.error('❌ Failed to retrieve cached search results');
        return false;
      }

      // Test user favorites caching
      const userFavorites = [999, 998, 997];
      const favoritesCached = await this.cacheService.cacheUserFavorites(1, userFavorites);
      if (!favoritesCached) {
        console.error('❌ Failed to cache user favorites');
        return false;
      }

      const favoritesRetrieved = await this.cacheService.getUserFavorites(1);
      if (!favoritesRetrieved || favoritesRetrieved.length !== 3) {
        console.error('❌ Failed to retrieve cached user favorites');
        return false;
      }

      // Test analytics caching
      const analyticsData = {
        totalProperties: 100,
        totalUsers: 50,
        totalInquiries: 25,
        propertyViews: 1000,
        newListingsToday: 5,
        activeUsers: 20,
        popularCities: [{ city: 'Test City', count: 10 }],
        propertyTypeDistribution: [{ type: 'apartment', count: 60 }],
      };

      const analyticsCached = await this.cacheService.cacheAnalyticsData('2024-01-01', analyticsData);
      if (!analyticsCached) {
        console.error('❌ Failed to cache analytics data');
        return false;
      }

      const analyticsRetrieved = await this.cacheService.getAnalyticsData('2024-01-01');
      if (!analyticsRetrieved || analyticsRetrieved.totalProperties !== 100) {
        console.error('❌ Failed to retrieve cached analytics data');
        return false;
      }

      console.log('✅ Basic cache operations test passed');
      return true;
    } catch (error) {
      console.error('❌ Basic cache operations test failed:', error);
      return false;
    }
  }

  /**
   * Test cache invalidation
   */
  async testCacheInvalidation(): Promise<boolean> {
    console.log('🧪 Testing cache invalidation...');

    try {
      // Cache some data
      const testProperty = { id: 888, title: 'Test Property for Invalidation' };
      await this.cacheService.cachePropertyDetails(888, testProperty);

      // Verify it's cached
      const cached = await this.cacheService.getPropertyDetails(888);
      if (!cached) {
        console.error('❌ Property was not cached before invalidation test');
        return false;
      }

      // Invalidate property-related cache
      const invalidated = await this.cacheService.invalidatePropertyRelatedCache(888);
      if (!invalidated) {
        console.error('❌ Failed to invalidate property-related cache');
        return false;
      }

      // Verify it's no longer cached
      const afterInvalidation = await this.cacheService.getPropertyDetails(888);
      if (afterInvalidation) {
        console.error('❌ Property was still cached after invalidation');
        return false;
      }

      console.log('✅ Cache invalidation test passed');
      return true;
    } catch (error) {
      console.error('❌ Cache invalidation test failed:', error);
      return false;
    }
  }

  /**
   * Test cache statistics
   */
  async testCacheStats(): Promise<boolean> {
    console.log('🧪 Testing cache statistics...');

    try {
      const stats = await this.managementService.getCacheStats();
      
      if (typeof stats.totalKeys !== 'number') {
        console.error('❌ Invalid cache stats format');
        return false;
      }

      console.log(`📊 Cache stats: ${stats.totalKeys} keys, ${stats.memoryUsage} memory`);
      console.log('✅ Cache statistics test passed');
      return true;
    } catch (error) {
      console.error('❌ Cache statistics test failed:', error);
      return false;
    }
  }

  /**
   * Run all cache tests
   */
  async runAllTests(): Promise<boolean> {
    console.log('🚀 Starting cache functionality tests...');

    const tests = [
      this.testBasicOperations(),
      this.testCacheInvalidation(),
      this.testCacheStats(),
    ];

    const results = await Promise.all(tests);
    const allPassed = results.every(result => result);

    if (allPassed) {
      console.log('🎉 All cache tests passed!');
    } else {
      console.log('❌ Some cache tests failed');
    }

    return allPassed;
  }
}

/**
 * Standalone function to run cache tests
 */
export async function runCacheTests(): Promise<boolean> {
  const testUtil = new CacheTestUtil();
  return await testUtil.runAllTests();
}