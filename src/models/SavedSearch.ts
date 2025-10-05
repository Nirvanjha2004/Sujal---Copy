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
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
// Forward declarations to avoid circular imports
import { PropertyType, ListingType } from './Property';

export interface SearchCriteria {
  property_type?: PropertyType[];
  listing_type?: ListingType;
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  bedrooms?: number[];
  bathrooms?: number[];
  city?: string[];
  state?: string;
  amenities?: string[];
  keywords?: string;
  radius?: number;
  latitude?: number;
  longitude?: number;
  [key: string]: any;
}

@Table({
  tableName: 'saved_searches',
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      fields: ['user_id'],
    },
    {
      fields: ['created_at'],
    },
  ],
})
export class SavedSearch extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  @Index
  user_id!: number;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  search_name!: string;

  @AllowNull(false)
  @Column(DataType.JSON)
  search_criteria!: SearchCriteria;

  @CreatedAt
  created_at!: Date;

  // Associations - will be defined in database configuration
  user!: any;

  // Instance methods
  get formattedCreatedAt(): string {
    return this.created_at.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  get searchSummary(): string {
    const criteria = this.search_criteria;
    const parts: string[] = [];

    if (criteria.property_type?.length) {
      parts.push(`Type: ${criteria.property_type.join(', ')}`);
    }

    if (criteria.listing_type) {
      parts.push(`For: ${criteria.listing_type}`);
    }

    if (criteria.min_price || criteria.max_price) {
      const priceRange = [
        criteria.min_price ? `₹${criteria.min_price.toLocaleString()}` : '',
        criteria.max_price ? `₹${criteria.max_price.toLocaleString()}` : '',
      ].filter(Boolean).join(' - ');
      parts.push(`Price: ${priceRange}`);
    }

    if (criteria.city?.length) {
      parts.push(`City: ${criteria.city.join(', ')}`);
    }

    if (criteria.bedrooms?.length) {
      parts.push(`Bedrooms: ${criteria.bedrooms.join(', ')}`);
    }

    return parts.join(' | ') || 'All properties';
  }

  async updateCriteria(newCriteria: Partial<SearchCriteria>): Promise<void> {
    this.search_criteria = { ...this.search_criteria, ...newCriteria };
    await this.save();
  }

  // Validation methods
  static validateSearchName(name: string): boolean {
    return name.trim().length >= 3 && name.trim().length <= 100;
  }

  static validateSearchCriteria(criteria: SearchCriteria): boolean {
    // At least one search criterion should be provided
    const hasValidCriteria = Object.keys(criteria).some(key => {
      const value = criteria[key];
      return value !== undefined && value !== null && value !== '';
    });

    if (!hasValidCriteria) {
      return false;
    }

    // Validate price range
    if (criteria.min_price && criteria.max_price) {
      if (criteria.min_price >= criteria.max_price) {
        return false;
      }
    }

    // Validate area range
    if (criteria.min_area && criteria.max_area) {
      if (criteria.min_area >= criteria.max_area) {
        return false;
      }
    }

    // Validate coordinates if radius is provided
    if (criteria.radius && (!criteria.latitude || !criteria.longitude)) {
      return false;
    }

    return true;
  }

  // Hooks
  @BeforeCreate
  @BeforeUpdate
  static validateSavedSearchData(instance: SavedSearch): void {
    if (!SavedSearch.validateSearchName(instance.search_name)) {
      throw new Error('Search name must be between 3 and 100 characters');
    }

    if (!SavedSearch.validateSearchCriteria(instance.search_criteria)) {
      throw new Error('Invalid search criteria');
    }

    // Sanitize search name
    instance.search_name = instance.search_name.trim();
  }

  // Static methods for managing saved searches
  static async getUserSavedSearches(userId: number, options?: {
    limit?: number;
    offset?: number;
  }): Promise<SavedSearch[]> {
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

    return SavedSearch.findAll(queryOptions);
  }

  static async getSavedSearchCount(userId: number): Promise<number> {
    return SavedSearch.count({
      where: { user_id: userId },
    });
  }

  static async createSavedSearch(
    userId: number,
    searchName: string,
    searchCriteria: SearchCriteria
  ): Promise<SavedSearch> {
    return SavedSearch.create({
      user_id: userId,
      search_name: searchName,
      search_criteria: searchCriteria,
    });
  }

  static async updateSavedSearch(
    id: number,
    userId: number,
    updates: {
      search_name?: string;
      search_criteria?: SearchCriteria;
    }
  ): Promise<SavedSearch | null> {
    const savedSearch = await SavedSearch.findOne({
      where: { id, user_id: userId },
    });

    if (!savedSearch) {
      return null;
    }

    if (updates.search_name) {
      savedSearch.search_name = updates.search_name;
    }

    if (updates.search_criteria) {
      savedSearch.search_criteria = updates.search_criteria;
    }

    await savedSearch.save();
    return savedSearch;
  }

  static async deleteSavedSearch(id: number, userId: number): Promise<boolean> {
    const deletedCount = await SavedSearch.destroy({
      where: { id, user_id: userId },
    });

    return deletedCount > 0;
  }
}