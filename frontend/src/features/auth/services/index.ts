// Auth services exports

// Core auth service - Authentication API operations
export { authService, default as AuthService } from './authService';

// Token service - JWT token management and validation
export { tokenService, default as TokenService } from './tokenService';

// Re-export types for convenience
export type { AuthService, TokenService } from '../types';

// Service utilities - Common service patterns and helpers
export const authServices = {
  auth: authService,
  token: tokenService,
} as const;