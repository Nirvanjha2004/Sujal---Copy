import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Default, CreatedAt, UpdatedAt, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { User } from './User';
import { Property } from './Property';

@Table({
  tableName: 'reviews',
  timestamps: true,
})
export class Review extends Model<Review> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => Property)
  @Column({ type: DataType.INTEGER, field: 'property_id' })
  propertyId!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, field: 'user_id' })
  userId!: number;

  @Column({ type: DataType.INTEGER, validate: { min: 1, max: 5 } })
  rating!: number;

  @Column({ type: DataType.STRING(255) })
  title!: string;

  @Column(DataType.TEXT)
  content!: string;

  @Default(false)
  @Column({ type: DataType.BOOLEAN, field: 'is_verified' })
  isVerified!: boolean;

  @Default(false)
  @Column({ type: DataType.BOOLEAN, field: 'is_approved' })
  isApproved!: boolean;

  @Default('pending')
  @Column({ 
    type: DataType.ENUM('pending', 'approved', 'rejected'), 
    field: 'moderation_status' 
  })
  moderationStatus!: 'pending' | 'approved' | 'rejected';

  @Column({ type: DataType.TEXT, field: 'moderation_notes' })
  moderationNotes?: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, field: 'moderated_by' })
  moderatedBy?: number;

  @Column({ type: DataType.DATE, field: 'moderated_at' })
  moderatedAt?: Date;

  @Default(0)
  @Column({ type: DataType.INTEGER, field: 'helpful_count' })
  helpfulCount!: number;

  @Default(0)
  @Column({ type: DataType.INTEGER, field: 'report_count' })
  reportCount!: number;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt!: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt!: Date;

  // Associations
  @BelongsTo(() => Property, 'propertyId')
  property?: Property;

  @BelongsTo(() => User, 'userId')
  reviewer?: User;

  @BelongsTo(() => User, 'moderatedBy')
  moderator?: User;
}

export default Review;