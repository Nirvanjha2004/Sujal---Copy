import { Inquiry, InquiryStatus } from '../models/Inquiry';
import { User } from '../models/User';
import { Property } from '../models/Property';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { ConversationParticipant } from '../models/ConversationParticipant';
import sequelize from '../config/database';
import emailService, { InquiryEmailData } from './emailService';
import { Op, Transaction } from 'sequelize';

export interface CreateInquiryData {
  property_id: number;
  inquirer_id?: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  [key: string]: any;
}

export interface InquiryFilters {
  status?: InquiryStatus;
  property_id?: number;
  inquirer_id?: number;
  date_from?: Date;
  date_to?: Date;
}

export interface InquiryListOptions {
  page?: number;
  limit?: number;
  sort?: 'created_at' | 'status' | 'property_id';
  order?: 'ASC' | 'DESC';
}

export class InquiryService {
  public async createInquiry(data: {
    property_id: number;
    name: string;
    email: string;
    phone?: string;
    message: string;
    inquirer_id?: number;
  }): Promise<Inquiry> {
    const t = await sequelize.transaction();
    try {
      // 1. Find the property to get the owner
      const property = await Property.findByPk(data.property_id, { transaction: t });
      if (!property) {
        throw new Error('Property not found');
      }
      const ownerId = property.user_id;
      const inquirerId = data.inquirer_id;

      // 2. Find an existing Inquiry or prepare to create a new one
      let inquiry: Inquiry | null = null;

      // If the user is logged in, check for an existing inquiry by their ID
      if (inquirerId) {
        inquiry = await Inquiry.findOne({
          where: {
            property_id: data.property_id,
            inquirer_id: inquirerId,
          },
          transaction: t,
        });
      }

      // If no inquiry was found (or user is a guest), create a new one
      if (!inquiry) {
        inquiry = await Inquiry.create(data, { transaction: t });
      } else {
        // An inquiry already exists. We can optionally update its timestamp or status.
        // For now, we'll just proceed with the existing inquiry record.
        // You could add: inquiry.changed('updated_at', true); await inquiry.save({ transaction: t });
      }


      // 3. Find or create a conversation
      // Do not create a conversation if the inquirer is the owner
      if (inquirerId && ownerId && inquirerId !== ownerId) {
        let conversation: Conversation | null = null;

        // Find an existing conversation between these two users for this property
        const existingConversations = await Conversation.findAll({
          where: { property_id: data.property_id },
          include: [{
            model: ConversationParticipant,
            as: 'participants',
            attributes: ['user_id'],
          }],
          transaction: t,
        });

        for (const conv of existingConversations) {
          const participantIds = conv.participants.map(p => p.user_id);
          const hasBothParticipants = participantIds.includes(inquirerId) && participantIds.includes(ownerId);
          if (hasBothParticipants && participantIds.length === 2) {
            conversation = conv;
            break;
          }
        }

        // If no conversation exists, create a new one
        if (!conversation) {
          conversation = await Conversation.create(
            {
              property_id: data.property_id,
              subject: `Inquiry for: ${property.title}`,
            },
            { transaction: t }
          );

          // Add participants to the new conversation
          await ConversationParticipant.bulkCreate(
            [
              { conversation_id: conversation.id, user_id: inquirerId },
              { conversation_id: conversation.id, user_id: ownerId },
            ],
            { transaction: t }
          );
        }

        // Link the inquiry to the found or created conversation
        // This is important for both new and existing inquiries
        if (inquiry.conversation_id !== conversation.id) {
            await inquiry.update({ conversation_id: conversation.id }, { transaction: t });
        }

        // Add the new message to the conversation
        if (data.message) {
          await Message.create(
            {
              conversation_id: conversation.id,
              sender_id: inquirerId,
              recipient_id: ownerId,
              content: data.message,
            },
            { transaction: t }
          );
        }
      }

      await t.commit();
      return inquiry;
    } catch (error) {
      await t.rollback();
      console.error('Error in createInquiry service:', error);
      throw error;
    }
  }

  async getInquiries(
    filters: InquiryFilters = {},
    options: InquiryListOptions = {}
  ): Promise<{ inquiries: Inquiry[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, sort = 'created_at', order = 'DESC' } = options;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    
    if (filters.status) {
      whereClause.status = filters.status;
    }
    
    if (filters.property_id) {
      whereClause.property_id = filters.property_id;
    }
    
    if (filters.inquirer_id) {
      whereClause.inquirer_id = filters.inquirer_id;
    }
    
    if (filters.date_from || filters.date_to) {
      whereClause.created_at = {};
      if (filters.date_from) {
        whereClause.created_at[Op.gte] = filters.date_from;
      }
      if (filters.date_to) {
        whereClause.created_at[Op.lte] = filters.date_to;
      }
    }

    const { rows: inquiries, count: total } = await Inquiry.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'property_type', 'listing_type', 'price'],
        },
        {
          model: User,
          as: 'inquirer',
          attributes: ['id', 'first_name', 'last_name', 'email'],
          required: false,
        },
      ],
      order: [[sort, order]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      inquiries,
      total,
      page,
      totalPages,
    };
  }

  async getInquiryById(id: number): Promise<Inquiry | null> {
    return await Inquiry.findByPk(id, {
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'property_type', 'listing_type', 'price', 'user_id'],
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id', 'email', 'first_name', 'last_name'],
            },
          ],
        },
        {
          model: User,
          as: 'inquirer',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
          required: false,
        },
      ],
    });
  }

  async updateInquiryStatus(id: number, status: InquiryStatus, userId?: number): Promise<Inquiry> {
    const inquiry = await this.getInquiryById(id);
    
    if (!inquiry) {
      throw new Error('Inquiry not found');
    }

    // Check if user has permission to update this inquiry
    if (userId && inquiry.property?.user_id !== userId) {
      throw new Error('Unauthorized to update this inquiry');
    }

    inquiry.status = status;
    await inquiry.save();

    return inquiry;
  }

  async deleteInquiry(id: number, userId?: number): Promise<void> {
    const inquiry = await this.getInquiryById(id);
    
    if (!inquiry) {
      throw new Error('Inquiry not found');
    }

    // Check if user has permission to delete this inquiry
    if (userId && inquiry.property?.user_id !== userId) {
      throw new Error('Unauthorized to delete this inquiry');
    }

    await inquiry.destroy();
  }

  async getInquiriesForProperty(propertyId: number, options: InquiryListOptions = {}): Promise<{
    inquiries: Inquiry[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.getInquiries({ property_id: propertyId }, options);
  }

  async getInquiriesForUser(userId: number, options: InquiryListOptions = {}): Promise<{
    inquiries: Inquiry[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.getInquiries({ inquirer_id: userId }, options);
  }

  async getInquiriesForOwner(ownerId: number, options: InquiryListOptions = {}): Promise<{
    inquiries: Inquiry[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Validate ownerId
    if (!ownerId || isNaN(ownerId) || ownerId <= 0) {
      throw new Error('Invalid owner ID provided');
    }

    const { page = 1, limit = 10, sort = 'created_at', order = 'DESC' } = options;
    const offset = (page - 1) * limit;

    const { rows: inquiries, count: total } = await Inquiry.findAndCountAll({
      include: [
        {
          model: Property,
          as: 'property',
          where: { user_id: ownerId },
          attributes: ['id', 'title', 'property_type', 'listing_type', 'price'],
        },
        {
          model: User,
          as: 'inquirer',
          attributes: ['id', 'first_name', 'last_name', 'email'],
          required: false,
        },
      ],
      order: [[sort, order]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      inquiries,
      total,
      page,
      totalPages,
    };
  }

  async getInquiryStats(propertyId?: number): Promise<{
    total: number;
    new: number;
    contacted: number;
    closed: number;
  }> {
    return await Inquiry.getInquiryStats(propertyId);
  }

  private async sendInquiryNotifications(inquiry: Inquiry): Promise<void> {
    try {
      const property = inquiry.property;
      const owner = property?.user;

      if (!property || !owner) {
        console.error('Missing property or owner information for inquiry notification');
        return;
      }

      const emailData: InquiryEmailData = {
        propertyTitle: property.title,
        propertyId: property.id,
        inquirerName: inquiry.name,
        inquirerEmail: inquiry.email,
        inquirerPhone: inquiry.phone,
        message: inquiry.message,
        propertyOwnerName: `${owner.first_name} ${owner.last_name}`,
        propertyUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/properties/${property.id}`,
      };

      // Send notification to property owner
      await emailService.sendInquiryToOwner(owner.email, emailData);

      // Send confirmation to inquirer
      await emailService.sendInquiryNotification(emailData);

    } catch (error) {
      console.error('Failed to send inquiry notifications:', error);
      // Don't throw error here to avoid failing the inquiry creation
    }
  }

  async maskPhoneNumber(phoneNumber: string): Promise<string> {
    if (!phoneNumber) return '';
    
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    if (digits.length < 6) return phoneNumber; // Too short to mask meaningfully
    
    // Show first 2 and last 2 digits, mask the middle
    const firstPart = digits.slice(0, 2);
    const lastPart = digits.slice(-2);
    const middlePart = '*'.repeat(digits.length - 4);
    
    return `${firstPart}${middlePart}${lastPart}`;
  }

  async routeLead(inquiryId: number): Promise<void> {
    const inquiry = await this.getInquiryById(inquiryId);
    
    if (!inquiry) {
      throw new Error('Inquiry not found');
    }

    // Basic lead routing logic - can be enhanced based on business rules
    // For now, we'll just mark it as contacted and send notification
    if (inquiry.status === InquiryStatus.NEW) {
      await this.updateInquiryStatus(inquiryId, InquiryStatus.CONTACTED);
    }
  }
}

export default new InquiryService();