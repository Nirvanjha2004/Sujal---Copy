import { Request, Response } from 'express';
import { param, body, query, validationResult } from 'express-validator';
import { Conversation } from '../models/Conversation';
import { ConversationParticipant } from '../models/ConversationParticipant';
import { User } from '../models/User';
import { Property } from '../models/Property';
import { PropertyImage } from '../models/PropertyImage';
import { UserRole } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    id: number;
    email: string;
    role: UserRole;
  };
}

class ConversationController {
  // Validation rules
  static getConversationsValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ];

  static getConversationValidation = [
    param('id').isInt({ min: 1 }).withMessage('Valid conversation ID is required'),
  ];

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

      console.log('Fetching conversations for user:', req.user);

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      // Use userId (which seems to be the correct field based on your JWT)
      const userId = req.user.userId || req.user.id;

      console.log('Using userId:', userId);
      
      // First, get conversation IDs where user is a participant
      const participantConversations = await ConversationParticipant.findAll({
        where: { user_id: userId },
        attributes: ['conversation_id'],
      });

      const conversationIds = participantConversations.map(p => p.conversation_id);

      if (conversationIds.length === 0) {
        res.json({
          success: true,
          data: {
            conversations: [],
            total: 0,
            page,
            totalPages: 0,
          },
        });
        return;
      }

      // Get conversations with their details using correct aliases
      const { rows: conversations, count: total } = await Conversation.findAndCountAll({
        where: {
          id: conversationIds,
        },
        include: [
          {
            model: Property,
            as: 'property', // Use the alias defined in associations.ts
            attributes: ['id', 'title', 'price'], // Only select columns that definitely exist
            include: [
              {
                model: PropertyImage,
                as: 'images', // Include property images from the separate table
                attributes: ['id', 'image_url', 'alt_text'],
                required: false, // Left join - property might not have images
              },
            ],
          },
          {
            model: ConversationParticipant,
            as: 'participants', // Use the alias defined in associations.ts
            include: [
              {
                model: User,
                as: 'user', // Use the alias defined in associations.ts
                attributes: ['id', 'first_name', 'last_name', 'email'],
              },
            ],
          },
        ],
        order: [['updated_at', 'DESC']],
        limit,
        offset,
      });

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          conversations,
          total,
          page,
          totalPages,
        },
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

  async getConversationById(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const conversationId = parseInt(req.params.id);
      const userId = req.user.userId || req.user.id;

      // Check if user is a participant in this conversation
      const participant = await ConversationParticipant.findOne({
        where: {
          conversation_id: conversationId,
          user_id: userId,
        },
      });

      if (!participant) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied to this conversation',
          },
        });
        return;
      }

      // Get conversation with all details using correct aliases
      const conversation = await Conversation.findByPk(conversationId, {
        include: [
          {
            model: Property,
            as: 'property', // Use the alias defined in associations.ts
            attributes: ['id', 'title', 'price'], // Only select columns that definitely exist
            include: [
              {
                model: PropertyImage,
                as: 'images', // Include property images from the separate table
                attributes: ['id', 'image_url', 'alt_text', 'is_primary'],
                required: false, // Left join - property might not have images
              },
            ],
          },
          {
            model: ConversationParticipant,
            as: 'participants', // Use the alias defined in associations.ts
            include: [
              {
                model: User,
                as: 'user', // Use the alias defined in associations.ts
                attributes: ['id', 'first_name', 'last_name', 'email'],
              },
            ],
          },
        ],
      });

      if (!conversation) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Conversation not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          conversation,
        },
      });
    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve conversation',
        },
      });
    }
  }
}

const conversationController = new ConversationController();
export { ConversationController };
export default conversationController;