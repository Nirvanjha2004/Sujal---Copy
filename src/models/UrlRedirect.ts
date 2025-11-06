import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Default, CreatedAt, UpdatedAt, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'url_redirects',
  timestamps: true,
  underscored: true,
})
export class UrlRedirect extends Model<UrlRedirect> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({ type: DataType.STRING(500), field: 'from_path' })
  fromPath!: string;

  @Column({ type: DataType.STRING(500), field: 'to_path' })
  toPath!: string;

  @Default(301)
  @Column({ type: DataType.INTEGER, field: 'status_code' })
  statusCode!: number;

  @Default(true)
  @Column({ type: DataType.BOOLEAN, field: 'is_active' })
  isActive!: boolean;

  @Column(DataType.STRING(255))
  description?: string;

  @Default(0)
  @Column({ type: DataType.INTEGER, field: 'hit_count' })
  hitCount!: number;

  @Column({ type: DataType.DATE, field: 'last_used' })
  lastUsed?: Date;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, field: 'created_by' })
  createdBy!: number;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt!: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt!: Date;

  // Associations
  @BelongsTo(() => User, 'createdBy')
  creator?: User;
}

export default UrlRedirect;