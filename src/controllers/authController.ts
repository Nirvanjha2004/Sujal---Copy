import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import authService, { LoginCredentials, RegisterData } from '../services/authService';
import userService from '../services/userService';
import { AuthenticatedRequest } from '../middleware/auth';

class AuthController {




  /**
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Check validation results
      console.log("The response reached here", req.body)
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

      const registerData: RegisterData = {
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        role: req.body.role,
      };

      console.log("The Result is ", registerData)

      const result = await authService.register(registerData);

      // Generate and send verification OTP
      const otp = authService.generateOTP();
      await authService.storeOTP(result.user.email, otp);

      // TODO: Send email with OTP (will be implemented in email service)
      console.log(`Verification OTP for ${result.user.email}: ${otp}`);

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          tokens: result.tokens,
          message: 'Registration successful. Please verify your email with the OTP sent to your email address.',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Registration error:', error);

      const message = error instanceof Error ? error.message : 'Registration failed';
      const statusCode = message.includes('already exists') ? 409 : 400;

      res.status(statusCode).json({
        success: false,
        error: {
          code: 'REGISTRATION_ERROR',
          message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response): Promise<void> {
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

      const credentials: LoginCredentials = {
        email: req.body.email,
        password: req.body.password,
      };

      const result = await authService.login(credentials);

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          tokens: result.tokens,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Login error:', error);

      const message = error instanceof Error ? error.message : 'Login failed';
      const statusCode = message.includes('Invalid email or password') ||
        message.includes('deactivated') ? 401 : 400;

      res.status(statusCode).json({
        success: false,
        error: {
          code: 'LOGIN_ERROR',
          message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
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

      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        data: { tokens },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Token refresh error:', error);

      const message = error instanceof Error ? error.message : 'Token refresh failed';

      res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_REFRESH_ERROR',
          message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Logout user
   */
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      await authService.logout(req.user.userId);

      res.status(200).json({
        success: true,
        data: { message: 'Logout successful' },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Logout error:', error);

      res.status(500).json({
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: 'Logout failed',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Verify email with OTP
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
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

      const { email, otp } = req.body;
      await userService.verifyEmail(email, otp);

      res.status(200).json({
        success: true,
        data: { message: 'Email verified successfully' },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Email verification error:', error);

      const message = error instanceof Error ? error.message : 'Email verification failed';

      res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_VERIFICATION_ERROR',
          message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Resend verification OTP
   */
  async resendVerificationOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await userService.resendVerificationOTP(email);

      res.status(200).json({
        success: true,
        data: { message: 'Verification OTP sent successfully' },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Resend OTP error:', error);

      const message = error instanceof Error ? error.message : 'Failed to send verification OTP';

      res.status(400).json({
        success: false,
        error: {
          code: 'RESEND_OTP_ERROR',
          message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get current user profile
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
   * Send password reset email
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
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
      await authService.sendPasswordResetEmail(email);

      // Always return success to prevent email enumeration
      res.status(200).json({
        success: true,
        data: { message: 'If an account with that email exists, a password reset link has been sent.' },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Forgot password error:', error);

      res.status(500).json({
        success: false,
        error: {
          code: 'FORGOT_PASSWORD_ERROR',
          message: 'Failed to process password reset request',
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Reset password using token
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

      const { token, password } = req.body;
      await authService.resetPassword(token, password);

      res.status(200).json({
        success: true,
        data: { message: 'Password reset successfully' },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Reset password error:', error);

      const message = error instanceof Error ? error.message : 'Password reset failed';

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
}

export default new AuthController();