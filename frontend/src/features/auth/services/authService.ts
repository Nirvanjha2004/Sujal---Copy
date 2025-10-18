import { 
  AuthService, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  TokenPair, 
  User,
  AuthError,
  AuthErrorType 
} from '../types';
import { tokenService } from './tokenService';

// API configuration
const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001/api/v1';

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generic API request function with token management
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get valid token (automatically clears invalid tokens)
  const validToken = tokenService.getValidToken();

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(validToken && { Authorization: `Bearer ${validToken}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 responses by clearing invalid tokens
    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.error?.code === 'INVALID_TOKEN' || errorData.error?.code === 'MISSING_TOKEN') {
        console.warn('Received 401 with invalid token, clearing from localStorage');
        tokenService.clearToken();
      }
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`);
    }

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Transform API errors into AuthError objects
 */
function transformApiError(error: unknown): AuthError {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return {
          type: AuthErrorType.INVALID_CREDENTIALS,
          message: 'Invalid email or password'
        };
      case 404:
        return {
          type: AuthErrorType.USER_NOT_FOUND,
          message: 'User not found'
        };
      case 409:
        return {
          type: AuthErrorType.EMAIL_ALREADY_EXISTS,
          message: 'Email already exists'
        };
      case 403:
        return {
          type: AuthErrorType.FORBIDDEN,
          message: 'Access forbidden'
        };
      case 0:
        return {
          type: AuthErrorType.NETWORK_ERROR,
          message: 'Network connection error'
        };
      default:
        return {
          type: AuthErrorType.NETWORK_ERROR,
          message: error.message || 'An unexpected error occurred'
        };
    }
  }

  return {
    type: AuthErrorType.NETWORK_ERROR,
    message: error instanceof Error ? error.message : 'An unexpected error occurred'
  };
}

/**
 * Auth service implementation
 * Extracted and enhanced from shared/lib/api.ts
 */
class AuthServiceImpl implements AuthService {
  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }) as any;

      // Backend returns { success: true, data: { user, tokens: { accessToken, refreshToken } } }
      const authResponse: AuthResponse = {
        user: response.data.user,
        token: response.data.tokens.accessToken,
        refreshToken: response.data.tokens.refreshToken
      };

      // Store tokens
      tokenService.setToken(authResponse.token);
      if (authResponse.refreshToken) {
        tokenService.setRefreshToken(authResponse.refreshToken);
      }

      return authResponse;
    } catch (error) {
      throw transformApiError(error);
    }
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }) as any;

      // Backend returns { success: true, data: { user, tokens: { accessToken, refreshToken } } }
      const authResponse: AuthResponse = {
        user: response.data.user,
        token: response.data.tokens.accessToken,
        refreshToken: response.data.tokens.refreshToken
      };

      // Store tokens
      tokenService.setToken(authResponse.token);
      if (authResponse.refreshToken) {
        tokenService.setRefreshToken(authResponse.refreshToken);
      }

      return authResponse;
    } catch (error) {
      throw transformApiError(error);
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Log the error but don't throw - we still want to clear local tokens
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear tokens on logout
      tokenService.clearToken();
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<TokenPair> {
    try {
      const refreshToken = tokenService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiRequest('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }) as any;

      const tokenPair: TokenPair = {
        accessToken: response.data.tokens.accessToken,
        refreshToken: response.data.tokens.refreshToken
      };

      // Update stored tokens
      tokenService.setToken(tokenPair.accessToken);
      tokenService.setRefreshToken(tokenPair.refreshToken);

      return tokenPair;
    } catch (error) {
      // Clear tokens if refresh fails
      tokenService.clearToken();
      throw transformApiError(error);
    }
  }

  /**
   * Verify user email with OTP
   */
  async verifyEmail(email: string, otp: string): Promise<void> {
    try {
      await apiRequest('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
    } catch (error) {
      throw transformApiError(error);
    }
  }

  /**
   * Resend email verification OTP
   */
  async resendVerificationOTP(email: string): Promise<void> {
    try {
      await apiRequest('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      throw transformApiError(error);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string): Promise<void> {
    try {
      await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      throw transformApiError(error);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
    } catch (error) {
      throw transformApiError(error);
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiRequest('/auth/profile') as any;
      // Backend returns { success: true, data: { user } }
      return response.data.user;
    } catch (error) {
      throw transformApiError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await apiRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
      }) as any;

      return response.data.user;
    } catch (error) {
      throw transformApiError(error);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenService.getValidToken() !== null;
  }

  /**
   * Get current user role from token
   */
  getCurrentUserRole(): string | null {
    return tokenService.getUserRoleFromToken();
  }

  /**
   * Check if current user has specific role
   */
  hasRole(role: string): boolean {
    const currentRole = this.getCurrentUserRole();
    return currentRole === role;
  }

  /**
   * Check if current user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const currentRole = this.getCurrentUserRole();
    return currentRole ? roles.includes(currentRole) : false;
  }
}

// Export singleton instance
export const authService = new AuthServiceImpl();
export default authService;