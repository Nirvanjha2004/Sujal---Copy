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
} from 'sequelize-typescript';

@Table({
  tableName: 'conversation_participants',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['conversation_id', 'user_id'],
    },
  ],
})
export class ConversationParticipant extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  @Index
  conversation_id!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  @Index
  user_id!: number;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  // Remove all decorator-based associations, they'll be defined in associations.ts
  conversation!: any;
  user!: any;
}