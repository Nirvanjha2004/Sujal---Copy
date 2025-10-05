import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  CreatedAt,
  Index,
  Unique,
} from 'sequelize-typescript';
// Forward declarations to avoid circular imports

@Table({
  tableName: 'user_favorites',
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      fields: ['user_id'],
    },
    {
      fields: ['property_id'],
    },
    {
      fields: ['user_id', 'property_id'],
      unique: true,
      name: 'unique_user_property',
    },
  ],
})
export class UserFavorite extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  @Index
  user_id!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  @Index
  property_id!: number;

  @CreatedAt
  created_at!: Date;

  // Associations - will be defined in database configuration
  user!: any;
  property!: any;

  // Static methods for managing favorites
  static async addToFavorites(userId: number, propertyId: number): Promise<UserFavorite> {
    const [favorite, created] = await UserFavorite.findOrCreate({
      where: { user_id: userId, property_id: propertyId },
      defaults: { user_id: userId, property_id: propertyId },
    });

    if (!created) {
      throw new Error('Property is already in favorites');
    }

    return favorite;
  }

  static async removeFromFavorites(userId: number, propertyId: number): Promise<boolean> {
    const deletedCount = await UserFavorite.destroy({
      where: { user_id: userId, property_id: propertyId },
    });

    return deletedCount > 0;
  }

  static async isFavorite(userId: number, propertyId: number): Promise<boolean> {
    const favorite = await UserFavorite.findOne({
      where: { user_id: userId, property_id: propertyId },
    });

    return !!favorite;
  }

  static async getUserFavorites(userId: number, options?: {
    limit?: number;
    offset?: number;
    includeProperty?: boolean;
  }): Promise<UserFavorite[]> {
    const queryOptions: any = {
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    };

    if (options?.limit) {
      queryOptions.limit = options.limit;
    }

    if (options?.offset) {
      queryOptions.offset = options.offset;
    }

    if (options?.includeProperty) {
      queryOptions.include = [
        {
          association: 'property',
          include: [
            {
              association: 'user',
              attributes: ['id', 'first_name', 'last_name', 'role'],
            },
          ],
        },
      ];
    }

    return UserFavorite.findAll(queryOptions);
  }

  static async getFavoriteCount(userId: number): Promise<number> {
    return UserFavorite.count({
      where: { user_id: userId },
    });
  }

  static async getPropertyFavoriteCount(propertyId: number): Promise<number> {
    return UserFavorite.count({
      where: { property_id: propertyId },
    });
  }

  static async clearUserFavorites(userId: number): Promise<number> {
    return UserFavorite.destroy({
      where: { user_id: userId },
    });
  }

  // Instance methods
  get formattedCreatedAt(): string {
    return this.created_at.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}