import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import userService, { UpdateProfileData, ChangePasswordData, ResetPasswordData } from '../services/userService';
import { UserRole } from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';
import { getFileUrl, deleteUploadedFile } from '../middleware/upload';
import path from 'path';

class UserController {
  /**
   * Validation rules for profile update
   */
  static updateProfileValidation = [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),
    body('phone')
      .optional()
      .matches(/^\+?[\d\s\-\(\)]{10,}$/)
      .withMessage('Invalid phone number format'),
    body('profileImage')
      .optional()
      .isURL()
      .withMessage('Profile image must be a valid URL'),
  ];

  /**
   * Validation rules for password change
   */
  static changePasswordValidation = [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  ];

  /**
   * Validation rules for password reset initiation
   */
  static initiatePasswordResetValidation = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
  ];

  /**
   * Validation rules for password reset
   */
  static resetPasswordValidation = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('OTP must be a 6-digit number'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  ];

  /**
   * Get user profile
   */
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Authentication required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const user = await userService.getUserProfile(req.user.userId);

      res.status(200).json({
        success: true,
        data: { user },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Get profile error:', error);
      
      const message = error instanceof Error ? error.message : 'Failed to get profile';

      res.status(400).json({
        success: false,
        error: {
          code: 'GET_PROFILE_ERROR',
          message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Authentication required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array(),
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const updateData: UpdateProfileData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        profileImage: req.body.profileImage,
      };

      const user = await userService.updateProfile(req.user.userId, updateData);

      res.status(200).json({
        success: true,
        data: { user },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Update profile error:', error);
      
      const message = error instanceof Error ? error.message : 'Failed to update profile';

      res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_PROFILE_ERROR',
          message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Change user password
   */
  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Authentication required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array(),
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const passwordData: ChangePasswordData = {
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
      };

      await userService.changePassword(req.user.userId, passwordData);

      res.status(200).json({
        success: true,
        data: { message: 'Password changed successfully' },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Change password error:', error);
      
      const message = error instanceof Error ? error.message : 'Failed to change password';

      res.status(400).json({
        success: false,
        error: {
          code: 'CHANGE_PASSWORD_ERROR',
          message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Initiate password reset
   */
  async initiatePasswordReset(req: Request, res: Response): Promise<void> {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array(),
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { email } = req.body;
      await userService.initiatePasswordReset(email);

      res.status(200).json({
        success: true,
        data: { message: 'Password reset OTP sent to your email' },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Initiate password reset error:', error);
      
      const message = error instanceof Error ? error.message : 'Failed to initiate password reset';

      res.status(400).json({
        success: false,
        error: {
          code: 'INITIATE_PASSWORD_RESET_ERROR',
          message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: errors.array(),
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const resetData: ResetPasswordData = {
        email: req.body.email,
        otp: req.body.otp,
        newPassword: req.body.newPassword,
      };

      await userService.resetPassword(resetData);

      res.status(200).json({
        success: true,
        data: { message: 'Password reset successfully' },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Reset password error:', error);
      
      const message = error instanceof Error ? error.message : 'Failed to reset password';

      res.status(400).json({
        success: false,
        error: {
          code: 'RESET_PASSWORD_ERROR',
          message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Activate user account (admin only)
   */
  async activateAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId || isNaN(parseInt(userId))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_USER_ID',
            message: 'Valid user ID is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await userService.activateAccount(parseInt(userId));

      res.status(200).json({
        success: true,
        data: { message: 'User account activated successfully' },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Activate account error:', error);
      
      const message = error instanceof Error ? error.message : 'Failed to activate account';

      res.status(400).json({
        success: false,
        error: {
          code: 'ACTIVATE_ACCOUNT_ERROR',
          message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Deactivate user account (admin only)
   */
  async deactivateAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId || isNaN(parseInt(userId))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_USER_ID',
            message: 'Valid user ID is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await userService.deactivateAccount(parseInt(userId));

      res.status(200).json({
        success: true,
        data: { message: 'User account deactivated successfully' },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Deactivate account error:', error);
      
      const message = error instanceof Error ? error.message : 'Failed to deactivate account';

      res.status(400).json({
        success: false,
        error: {
          code: 'DEACTIVATE_ACCOUNT_ERROR',
          message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await userService.getAllUsers(page, limit);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Get all users error:', error);
      
      const message = error instanceof Error ? error.message : 'Failed to get users';

      res.status(400).json({
        success: false,
        error: {
          code: 'GET_USERS_ERROR',
          message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!userId || isNaN(parseInt(userId))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_USER_ID',
            message: 'Valid user ID is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!role || !Object.values(UserRole).includes(role)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ROLE',
            message: 'Valid user role is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const user = await userService.updateUserRole(parseInt(userId), role);

      res.status(200).json({
        success: true,
        data: { user },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Update user role error:', error);
      
      const message = error instanceof Error ? error.message : 'Failed to update user role';

      res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_ROLE_ERROR',
          message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Upload profile image
   */
  async uploadProfileImage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Authentication required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE_UPLOADED',
            message: 'Profile image file is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Get current user to check for existing profile image
      const currentUser = await userService.getUserProfile(req.user.userId);
      
      // Generate file URL
      const imageUrl = getFileUrl(req.file.filename, 'profile');
      
      // Update user profile with new image URL
      const user = await userService.updateProfile(req.user.userId, {
        profileImage: imageUrl,
      });

      // Delete old profile image if it exists
      if (currentUser.profile_image) {
        try {
          const oldFilename = path.basename(currentUser.profile_image);
          const oldFilePath = path.join(process.cwd(), 'uploads', 'profiles', oldFilename);
          deleteUploadedFile(oldFilePath);
        } catch (error) {
          console.warn('Failed to delete old profile image:', error);
        }
      }

      res.status(200).json({
        success: true,
        data: { 
          user,
          imageUrl,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Upload profile image error:', error);
      
      // Delete uploaded file if there was an error
      if (req.file) {
        deleteUploadedFile(req.file.path);
      }
      
      const message = error instanceof Error ? error.message : 'Failed to upload profile image';

      res.status(400).json({
        success: false,
        error: {
          code: 'UPLOAD_PROFILE_IMAGE_ERROR',
          message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId || isNaN(parseInt(userId))) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_USER_ID',
            message: 'Valid user ID is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await userService.deleteUser(parseInt(userId));

      res.status(200).json({
        success: true,
        data: { message: 'User deleted successfully' },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Delete user error:', error);
      
      const message = error instanceof Error ? error.message : 'Failed to delete user';

      res.status(400).json({
        success: false,
        error: {
          code: 'DELETE_USER_ERROR',
          message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export default new UserController();