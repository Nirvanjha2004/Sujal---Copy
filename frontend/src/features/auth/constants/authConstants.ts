// Authentication constants and configuration

import { UserRole } from '../types/user';
import { AuthErrorType } from '../types/auth';

// Token configuration
export const TOKEN_CONFIG = {
  ACCESS_TOKEN_KEY: 'accessToken',
  REFRESH_TOKEN_KEY: 'refreshToken',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes in milliseconds
  MAX_TOKEN_AGE: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  REFRESH_THRESHOLD: 15 * 60 * 1000, // 15 minutes in milliseconds
} as const;

// API endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  VERIFY_EMAIL: '/api/auth/verify-email',
  SEND_VERIFICATION: '/api/auth/send-verification',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  PROFILE: '/api/auth/profile',
  CHANGE_PASSWORD: '/api/auth/change-password',
} as const;

// User roles and permissions
export const USER_ROLES: Record<UserRole, UserRole> = {
  buyer: 'buyer',
  owner: 'owner',
  agent: 'agent',
  builder: 'builder',
  admin: 'admin',
} as const;

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  buyer: 1,
  owner: 2,
  agent: 3,
  builder: 4,
  admin: 5,
} as const;

// Role-based access control
export const ROLE_PERMISSIONS = {
  buyer: [
    'view_properties',
    'save_searches',
    'manage_favorites',
    'view_profile',
    'update_profile',
  ],
  owner: [
    'view_properties',
    'list_properties',
    'manage_properties',
    'view_profile',
    'update_profile',
  ],
  agent: [
    'view_properties',
    'list_properties',
    'manage_properties',
    'manage_leads',
    'view_analytics',
    'schedule_visits',
    'view_profile',
    'update_profile',
  ],
  builder: [
    'view_properties',
    'list_properties',
    'manage_properties',
    'manage_projects',
    'bulk_upload',
    'view_analytics',
    'view_profile',
    'update_profile',
  ],
  admin: [
    'view_properties',
    'list_properties',
    'manage_properties',
    'manage_users',
    'moderate_content',
    'view_analytics',
    'manage_system',
    'view_profile',
    'update_profile',
  ],
} as const;

// Protected routes by role
export const PROTECTED_ROUTES = {
  buyer: ['/dashboard', '/favorites', '/saved-searches', '/profile'],
  owner: ['/dashboard', '/my-properties', '/profile'],
  agent: ['/dashboard', '/leads', '/analytics', '/properties', '/profile'],
  builder: ['/dashboard', '/projects', '/bulk-upload', '/analytics', '/profile'],
  admin: ['/admin', '/dashboard', '/users', '/moderation', '/analytics', '/profile'],
} as const;

// Form validation rules
export const VALIDATION_RULES = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255,
  },
  password: {
    required: true,
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  firstName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
  },
  lastName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
  },
  phone: {
    required: false,
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    minLength: 10,
    maxLength: 15,
  },
  otp: {
    required: true,
    length: 6,
    pattern: /^\d{6}$/,
  },
} as const;

// Error messages
export const ERROR_MESSAGES: Record<AuthErrorType, string> = {
  [AuthErrorType.INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
  [AuthErrorType.USER_NOT_FOUND]: 'No account found with this email address.',
  [AuthErrorType.EMAIL_ALREADY_EXISTS]: 'An account with this email already exists.',
  [AuthErrorType.INVALID_TOKEN]: 'Invalid or expired token. Please log in again.',
  [AuthErrorType.TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
  [AuthErrorType.NETWORK_ERROR]: 'Network error. Please check your connection and try again.',
  [AuthErrorType.VALIDATION_ERROR]: 'Please check your input and try again.',
  [AuthErrorType.UNAUTHORIZED]: 'You are not authorized to access this resource.',
  [AuthErrorType.FORBIDDEN]: 'You do not have permission to perform this action.',
} as const;

// Field validation error messages
export const FIELD_ERROR_MESSAGES = {
  email: {
    required: 'Email is required',
    invalid: 'Please enter a valid email address',
    maxLength: 'Email must be less than 255 characters',
  },
  password: {
    required: 'Password is required',
    minLength: 'Password must be at least 8 characters long',
    maxLength: 'Password must be less than 128 characters',
    pattern: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    mismatch: 'Passwords do not match',
  },
  confirmPassword: {
    required: 'Please confirm your password',
    mismatch: 'Passwords do not match',
  },
  firstName: {
    required: 'First name is required',
    minLength: 'First name must be at least 2 characters long',
    maxLength: 'First name must be less than 50 characters',
    pattern: 'First name can only contain letters, spaces, hyphens, and apostrophes',
  },
  lastName: {
    required: 'Last name is required',
    minLength: 'Last name must be at least 2 characters long',
    maxLength: 'Last name must be less than 50 characters',
    pattern: 'Last name can only contain letters, spaces, hyphens, and apostrophes',
  },
  phone: {
    invalid: 'Please enter a valid phone number',
    minLength: 'Phone number must be at least 10 digits',
    maxLength: 'Phone number must be less than 15 digits',
  },
  otp: {
    required: 'Verification code is required',
    invalid: 'Please enter a valid 6-digit verification code',
    length: 'Verification code must be exactly 6 digits',
  },
  role: {
    required: 'Please select a role',
    invalid: 'Please select a valid role',
  },
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  REGISTER: 'Account created successfully! Please verify your email.',
  LOGOUT: 'Successfully logged out!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  EMAIL_VERIFIED: 'Email verified successfully!',
  VERIFICATION_SENT: 'Verification email sent! Please check your inbox.',
  PASSWORD_RESET_SENT: 'Password reset email sent! Please check your inbox.',
  PASSWORD_RESET: 'Password reset successfully! You can now log in with your new password.',
} as const;

// Loading messages
export const LOADING_MESSAGES = {
  LOGGING_IN: 'Logging in...',
  REGISTERING: 'Creating account...',
  LOGGING_OUT: 'Logging out...',
  UPDATING_PROFILE: 'Updating profile...',
  CHANGING_PASSWORD: 'Changing password...',
  VERIFYING_EMAIL: 'Verifying email...',
  SENDING_VERIFICATION: 'Sending verification email...',
  SENDING_RESET: 'Sending password reset email...',
  RESETTING_PASSWORD: 'Resetting password...',
  REFRESHING_TOKEN: 'Refreshing session...',
} as const;

// Form field names
export const FORM_FIELDS = {
  EMAIL: 'email',
  PASSWORD: 'password',
  CONFIRM_PASSWORD: 'confirmPassword',
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  PHONE: 'phone',
  ROLE: 'role',
  OTP: 'otp',
  TOKEN: 'token',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER_DATA: 'auth_user_data',
  REMEMBER_EMAIL: 'auth_remember_email',
  LAST_LOGIN: 'auth_last_login',
} as const;

// Session configuration
export const SESSION_CONFIG = {
  REMEMBER_ME_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  SESSION_WARNING_TIME: 5 * 60 * 1000, // 5 minutes before expiry
  AUTO_LOGOUT_TIME: 60 * 60 * 1000, // 1 hour of inactivity
  HEARTBEAT_INTERVAL: 5 * 60 * 1000, // 5 minutes
} as const;

// Rate limiting
export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: 5,
  REGISTRATION_ATTEMPTS: 3,
  PASSWORD_RESET_ATTEMPTS: 3,
  EMAIL_VERIFICATION_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
} as const;

// Default values
export const DEFAULT_VALUES = {
  ROLE: 'buyer' as UserRole,
  AVATAR: '/default-avatar.png',
  PAGINATION_LIMIT: 20,
  SEARCH_DEBOUNCE: 300,
} as const;