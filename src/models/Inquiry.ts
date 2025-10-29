import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  CreatedAt,
  Index,
  BeforeCreate,
  BeforeUpdate,
  ForeignKey,
} from 'sequelize-typescript';

export enum InquiryStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  CLOSED = 'closed',
}

@Table({
  tableName: 'inquiries',
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      fields: ['property_id'],
    },
    // TODO: Add back after running migration
    // {
    //   fields: ['project_id'],
    // },
    {
      fields: ['inquirer_id'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['created_at'],
    },
    {
      fields: ['conversation_id'],
    },
  ],
})
export class Inquiry extends Model {
  [x: string]: any;
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column(DataType.INTEGER)
  @Index
  property_id?: number;

  // TODO: Uncomment after running migration
  @Column(DataType.INTEGER)
  @Index
  project_id?: number;

  @Column(DataType.INTEGER)
  @Index
  inquirer_id?: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  name!: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  email!: string;

  @Column(DataType.STRING(20))
  phone?: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  message!: string;

  @Default(InquiryStatus.NEW)
  @Column(DataType.ENUM(...Object.values(InquiryStatus)))
  @Index
  status!: InquiryStatus;

  @Column(DataType.INTEGER)
  @Index
  conversation_id?: number;

  @CreatedAt
  created_at!: Date;

  // Remove all decorator-based associations, they'll be defined in associations.ts
  property?: any;
  project?: any;
  inquirer?: any;
  conversation?: any;

  // Instance methods
  async markAsContacted(): Promise<void> {
    this.status = InquiryStatus.CONTACTED;
    await this.save();
  }

  async markAsClosed(): Promise<void> {
    this.status = InquiryStatus.CLOSED;
    await this.save();
  }

  get isNew(): boolean {
    return this.status === InquiryStatus.NEW;
  }

  get isContacted(): boolean {
    return this.status === InquiryStatus.CONTACTED;
  }

  get isClosed(): boolean {
    return this.status === InquiryStatus.CLOSED;
  }

  get formattedCreatedAt(): string {
    return this.created_at.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Validation methods
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  static validateMessage(message: string): boolean {
    return message.trim().length >= 10 && message.trim().length <= 1000;
  }

  static validateName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 100;
  }

  // Hooks
  @BeforeCreate
  @BeforeUpdate
  static validateInquiryData(instance: Inquiry): void {
    // Validate that either property_id or project_id is provided, but not both
    if (!instance.property_id && !instance.project_id) {
      throw new Error('Either property_id or project_id must be provided');
    }

    if (instance.property_id && instance.project_id) {
      throw new Error('Cannot provide both property_id and project_id');
    }

    if (!Inquiry.validateEmail(instance.email)) {
      throw new Error('Invalid email format');
    }

    if (!Inquiry.validateName(instance.name)) {
      throw new Error('Name must be between 2 and 100 characters');
    }

    if (!Inquiry.validateMessage(instance.message)) {
      throw new Error('Message must be between 10 and 1000 characters');
    }

    if (instance.phone && !Inquiry.validatePhone(instance.phone)) {
      throw new Error('Invalid phone number format');
    }

    // Sanitize inputs
    instance.name = instance.name.trim();
    instance.email = instance.email.trim().toLowerCase();
    instance.message = instance.message.trim();
    if (instance.phone) {
      instance.phone = instance.phone.trim();
    }
  }

  // Helper methods
  get isPropertyInquiry(): boolean {
    return !!this.property_id;
  }

  get isProjectInquiry(): boolean {
    return !!this.project_id;
  }

  get inquiryType(): 'property' | 'project' {
    return this.property_id ? 'property' : 'project';
  }

  // Static methods for analytics
  static async getInquiryStats(propertyId?: number, projectId?: number): Promise<{
    total: number;
    new: number;
    contacted: number;
    closed: number;
  }> {
    let whereClause = {};
    
    if (propertyId) {
      whereClause = { property_id: propertyId };
    } else if (projectId) {
      whereClause = { project_id: projectId };
    }

    const [total, newCount, contactedCount, closedCount] = await Promise.all([
      Inquiry.count({ where: whereClause }),
      Inquiry.count({ where: { ...whereClause, status: InquiryStatus.NEW } }),
      Inquiry.count({ where: { ...whereClause, status: InquiryStatus.CONTACTED } }),
      Inquiry.count({ where: { ...whereClause, status: InquiryStatus.CLOSED } }),
    ]);

    return {
      total,
      new: newCount,
      contacted: contactedCount,
      closed: closedCount,
    };
  }

  // Get inquiries for a builder's projects
  static async getBuilderInquiryStats(builderId: number): Promise<{
    total: number;
    new: number;
    contacted: number;
    closed: number;
    propertyInquiries: number;
    projectInquiries: number;
  }> {
    // This will be implemented after we add the associations
    const [total, newCount, contactedCount, closedCount, propertyInquiries, projectInquiries] = await Promise.all([
      Inquiry.count({
        include: [
          { model: require('./Property').Property, where: { user_id: builderId }, required: false },
          { model: require('./Project').Project, where: { builder_id: builderId }, required: false }
        ]
      }),
      Inquiry.count({
        where: { status: InquiryStatus.NEW },
        include: [
          { model: require('./Property').Property, where: { user_id: builderId }, required: false },
          { model: require('./Project').Project, where: { builder_id: builderId }, required: false }
        ]
      }),
      Inquiry.count({
        where: { status: InquiryStatus.CONTACTED },
        include: [
          { model: require('./Property').Property, where: { user_id: builderId }, required: false },
          { model: require('./Project').Project, where: { builder_id: builderId }, required: false }
        ]
      }),
      Inquiry.count({
        where: { status: InquiryStatus.CLOSED },
        include: [
          { model: require('./Property').Property, where: { user_id: builderId }, required: false },
          { model: require('./Project').Project, where: { builder_id: builderId }, required: false }
        ]
      }),
      Inquiry.count({
        where: { property_id: { [require('sequelize').Op.ne]: null } },
        include: [{ model: require('./Property').Property, where: { user_id: builderId } }]
      }),
      Inquiry.count({
        where: { project_id: { [require('sequelize').Op.ne]: null } },
        include: [{ model: require('./Project').Project, where: { builder_id: builderId } }]
      })
    ]);

    return {
      total,
      new: newCount,
      contacted: contactedCount,
      closed: closedCount,
      propertyInquiries,
      projectInquiries,
    };
  }
}