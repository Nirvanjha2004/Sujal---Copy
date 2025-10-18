import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { ProfileUpdateData } from '../types';
import { validationService } from '../utils/validation';

interface UseProfileState {
  isLoading: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  isSuccess: boolean;
  isDirty: boolean;
}

interface UseProfileReturn extends UseProfileState {
  updateProfile: (userData: ProfileUpdateData) => Promise<boolean>;
  validateField: (field: keyof ProfileUpdateData, value: string) => string | null;
  validateForm: (userData: ProfileUpdateData) => Record<string, string>;
  clearError: () => void;
  clearFieldError: (field: keyof ProfileUpdateData) => void;
  resetState: () => void;
  markDirty: () => void;
  markClean: () => void;
}

/**
 * Specialized hook for profile management functionality
 * Provides form validation, error handling, and profile update state management
 */
export function useProfile(): UseProfileReturn {
  const { updateProfile: authUpdateProfile, clearError: authClearError, user } = useAuth();
  
  const [state, setState] = useState<UseProfileState>({
    isLoading: false,
    error: null,
    fieldErrors: {},
    isSuccess: false,
    isDirty: false
  });

  /**
   * Validate individual form field
   */
  const validateField = useCallback((field: keyof ProfileUpdateData, value: string): string | null => {
    switch (field) {
      case 'firstName':
        if (!value.trim()) {
          return 'First name is required';
        }
        if (value.trim().length < 2) {
          return 'First name must be at least 2 characters';
        }
        if (value.trim().length > 50) {
          return 'First name must be less than 50 characters';
        }
        return null;
      
      case 'lastName':
        if (!value.trim()) {
          return 'Last name is required';
        }
        if (value.trim().length < 2) {
          return 'Last name must be at least 2 characters';
        }
        if (value.trim().length > 50) {
          return 'Last name must be less than 50 characters';
        }
        return null;
      
      case 'phone':
        if (value && !validationService.validatePhone(value)) {
          return 'Please enter a valid phone number';
        }
        return null;
      
      case 'avatar':
        // Avatar validation could include URL validation or file type checking
        if (value && value.length > 500) {
          return 'Avatar URL is too long';
        }
        return null;
      
      default:
        return null;
    }
  }, []);

  /**
   * Validate entire profile form
   */
  const validateForm = useCallback((userData: ProfileUpdateData): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (userData.firstName !== undefined) {
      const firstNameError = validateField('firstName', userData.firstName);
      if (firstNameError) errors.firstName = firstNameError;
    }
    
    if (userData.lastName !== undefined) {
      const lastNameError = validateField('lastName', userData.lastName);
      if (lastNameError) errors.lastName = lastNameError;
    }
    
    if (userData.phone !== undefined) {
      const phoneError = validateField('phone', userData.phone);
      if (phoneError) errors.phone = phoneError;
    }
    
    if (userData.avatar !== undefined) {
      const avatarError = validateField('avatar', userData.avatar);
      if (avatarError) errors.avatar = avatarError;
    }
    
    return errors;
  }, [validateField]);

  /**
   * Check if profile data has changed from current user data
   */
  const hasChanges = useCallback((userData: ProfileUpdateData): boolean => {
    if (!user) return false;
    
    return (
      (userData.firstName !== undefined && userData.firstName !== user.firstName) ||
      (userData.lastName !== undefined && userData.lastName !== user.lastName) ||
      (userData.phone !== undefined && userData.phone !== user.phone) ||
      (userData.avatar !== undefined && userData.avatar !== user.avatar)
    );
  }, [user]);

  /**
   * Update user profile with validation and error handling
   */
  const updateProfile = useCallback(async (userData: ProfileUpdateData): Promise<boolean> => {
    // Clear previous errors
    setState(prev => ({ ...prev, error: null, fieldErrors: {}, isSuccess: false }));
    authClearError();

    // Check if there are any changes
    if (!hasChanges(userData)) {
      setState(prev => ({ ...prev, error: 'No changes to save' }));
      return false;
    }

    // Validate form
    const fieldErrors = validateForm(userData);
    if (Object.keys(fieldErrors).length > 0) {
      setState(prev => ({ ...prev, fieldErrors }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await authUpdateProfile(userData);
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        isSuccess: true,
        isDirty: false
      }));
      return true;
    } catch (error) {
      let errorMessage = 'Failed to update profile';
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('phone already exists')) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            fieldErrors: { phone: 'This phone number is already in use' }
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
  }, [authUpdateProfile, authClearError, validateForm, hasChanges]);

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
  const clearFieldError = useCallback((field: keyof ProfileUpdateData): void => {
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
      isSuccess: false,
      isDirty: false
    });
    authClearError();
  }, [authClearError]);

  /**
   * Mark form as dirty (has unsaved changes)
   */
  const markDirty = useCallback((): void => {
    setState(prev => ({ ...prev, isDirty: true, isSuccess: false }));
  }, []);

  /**
   * Mark form as clean (no unsaved changes)
   */
  const markClean = useCallback((): void => {
    setState(prev => ({ ...prev, isDirty: false }));
  }, []);

  return {
    ...state,
    updateProfile,
    validateField,
    validateForm,
    clearError,
    clearFieldError,
    resetState,
    markDirty,
    markClean
  };
}

export default useProfile;