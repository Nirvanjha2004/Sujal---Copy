/**
 * Auth-specific validation utilities
 */

import { 
  LoginFormData, 
  RegisterFormData, 
  ProfileFormData, 
  PasswordResetFormData,
  NewPasswordFormData,
  OTPVerificationFormData,
  FormValidationError 
} from '../types/forms';
import { UserRole } from '../types/user';

/**
 * Validate email format
 */
export const validateEmail = (email: string): string | null => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }

  return null;
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate phone number (Indian format)
 */
export const validatePhone = (phone: string): string | null => {
  if (!phone || !phone.trim()) {
    return null; // Phone is optional in most cases
  }

  const cleanPhone = phone.replace(/\D/g, '');
  const phoneRegex = /^[6-9]\d{9}$/;
  
  if (!phoneRegex.test(cleanPhone)) {
    return 'Please enter a valid 10-digit Indian mobile number';
  }

  return null;
};

/**
 * Validate required field
 */
export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || !value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate password confirmation
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }

  return null;
};

/**
 * Validate name fields (first name, last name)
 */
export const validateName = (name: string, fieldName: string): string | null => {
  if (!name || !name.trim()) {
    return `${fieldName} is required`;
  }

  if (name.trim().length < 2) {
    return `${fieldName} must be at least 2 characters long`;
  }

  if (name.trim().length > 50) {
    return `${fieldName} must be less than 50 characters`;
  }

  // Only allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(name.trim())) {
    return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
  }

  return null;
};

/**
 * Validate user role
 */
export const validateRole = (role: string): string | null => {
  const validRoles: UserRole[] = ['buyer', 'owner', 'agent', 'builder', 'admin'];
  
  if (!role) {
    return 'Role is required';
  }

  if (!validRoles.includes(role as UserRole)) {
    return 'Please select a valid role';
  }

  return null;
};

/**
 * Validate OTP format
 */
export const validateOTP = (otp: string): string | null => {
  if (!otp || !otp.trim()) {
    return 'OTP is required';
  }

  const cleanOTP = otp.replace(/\D/g, '');
  if (cleanOTP.length !== 6) {
    return 'OTP must be 6 digits';
  }

  return null;
};

/**
 * Sanitize input by trimming whitespace and removing potentially harmful characters
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Sanitize email input
 */
export const sanitizeEmail = (email: string): string => {
  if (!email) return '';
  return email.trim().toLowerCase();
};

/**
 * Sanitize phone input (keep only digits and common separators)
 */
export const sanitizePhone = (phone: string): string => {
  if (!phone) return '';
  return phone.replace(/[^\d\s\-\+\(\)]/g, '');
};

/**
 * Validate complete login form
 */
export const validateLoginForm = (data: LoginFormData): FormValidationError[] => {
  const errors: FormValidationError[] = [];

  const emailError = validateEmail(data.email);
  if (emailError) {
    errors.push({ field: 'email', message: emailError });
  }

  const passwordError = validateRequired(data.password, 'Password');
  if (passwordError) {
    errors.push({ field: 'password', message: passwordError });
  }

  return errors;
};

/**
 * Validate complete registration form
 */
export const validateRegisterForm = (data: RegisterFormData): FormValidationError[] => {
  const errors: FormValidationError[] = [];

  // Email validation
  const emailError = validateEmail(data.email);
  if (emailError) {
    errors.push({ field: 'email', message: emailError });
  }

  // Password validation
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.push({ field: 'password', message: passwordValidation.errors[0] });
  }

  // Confirm password validation
  const confirmPasswordError = validatePasswordMatch(data.password, data.confirmPassword);
  if (confirmPasswordError) {
    errors.push({ field: 'confirmPassword', message: confirmPasswordError });
  }

  // First name validation
  const firstNameError = validateName(data.firstName, 'First name');
  if (firstNameError) {
    errors.push({ field: 'firstName', message: firstNameError });
  }

  // Last name validation
  const lastNameError = validateName(data.lastName, 'Last name');
  if (lastNameError) {
    errors.push({ field: 'lastName', message: lastNameError });
  }

  // Phone validation (optional)
  if (data.phone) {
    const phoneError = validatePhone(data.phone);
    if (phoneError) {
      errors.push({ field: 'phone', message: phoneError });
    }
  }

  // Role validation (if provided)
  if (data.role) {
    const roleError = validateRole(data.role);
    if (roleError) {
      errors.push({ field: 'role', message: roleError });
    }
  }

  return errors;
};

/**
 * Validate profile form
 */
export const validateProfileForm = (data: ProfileFormData): FormValidationError[] => {
  const errors: FormValidationError[] = [];

  // First name validation
  const firstNameError = validateName(data.firstName, 'First name');
  if (firstNameError) {
    errors.push({ field: 'firstName', message: firstNameError });
  }

  // Last name validation
  const lastNameError = validateName(data.lastName, 'Last name');
  if (lastNameError) {
    errors.push({ field: 'lastName', message: lastNameError });
  }

  // Phone validation (optional)
  if (data.phone) {
    const phoneError = validatePhone(data.phone);
    if (phoneError) {
      errors.push({ field: 'phone', message: phoneError });
    }
  }

  return errors;
};

/**
 * Validate password reset form
 */
export const validatePasswordResetForm = (data: PasswordResetFormData): FormValidationError[] => {
  const errors: FormValidationError[] = [];

  const emailError = validateEmail(data.email);
  if (emailError) {
    errors.push({ field: 'email', message: emailError });
  }

  return errors;
};

/**
 * Validate new password form
 */
export const validateNewPasswordForm = (data: NewPasswordFormData): FormValidationError[] => {
  const errors: FormValidationError[] = [];

  // Password validation
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.push({ field: 'password', message: passwordValidation.errors[0] });
  }

  // Confirm password validation
  const confirmPasswordError = validatePasswordMatch(data.password, data.confirmPassword);
  if (confirmPasswordError) {
    errors.push({ field: 'confirmPassword', message: confirmPasswordError });
  }

  // Token validation
  const tokenError = validateRequired(data.token, 'Reset token');
  if (tokenError) {
    errors.push({ field: 'token', message: tokenError });
  }

  return errors;
};

/**
 * Validate OTP verification form
 */
export const validateOTPForm = (data: OTPVerificationFormData): FormValidationError[] => {
  const errors: FormValidationError[] = [];

  const emailError = validateEmail(data.email);
  if (emailError) {
    errors.push({ field: 'email', message: emailError });
  }

  const otpError = validateOTP(data.otp);
  if (otpError) {
    errors.push({ field: 'otp', message: otpError });
  }

  return errors;
};

/**
 * Check if form has any validation errors
 */
export const hasValidationErrors = (errors: FormValidationError[]): boolean => {
  return errors.length > 0;
};

/**
 * Get error message for a specific field
 */
export const getFieldError = (errors: FormValidationError[], fieldName: string): string | null => {
  const error = errors.find(err => err.field === fieldName);
  return error ? error.message : null;
};

/**
 * Clear errors for a specific field
 */
export const clearFieldError = (errors: FormValidationError[], fieldName: string): FormValidationError[] => {
  return errors.filter(err => err.field !== fieldName);
};

/**
 * Validation service object for easy access to validation functions
 */
export const validationService = {
  validateEmail: (email: string): boolean => validateEmail(email) === null,
  validatePassword: (password: string): { isValid: boolean; errors: string[] } => validatePassword(password),
  validatePhone: (phone: string): boolean => validatePhone(phone) === null,
  validateRequired: (value: string, fieldName: string): string | null => validateRequired(value, fieldName),
  validatePasswordMatch: (password: string, confirmPassword: string): string | null => validatePasswordMatch(password, confirmPassword),
  validateName: (name: string, fieldName: string): string | null => validateName(name, fieldName),
  validateRole: (role: string): string | null => validateRole(role),
  validateOTP: (otp: string): string | null => validateOTP(otp),
  sanitizeInput: (input: string): string => sanitizeInput(input),
  sanitizeEmail: (email: string): string => sanitizeEmail(email),
  sanitizePhone: (phone: string): string => sanitizePhone(phone),
};