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
  BeforeDestroy,
} from 'sequelize-typescript';
// Forward declarations to avoid circular imports
import fs from 'fs';
import path from 'path';

@Table({
  tableName: 'property_images',
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      fields: ['property_id'],
    },
    {
      fields: ['display_order'],
    },
  ],
})
export class PropertyImage extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  @Index
  property_id!: number;

  @AllowNull(false)
  @Column(DataType.STRING(500))
  image_url!: string;

  @Column(DataType.STRING(500))
  s3_key?: string;

  @Column(DataType.STRING(100))
  s3_bucket?: string;

  @Column(DataType.STRING(500))
  thumbnail_url?: string;

  @Column(DataType.STRING(500))
  medium_url?: string;

  @Column(DataType.STRING(500))
  large_url?: string;

  @Column(DataType.INTEGER)
  file_size?: number;

  @Column(DataType.STRING(50))
  mime_type?: string;

  @Column(DataType.INTEGER)
  width?: number;

  @Column(DataType.INTEGER)
  height?: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_primary!: boolean;

  @Column(DataType.STRING(255))
  alt_text?: string;

  @Default(0)
  @Column(DataType.INTEGER)
  @Index
  display_order!: number;

  @CreatedAt
  created_at!: Date;

  // Associations - will be defined in database configuration
  property!: any;

  // Instance methods
  get filename(): string {
    return path.basename(this.image_url);
  }

  get fullPath(): string {
    return path.resolve(this.image_url);
  }

  async deleteFile(): Promise<void> {
    try {
      if (fs.existsSync(this.fullPath)) {
        await fs.promises.unlink(this.fullPath);
      }
    } catch (error) {
      console.error(`Failed to delete image file: ${this.image_url}`, error);
    }
  }

  // Validation methods
  static validateImageUrl(url: string): boolean {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const extension = path.extname(url).toLowerCase();
    return allowedExtensions.includes(extension);
  }

  static validateDisplayOrder(order: number): boolean {
    return order >= 0 && order <= 100;
  }

  // Hooks
  @BeforeDestroy
  static async cleanupFile(instance: PropertyImage): Promise<void> {
    await instance.deleteFile();
  }

  // Static methods for bulk operations
  static async reorderImages(propertyId: number, imageIds: number[]): Promise<void> {
    const updates = imageIds.map((id, index) => ({
      id,
      display_order: index,
    }));

    for (const update of updates) {
      await PropertyImage.update(
        { display_order: update.display_order },
        { where: { id: update.id, property_id: propertyId } }
      );
    }
  }

  static async getMainImage(propertyId: number): Promise<PropertyImage | null> {
    return PropertyImage.findOne({
      where: { property_id: propertyId },
      order: [['display_order', 'ASC']],
    });
  }
}