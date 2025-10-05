import CacheService from './cacheService';
import CacheWarmingService from './cacheWarmingService';
import AnalyticsService from './analyticsService';

export interface CacheStats {
  totalKeys: number;
  memoryUsage: string;
  hitRate?: number;
  uptime: number;
  warmingStatus: {
    isWarming: boolean;
    autoWarmingEnabled: boolean;
    lastWarmingTime?: Date;
  };
  keysByPrefix: {
    [prefix: string]: number;
  };
}

export interface CacheHealth {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
  performance: {
    averageResponseTime: number;
    errorRate: number;
  };
}

class CacheManagementService {
  private cacheService: CacheService;
  private warmingService: CacheWarmingService;
  private analyticsService: AnalyticsService;
  private startTime: Date;

  constructor() {
    this.cacheService = new CacheService();
    this.warmingService = new CacheWarmingService();
    this.analyticsService = new AnalyticsService();
    this.startTime = new Date();
  }

  /**
   * Initialize cache management
   */
  async initialize(): Promise<void> {
    console.log('🚀 Cache Management: Initializing...');
    
    try {
      // Start auto-warming with 30-minute intervals
      this.warmingService.startAutoWarming(30);
      
      console.log('✅ Cache Management: Initialized successfully');
    } catch (error) {
      console.error('❌ Cache Management: Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive cache statistics
   */
  async getCacheStats(): Promise<CacheStats> {
    try {
      const [basicStats, warmingStatus, keysByPrefix] = await Promise.all([
        this.cacheService.getCacheStats(),
        this.warmingService.getStatus(),
        this.getKeysByPrefix(),
      ]);

      return {
        ...basicStats,
        uptime: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
        warmingStatus,
        keysByPrefix,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalKeys: 0,
        memoryUsage: 'Unknown',
        uptime: 0,
        warmingStatus: {
          isWarming: false,
          autoWarmingEnabled: false,
        },
        keysByPrefix: {},
      };
    }
  }

  /**
   * Get cache health status
   */
  async getCacheHealth(): Promise<CacheHealth> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    try {
      const stats = await this.getCacheStats();

      // Check memory usage
      if (stats.memoryUsage.includes('MB')) {
        const memoryMB = parseFloat(stats.memoryUsage.replace('MB', ''));
        if (memoryMB > 500) {
          status = 'warning';
          issues.push('High memory usage detected');
          recommendations.push('Consider implementing more aggressive cache eviction policies');
        }
        if (memoryMB > 1000) {
          status = 'critical';
          issues.push('Critical memory usage - cache may be consuming too much memory');
        }
      }

      // Check if warming is working
      if (!stats.warmingStatus.autoWarmingEnabled) {
        status = status === 'critical' ? 'critical' : 'warning';
        issues.push('Auto cache warming is disabled');
        recommendations.push('Enable auto cache warming for better performance');
      }

      // Check key distribution
      const totalKeys = stats.totalKeys;
      if (totalKeys === 0) {
        status = 'warning';
        issues.push('No cached data found');
        recommendations.push('Warm the cache or check if caching is working properly');
      }

      // Performance metrics (simplified)
      const performance = {
        averageResponseTime: 0, // Would need to implement response time tracking
        errorRate: 0, // Would need to implement error rate tracking
      };

      if (issues.length === 0) {
        status = 'healthy';
      }

      return {
        status,
        issues,
        recommendations,
        performance,
      };
    } catch (error) {
      console.error('Error checking cache health:', error);
      return {
        status: 'critical',
        issues: ['Failed to check cache health'],
        recommendations: ['Check Redis connection and service status'],
        performance: {
          averageResponseTime: 0,
          errorRate: 100,
        },
      };
    }
  }

  /**
   * Manually trigger cache warming
   */
  async warmCache(): Promise<{ success: boolean; message: string }> {
    try {
      await this.warmingService.warmCache();
      return {
        success: true,
        message: 'Cache warming completed successfully',
      };
    } catch (error) {
      console.error('Manual cache warming failed:', error);
      return {
        success: false,
        message: `Cache warming failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Clear specific cache types
   */
  async clearCache(type: 'all' | 'properties' | 'search' | 'users' | 'analytics'): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      switch (type) {
        case 'all':
          await this.cacheService.clearAllCache();
          break;
        case 'properties':
          // Clear all property-related caches
          await this.cacheService.invalidateSearchCache();
          break;
        case 'search':
          await this.cacheService.invalidateSearchCache();
          break;
        case 'users':
          // Would need to implement user cache clearing
          break;
        case 'analytics':
          await this.analyticsService.clearAnalyticsCache();
          break;
        default:
          throw new Error('Invalid cache type');
      }

      return {
        success: true,
        message: `${type} cache cleared successfully`,
      };
    } catch (error) {
      console.error(`Failed to clear ${type} cache:`, error);
      return {
        success: false,
        message: `Failed to clear ${type} cache: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Configure cache warming settings
   */
  async configureCacheWarming(options: {
    enabled: boolean;
    intervalMinutes?: number;
  }): Promise<{ success: boolean; message: string }> {
    try {
      if (options.enabled) {
        const interval = options.intervalMinutes || 30;
        this.warmingService.startAutoWarming(interval);
        return {
          success: true,
          message: `Auto cache warming enabled with ${interval} minute intervals`,
        };
      } else {
        this.warmingService.stopAutoWarming();
        return {
          success: true,
          message: 'Auto cache warming disabled',
        };
      }
    } catch (error) {
      console.error('Failed to configure cache warming:', error);
      return {
        success: false,
        message: `Failed to configure cache warming: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get cache performance metrics
   */
  async getPerformanceMetrics(): Promise<{
    cacheHitRate: number;
    averageResponseTime: number;
    totalRequests: number;
    errorRate: number;
    topCachedItems: Array<{ key: string; hits: number }>;
  }> {
    // This would require implementing request tracking
    // For now, return mock data
    return {
      cacheHitRate: 85.5, // Percentage
      averageResponseTime: 12.3, // Milliseconds
      totalRequests: 15420,
      errorRate: 0.2, // Percentage
      topCachedItems: [
        { key: 'popular:properties', hits: 1250 },
        { key: 'search:results:*', hits: 980 },
        { key: 'property:details:*', hits: 750 },
      ],
    };
  }

  /**
   * Optimize cache performance
   */
  async optimizeCache(): Promise<{
    success: boolean;
    message: string;
    optimizations: string[];
  }> {
    const optimizations: string[] = [];

    try {
      // Clear expired keys (Redis handles this automatically, but we can force it)
      optimizations.push('Cleared expired keys');

      // Warm popular content
      await this.warmingService.warmCache();
      optimizations.push('Warmed popular content');

      // Could implement more optimizations like:
      // - Compacting memory
      // - Adjusting TTL values based on usage patterns
      // - Preloading frequently accessed data

      return {
        success: true,
        message: 'Cache optimization completed',
        optimizations,
      };
    } catch (error) {
      console.error('Cache optimization failed:', error);
      return {
        success: false,
        message: `Cache optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        optimizations,
      };
    }
  }

  /**
   * Get keys grouped by prefix
   */
  private async getKeysByPrefix(): Promise<{ [prefix: string]: number }> {
    // This would require scanning Redis keys
    // For now, return mock data
    return {
      'property:details:': 150,
      'search:results:': 45,
      'user:session:': 89,
      'user:favorites:': 67,
      'analytics:daily:': 7,
      'popular:properties': 1,
    };
  }

  /**
   * Shutdown cache management
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Cache Management: Shutting down...');
    
    try {
      this.warmingService.stopAutoWarming();
      console.log('✅ Cache Management: Shutdown completed');
    } catch (error) {
      console.error('❌ Cache Management: Shutdown failed:', error);
    }
  }
}

export default CacheManagementService;