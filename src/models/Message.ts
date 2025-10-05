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
} from 'sequelize-typescript';

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

@Table({
  tableName: 'messages',
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      fields: ['conversation_id'],
    },
    {
      fields: ['sender_id'],
    },
    {
      fields: ['recipient_id'],
    },
    {
      fields: ['created_at'],
    },
    {
      fields: ['status'],
    },
  ],
})
export class Message extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  @Index
  conversation_id!: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  @Index
  sender_id!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  @Index
  recipient_id!: number;

  @Column(DataType.INTEGER)
  property_id?: number;

  @Column(DataType.INTEGER)
  inquiry_id?: number;

  @AllowNull(false)
  @Column(DataType.TEXT)
  content!: string;

  @Default(MessageStatus.SENT)
  @Column(DataType.ENUM(...Object.values(MessageStatus)))
  @Index
  status!: MessageStatus;

  @Column(DataType.DATE)
  read_at?: Date;

  @CreatedAt
  created_at!: Date;

  // Associations - will be defined in database configuration
  sender!: any;
  recipient!: any;
  property?: any;
  inquiry?: any;

  // Instance methods
  async markAsRead(): Promise<void> {
    if (this.status !== MessageStatus.READ) {
      this.status = MessageStatus.READ;
      this.read_at = new Date();
      await this.save();
    }
  }

  async markAsDelivered(): Promise<void> {
    if (this.status === MessageStatus.SENT) {
      this.status = MessageStatus.DELIVERED;
      await this.save();
    }
  }

  get isRead(): boolean {
    return this.status === MessageStatus.READ;
  }

  get isDelivered(): boolean {
    return this.status === MessageStatus.DELIVERED || this.status === MessageStatus.READ;
  }

  get formattedCreatedAt(): string {
    return this.created_at.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Validation methods
  static validateContent(content: string): boolean {
    return content.trim().length >= 1 && content.trim().length <= 2000;
  }

  static generateConversationId(userId1: number, userId2: number, propertyId?: number): string {
    const sortedIds = [userId1, userId2].sort((a, b) => a - b);
    const baseId = `${sortedIds[0]}_${sortedIds[1]}`;
    return propertyId ? `${baseId}_${propertyId}` : baseId;
  }

  // Hooks
  @BeforeCreate
  @BeforeUpdate
  static validateMessageData(instance: Message): void {
    if (!Message.validateContent(instance.content)) {
      throw new Error('Message content must be between 1 and 2000 characters');
    }

    // Sanitize content
    instance.content = instance.content.trim();

    // Ensure sender and recipient are different
    if (instance.sender_id === instance.recipient_id) {
      throw new Error('Sender and recipient cannot be the same');
    }
  }

  // Static methods for analytics
  static async getUnreadCount(userId: number): Promise<number> {
    return await Message.count({
      where: {
        recipient_id: userId,
        status: MessageStatus.SENT,
      },
    });
  }

  static async getConversationStats(conversationId: string): Promise<{
    total: number;
    unread: number;
    lastMessage?: Date;
  }> {
    const [total, unread, lastMessage] = await Promise.all([
      Message.count({ where: { conversation_id: conversationId } }),
      Message.count({ 
        where: { 
          conversation_id: conversationId,
          status: MessageStatus.SENT,
        } 
      }),
      Message.findOne({
        where: { conversation_id: conversationId },
        order: [['created_at', 'DESC']],
        attributes: ['created_at'],
      }),
    ]);

    return {
      total,
      unread,
      lastMessage: lastMessage?.created_at,
    };
  }
}