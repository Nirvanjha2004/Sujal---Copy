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
} from 'sequelize-typescript';

export enum CmsContentType {
  BANNER = 'banner',
  ANNOUNCEMENT = 'announcement', 
  PAGE = 'page',
  WIDGET = 'widget',
}

@Table({
  tableName: 'cms_content',
  timestamps: true,
})
export default class CmsContent extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(CmsContentType)))
  type!: CmsContentType;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  key!: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  title!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  content!: string;

  @Column(DataType.JSON)
  metadata?: object;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  @Default(0)
  @Column(DataType.INTEGER)
  displayOrder!: number;

  @Column(DataType.INTEGER)
  createdBy?: number;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  // Association declarations - will be defined in associations.ts
  creator!: any;
}
