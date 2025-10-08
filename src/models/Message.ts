import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  Index,
  Default,
} from 'sequelize-typescript';

export enum MessageStatus {
  SENT = 'sent',
  READ = 'read',
}

@Table({
  tableName: 'messages',
  timestamps: true,
})
export class Message extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Column(DataType.STRING)
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

  @AllowNull(false)
  @Column(DataType.TEXT)
  content!: string;

  @Default(MessageStatus.SENT)
  @Column(DataType.ENUM(...Object.values(MessageStatus)))
  status!: MessageStatus;

  @Column(DataType.DATE)
  read_at?: Date;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  // Associations
  sender!: any;
  recipient!: any;

  static generateConversationId(userId1: number, userId2: number, propertyId?: number): string {
    const sortedIds = [userId1, userId2].sort();
    return propertyId 
      ? `${sortedIds[0]}-${sortedIds[1]}-${propertyId}`
      : `${sortedIds[0]}-${sortedIds[1]}`;
  }

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
    const total = await Message.count({
      where: { conversation_id: conversationId },
    });

    const unread = await Message.count({
      where: {
        conversation_id: conversationId,
        status: MessageStatus.SENT,
      },
    });

    const lastMessage = await Message.findOne({
      where: { conversation_id: conversationId },
      order: [['created_at', 'DESC']],
      attributes: ['created_at'],
    });

    return {
      total,
      unread,
      lastMessage: lastMessage?.created_at,
    };
  }
}