import { Request, Response } from 'express';
import { param, body, query, validationResult } from 'express-validator';
import { Message } from '../models/Message';
import { ConversationParticipant } from '../models/ConversationParticipant';
import { Conversation } from '../models/Conversation';
import { User } from '../models/User';
import { UserRole } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: UserRole;
  };
}

class MessageController {
  static getMessagesValidation = [
    param('conversationId').isInt({ min: 1 }).withMessage('Valid conversation ID is required'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ];

  static sendMessageValidation = [
    param('conversationId').isInt({ min: 1 }).withMessage('Valid conversation ID is required'),
    body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message content must be between 1 and 1000 characters'),
  ];

  async getMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid parameters',
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

      const conversationId = parseInt(req.params.conversationId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      // Use consistent user ID field
      const userId = req.user.userId;

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

      // Get messages for this conversation using correct alias
      const { rows: messages, count: total } = await Message.findAndCountAll({
        where: {
          conversation_id: conversationId.toString(),
        },
        include: [
          {
            model: User,
            as: 'sender', // Use the alias defined in associations.ts
            attributes: ['id', 'first_name', 'last_name', 'email'],
          },
        ],
        order: [['created_at', 'ASC']],
        limit,
        offset,
      });

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          messages,
          total,
          page,
          totalPages,
        },
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

      const conversationId = parseInt(req.params.conversationId);
      const { content } = req.body;

      // Use consistent user ID field
      const userId = req.user.userId;

      console.log('Sending message:', { conversationId, userId, content });

      // Get conversation details to extract property_id
      const conversation = await Conversation.findByPk(conversationId, {
        attributes: ['id', 'property_id'],
        include: [
          {
            model: require('../models/Inquiry').Inquiry,
            as: 'relatedInquiries',
            attributes: ['id'],
            limit: 1, // Get the first related inquiry if any
            required: false,
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

      // Check if user is a participant in this conversation
      const participants = await ConversationParticipant.findAll({
        where: {
          conversation_id: conversationId,
        },
      });

      console.log('Found participants:', participants.map(p => ({ id: p.id, user_id: p.user_id })));

      const userParticipant = participants.find(p => p.user_id === userId);
      if (!userParticipant) {
        console.log('User not found as participant:', { userId, participantIds: participants.map(p => p.user_id) });
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Access denied to this conversation',
          },
        });
        return;
      }

      // Find the recipient (other participant)
      const recipientParticipant = participants.find(p => p.user_id !== userId);
      if (!recipientParticipant) {
        res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'No recipient found in conversation',
          },
        });
        return;
      }

    //   // Get the inquiry_id if there are related inquiries
    //   const inquiryId = conversation.relatedInquiries && conversation.relatedInquiries.length > 0 
    //     ? conversation.relatedInquiries[0].id 
    //     : null;

      // Create the message with property_id and inquiry_id
      const message = await Message.create({
        conversation_id: conversationId.toString(),
        sender_id: userId,
        recipient_id: recipientParticipant.user_id,
        property_id: conversation.property_id, // Add property_id from conversation
        content,
      });

      // Load the created message with sender details using correct alias
      const createdMessage = await Message.findByPk(message.id, {
        include: [
          {
            model: User,
            as: 'sender', // Use the alias defined in associations.ts
            attributes: ['id', 'first_name', 'last_name', 'email'],
          },
        ],
      });

      console.log('Message created successfully:', {
        messageId: message.id,
        conversationId,
        propertyId: conversation.property_id,
        senderId: userId,
        recipientId: recipientParticipant.user_id,
      });

      res.status(201).json({
        success: true,
        data: {
          message: createdMessage,
        },
        message: 'Message sent successfully',
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to send message',
        },
      });
    }
  }
}

const messageController = new MessageController();
export { MessageController };
export default messageController;