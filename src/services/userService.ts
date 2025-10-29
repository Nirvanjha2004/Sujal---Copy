import { User, UserRole } from '../models/User';
import authService from './authService';
import RedisConnection from '../config/redis';
import emailService from './emailService';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImage?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

class UserService {
  private redis: RedisConnection;

  constructor() {
    this.redis = RedisConnection.getInstance();
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: number): Promise<Omit<User, 'password_hash'>> {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.is_active) {
      throw new Error('User account is deactivated');
    }

    return user.toJSON();
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: number, updateData: UpdateProfileData): Promise<Omit<User, 'password_hash'>> {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.is_active) {
      throw new Error('User account is deactivated');
    }

    // Validate phone if provided and not empty
    if (updateData.phone && updateData.phone.trim() !== '' && !User.validatePhone(updateData.phone)) {
      throw new Error('Invalid phone number format');
    }

    // Update user fields
    if (updateData.firstName !== undefined) {
      user.first_name = updateData.firstName;
    }
    if (updateData.lastName !== undefined) {
      user.last_name = updateData.lastName;
    }
    if (updateData.phone !== undefined) {
      user.phone = updateData.phone;
    }
    if (updateData.profileImage !== undefined) {
      user.profile_image = updateData.profileImage;
    }

    await user.save();

    return user.toJSON();
  }

  /**
   * Change user password
   */
  async changePassword(userId: number, passwordData: ChangePasswordData): Promise<void> {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.is_active) {
      throw new Error('User account is deactivated');
    }

    // Verify current password
    const isValidPassword = await user.validatePassword(passwordData.currentPassword);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password strength
    if (passwordData.newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }

    // Update password (will be hashed by model hook)
    user.password_hash = passwordData.newPassword;
    await user.save();

    // Invalidate all refresh tokens for this user
    await authService.removeRefreshToken(userId);
  }

  /**
   * Activate user account
   */
  async activateAccount(userId: number): Promise<void> {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    user.is_active = true;
    await user.save();
  }

  /**
   * Deactivate user account
   */
  async deactivateAccount(userId: number): Promise<void> {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    user.is_active = false;
    await user.save();

    // Invalidate all refresh tokens for this user
    await authService.removeRefreshToken(userId);
  }

  /**
   * Verify user email with OTP
   */
  async verifyEmail(email: string, otp: string): Promise<void> {
    // Verify OTP
    const isValidOTP = await authService.verifyOTP(email, otp);
    if (!isValidOTP) {
      throw new Error('Invalid or expired verification code');
    }

    // Find and update user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    user.is_verified = true;
    await user.save();
  }

  /**
   * Resend email verification OTP
   */
  async resendVerificationOTP(email: string): Promise<void> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    if (user.is_verified) {
      throw new Error('Email is already verified');
    }

    // Generate and store new OTP
    const otp = authService.generateOTP();
    await authService.storeOTP(email, otp);

    try {
      // Send verification OTP email
      await emailService.sendVerificationOTP(email, {
        userName: `${user.first_name} ${user.last_name}`,
        otp: otp,
        expirationMinutes: 10
      });
    } catch (error) {
      console.error('Failed to send verification OTP email:', error);
      throw new Error('Failed to send verification email. Please try again or contact support.');
    }
  }

  /**
   * Initiate password reset
   */
  async initiatePasswordReset(email: string): Promise<void> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.is_active) {
      throw new Error('User account is deactivated');
    }

    // Generate and store OTP for password reset
    const otp = authService.generateOTP();
    const resetKey = `password_reset:${email}`;

    try {
      await this.redis.setEx(resetKey, 10 * 60, otp); // 10 minutes expiration
    } catch (error) {
      console.warn('Failed to store password reset OTP in Redis:', error);
      throw new Error('Failed to initiate password reset');
    }

    try {
      // Send password reset OTP email
      await emailService.sendPasswordResetOTP(email, {
        userName: `${user.first_name} ${user.last_name}`,
        otp: otp,
        expirationMinutes: 10
      });
    } catch (error) {
      console.error('Failed to send password reset OTP email:', error);
      throw new Error('Failed to send password reset email. Please try again or contact support.');
    }
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(resetData: ResetPasswordData): Promise<void> {
    const resetKey = `password_reset:${resetData.email}`;

    try {
      // Verify OTP
      const storedOTP = await this.redis.get(resetKey);
      if (!storedOTP || storedOTP !== resetData.otp) {
        throw new Error('Invalid or expired reset code');
      }

      // Find user
      const user = await User.findOne({ where: { email: resetData.email } });
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.is_active) {
        throw new Error('User account is deactivated');
      }

      // Validate new password strength
      if (resetData.newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }

      // Update password (will be hashed by model hook)
      user.password_hash = resetData.newPassword;
      await user.save();

      // Remove reset OTP
      await this.redis.del(resetKey);

      // Invalidate all refresh tokens for this user
      await authService.removeRefreshToken(user.id);

    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      console.warn('Failed to reset password:', error);
      throw new Error('Failed to reset password');
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(page: number = 1, limit: number = 20): Promise<{
    users: Omit<User, 'password_hash'>[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return {
      users: rows.map(user => user.toJSON()),
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: number, newRole: UserRole): Promise<Omit<User, 'password_hash'>> {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (!User.validateRole(newRole)) {
      throw new Error('Invalid user role');
    }

    user.role = newRole;
    await user.save();

    // Invalidate all refresh tokens for this user to force re-login with new role
    await authService.removeRefreshToken(userId);

    return user.toJSON();
  }

  /**
   * Delete user account (admin only)
   */
  async deleteUser(userId: number): Promise<void> {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Invalidate all refresh tokens for this user
    await authService.removeRefreshToken(userId);

    // Delete user (cascade will handle related records)
    await user.destroy();
  }
}

export default new UserService();