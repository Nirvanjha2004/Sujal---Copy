import { Request, Response } from 'express';
import CmsService from '../services/cmsService';
import { AuthenticatedRequest, ApiResponse } from '../types';

class CmsController {
  private cmsService: CmsService;

  constructor() {
    this.cmsService = new CmsService();
  }

  /**
   * Get all CMS content (admin)
   */
  getAllContent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const type = req.query.type as 'banner' | 'announcement' | 'page' | 'widget';
      const isActive = req.query.isActive ? req.query.isActive === 'true' : undefined;
      const search = req.query.search as string;

      const result = await this.cmsService.getAllContent(page, limit, {
        type,
        isActive,
        search,
      });

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting all content:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get content',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Get active content for public display
   */
  getActiveContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const type = req.query.type as 'banner' | 'announcement' | 'page' | 'widget';
      const content = await this.cmsService.getActiveContent(type);

      res.json({
        success: true,
        data: content,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting active content:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get active content',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Get content by ID
   */
  getContentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid content ID is required',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      const content = await this.cmsService.getContentById(parseInt(id));

      if (!content) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Content not found',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: content,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting content by ID:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get content',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Get content by key
   */
  getContentByKey = async (req: Request, res: Response): Promise<void> => {
    try {
      const { key } = req.params;

      if (!key) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Content key is required',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      const content = await this.cmsService.getContentByKey(key);

      if (!content) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Content not found',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: content,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting content by key:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get content',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Create new CMS content
   */
  createContent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const {
        type,
        key,
        title,
        content,
        metadata,
        isActive,
        displayOrder,
      } = req.body;

      if (!type || !key || !title || !content) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Type, key, title, and content are required',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      const newContent = await this.cmsService.createContent({
        type,
        key,
        title,
        content,
        metadata,
        isActive,
        displayOrder,
      });

      res.status(201).json({
        success: true,
        data: newContent,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error creating content:', error);
      
      if (error instanceof Error && error.message === 'Content with this key already exists') {
        res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Content with this key already exists',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create content',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Update CMS content
   */
  updateContent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const {
        title,
        content,
        metadata,
        isActive,
        displayOrder,
      } = req.body;

      if (!id || isNaN(parseInt(id))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid content ID is required',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (metadata !== undefined) updateData.metadata = metadata;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

      const updatedContent = await this.cmsService.updateContent(parseInt(id), updateData);

      res.json({
        success: true,
        data: updatedContent,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error updating content:', error);
      
      if (error instanceof Error && error.message === 'Content not found') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Content not found',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update content',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Delete CMS content
   */
  deleteContent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid content ID is required',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      await this.cmsService.deleteContent(parseInt(id));

      res.json({
        success: true,
        data: { message: 'Content deleted successfully' },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error deleting content:', error);
      
      if (error instanceof Error && error.message === 'Content not found') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Content not found',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete content',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Toggle content status
   */
  toggleContentStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid content ID is required',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      const updatedContent = await this.cmsService.toggleContentStatus(parseInt(id));

      res.json({
        success: true,
        data: updatedContent,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error toggling content status:', error);
      
      if (error instanceof Error && error.message === 'Content not found') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Content not found',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to toggle content status',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Get banners for display
   */
  getBanners = async (req: Request, res: Response): Promise<void> => {
    try {
      const banners = await this.cmsService.getActiveBanners();

      res.json({
        success: true,
        data: banners,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting banners:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get banners',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Get announcements for display
   */
  getAnnouncements = async (req: Request, res: Response): Promise<void> => {
    try {
      const announcements = await this.cmsService.getActiveAnnouncements();

      res.json({
        success: true,
        data: announcements,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting announcements:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get announcements',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Get content statistics
   */
  getContentStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const stats = await this.cmsService.getContentStats();

      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting content stats:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get content statistics',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };
}

export default CmsController;