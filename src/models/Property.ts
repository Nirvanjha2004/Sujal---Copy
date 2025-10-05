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
  BeforeCreate,
  BeforeUpdate,
  HasMany,
} from 'sequelize-typescript';
// Forward declarations to avoid circular imports

export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  COMMERCIAL = 'commercial',
  LAND = 'land',
}

export enum ListingType {
  SALE = 'sale',
  RENT = 'rent',
}

export enum PropertyStatus {
  NEW = 'new',
  RESALE = 'resale',
  UNDER_CONSTRUCTION = 'under_construction',
}

export interface PropertyAmenities {
  parking?: boolean;
  gym?: boolean;
  swimming_pool?: boolean;
  garden?: boolean;
  security?: boolean;
  elevator?: boolean;
  power_backup?: boolean;
  water_supply?: boolean;
  internet?: boolean;
  air_conditioning?: boolean;
  furnished?: boolean;
  pet_friendly?: boolean;
  balcony?: boolean;
  terrace?: boolean;
  club_house?: boolean;
  playground?: boolean;
  [key: string]: boolean | undefined;
}

@Table({
  tableName: 'properties',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id'],
    },
    {
      fields: ['property_type'],
    },
    {
      fields: ['listing_type'],
    },
    {
      fields: ['city'],
    },
    {
      fields: ['price'],
    },
    {
      fields: ['latitude', 'longitude'],
    },
    {
      fields: ['is_active'],
    },
    {
      fields: ['is_featured'],
    },
  ],
})
export class Property extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  user_id!: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  title!: string;

  @Column(DataType.TEXT)
  description?: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(PropertyType)))
  property_type!: PropertyType;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(ListingType)))
  listing_type!: ListingType;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(PropertyStatus)))
  status!: PropertyStatus;

  @AllowNull(false)
  @Column(DataType.DECIMAL(15, 2))
  price!: number;

  @Column(DataType.INTEGER)
  area_sqft?: number;

  @Column(DataType.INTEGER)
  bedrooms?: number;

  @Column(DataType.INTEGER)
  bathrooms?: number;

  @AllowNull(false)
  @Column(DataType.TEXT)
  address!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  city!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  state!: string;

  @Column(DataType.STRING(20))
  postal_code?: string;

  @Column(DataType.DECIMAL(10, 8))
  latitude?: number;

  @Column(DataType.DECIMAL(11, 8))
  longitude?: number;

  @Column(DataType.JSON)
  amenities?: PropertyAmenities;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_featured!: boolean;

  @Default(true)
  @Column(DataType.BOOLEAN)
  is_active!: boolean;

  @Default(0)
  @Column(DataType.INTEGER)
  views_count!: number;

  @Column(DataType.DATE)
  expires_at?: Date;

  @Default(false)
  @Column(DataType.BOOLEAN)
  auto_renew!: boolean;

  @Default(30)
  @Column(DataType.INTEGER)
  renewal_period_days!: number;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  // Associations - will be defined in database configuration
  user!: any;
  images!: any[];
  inquiries!: any[];
  favorites!: any[];



  // Instance methods
  async incrementViews(): Promise<void> {
    await this.increment('views_count');
  }

  get formattedPrice(): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(this.price);
  }

  get pricePerSqft(): number | null {
    if (!this.area_sqft || this.area_sqft === 0) return null;
    return Math.round(this.price / this.area_sqft);
  }

  get isExpired(): boolean {
    if (!this.expires_at) return false;
    return new Date() > this.expires_at;
  }

  get daysUntilExpiration(): number | null {
    if (!this.expires_at) return null;
    const now = new Date();
    const expiration = new Date(this.expires_at);
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  async extendExpiration(days: number = 30): Promise<void> {
    const newExpirationDate = new Date();
    newExpirationDate.setDate(newExpirationDate.getDate() + days);
    await this.update({ expires_at: newExpirationDate });
  }

  async renewListing(): Promise<void> {
    if (this.auto_renew && this.renewal_period_days) {
      await this.extendExpiration(this.renewal_period_days);
    }
  }

  // Validation methods
  static validatePrice(price: number): boolean {
    return price > 0 && price <= 999999999999999;
  }

  static validateArea(area: number): boolean {
    return area > 0 && area <= 100000;
  }

  static validateBedrooms(bedrooms: number): boolean {
    return bedrooms >= 0 && bedrooms <= 20;
  }

  static validateBathrooms(bathrooms: number): boolean {
    return bathrooms >= 0 && bathrooms <= 20;
  }

  static validateCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  // Hooks
  @BeforeCreate
  @BeforeUpdate
  static validatePropertyData(instance: Property): void {
    if (instance.price && !Property.validatePrice(instance.price)) {
      throw new Error('Invalid price value');
    }

    if (instance.area_sqft && !Property.validateArea(instance.area_sqft)) {
      throw new Error('Invalid area value');
    }

    if (instance.bedrooms !== undefined && !Property.validateBedrooms(instance.bedrooms)) {
      throw new Error('Invalid bedrooms count');
    }

    if (instance.bathrooms !== undefined && !Property.validateBathrooms(instance.bathrooms)) {
      throw new Error('Invalid bathrooms count');
    }

    if (instance.latitude && instance.longitude) {
      if (!Property.validateCoordinates(instance.latitude, instance.longitude)) {
        throw new Error('Invalid coordinates');
      }
    }
  }
}