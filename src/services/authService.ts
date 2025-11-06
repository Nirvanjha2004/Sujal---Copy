import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User, UserRole } from '../models/User';
import config from '../config';
import RedisConnection from '../config/redis';
import { JwtPayload } from '../types';
import emailService from './emailService';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  tokens: TokenPair;
}

class AuthService {
  private redis: RedisConnection;

  constructor() {
    this.redis = RedisConnection.getInstance();
  }

  /**
   * Generate JWT access and refresh tokens
   */
  generateTokens(payload: JwtPayload): TokenPair {
    const accessToken = jwt.sign(
      payload as object,
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as any
    );

    const refreshToken = jwt.sign(
      payload as object,
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn } as any
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verify JWT access token
   */
  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify JWT refresh token
   */
  verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Store refresh token in Redis
   */
  async storeRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const key = `refresh_token:${userId}`;
    const expiresIn = 7 * 24 * 60 * 60; // 7 days in seconds
    
    try {
      await this.redis.setEx(key, expiresIn, refreshToken);
    } catch (error) {
      console.warn('Failed to store refresh token in Redis:', error);
      // Continue without Redis storage - not critical for basic functionality
    }
  }

  /**
   * Validate stored refresh token
   */
  async validateStoredRefreshToken(userId: number, refreshToken: string): Promise<boolean> {
    const key = `refresh_token:${userId}`;
    
    try {
      const storedToken = await this.redis.get(key);
      return storedToken === refreshToken;
    } catch (error) {
      console.warn('Failed to validate refresh token from Redis:', error);
      // If Redis is unavailable, allow token validation to proceed
      return true;
    }
  }

  /**
   * Remove refresh token from Redis
   */
  async removeRefreshToken(userId: number): Promise<void> {
    const key = `refresh_token:${userId}`;
    
    try {
      await this.redis.del(key);
    } catch (error) {
      console.warn('Failed to remove refresh token from Redis:', error);
    }
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate email format
    if (!User.validateEmail(userData.email)) {
      throw new Error('Invalid email format');
    }

    // Validate phone if provided and not empty
    if (userData.phone && userData.phone.trim() !== '' && !User.validatePhone(userData.phone)) {
      throw new Error('Invalid phone number format');
    }

    // Validate role
    if (!User.validateRole(userData.role)) {
      throw new Error('Invalid user role');
    }

    // Create user (password will be hashed by the model hook)
    const user = await User.create({
      email: userData.email,
      password_hash: userData.password, // Will be hashed by BeforeCreate hook
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone,
      role: userData.role,
      is_verified: false, // Will be verified via email/OTP
      is_active: true,
    });

    // Generate tokens
    const jwtPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = this.generateTokens(jwtPayload);
    
    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: user.toJSON(),
      tokens,
    };
  }

  /**
   * Login user with credentials
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Find user by email
    const user = await User.findOne({ where: { email: credentials.email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error('Account is deactivated');
    }

    // Validate password
    const isValidPassword = await user.validatePassword(credentials.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const jwtPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = this.generateTokens(jwtPayload);
    
    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: user.toJSON(),
      tokens,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    // Verify refresh token
    const payload = this.verifyRefreshToken(refreshToken);
    
    // Validate stored refresh token
    const isValidStored = await this.validateStoredRefreshToken(payload.userId, refreshToken);
    if (!isValidStored) {
      throw new Error('Invalid refresh token');
    }

    // Check if user still exists and is active
    const user = await User.findByPk(payload.userId);
    if (!user || !user.is_active) {
      throw new Error('User not found or inactive');
    }

    // Generate new tokens
    const newPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = this.generateTokens(newPayload);
    
    // Store new refresh token and remove old one
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  /**
   * Logout user by removing refresh token
   */
  async logout(userId: number): Promise<void> {
    await this.removeRefreshToken(userId);
  }

  /**
   * Generate OTP for email verification
   */
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Store OTP in Redis with expiration
   */
  async storeOTP(email: string, otp: string): Promise<void> {
    const key = `otp:${email}`;
    const expiresIn = 10 * 60; // 10 minutes
    
    try {
      await this.redis.setEx(key, expiresIn, otp);
    } catch (error) {
      console.warn('Failed to store OTP in Redis:', error);
      throw new Error('Failed to generate verification code');
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(email: string, otp: string): Promise<boolean> {
    const key = `otp:${email}`;
    
    try {
      const storedOTP = await this.redis.get(key);
      if (storedOTP === otp) {
        // Remove OTP after successful verification
        await this.redis.del(key);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Failed to verify OTP from Redis:', error);
      throw new Error('Failed to verify code');
    }
  }

  /**
   * Hash password manually (for password reset)
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.security.bcryptRounds);
  }

  /**
   * Generate password reset token
   */
  generatePasswordResetToken(userId: number, email: string): string {
    const payload = {
      userId,
      email,
      type: 'password_reset',
    };
    
    return jwt.sign(payload, config.jwt.secret, { expiresIn: '1h' });
  }

  /**
   * Verify password reset token
   */
  verifyPasswordResetToken(token: string): { userId: number; email: string } {
    try {
      const payload = jwt.verify(token, config.jwt.secret) as any;
      
      if (payload.type !== 'password_reset') {
        throw new Error('Invalid token type');
      }
      
      return {
        userId: payload.userId,
        email: payload.email,
      };
    } catch (error) {
      throw new Error('Invalid or expired password reset token');
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return;
    }

    const resetToken = this.generatePasswordResetToken(user.id, user.email);
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    try {
      await emailService.sendPasswordResetEmail(user.email, {
        userName: user.fullName,
        resetUrl,
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const { userId } = this.verifyPasswordResetToken(token);
    
    const user = await User.findByPk(userId);
    if (!user || !user.is_active) {
      throw new Error('User not found or inactive');
    }

    // Hash the new password
    const hashedPassword = await this.hashPassword(newPassword);
    
    // Update user password
    user.password_hash = hashedPassword;
    await user.save();

    // Invalidate all existing refresh tokens for security
    await this.removeRefreshToken(userId);
  }

  /**
   * Send registration confirmation email
   */
  async sendRegistrationConfirmationEmail(user: User): Promise<void> {
    try {
      await emailService.sendRegistrationConfirmation(user.email, {
        userName: user.fullName,
      });
    } catch (error) {
      console.error('Failed to send registration confirmation email:', error);
      // Don't throw error to avoid failing registration
    }
  }
}

export default new AuthService();