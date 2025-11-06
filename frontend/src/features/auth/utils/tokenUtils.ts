/**
 * Token utilities for backward compatibility
 * This file provides the same interface as shared/utils/tokenUtils.ts
 * but uses the enhanced tokenService internally
 */

import { tokenService } from '../services/tokenService';
import { TokenPayload } from '../types';

/**
 * Validates a JWT token structure and expiration
 * @deprecated Use tokenService.validateToken() instead
 */
export function validateToken(token: string): { isValid: boolean; payload?: TokenPayload; error?: string } {
  return tokenService.validateToken(token);
}

/**
 * Gets a valid token from localStorage, clearing it if invalid
 * @deprecated Use tokenService.getValidToken() instead
 */
export function getValidToken(): string | null {
  return tokenService.getValidToken();
}

/**
 * Clears the token from localStorage
 * @deprecated Use tokenService.clearToken() instead
 */
export function clearToken(): void {
  tokenService.clearToken();
}

/**
 * Sets a token in localStorage after validation
 * @deprecated Use tokenService.setToken() instead
 */
export function setToken(token: string): boolean {
  return tokenService.setToken(token);
}

/**
 * Gets the time until token expiration in seconds
 * @deprecated Use tokenService.getTokenTimeToExpiry() instead
 */
export function getTokenTimeToExpiry(token?: string): number | null {
  return tokenService.getTokenTimeToExpiry(token);
}

/**
 * Checks if token will expire within the specified number of seconds
 * @deprecated Use tokenService.isTokenExpiringSoon() instead
 */
export function isTokenExpiringSoon(token?: string, thresholdSeconds: number = 300): boolean {
  return tokenService.isTokenExpiringSoon(token, thresholdSeconds);
}

// Re-export TokenPayload type for compatibility
export type { TokenPayload };

// Export the tokenService for direct access to enhanced functionality
export { tokenService };