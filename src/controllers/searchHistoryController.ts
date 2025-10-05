import { Request, Response, NextFunction } from 'express';
import searchHistoryService from '../services/searchHistoryService';
import { AuthenticatedRequest } from '../middleware/auth';

export class SearchHistoryController {
  /**
   * Get user's search history
   */
  async getSearchHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const offset = parseInt(req.query.offset as string) || 0;

      const history = await searchHistoryService.getSearchHistory(userId, {
        limit,
        offset,
      });

      res.status(200).json({
        success: true,
        data: {
          history,
          count: history.length,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear user's search history
   */
  async clearSearchHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      await searchHistoryService.clearSearchHistory(userId);

      res.status(200).json({
        success: true,
        message: 'Search history cleared successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get search history count
   */
  async getSearchHistoryCount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const count = await searchHistoryService.getSearchHistoryCount(userId);

      res.status(200).json({
        success: true,
        data: {
          count,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get popular search terms (public endpoint)
   */
  async getPopularSearchTerms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const terms = await searchHistoryService.getPopularSearchTerms(limit);

      res.status(200).json({
        success: true,
        data: {
          terms,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get similar searches for user
   */
  async getSimilarSearches(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { criteria } = req.body;
      const limit = Math.min(parseInt(req.query.limit as string) || 5, 20);

      if (!criteria || typeof criteria !== 'object') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Search criteria is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const similarSearches = await searchHistoryService.getSimilarSearches(
        userId,
        criteria,
        limit
      );

      res.status(200).json({
        success: true,
        data: {
          similar_searches: similarSearches,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SearchHistoryController();