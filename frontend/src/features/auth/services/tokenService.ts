import { TokenService, TokenValidation, TokenPayload } from '../types';

/**
 * Token service implementation for JWT token management
 * Moved and enhanced from shared/utils/tokenUtils.ts
 */
class TokenServiceImpl implements TokenService {
  private readonly TOKEN_KEY = 'token';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly EXPIRY_THRESHOLD_SECONDS = 300; // 5 minutes

  /**
   * Validates a JWT token structure and expiration
   */
  validateToken(token: string): TokenValidation {
    try {
      if (!token) {
        return { isValid: false, error: 'Token is empty' };
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return { isValid: false, error: 'Invalid token format' };
      }

      const payload = JSON.parse(atob(parts[1])) as TokenPayload;
      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < currentTime) {
        return { isValid: false, error: 'Token expired', payload };
      }

      return { isValid: true, payload };
    } catch (error) {
      return { 
        isValid: false, 
        error: `Token validation error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Gets a valid token from localStorage, clearing it if invalid
   */
  getValidToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;

    const validation = this.validateToken(token);
    if (!validation.isValid) {
      console.warn('Invalid token found in localStorage:', validation.error);
      this.clearToken();
      return null;
    }

    return token;
  }

  /**
   * Sets a token in localStorage after validation
   */
  setToken(token: string): boolean {
    const validation = this.validateToken(token);
    if (!validation.isValid) {
      console.warn('Attempted to set invalid token:', validation.error);
      return false;
    }

    localStorage.setItem(this.TOKEN_KEY, token);
    return true;
  }

  /**
   * Clears the token from localStorage
   */
  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Gets the time until token expiration in seconds
   */
  getTokenTimeToExpiry(token?: string): number | null {
    const tokenToCheck = token || this.getValidToken();
    if (!tokenToCheck) return null;

    const validation = this.validateToken(tokenToCheck);
    if (!validation.isValid || !validation.payload) return null;

    const currentTime = Math.floor(Date.now() / 1000);
    return validation.payload.exp - currentTime;
  }

  /**
   * Checks if token will expire within the specified number of seconds
   */
  isTokenExpiringSoon(token?: string, thresholdSeconds: number = this.EXPIRY_THRESHOLD_SECONDS): boolean {
    const timeToExpiry = this.getTokenTimeToExpiry(token);
    return timeToExpiry !== null && timeToExpiry <= thresholdSeconds;
  }

  /**
   * Gets the refresh token from localStorage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Sets the refresh token in localStorage
   */
  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Attempts to refresh the access token using the refresh token
   */
  async refreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.warn('No refresh token available');
      return null;
    }

    try {
      // This would typically call the auth service to refresh the token
      // For now, we'll return null and let the auth service handle the refresh logic
      console.warn('Token refresh should be handled by auth service');
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearToken();
      return null;
    }
  }

  /**
   * Gets the token payload without validation (for debugging)
   */
  getTokenPayload(token?: string): TokenPayload | null {
    const tokenToCheck = token || this.getValidToken();
    if (!tokenToCheck) return null;

    try {
      const parts = tokenToCheck.split('.');
      if (parts.length !== 3) return null;
      
      return JSON.parse(atob(parts[1])) as TokenPayload;
    } catch (error) {
      console.error('Failed to parse token payload:', error);
      return null;
    }
  }

  /**
   * Checks if the current token belongs to a specific user
   */
  isTokenForUser(userId: number, token?: string): boolean {
    const payload = this.getTokenPayload(token);
    return payload?.userId === userId;
  }

  /**
   * Gets the user role from the current token
   */
  getUserRoleFromToken(token?: string): string | null {
    const payload = this.getTokenPayload(token);
    return payload?.role || null;
  }

  /**
   * Cleanup method to remove expired tokens
   */
  cleanup(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      const validation = this.validateToken(token);
      if (!validation.isValid) {
        this.clearToken();
      }
    }
  }
}

// Export singleton instance
export const tokenService = new TokenServiceImpl();
export default tokenService;