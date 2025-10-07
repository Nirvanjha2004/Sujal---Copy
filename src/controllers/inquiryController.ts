import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import inquiryService, { CreateInquiryData, InquiryFilters } from '../services/inquiryService';
import { InquiryStatus } from '../models/Inquiry';
import { UserRole } from '../models/User';
import sequelize from '../config/database'; // 1. Import sequelize instance

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: UserRole;
  };
}

class InquiryController {
  // Validation rules
  static createInquiryValidation = [
    body('property_id').isInt({ min: 1 }).withMessage('Valid property ID is required'),
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().isMobilePhone('any').withMessage('Valid phone number is required'),
    body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters'),
  ];

  static updateStatusValidation = [
    param('id').isInt({ min: 1 }).withMessage('Valid inquiry ID is required'),
    body('status').isIn(Object.values(InquiryStatus)).withMessage('Valid status is required'),
  ];

  static getInquiryValidation = [
    param('id').isInt({ min: 1 }).withMessage('Valid inquiry ID is required'),
  ];

  static getInquiriesValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(Object.values(InquiryStatus)).withMessage('Invalid status'),
    query('property_id').optional().isInt({ min: 1 }).withMessage('Valid property ID is required'),
    query('sort').optional().isIn(['created_at', 'status', 'property_id']).withMessage('Invalid sort field'),
    query('order').optional().isIn(['ASC', 'DESC']).withMessage('Order must be ASC or DESC'),
  ];

  async createInquiry(req: AuthenticatedRequest, res: Response): Promise<void> {
    // 2. Start a transaction
    const t = await sequelize.transaction();

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // If validation fails, no DB changes were made, so we can safely rollback.
        await t.rollback();
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array(),
          },
        });
        return;
      }

      const inquiryData: CreateInquiryData = {
        property_id: req.body.property_id,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        message: req.body.message,
      };

      // If user is authenticated, add their ID
      if (req.user) {
        inquiryData.inquirer_id = req.user.id;
      }

      // 3. Pass the transaction to the service method
      const inquiry = await inquiryService.createInquiry(inquiryData, { transaction: t });

      // 4. If everything is successful, commit the transaction
      await t.commit();

      res.status(201).json({
        success: true,
        data: {
          inquiry: {
            id: inquiry.id,
            property_id: inquiry.property_id,
            name: inquiry.name,
            email: inquiry.email,
            phone: inquiry.phone,
            message: inquiry.message,
            status: inquiry.status,
            created_at: inquiry.created_at,
          },
        },
        message: 'Inquiry submitted successfully',
      });
    } catch (error) {
      // 5. If any error occurs, roll back the transaction
      await t.rollback();

      console.error('Create inquiry error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create inquiry',
        },
      });
    }
  }

  async getInquiries(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: errors.array(),
          },
        });
        return;
      }

      const filters: InquiryFilters = {};
      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sort: (req.query.sort as 'created_at' | 'status' | 'property_id') || 'created_at',
        order: (req.query.order as 'ASC' | 'DESC') || 'DESC',
      };

      // Apply filters based on query parameters
      if (req.query.status) {
        filters.status = req.query.status as InquiryStatus;
      }
      if (req.query.property_id) {
        filters.property_id = parseInt(req.query.property_id as string);
      }
      if (req.query.date_from) {
        filters.date_from = new Date(req.query.date_from as string);
      }
      if (req.query.date_to) {
        filters.date_to = new Date(req.query.date_to as string);
      }

      // Role-based filtering
      if (req.user) {
        if (req.user.role === UserRole.BUYER) {
          // Buyers can only see their own inquiries
          filters.inquirer_id = req.user.id;
        } else if ([UserRole.OWNER, UserRole.AGENT, UserRole.BUILDER].includes(req.user.role)) {
          // Property owners/agents/builders see inquiries for their properties
          const result = await inquiryService.getInquiriesForOwner(req.user.id, options);
          res.json({
            success: true,
            data: result,
          });
          return;
        }
        // Admins can see all inquiries (no additional filtering)
      }

      const result = await inquiryService.getInquiries(filters, options);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get inquiries error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve inquiries',
        },
      });
    }
  }

  async getInquiryById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid inquiry ID',
            details: errors.array(),
          },
        });
        return;
      }

      const inquiryId = parseInt(req.params.id);
      const inquiry = await inquiryService.getInquiryById(inquiryId);

      if (!inquiry) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Inquiry not found',
          },
        });
        return;
      }

      // Check permissions
      if (req.user) {
        const canView = 
          req.user.role === UserRole.ADMIN ||
          inquiry.inquirer_id === req.user.id ||
          inquiry.property?.user_id === req.user.id;

        if (!canView) {
          res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Access denied',
            },
          });
          return;
        }
      }

      // Mask phone number if not the owner or inquirer
      let maskedInquiry = inquiry.toJSON();
      if (req.user && 
          inquiry.inquirer_id !== req.user.id && 
          inquiry.property?.user_id !== req.user.id &&
          req.user.role !== UserRole.ADMIN) {
        if (maskedInquiry.phone) {
          maskedInquiry.phone = await inquiryService.maskPhoneNumber(maskedInquiry.phone);
        }
      }

      res.json({
        success: true,
        data: {
          inquiry: maskedInquiry,
        },
      });
    } catch (error) {
      console.error('Get inquiry error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve inquiry',
        },
      });
    }
  }

  async updateInquiryStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array(),
          },
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const inquiryId = parseInt(req.params.id);
      const { status } = req.body;

      // Only property owners, agents, builders, and admins can update status
      if (![UserRole.OWNER, UserRole.AGENT, UserRole.BUILDER, UserRole.ADMIN].includes(req.user.role)) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
          },
        });
        return;
      }

      const userId = req.user.role === UserRole.ADMIN ? undefined : req.user.id;
      const inquiry = await inquiryService.updateInquiryStatus(inquiryId, status, userId);

      res.json({
        success: true,
        data: {
          inquiry: {
            id: inquiry.id,
            status: inquiry.status,
            updated_at: new Date(),
          },
        },
        message: 'Inquiry status updated successfully',
      });
    } catch (error) {
      console.error('Update inquiry status error:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Inquiry not found') {
          res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: error.message,
            },
          });
          return;
        }
        
        if (error.message === 'Unauthorized to update this inquiry') {
          res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: error.message,
            },
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update inquiry status',
        },
      });
    }
  }

  async deleteInquiry(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid inquiry ID',
            details: errors.array(),
          },
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const inquiryId = parseInt(req.params.id);

      // Only property owners, agents, builders, and admins can delete inquiries
      if (![UserRole.OWNER, UserRole.AGENT, UserRole.BUILDER, UserRole.ADMIN].includes(req.user.role)) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
          },
        });
        return;
      }

      const userId = req.user.role === UserRole.ADMIN ? undefined : req.user.id;
      await inquiryService.deleteInquiry(inquiryId, userId);

      res.json({
        success: true,
        message: 'Inquiry deleted successfully',
      });
    } catch (error) {
      console.error('Delete inquiry error:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Inquiry not found') {
          res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: error.message,
            },
          });
          return;
        }
        
        if (error.message === 'Unauthorized to delete this inquiry') {
          res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: error.message,
            },
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete inquiry',
        },
      });
    }
  }

  async getInquiryStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const propertyId = req.query.property_id ? parseInt(req.query.property_id as string) : undefined;
      
      // Only allow property owners/agents/builders to get stats for their properties
      // Admins can get stats for any property
      if (propertyId && req.user.role !== UserRole.ADMIN) {
        // TODO: Add property ownership check here
      }

      const stats = await inquiryService.getInquiryStats(propertyId);

      res.json({
        success: true,
        data: {
          stats,
        },
      });
    } catch (error) {
      console.error('Get inquiry stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve inquiry statistics',
        },
      });
    }
  }
}

const inquiryController = new InquiryController();
export { InquiryController };
export default inquiryController;