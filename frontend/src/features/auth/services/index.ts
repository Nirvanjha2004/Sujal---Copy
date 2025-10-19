// Auth services exports
import { authService } from './authService';
import { tokenService } from './tokenService';

// Core auth service - Authentication API operations
export { authService } from './authService';
export { default as AuthServiceImpl } from './authService';

// Token service - JWT token management and validation
export { tokenService } from './tokenService';
export { default as TokenServiceImpl } from './tokenService';

// Re-export types for convenience
export type { AuthService, TokenService } from '../types';

// Service utilities - Common service patterns and helpers
export const authServices = {
  auth: authService,
  token: tokenService,
} as const;