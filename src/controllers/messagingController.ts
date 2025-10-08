import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import messagingService, { CreateMessageData, ConversationFilters, MessageFilters } from '../services/messagingService';
import { UserRole } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: UserRole;
  };
}

class MessagingController {
  // Validation rules
  static sendMessageValidation = [
    body('recipient_id').isInt({ min: 1 }).withMessage('Valid recipient ID is required'),
    body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Message content must be between 1 and 2000 characters'),
    body('property_id').optional().isInt({ min: 1 }).withMessage('Valid property ID is required'),
    body('inquiry_id').optional().isInt({ min: 1 }).withMessage('Valid inquiry ID is required'),
  ];

  static getMessagesValidation = [
    param('conversationId').notEmpty().withMessage('Conversation ID is required'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('unread_only').optional().isBoolean().withMessage('unread_only must be a boolean'),
  ];

  static getConversationsValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('property_id').optional().isInt({ min: 1 }).withMessage('Valid property ID is required'),
    query('unread_only').optional().isBoolean().withMessage('unread_only must be a boolean'),
  ];

  static markAsReadValidation = [
    param('conversationId').notEmpty().withMessage('Conversation ID is required'),
  ];

  static deleteMessageValidation = [
    param('id').isInt({ min: 1 }).withMessage('Valid message ID is required'),
  ];

  async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const messageData: CreateMessageData = {
        sender_id: req.user.id,
        recipient_id: req.body.recipient_id,
        content: req.body.content,
        property_id: req.body.property_id,
        inquiry_id: req.body.inquiry_id,
      };

      // Prevent users from sending messages to themselves
      if (messageData.sender_id === messageData.recipient_id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Cannot send message to yourself',
          },
        });
        return;
      }

      const message = await messagingService.sendMessage(messageData);

      res.status(201).json({
        success: true,
        data: {
          message: {
            id: message.id,
            conversation_id: message.conversation_id,
            sender_id: message.sender_id,
            recipient_id: message.recipient_id,
            content: message.content,
            status: message.status,
            created_at: message.created_at,
            // property: message.property,
            // inquiry: message.inquiry,
          },
        },
        message: 'Message sent successfully',
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to send message',
        },
      });
    }
  }

  async getMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const conversationId = req.params.conversationId;

      // Validate that user has access to this conversation
      const hasAccess = await messagingService.validateConversationAccess(conversationId, req.user.id);
      if (!hasAccess) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied to this conversation',
          },
        });
        return;
      }

      const filters: MessageFilters = {
        conversation_id: conversationId,
        user_id: req.user.id,
        unread_only: req.query.unread_only === 'true',
      };

      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sort: 'created_at' as const,
        order: 'ASC' as const,
      };

      const result = await messagingService.getMessages(filters, options);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve messages',
        },
      });
    }
  }

  async getConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const filters: ConversationFilters = {
        user_id: req.user.id,
        property_id: req.query.property_id ? parseInt(req.query.property_id as string) : undefined,
        unread_only: req.query.unread_only === 'true',
      };

      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      const result = await messagingService.getConversations(filters, options);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve conversations',
        },
      });
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid conversation ID',
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

      const conversationId = req.params.conversationId;

      // Validate that user has access to this conversation
      const hasAccess = await messagingService.validateConversationAccess(conversationId, req.user.id);
      if (!hasAccess) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied to this conversation',
          },
        });
        return;
      }

      const updatedCount = await messagingService.markMessagesAsRead(conversationId, req.user.id);

      res.json({
        success: true,
        data: {
          updated_count: updatedCount,
        },
        message: 'Messages marked as read',
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to mark messages as read',
        },
      });
    }
  }

  async deleteMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid message ID',
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

      const messageId = parseInt(req.params.id);
      await messagingService.deleteMessage(messageId, req.user.id);

      res.json({
        success: true,
        message: 'Message deleted successfully',
      });
    } catch (error) {
      console.error('Delete message error:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Message not found') {
          res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: error.message,
            },
          });
          return;
        }
        
        if (error.message === 'Unauthorized to delete this message') {
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
          message: 'Failed to delete message',
        },
      });
    }
  }

  async getUnreadCount(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const unreadCount = await messagingService.getUnreadCount(req.user.id);

      res.json({
        success: true,
        data: {
          unread_count: unreadCount,
        },
      });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve unread count',
        },
      });
    }
  }

  async getConversationStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid conversation ID',
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

      const conversationId = req.params.conversationId;

      // Validate that user has access to this conversation
      const hasAccess = await messagingService.validateConversationAccess(conversationId, req.user.id);
      if (!hasAccess) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied to this conversation',
          },
        });
        return;
      }

      const stats = await messagingService.getConversationStats(conversationId);

      res.json({
        success: true,
        data: {
          stats,
        },
      });
    } catch (error) {
      console.error('Get conversation stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve conversation statistics',
        },
      });
    }
  }
}

const messagingController = new MessagingController();
export { MessagingController };
export default messagingController;