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

@Table({
  tableName: 'seo_settings',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['page_type'],
      unique: false,
    },
    {
      fields: ['entity_type', 'entity_id'],
    },
  ],
})
export class SeoSettings extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM('property', 'page', 'global'),
    field: 'entity_type'
  })
  entityType!: 'property' | 'page' | 'global';

  @Column({
    type: DataType.INTEGER,
    field: 'entity_id'
  })
  entityId?: number;

  @Column({
    type: DataType.STRING(100),
    field: 'page_type'
  })
  pageType?: string;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_active'
  })
  isActive!: boolean;

  @Column(DataType.STRING(255))
  title?: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column(DataType.TEXT)
  keywords?: string;

  @Column({
    type: DataType.STRING(255),
    field: 'og_title'
  })
  ogTitle?: string;

  @Column({
    type: DataType.TEXT,
    field: 'og_description'
  })
  ogDescription?: string;

  @Column({
    type: DataType.STRING(500),
    field: 'og_image'
  })
  ogImage?: string;

  @Column({
    type: DataType.STRING(500),
    field: 'canonical_url'
  })
  canonicalUrl?: string;

  @Default('index,follow')
  @Column({
    type: DataType.STRING(100),
    field: 'meta_robots'
  })
  metaRobots!: string;

  @Column({
    type: DataType.JSON,
    field: 'schema_markup'
  })
  schemaMarkup?: object;

  @Column({
    type: DataType.JSON,
    field: 'custom_meta'
  })
  customMeta?: object;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at'
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updated_at'
  })
  updatedAt!: Date;
}

export default SeoSettings;
