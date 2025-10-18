// Frontend Auth Types - imports from shared backend types
// This ensures type consistency between frontend and backend

// Re-export all shared auth types from backend
export type {
  User,
  UserRole,
  UserProfile,
  TokenPair,
  JwtPayload,
  RefreshTokenPayload,
  TokenValidationResult,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  RefreshTokenRequest,
  AuthResponse,
  LoginResponse,
  RegisterResponse,
  RefreshTokenResponse,
  ProfileResponse,
  VerifyEmailResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  ChangePasswordResponse,
  LogoutResponse,
  AuthErrorResponse,
  AuthState,
  AuthActions,
  RegisterData,
  AuthContextValue,
  AuthGuardProps,
  RouteGuardConfig,
} from '../../../src/shared/types/auth';

export { UserRole, AuthErrorCode } from '../../../src/shared/types/auth';

// Frontend-specific auth types (if needed)
export interface AuthFormState {
  isSubmitting: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  agreeToTerms: boolean;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}