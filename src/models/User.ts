import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Unique,
  AllowNull,
  Default,
  CreatedAt,
  UpdatedAt,
  Index,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import bcrypt from 'bcrypt';
import config from '../config';

export enum UserRole {
  BUYER = 'buyer',
  OWNER = 'owner',
  AGENT = 'agent',
  BUILDER = 'builder',
  ADMIN = 'admin',
}

@Table({
  tableName: 'users',
  timestamps: true,
  indexes: [
    {
      fields: ['email'],
      unique: true,
    },
    {
      fields: ['role'],
    },
  ],
})
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  email!: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  password_hash!: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(UserRole)))
  role!: UserRole;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  first_name!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  last_name!: string;

  @Column(DataType.STRING(20))
  phone?: string;

  @Column(DataType.STRING(255))
  profile_image?: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_verified!: boolean;

  @Default(true)
  @Column(DataType.BOOLEAN)
  is_active!: boolean;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;

  // Associations - will be defined in associations.ts
  properties!: any[];
  inquiries!: any[];
  favorites!: any[];
  saved_searches!: any[];
  conversations!: any[];
  participations!: any[];
  sent_messages!: any[];
  received_messages!: any[];
  createdContent!: any[];
  userReviews!: any[];
  createdRedirects!: any[];



  // Instance methods
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password_hash);
  }

  toJSON(): any {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
  }

  get fullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }

  // Hooks
  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User): Promise<void> {
    if (instance.changed('password_hash')) {
      const hashedPassword = await bcrypt.hash(instance.password_hash, config.security.bcryptRounds);
      instance.password_hash = hashedPassword;
    }
  }

  // Validation methods
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone: string): boolean {
    // Allow empty phone numbers
    if (!phone || phone.trim() === '') {
      return true;
    }
    
    // Clean the phone number (remove non-digits)
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's a valid 10-digit Indian mobile number
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(cleanPhone);
  }

  static validateRole(role: string): boolean {
    return Object.values(UserRole).includes(role as UserRole);
  }
}