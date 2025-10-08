import { Message, MessageStatus } from '../models/Message';
import { User } from '../models/User';
import { Property } from '../models/Property';
import { Inquiry } from '../models/Inquiry';
import { Op } from 'sequelize';

export interface CreateMessageData {
  sender_id: number;
  recipient_id: number;
  content: string;
  property_id?: number;
  inquiry_id?: number;
}

export interface ConversationFilters {
  user_id: number;
  property_id?: number;
  unread_only?: boolean;
}

export interface MessageFilters {
  conversation_id: string;
  user_id: number;
  unread_only?: boolean;
}

export interface MessageListOptions {
  page?: number;
  limit?: number;
  sort?: 'created_at';
  order?: 'ASC' | 'DESC';
}

export interface Conversation {
  conversation_id: string;
  participant: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_image?: string;
  };
  property?: {
    id: number;
    title: string;
  };
  last_message: {
    content: string;
    created_at: Date;
    sender_id: number;
  };
  unread_count: number;
  total_messages: number;
}

class MessagingService {
  async sendMessage(data: CreateMessageData): Promise<Message> {
    // Validate that sender and recipient exist
    const [sender, recipient] = await Promise.all([
      User.findByPk(data.sender_id),
      User.findByPk(data.recipient_id),
    ]);

    if (!sender) {
      throw new Error('Sender not found');
    }

    if (!recipient) {
      throw new Error('Recipient not found');
    }

    // Validate property if provided
    if (data.property_id) {
      const property = await Property.findByPk(data.property_id);
      if (!property) {
        throw new Error('Property not found');
      }
    }

    // Validate inquiry if provided
    if (data.inquiry_id) {
      const inquiry = await Inquiry.findByPk(data.inquiry_id);
      if (!inquiry) {
        throw new Error('Inquiry not found');
      }
    }

    // Generate conversation ID
    const conversation_id = Message.generateConversationId(
      data.sender_id,
      data.recipient_id,
      data.property_id
    );

    // Create the message
    const message = await Message.create({
      ...data,
      conversation_id,
    });

    // Load the created message with associations
    const createdMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title'],
          required: false,
        },
        {
          model: Inquiry,
          as: 'inquiry',
          attributes: ['id', 'message'],
          required: false,
        },
      ],
    });

    if (!createdMessage) {
      throw new Error('Failed to create message');
    }

    return createdMessage;
  }

  async getMessages(
    filters: MessageFilters,
    options: MessageListOptions = {}
  ): Promise<{ messages: Message[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 20, sort = 'created_at', order = 'ASC' } = options;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      conversation_id: filters.conversation_id,
      [Op.or]: [
        { sender_id: filters.user_id },
        { recipient_id: filters.user_id },
      ],
    };

    if (filters.unread_only) {
      whereClause.status = MessageStatus.SENT;
      whereClause.recipient_id = filters.user_id;
    }

    const { rows: messages, count: total } = await Message.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'email', 'profile_image'],
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'first_name', 'last_name', 'email', 'profile_image'],
        },
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title'],
          required: false,
        },
      ],
      order: [[sort, order]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      messages,
      total,
      page,
      totalPages,
    };
  }

  async getConversations(
    filters: ConversationFilters,
    options: MessageListOptions = {}
  ): Promise<{ conversations: Conversation[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    // Get all conversations for the user
    const conversationQuery = `
      SELECT DISTINCT 
        m.conversation_id,
        CASE 
          WHEN m.sender_id = ? THEN m.recipient_id 
          ELSE m.sender_id 
        END as participant_id,
        m.property_id,
        (SELECT content FROM messages m2 
         WHERE m2.conversation_id = m.conversation_id 
         ORDER BY m2.created_at DESC LIMIT 1) as last_message_content,
        (SELECT created_at FROM messages m2 
         WHERE m2.conversation_id = m.conversation_id 
         ORDER BY m2.created_at DESC LIMIT 1) as last_message_date,
        (SELECT sender_id FROM messages m2 
         WHERE m2.conversation_id = m.conversation_id 
         ORDER BY m2.created_at DESC LIMIT 1) as last_message_sender_id,
        (SELECT COUNT(*) FROM messages m2 
         WHERE m2.conversation_id = m.conversation_id 
         AND m2.recipient_id = ? 
         AND m2.status = 'sent') as unread_count,
        (SELECT COUNT(*) FROM messages m2 
         WHERE m2.conversation_id = m.conversation_id) as total_messages
      FROM messages m
      WHERE m.sender_id = ? OR m.recipient_id = ?
      ${filters.property_id ? 'AND m.property_id = ?' : ''}
      ${filters.unread_only ? 'AND EXISTS (SELECT 1 FROM messages m3 WHERE m3.conversation_id = m.conversation_id AND m3.recipient_id = ? AND m3.status = "sent")' : ''}
      ORDER BY last_message_date DESC
      LIMIT ? OFFSET ?
    `;

    const queryParams = [
      filters.user_id, // for participant_id calculation
      filters.user_id, // for unread_count
      filters.user_id, // for sender condition
      filters.user_id, // for recipient condition
    ];

    if (filters.property_id) {
      queryParams.push(filters.property_id);
    }

    if (filters.unread_only) {
      queryParams.push(filters.user_id);
    }

    queryParams.push(limit, offset);

    // This is a simplified approach - in a real implementation, you'd want to use Sequelize's query methods
    // For now, let's implement a simpler version using the ORM

    const conversations: Conversation[] = [];
    const conversationIds = new Set<string>();

    // Get recent messages for the user
    const recentMessages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: filters.user_id },
          { recipient_id: filters.user_id },
        ],
        ...(filters.property_id && { property_id: filters.property_id }),
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name', 'email', 'profile_image'],
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'first_name', 'last_name', 'email', 'profile_image'],
        },
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title'],
          required: false,
        },
      ],
      order: [['created_at', 'DESC']],
      limit: 100, // Get more messages to find unique conversations
    });

    // Group by conversation and get the latest message for each
    const conversationMap = new Map<string, any>();

    for (const message of recentMessages) {
      if (!conversationMap.has(message.conversation_id)) {
        const participant = message.sender_id === filters.user_id ? message.recipient : message.sender;
        
        conversationMap.set(message.conversation_id, {
          conversation_id: message.conversation_id,
          participant: {
            id: participant.id,
            first_name: participant.first_name,
            last_name: participant.last_name,
            email: participant.email,
            profile_image: participant.profile_image,
          },
          // property: message.property ? {
          //   id: message.property.id,
          //   title: message.property.title,
          // } : undefined,
          last_message: {
            content: message.content,
            created_at: message.created_at,
            sender_id: message.sender_id,
          },
          unread_count: 0,
          total_messages: 0,
        });
      }
    }

    // Get unread counts and total message counts for each conversation
    for (const [conversationId, conversation] of conversationMap) {
      const [unreadCount, totalCount] = await Promise.all([
        Message.count({
          where: {
            conversation_id: conversationId,
            recipient_id: filters.user_id,
            status: MessageStatus.SENT,
          },
        }),
        Message.count({
          where: {
            conversation_id: conversationId,
          },
        }),
      ]);

      conversation.unread_count = unreadCount;
      conversation.total_messages = totalCount;

      if (!filters.unread_only || unreadCount > 0) {
        conversations.push(conversation);
      }
    }

    // Apply pagination
    const total = conversations.length;
    const paginatedConversations = conversations.slice(offset, offset + limit);
    const totalPages = Math.ceil(total / limit);

    return {
      conversations: paginatedConversations,
      total,
      page,
      totalPages,
    };
  }

  async markMessagesAsRead(conversationId: string, userId: number): Promise<number> {
    const [updatedCount] = await Message.update(
      { 
        status: MessageStatus.READ,
        read_at: new Date(),
      },
      {
        where: {
          conversation_id: conversationId,
          recipient_id: userId,
          status: MessageStatus.SENT,
        },
      }
    );

    return updatedCount;
  }

  async deleteMessage(messageId: number, userId: number): Promise<void> {
    const message = await Message.findByPk(messageId);
    
    if (!message) {
      throw new Error('Message not found');
    }

    // Only sender can delete their own messages
    if (message.sender_id !== userId) {
      throw new Error('Unauthorized to delete this message');
    }

    await message.destroy();
  }

  async getUnreadCount(userId: number): Promise<number> {
    return await Message.getUnreadCount(userId);
  }

  async getConversationStats(conversationId: string): Promise<{
    total: number;
    unread: number;
    lastMessage?: Date;
  }> {
    return await Message.getConversationStats(conversationId);
  }

  async validateConversationAccess(conversationId: string, userId: number): Promise<boolean> {
    const message = await Message.findOne({
      where: {
        conversation_id: conversationId,
        [Op.or]: [
          { sender_id: userId },
          { recipient_id: userId },
        ],
      },
    });

    return !!message;
  }

  generateConversationId(userId1: number, userId2: number, propertyId?: number): string {
    return Message.generateConversationId(userId1, userId2, propertyId);
  }
}

export default new MessagingService();