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
  tableName: 'conversations',
  timestamps: true,
  indexes: [
    {
      fields: ['property_id'],
    },
  ],
})
export class Conversation extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  @Index
  property_id!: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  subject!: string;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  // Remove all decorator-based associations, they'll be defined in associations.ts
  property!: any;
  participants!: any[];
  users!: any[];
  inquiries!: any[];
}