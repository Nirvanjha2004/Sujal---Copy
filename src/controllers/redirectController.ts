import { Request, Response } from 'express';
import RedirectService, { RedirectFilters, CreateRedirectData, UpdateRedirectData } from '../services/redirectService';

export class RedirectController {
  private redirectService: RedirectService;

  constructor() {
    this.redirectService = new RedirectService();
  }

  /**
   * Get all redirects with filtering and pagination
   */
  async getRedirects(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const filters: RedirectFilters = {};
      
      if (req.query.isActive !== undefined) {
        filters.isActive = req.query.isActive === 'true';
      }
      if (req.query.statusCode) {
        filters.statusCode = parseInt(req.query.statusCode as string);
      }
      if (req.query.search) {
        filters.search = req.query.search as string;
      }

      const result = await this.redirectService.getAllRedirects(page, limit, filters);
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching redirects:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get redirect statistics
   */
  async getRedirectStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.redirectService.getRedirectStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching redirect stats:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create a new redirect
   */
  async createRedirect(req: Request, res: Response): Promise<void> {
    try {
      const { fromPath, toPath, statusCode, description, isActive } = req.body;
      const createdBy = (req as any).user.id; // From auth middleware

      if (!fromPath || !toPath) {
        res.status(400).json({ error: 'fromPath and toPath are required' });
        return;
      }

      const redirectData: CreateRedirectData = {
        fromPath,
        toPath,
        statusCode,
        description,
        isActive
      };

      const redirect = await this.redirectService.createRedirect(redirectData, createdBy);
      
      res.status(201).json(redirect);
    } catch (error) {
      console.error('Error creating redirect:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ 
          error: 'Conflict',
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  /**
   * Update a redirect
   */
  async updateRedirect(req: Request, res: Response): Promise<void> {
    try {
      const redirectId = parseInt(req.params.id);
      const { toPath, statusCode, description, isActive } = req.body;

      const updateData: UpdateRedirectData = {};
      
      if (toPath !== undefined) updateData.toPath = toPath;
      if (statusCode !== undefined) updateData.statusCode = statusCode;
      if (description !== undefined) updateData.description = description;
      if (isActive !== undefined) updateData.isActive = isActive;

      await this.redirectService.updateRedirect(redirectId, updateData);
      
      res.json({ success: true, message: 'Redirect updated successfully' });
    } catch (error) {
      console.error('Error updating redirect:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete a redirect
   */
  async deleteRedirect(req: Request, res: Response): Promise<void> {
    try {
      const redirectId = parseInt(req.params.id);
      
      await this.redirectService.deleteRedirect(redirectId);
      
      res.json({ success: true, message: 'Redirect deleted successfully' });
    } catch (error) {
      console.error('Error deleting redirect:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Toggle redirect status
   */
  async toggleRedirectStatus(req: Request, res: Response): Promise<void> {
    try {
      const redirectId = parseInt(req.params.id);
      
      await this.redirectService.toggleRedirectStatus(redirectId);
      
      res.json({ success: true, message: 'Redirect status toggled successfully' });
    } catch (error) {
      console.error('Error toggling redirect status:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Bulk update redirects
   */
  async bulkUpdateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { redirectIds, action } = req.body;

      if (!Array.isArray(redirectIds) || redirectIds.length === 0) {
        res.status(400).json({ error: 'redirectIds must be a non-empty array' });
        return;
      }

      let isActive: boolean;
      
      if (action === 'activate') {
        isActive = true;
      } else if (action === 'deactivate') {
        isActive = false;
      } else if (action === 'delete') {
        // Delete redirects
        for (const id of redirectIds) {
          await this.redirectService.deleteRedirect(id);
        }
        res.json({ 
          success: true, 
          message: `${redirectIds.length} redirect(s) deleted successfully`,
          affectedCount: redirectIds.length 
        });
        return;
      } else {
        res.status(400).json({ error: 'Invalid action. Use "activate", "deactivate", or "delete".' });
        return;
      }

      const affectedCount = await this.redirectService.bulkUpdateStatus(redirectIds, isActive);
      
      res.json({ 
        success: true, 
        message: `${affectedCount} redirect(s) ${action}d successfully`,
        affectedCount 
      });
    } catch (error) {
      console.error('Error bulk updating redirects:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get top redirects by hit count
   */
  async getTopRedirects(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      const redirects = await this.redirectService.getTopRedirects(limit);
      
      res.json(redirects);
    } catch (error) {
      console.error('Error fetching top redirects:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Handle redirect lookup (for actual redirects in production)
   */
  async handleRedirect(req: Request, res: Response): Promise<void> {
    try {
      const fromPath = req.path;
      
      const redirect = await this.redirectService.findRedirect(fromPath);
      
      if (redirect) {
        res.redirect(redirect.statusCode, redirect.toPath);
      } else {
        res.status(404).json({ error: 'Redirect not found' });
      }
    } catch (error) {
      console.error('Error handling redirect:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}