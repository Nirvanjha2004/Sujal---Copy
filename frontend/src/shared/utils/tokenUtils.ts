/**
 * @deprecated This file is deprecated. Use @/features/auth/utils/tokenUtils instead.
 * This file now re-exports from the auth feature for backward compatibility.
 * 
 * Utility functions for JWT token management
 */

// Re-export everything from the auth feature for backward compatibility
export {
  validateToken,
  getValidToken,
  clearToken,
  setToken,
  getTokenTimeToExpiry,
  isTokenExpiringSoon,
  tokenService,
  type TokenPayload
} from '@/features/auth/utils/tokenUtils';