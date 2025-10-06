import { Request, Response } from 'express';
import SeoService from '../services/seoService';
import { AuthenticatedRequest, ApiResponse } from '../types';

class SeoController {
  private seoService: SeoService;

  constructor() {
    this.seoService = new SeoService();
  }

  /**
   * Get SEO settings for an entity
   */
  getSeoSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { entityType, entityId, pageType, page, limit } = req.query;

      // Check if this is a request for ALL settings (admin list view)
      if (page || limit) {
        // This is for the admin list - get all settings with pagination
        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 20;

        // Get all settings with optional filters
        const filters: any = {};
        if (entityType) filters.entityType = entityType;
        if (entityId) filters.entityId = entityId;
        if (pageType) filters.pageType = pageType;

        const result = await this.seoService.getAllSeoSettings(
          pageNum,
          limitNum,
          filters
        );

        res.json({
          success: true,
          data: {
            settings: result.settings,
            total: result.total,
            totalPages: result.totalPages,
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      // Original logic for getting specific entity settings
      if (!entityType || typeof entityType !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Entity type is required',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      // Create page identifier based on entityType and other params
      let pageIdentifier = entityType as string;
      if (entityId) {
        pageIdentifier = `${entityType}-${entityId}`;
      } else if (pageType) {
        pageIdentifier = pageType as string;
      }

      const seoSettings = await this.seoService.getSeoSettings(pageIdentifier);

      res.json({
        success: true,
        data: seoSettings,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting SEO settings:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get SEO settings',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Create or update SEO settings
   */
  upsertSeoSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const {
        entityType,
        entityId,
        pageType,
        title,
        description,
        keywords,
        ogTitle,
        ogDescription,
        ogImage,
        canonicalUrl,
        metaRobots,
        schemaMarkup,
        customMeta,
        isActive,
      } = req.body;

      if (!entityType) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Entity type is required',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      // Create page identifier based on entityType and other params
      let pageIdentifier = entityType as string;
      if (entityId) {
        pageIdentifier = `${entityType}-${entityId}`;
      } else if (pageType) {
        pageIdentifier = pageType as string;
      }

      const seoSettings = await this.seoService.upsertSeoSettings({
        page: pageIdentifier,
        title,
        description,
        keywords,
        ogTitle,
        ogDescription,
        ogImage,
        canonicalUrl,
        metaRobots,
        structuredData: schemaMarkup,
      });

      res.json({
        success: true,
        data: seoSettings,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error upserting SEO settings:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update SEO settings',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Get SEO metadata for a property
   */
  getPropertySeoMetadata = async (req: Request, res: Response): Promise<void> => {
    try {
      const { propertyId } = req.params;
      const baseUrl = `${req.protocol}://${req.get('host')}`;

      if (!propertyId || isNaN(parseInt(propertyId))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid property ID is required',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      const metadata = await this.seoService.generatePropertySeoMetadata(
        parseInt(propertyId),
        baseUrl
      );

      res.json({
        success: true,
        data: metadata,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting property SEO metadata:', error);

      if (error instanceof Error && error.message === 'Property not found') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Property not found',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get property SEO metadata',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Get SEO metadata for a page
   */
  getPageSeoMetadata = async (req: Request, res: Response): Promise<void> => {
    try {
      const { pageType } = req.params;
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const params = req.query;

      const metadata = await this.seoService.generatePageSeoMetadata(
        pageType,
        baseUrl,
        params
      );

      res.json({
        success: true,
        data: metadata,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting page SEO metadata:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get page SEO metadata',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Generate XML sitemap
   */
  generateSitemap = async (req: Request, res: Response): Promise<void> => {
    try {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const sitemap = await this.seoService.generateSitemap(baseUrl);

      res.set('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate sitemap',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Generate clean URL for property
   */
  generatePropertyUrl = async (req: Request, res: Response): Promise<void> => {
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
        } as ApiResponse);
        return;
      }

      // This would typically fetch property data and generate URL
      // For now, we'll return a simple response
      res.json({
        success: true,
        data: {
          url: `/property/${propertyId}`,
          message: 'Property URL generation endpoint - implementation depends on property data',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error generating property URL:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate property URL',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };
}

export default SeoController;