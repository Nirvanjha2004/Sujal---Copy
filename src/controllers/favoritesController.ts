import { Request, Response, NextFunction } from 'express';
import favoritesService from '../services/favoritesService';
import { AuthenticatedRequest } from '../middleware/auth';

export class FavoritesController {
  /**
   * Add property to favorites
   */
  async addToFavorites(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { propertyId } = req.body;

      if (!propertyId || isNaN(parseInt(propertyId))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid property ID is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const favorite = await favoritesService.addToFavorites(userId, parseInt(propertyId));

      res.status(201).json({
        success: true,
        data: {
          id: favorite.id,
          property_id: favorite.property_id,
          added_at: favorite.created_at,
        },
        message: 'Property added to favorites successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already in favorites') || error.message.includes('already in your favorites')) {
          res.status(409).json({
            success: false,
            error: {
              code: 'ALREADY_EXISTS',
              message: error.message,
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }

        if (error.message.includes('not found')) {
          res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: error.message,
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }
      }
      next(error);
    }
  }

  /**
   * Remove property from favorites
   */
  async removeFromFavorites(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { propertyId } = req.params;

      if (!propertyId || isNaN(parseInt(propertyId))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid property ID is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await favoritesService.removeFromFavorites(userId, parseInt(propertyId));

      res.status(200).json({
        success: true,
        message: 'Property removed from favorites successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found in favorites')) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Check if property is in favorites
   */
  async checkFavorite(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { propertyId } = req.params;

      if (!propertyId || isNaN(parseInt(propertyId))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid property ID is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const isFavorite = await favoritesService.isFavorite(userId, parseInt(propertyId));

      res.status(200).json({
        success: true,
        data: {
          is_favorite: isFavorite,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's favorite properties
   */
  async getUserFavorites(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {

      console.log("Inside the getuserFavourites")
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const includeInactive = req.query.include_inactive === 'true';

      const result = await favoritesService.getUserFavorites(userId, {
        page,
        limit,
        includeInactive,
      });

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's favorites count
   */
  async getFavoritesCount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const count = await favoritesService.getFavoritesCount(userId);

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
   * Get user's favorite property IDs
   */
  async getFavoriteIds(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const ids = await favoritesService.getUserFavoriteIds(userId);

      res.status(200).json({
        success: true,
        data: {
          property_ids: ids,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear all user favorites
   */
  async clearFavorites(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const deletedCount = await favoritesService.clearUserFavorites(userId);

      res.status(200).json({
        success: true,
        data: {
          deleted_count: deletedCount,
        },
        message: 'All favorites cleared successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get property's favorites count (public endpoint)
   */
  async getPropertyFavoritesCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { propertyId } = req.params;

      if (!propertyId || isNaN(parseInt(propertyId))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid property ID is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const count = await favoritesService.getPropertyFavoritesCount(parseInt(propertyId));

      res.status(200).json({
        success: true,
        data: {
          property_id: parseInt(propertyId),
          favorites_count: count,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new FavoritesController();