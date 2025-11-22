import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { LoginCredentials, AuthError, AuthErrorType } from '../types';
import { validationService } from '../utils/validation';

interface UseLoginState {
  isLoading: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
}

interface UseLoginReturn extends UseLoginState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  validateField: (field: keyof LoginCredentials, value: string) => string | null;
  validateForm: (credentials: LoginCredentials) => Record<string, string>;
  clearError: () => void;
  clearFieldError: (field: keyof LoginCredentials) => void;
}

/**
 * Specialized hook for login-specific logic and state management
 * Provides form validation, error handling, and login flow management
 */
export function useLogin(): UseLoginReturn {
  const { login: authLogin, clearError: authClearError } = useAuth();
  
  const [state, setState] = useState<UseLoginState>({
    isLoading: false,
    error: null,
    fieldErrors: {}
  });

  /**
   * Validate individual form field
   */
  const validateField = useCallback((field: keyof LoginCredentials, value: string): string | null => {
    switch (field) {
      case 'email':
        if (!value.trim()) {
          return 'Email is required';
        }
        if (!validationService.validateEmail(value)) {
          return 'Please enter a valid email address';
        }
        return null;
      
      case 'password':
        if (!value.trim()) {
          return 'Password is required';
        }
        if (value.length < 6) {
          return 'Password must be at least 6 characters';
        }
        return null;
      
      default:
        return null;
    }
  }, []);

  /**
   * Validate entire login form
   */
  const validateForm = useCallback((credentials: LoginCredentials): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    const emailError = validateField('email', credentials.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validateField('password', credentials.password);
    if (passwordError) errors.password = passwordError;
    
    return errors;
  }, [validateField]);

  /**
   * Perform login with validation and error handling
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    // Clear previous errors
    setState(prev => ({ ...prev, error: null, fieldErrors: {} }));
    authClearError();

    // Validate form
    const fieldErrors = validateForm(credentials);
    if (Object.keys(fieldErrors).length > 0) {
      setState(prev => ({ ...prev, fieldErrors }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await authLogin(credentials.email, credentials.password);
      setState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }));
      return false;
    }
  }, [authLogin, authClearError, validateForm]);

  /**
   * Clear general error
   */
  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
    authClearError();
  }, [authClearError]);

  /**
   * Clear specific field error
   */
  const clearFieldError = useCallback((field: keyof LoginCredentials): void => {
    setState(prev => ({
      ...prev,
      fieldErrors: {
        ...prev.fieldErrors,
        [field]: undefined
      }
    }));
  }, []);

  return {
    ...state,
    login,
    validateField,
    validateForm,
    clearError,
    clearFieldError
  };
}

export default useLogin;