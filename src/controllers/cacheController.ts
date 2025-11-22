import { Request, Response } from 'express';
import CacheManagementService from '../services/cacheManagementService';

class CacheController {
  private cacheManagementService: CacheManagementService;

  constructor() {
    this.cacheManagementService = new CacheManagementService();
  }

  /**
   * Get cache statistics
   */
  getCacheStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.cacheManagementService.getCacheStats();

      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error getting cache stats:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CACHE_STATS_ERROR',
          message: 'Failed to retrieve cache statistics',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Get cache health status
   */
  getCacheHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const health = await this.cacheManagementService.getCacheHealth();

      res.json({
        success: true,
        data: health,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error getting cache health:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CACHE_HEALTH_ERROR',
          message: 'Failed to retrieve cache health status',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Get cache performance metrics
   */
  getPerformanceMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const metrics = await this.cacheManagementService.getPerformanceMetrics();

      res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PERFORMANCE_METRICS_ERROR',
          message: 'Failed to retrieve performance metrics',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Manually trigger cache warming
   */
  warmCache = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.cacheManagementService.warmCache();

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: 'CACHE_WARMING_ERROR',
            message: result.message,
          },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error warming cache:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CACHE_WARMING_ERROR',
          message: 'Failed to warm cache',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Clear specific cache types
   */
  clearCache = async (req: Request, res: Response): Promise<void> => {
    try {
      const { type } = req.params;
      
      if (!['all', 'properties', 'search', 'users', 'analytics'].includes(type)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CACHE_TYPE',
            message: 'Invalid cache type. Must be one of: all, properties, search, users, analytics',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await this.cacheManagementService.clearCache(
        type as 'all' | 'properties' | 'search' | 'users' | 'analytics'
      );

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: 'CACHE_CLEAR_ERROR',
            message: result.message,
          },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CACHE_CLEAR_ERROR',
          message: 'Failed to clear cache',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Optimize cache performance
   */
  optimizeCache = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.cacheManagementService.optimizeCache();

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: {
            optimizations: result.optimizations,
          },
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: 'CACHE_OPTIMIZATION_ERROR',
            message: result.message,
          },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error optimizing cache:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CACHE_OPTIMIZATION_ERROR',
          message: 'Failed to optimize cache',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Configure cache warming settings
   */
  configureCacheWarming = async (req: Request, res: Response): Promise<void> => {
    try {
      const { enabled, intervalMinutes } = req.body;

      if (typeof enabled !== 'boolean') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'enabled field must be a boolean',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (intervalMinutes !== undefined && (typeof intervalMinutes !== 'number' || intervalMinutes < 1)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'intervalMinutes must be a positive number',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await this.cacheManagementService.configureCacheWarming({
        enabled,
        intervalMinutes,
      });

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: 'CACHE_CONFIG_ERROR',
            message: result.message,
          },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error configuring cache warming:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CACHE_CONFIG_ERROR',
          message: 'Failed to configure cache warming',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };
}

export default CacheController;