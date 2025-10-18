import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { RegisterData } from '../types';
import { validationService } from '../utils/validation';

interface UseRegisterState {
  isLoading: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  isSuccess: boolean;
}

interface UseRegisterReturn extends UseRegisterState {
  register: (userData: RegisterData & { confirmPassword: string }) => Promise<boolean>;
  validateField: (field: string, value: string, confirmPassword?: string) => string | null;
  validateForm: (userData: RegisterData & { confirmPassword: string }) => Record<string, string>;
  clearError: () => void;
  clearFieldError: (field: string) => void;
  resetState: () => void;
}

/**
 * Specialized hook for registration flow management
 * Provides form validation, error handling, and registration state management
 */
export function useRegister(): UseRegisterReturn {
  const { register: authRegister, clearError: authClearError } = useAuth();
  
  const [state, setState] = useState<UseRegisterState>({
    isLoading: false,
    error: null,
    fieldErrors: {},
    isSuccess: false
  });

  /**
   * Validate individual form field
   */
  const validateField = useCallback((field: string, value: string, confirmPassword?: string): string | null => {
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
        const passwordValidation = validationService.validatePassword(value);
        if (!passwordValidation.isValid) {
          return passwordValidation.errors[0] || 'Password is invalid';
        }
        return null;
      
      case 'confirmPassword':
        if (!value.trim()) {
          return 'Please confirm your password';
        }
        if (confirmPassword && value !== confirmPassword) {
          return 'Passwords do not match';
        }
        return null;
      
      case 'firstName':
        if (!value.trim()) {
          return 'First name is required';
        }
        if (value.trim().length < 2) {
          return 'First name must be at least 2 characters';
        }
        return null;
      
      case 'lastName':
        if (!value.trim()) {
          return 'Last name is required';
        }
        if (value.trim().length < 2) {
          return 'Last name must be at least 2 characters';
        }
        return null;
      
      case 'phone':
        if (value && !validationService.validatePhone(value)) {
          return 'Please enter a valid phone number';
        }
        return null;
      
      default:
        return null;
    }
  }, []);

  /**
   * Validate entire registration form
   */
  const validateForm = useCallback((userData: RegisterData & { confirmPassword: string }): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    const emailError = validateField('email', userData.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validateField('password', userData.password);
    if (passwordError) errors.password = passwordError;
    
    const confirmPasswordError = validateField('confirmPassword', userData.confirmPassword, userData.password);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
    
    const firstNameError = validateField('firstName', userData.firstName);
    if (firstNameError) errors.firstName = firstNameError;
    
    const lastNameError = validateField('lastName', userData.lastName);
    if (lastNameError) errors.lastName = lastNameError;
    
    if (userData.phone) {
      const phoneError = validateField('phone', userData.phone);
      if (phoneError) errors.phone = phoneError;
    }
    
    return errors;
  }, [validateField]);

  /**
   * Perform registration with validation and error handling
   */
  const register = useCallback(async (userData: RegisterData & { confirmPassword: string }): Promise<boolean> => {
    // Clear previous errors
    setState(prev => ({ ...prev, error: null, fieldErrors: {}, isSuccess: false }));
    authClearError();

    // Validate form
    const fieldErrors = validateForm(userData);
    if (Object.keys(fieldErrors).length > 0) {
      setState(prev => ({ ...prev, fieldErrors }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Remove confirmPassword from the data sent to the API
      const { confirmPassword, ...registrationData } = userData;
      await authRegister(registrationData);
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        isSuccess: true
      }));
      return true;
    } catch (error) {
      let errorMessage = 'Registration failed';
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('email already exists') || error.message.includes('EMAIL_ALREADY_EXISTS')) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            fieldErrors: { email: 'This email is already registered' }
          }));
          return false;
        }
        errorMessage = error.message;
      }
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: errorMessage
      }));
      return false;
    }
  }, [authRegister, authClearError, validateForm]);

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
  const clearFieldError = useCallback((field: string): void => {
    setState(prev => {
      const { [field]: _, ...restErrors } = prev.fieldErrors;
      return {
        ...prev,
        fieldErrors: restErrors
      };
    });
  }, []);

  /**
   * Reset entire state (useful for form reset)
   */
  const resetState = useCallback((): void => {
    setState({
      isLoading: false,
      error: null,
      fieldErrors: {},
      isSuccess: false
    });
    authClearError();
  }, [authClearError]);

  return {
    ...state,
    register,
    validateField,
    validateForm,
    clearError,
    clearFieldError,
    resetState
  };
}

export default useRegister;