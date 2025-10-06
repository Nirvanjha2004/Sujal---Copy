import { Request, Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '../types';
import CmsService from '../services/cmsService';

class CmsController {
  private cmsService: CmsService;

  constructor() {
    this.cmsService = new CmsService();
  }

  /**
   * Get all CMS content (admin only) - FIXED
   */
  getAllContent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const type = req.query.type as string;
      const isActive = req.query.isActive ? req.query.isActive === 'true' : undefined;
      const search = req.query.search as string;

      console.log('🔍 Getting all CMS content:', { page, limit, type, isActive, search });

      const filters: any = {};
      if (type) filters.type = type;
      if (isActive !== undefined) filters.isActive = isActive;
      if (search) filters.search = search;

      const result = await this.cmsService.getAllContent(page, limit, filters);

      console.log('✅ CMS content fetched:', result);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('❌ Error getting all CMS content:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get CMS content',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Get active content for public display - FIXED
   */
  getActiveContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const type = req.query.type as 'banner' | 'announcement' | 'page' | 'widget';

      console.log('🔍 Getting active CMS content:', { type });

      const content = await this.cmsService.getActiveContent(type);

      console.log('✅ Active content fetched:', content.length);

      res.json({
        success: true,
        data: content,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('❌ Error getting active content:', error);
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
   * Get banners (public) - FIXED
   */
  getBanners = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('🔍 Getting banners');

      const banners = await this.cmsService.getActiveBanners();

      console.log('✅ Banners fetched:', banners.length);

      res.json({
        success: true,
        data: banners,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('❌ Error getting banners:', error);
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
   * Get announcements (public) - FIXED
   */
  getAnnouncements = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('🔍 Getting announcements');

      const announcements = await this.cmsService.getActiveAnnouncements();

      console.log('✅ Announcements fetched:', announcements.length);

      res.json({
        success: true,
        data: announcements,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('❌ Error getting announcements:', error);
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
   * Get content by key (public) - FIXED
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

      console.log('🔍 Getting content by key:', key);

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

      console.log('✅ Content found by key:', content.id);

      res.json({
        success: true,
        data: content,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('❌ Error getting content by key:', error);
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
   * Get content by ID (admin only) - FIXED
   */
  getContentById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

      console.log('🔍 Getting content by ID:', id);

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

      console.log('✅ Content found by ID:', content.id);

      res.json({
        success: true,
        data: content,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('❌ Error getting content by ID:', error);
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
   * Create content (admin only) - FIXED
   */
  createContent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { type, key, title, content, metadata, isActive, displayOrder } = req.body;

      // Validation
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

      if (!['banner', 'announcement', 'page', 'widget'].includes(type)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid content type',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      console.log('💾 Creating CMS content:', { type, key, title, content, metadata, isActive, displayOrder });

      const contentData = {
        type,
        key,
        title,
        content,
        metadata: metadata || {},
        isActive: isActive !== undefined ? isActive : true,
        displayOrder: displayOrder || 0,
      };

      const newContent = await this.cmsService.createContent(contentData);

      console.log('✅ Content created:', newContent.id);

      res.status(201).json({
        success: true,
        data: newContent,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error: any) {
      console.error('❌ Error creating content:', error);

      if (error.message === 'Content with this key already exists') {
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
   * Update content (admin only) - FIXED
   */
  updateContent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates = req.body;

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

      console.log('💾 Updating CMS content:', { id, updates });

      const updatedContent = await this.cmsService.updateContent(parseInt(id), updates);

      console.log('✅ Content updated:', updatedContent.id);

      res.json({
        success: true,
        data: updatedContent,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error: any) {
      console.error('❌ Error updating content:', error);

      if (error.message === 'Content not found') {
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
   * Delete content (admin only) - FIXED
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

      console.log('🗑️ Deleting CMS content:', id);

      await this.cmsService.deleteContent(parseInt(id));

      console.log('✅ Content deleted:', id);

      res.json({
        success: true,
        message: 'Content deleted successfully',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error: any) {
      console.error('❌ Error deleting content:', error);

      if (error.message === 'Content not found') {
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
   * Toggle content status (admin only) - FIXED
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

      console.log('🔄 Toggling content status:', id);

      const updatedContent = await this.cmsService.toggleContentStatus(parseInt(id));

      console.log('✅ Content status toggled:', updatedContent.id, updatedContent.isActive);

      res.json({
        success: true,
        data: updatedContent,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error: any) {
      console.error('❌ Error toggling content status:', error);

      if (error.message === 'Content not found') {
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
   * Get content statistics (admin only) - FIXED
   */
  getContentStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      console.log('📊 Getting content statistics');

      const stats = await this.cmsService.getContentStats();

      console.log('✅ Content stats fetched:', stats);

      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('❌ Error getting content stats:', error);
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