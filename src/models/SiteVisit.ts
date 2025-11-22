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
  UpdatedAt,
  Index,
} from 'sequelize-typescript';

export enum SiteVisitStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

@Table({
  tableName: 'site_visits',
  timestamps: true,
  indexes: [
    {
      fields: ['property_id'],
    },
    {
      fields: ['visitor_id'],
    },
    {
      fields: ['scheduled_at'],
    },
  ],
})
export class SiteVisit extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  @Index
  property_id!: number;

  @Column(DataType.INTEGER)
  @Index
  visitor_id?: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  visitor_name!: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  visitor_email!: string;

  @Column(DataType.STRING(20))
  visitor_phone?: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  scheduled_at!: Date;

  @Default(SiteVisitStatus.SCHEDULED)
  @Column(DataType.ENUM(...Object.values(SiteVisitStatus)))
  status!: SiteVisitStatus;

  @Column(DataType.TEXT)
  notes?: string;

  @Column(DataType.TEXT)
  agent_notes?: string;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  // Associations - will be defined in associations.ts
  property!: any;
  visitor!: any;
}

export default SiteVisit;