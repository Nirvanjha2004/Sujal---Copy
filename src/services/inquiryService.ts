import { Inquiry, InquiryStatus } from '../models/Inquiry';
import { User } from '../models/User';
import { Property } from '../models/Property';
import { Conversation } from '../models/Conversation'; // Make sure this import is present
import { ConversationParticipant } from '../models/ConversationParticipant'; // Make sure this import is present
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

class InquiryService {
  async createInquiry(data: CreateInquiryData, options?: { transaction: Transaction }): Promise<Inquiry> {
    // Validate that property exists
    const property = await Property.findByPk(data.property_id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'email', 'first_name', 'last_name'],
        },
      ],
      transaction: options?.transaction, // Pass transaction to findByPk
    });

    if (!property) {
      throw new Error('Property not found');
    }

    // Create the inquiry
    const inquiry = await Inquiry.create({
      property_id: data.property_id,
      inquirer_id: data.inquirer_id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
    }, { transaction: options?.transaction });

    // --- START: Create Conversation Logic ---

    // 3. Create a new conversation
    const conversation = await Conversation.create({
      property_id: property.id,
      subject: `Inquiry for: ${property.title}`,
    }, { transaction: options?.transaction });

    // 4. Add the property owner and the inquirer as participants
    const ownerId = property.user_id;
    console.log("The data is", data)
    const inquirerId = data.inquirer_id; // This is the logged-in user's ID

    if (!inquirerId) {
      throw new Error('Authenticated user ID is required to create a conversation.');
    }

    await ConversationParticipant.bulkCreate([
      { conversation_id: conversation.id, user_id: ownerId },
      { conversation_id: conversation.id, user_id: inquirerId },
    ], { transaction: options?.transaction });

    // 5. Link the conversation to the inquiry
    inquiry.conversation_id = conversation.id;
    await inquiry.save({ transaction: options?.transaction });

    // --- END: Create Conversation Logic ---

    console.log('The Inquiry logs are', inquiry);

    // Load the created inquiry with associations
    const createdInquiry = await Inquiry.findByPk(inquiry.id, {
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'user_id'],
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
          attributes: ['id', 'email', 'first_name', 'last_name'],
          required: false,
        },
      ],
      transaction: options?.transaction, // Pass transaction here as well
    });

    console.log('The CreatedInquiry logs are', createdInquiry);

    if (!createdInquiry) {
      throw new Error('Failed to create inquiry');
    }

    // Send email notifications
    // await this.sendInquiryNotifications(createdInquiry);

    return createdInquiry;
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