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
  HasMany,
  BelongsToMany,
  CreatedAt,
  UpdatedAt,
  Index,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import bcrypt from 'bcrypt';
import config from '../config';
// Forward declarations to avoid circular imports
class Review {} // Will be replaced by actual import at runtime
class UrlRedirect {} // Will be replaced by actual import at runtime
class Conversation {} // Will be replaced by actual import at runtime
class ConversationParticipant {} // Will be replaced by actual import at runtime
// These will be properly associated in the database configuration

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

  // Associations - will be defined in database configuration
  properties!: any[];
  inquiries!: any[];
  favorites!: any[];
  saved_searches!: any[];
  conversations!: Conversation[];
  participations!: ConversationParticipant[];



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
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  static validateRole(role: string): boolean {
    return Object.values(UserRole).includes(role as UserRole);
  }
}