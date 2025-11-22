import { Request, Response } from 'express';
import AdminService from '../services/adminService';
import { AuthenticatedRequest, ApiResponse, UserRole } from '../types';

class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  /**
   * Get dashboard analytics
   */
  getDashboardAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const analytics = await this.adminService.getDashboardAnalytics();
      console.log('Dashboard analytics:', analytics);
      res.json({
        success: true,
        data: analytics,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting dashboard analytics:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get dashboard analytics',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Get users for moderation - FIXED with correct parameter mapping
   */
  getUsersForModeration = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const role = req.query.role as UserRole;
      
      // Map camelCase query params to snake_case for database
      const isVerified = req.query.isVerified ? req.query.isVerified === 'true' : undefined;
      const isActive = req.query.isActive ? req.query.isActive === 'true' : undefined;
      const search = req.query.search as string;
      
      console.log('Fetching users for moderation with params:', { 
        page, limit, role, isVerified, isActive, search 
      });

      const result = await this.adminService.getUsersForModeration(page, limit, {
        role,
        is_verified: isVerified,    // Convert camelCase to snake_case
        is_active: isActive,        // Convert camelCase to snake_case
        search,
      });

      console.log('Fetched users for moderation:', result);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting users for moderation:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get users for moderation',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Get properties for moderation - FIXED with correct parameter mapping
   */
  getPropertiesForModeration = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      // Map camelCase query params to snake_case for database
      const propertyType = req.query.propertyType as string;      // Frontend sends propertyType
      const isActive = req.query.isActive ? req.query.isActive === 'true' : undefined;
      const isFeatured = req.query.isFeatured ? req.query.isFeatured === 'true' : undefined;
      const search = req.query.search as string;

      console.log('Fetching properties for moderation with params:', { 
        page, limit, propertyType, isActive, isFeatured, search 
      });

      const result = await this.adminService.getPropertiesForModeration(page, limit, {
        property_type: propertyType,    // Convert camelCase to snake_case
        is_active: isActive,            // Convert camelCase to snake_case
        is_featured: isFeatured,        // Convert camelCase to snake_case
        search,
      });

      console.log('Fetched properties for moderation:', result);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting properties for moderation:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get properties for moderation',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Update user status - FIXED with correct field mapping
   */
  updateUserStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { isActive, isVerified, role } = req.body;  // Frontend sends camelCase

      if (!userId || isNaN(parseInt(userId))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid user ID is required',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      // Map camelCase to snake_case for database
      const updates: any = {};
      if (isActive !== undefined) updates.is_active = isActive;      // Convert to snake_case
      if (isVerified !== undefined) updates.is_verified = isVerified; // Convert to snake_case
      if (role !== undefined) updates.role = role;

      if (Object.keys(updates).length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'At least one field to update is required',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      console.log('Updating user status:', { userId, updates });
      const user = await this.adminService.updateUserStatus(parseInt(userId), updates);

      res.json({
        success: true,
        data: user,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error updating user status:', error);
      
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user status',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Update property status - FIXED with correct field mapping
   */
  updatePropertyStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { propertyId } = req.params;
      const { isActive, isFeatured } = req.body;  // Frontend sends camelCase

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

      // Map camelCase to snake_case for database
      const updates: any = {};
      if (isActive !== undefined) updates.is_active = isActive;      // Convert to snake_case
      if (isFeatured !== undefined) updates.is_featured = isFeatured; // Convert to snake_case

      if (Object.keys(updates).length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'At least one field to update is required',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      console.log('Updating property status:', { propertyId, updates });
      const property = await this.adminService.updatePropertyStatus(parseInt(propertyId), updates);

      res.json({
        success: true,
        data: property,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error updating property status:', error);
      
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
          message: 'Failed to update property status',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Delete user
   */
  deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      if (!userId || isNaN(parseInt(userId))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Valid user ID is required',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      console.log('Deleting user:', userId);
      await this.adminService.deleteUser(parseInt(userId));

      res.json({
        success: true,
        data: { message: 'User deactivated successfully' },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error deleting user:', error);
      
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete user',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Delete property
   */
  deleteProperty = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

      console.log('Deleting property:', propertyId);
      await this.adminService.deleteProperty(parseInt(propertyId));

      res.json({
        success: true,
        data: { message: 'Property deleted successfully' },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error deleting property:', error);
      
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
          message: 'Failed to delete property',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Get system statistics
   */
  getSystemStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const stats = await this.adminService.getSystemStats();

      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting system stats:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get system statistics',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Get traffic analytics
   */
  getTrafficAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const range = req.query.range as string || '30d';
      const analytics = await this.adminService.getTrafficAnalytics(range);

      res.json({
        success: true,
        data: analytics,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting traffic analytics:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get traffic analytics',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Get lead analytics
   */
  getLeadAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const range = req.query.range as string || '30d';
      const analytics = await this.adminService.getLeadAnalytics(range);

      res.json({
        success: true,
        data: analytics,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting lead analytics:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get lead analytics',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };

  /**
   * Get listing analytics
   */
  getListingAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const range = req.query.range as string || '30d';
      const analytics = await this.adminService.getListingAnalytics(range);

      res.json({
        success: true,
        data: analytics,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting listing analytics:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get listing analytics',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };
}

export default AdminController;