// Auth hooks exports
import { useAuth } from './useAuth';
import { useLogin } from './useLogin';
import { useRegister } from './useRegister';
import { useProfile } from './useProfile';

// Core auth hook - Main authentication state and actions
export { useAuth, default as useAuthDefault } from './useAuth';

// Specialized hooks - Specific auth flow hooks
export { useLogin, default as useLoginDefault } from './useLogin';
export { useRegister, default as useRegisterDefault } from './useRegister';
export { useProfile, default as useProfileDefault } from './useProfile';

// Re-export types for convenience
export type { UseAuthReturn } from '../types';

// Hook utilities - Common patterns and helpers
export const authHooks = {
  useAuth,
  useLogin,
  useRegister,
  useProfile,
} as const;