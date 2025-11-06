// Service-related type definitions

import { User, UserRole } from './user';
import { LoginCredentials, RegisterData, AuthResponse, TokenPair, TokenValidation } from './auth';

export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(userData: RegisterData): Promise<AuthResponse>;
  logout(): Promise<void>;
  refreshToken(): Promise<TokenPair>;
  verifyEmail(email: string, otp: string): Promise<void>;
  resetPassword(token: string, password: string): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  updateProfile(userData: Partial<User>): Promise<User>;
  getCurrentUser(): Promise<User>;
}

export interface TokenService {
  getValidToken(): string | null;
  setToken(token: string): boolean;
  clearToken(): void;
  validateToken(token: string): TokenValidation;
  isTokenExpiringSoon(token?: string): boolean;
  getTokenTimeToExpiry(token?: string): number | null;
  refreshToken(): Promise<string | null>;
}

export interface ValidationService {
  validateEmail(email: string): boolean;
  validatePassword(password: string): { isValid: boolean; errors: string[] };
  validatePhone(phone: string): boolean;
  validateRequired(value: string, fieldName: string): string | null;
  validatePasswordMatch(password: string, confirmPassword: string): string | null;
}