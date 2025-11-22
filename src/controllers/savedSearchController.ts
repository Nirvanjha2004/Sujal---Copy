import { Request, Response, NextFunction } from 'express';
import savedSearchService from '../services/savedSearchService';
import { AuthenticatedRequest } from '../middleware/auth';
import { SearchCriteria } from '../models/SavedSearch';

export class SavedSearchController {
  /**
   * Create a new saved search
   */
  async createSavedSearch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { search_name, search_criteria } = req.body;

      // Validation
      if (!search_name || typeof search_name !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Search name is required and must be a string',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!search_criteria || typeof search_criteria !== 'object') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Search criteria is required and must be an object',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const savedSearch = await savedSearchService.createSavedSearch(
        userId,
        search_name.trim(),
        search_criteria as SearchCriteria
      );

      res.status(201).json({
        success: true,
        data: {
          id: savedSearch.id,
          search_name: savedSearch.search_name,
          search_criteria: savedSearch.search_criteria,
          search_summary: savedSearch.searchSummary,
          created_at: savedSearch.created_at,
        },
        message: 'Saved search created successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
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

        if (error.message.includes('Invalid search criteria') || error.message.includes('must be between')) {
          res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
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
   * Get user's saved searches
   */
  async getUserSavedSearches(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

      const result = await savedSearchService.getUserSavedSearches(userId, {
        page,
        limit,
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
   * Get a specific saved search
   */
  async getSavedSearchById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid saved search ID is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const savedSearch = await savedSearchService.getSavedSearchById(parseInt(id), userId);

      if (!savedSearch) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Saved search not found',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: savedSearch.id,
          search_name: savedSearch.search_name,
          search_criteria: savedSearch.search_criteria,
          search_summary: savedSearch.searchSummary,
          created_at: savedSearch.created_at,
          formatted_created_at: savedSearch.formattedCreatedAt,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a saved search
   */
  async updateSavedSearch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { search_name, search_criteria } = req.body;

      if (!id || isNaN(parseInt(id))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid saved search ID is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Validate at least one field is provided
      if (!search_name && !search_criteria) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'At least one field (search_name or search_criteria) must be provided',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const updates: any = {};
      if (search_name) {
        updates.search_name = search_name.trim();
      }
      if (search_criteria) {
        updates.search_criteria = search_criteria;
      }

      const updatedSearch = await savedSearchService.updateSavedSearch(parseInt(id), userId, updates);

      if (!updatedSearch) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Saved search not found',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: updatedSearch.id,
          search_name: updatedSearch.search_name,
          search_criteria: updatedSearch.search_criteria,
          search_summary: updatedSearch.searchSummary,
          created_at: updatedSearch.created_at,
        },
        message: 'Saved search updated successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
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

        if (error.message.includes('Invalid search criteria') || error.message.includes('must be between')) {
          res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
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
   * Delete a saved search
   */
  async deleteSavedSearch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid saved search ID is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const deleted = await savedSearchService.deleteSavedSearch(parseInt(id), userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Saved search not found',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Saved search deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Execute a saved search
   */
  async executeSavedSearch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

      if (!id || isNaN(parseInt(id))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid saved search ID is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await savedSearchService.executeSavedSearch(parseInt(id), userId, {
        page,
        limit,
      });

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Saved search not found') {
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
   * Get saved searches count
   */
  async getSavedSearchesCount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const count = await savedSearchService.getSavedSearchesCount(userId);

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
}

export default new SavedSearchController();