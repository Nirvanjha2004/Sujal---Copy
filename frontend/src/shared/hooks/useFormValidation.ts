import { useState, useCallback, useEffect, useRef } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  asyncValidator?: (value: any) => Promise<string | null>;
}

export interface FieldState {
  value: any;
  error: string | null;
  success: string | null;
  touched: boolean;
  validating: boolean;
  dirty: boolean;
}

export interface FormState {
  [key: string]: FieldState;
}

interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
  showSuccessMessage?: boolean;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Partial<Record<keyof T, ValidationRule>>,
  options: UseFormValidationOptions = {}
) {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300,
    showSuccessMessage = true
  } = options;

  // Initialize form state
  const [formState, setFormState] = useState<FormState>(() => {
    const state: FormState = {};
    Object.keys(initialValues).forEach(key => {
      state[key] = {
        value: initialValues[key],
        error: null,
        success: null,
        touched: false,
        validating: false,
        dirty: false
      };
    });
    return state;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounceTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // Validation function
  const validateField = useCallback(async (
    fieldName: keyof T, 
    value: any,
    showSuccess = showSuccessMessage
  ): Promise<string | null> => {
    const rules = validationRules[fieldName];
    if (!rules) return null;

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${String(fieldName)} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // String length validations
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return `${String(fieldName)} must be at least ${rules.minLength} characters`;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return `${String(fieldName)} must be no more than ${rules.maxLength} characters`;
      }
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      return `${String(fieldName)} format is invalid`;
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) return customError;
    }

    // Async validation
    if (rules.asyncValidator) {
      try {
        const asyncError = await rules.asyncValidator(value);
        if (asyncError) return asyncError;
      } catch (error) {
        return 'Validation failed';
      }
    }

    return null;
  }, [validationRules, showSuccessMessage]);

  // Update field value and validate
  const setFieldValue = useCallback((fieldName: keyof T, value: any) => {
    setFormState(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,
        dirty: true,
        error: null,
        success: null
      }
    }));

    if (validateOnChange) {
      // Clear existing timeout
      if (debounceTimeouts.current[String(fieldName)]) {
        clearTimeout(debounceTimeouts.current[String(fieldName)]);
      }

      // Set new timeout for debounced validation
      debounceTimeouts.current[String(fieldName)] = setTimeout(async () => {
        setFormState(prev => ({
          ...prev,
          [fieldName]: { ...prev[fieldName], validating: true }
        }));

        const error = await validateField(fieldName, value);
        
        setFormState(prev => ({
          ...prev,
          [fieldName]: {
            ...prev[fieldName],
            error,
            success: !error && showSuccessMessage && prev[fieldName].dirty ? 'Valid' : null,
            validating: false
          }
        }));
      }, debounceMs);
    }
  }, [validateOnChange, debounceMs, validateField, showSuccessMessage]);

  // Set field as touched (for blur events)
  const setFieldTouched = useCallback(async (fieldName: keyof T) => {
    setFormState(prev => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], touched: true }
    }));

    if (validateOnBlur && formState[String(fieldName)].dirty) {
      setFormState(prev => ({
        ...prev,
        [fieldName]: { ...prev[fieldName], validating: true }
      }));

      const error = await validateField(fieldName, formState[String(fieldName)].value);
      
      setFormState(prev => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          error,
          success: !error && showSuccessMessage ? 'Valid' : null,
          validating: false
        }
      }));
    }
  }, [validateOnBlur, validateField, formState, showSuccessMessage]);

  // Set field error manually
  const setFieldError = useCallback((fieldName: keyof T, error: string | null) => {
    setFormState(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        error,
        success: null
      }
    }));
  }, []);

  // Validate all fields
  const validateForm = useCallback(async (): Promise<boolean> => {
    const newState = { ...formState };
    let hasErrors = false;

    for (const fieldName of Object.keys(formState)) {
      const error = await validateField(fieldName as keyof T, formState[fieldName].value, false);
      newState[fieldName] = {
        ...newState[fieldName],
        error,
        touched: true,
        validating: false
      };
      if (error) hasErrors = true;
    }

    setFormState(newState);
    return !hasErrors;
  }, [formState, validateField]);

  // Submit handler
  const handleSubmit = useCallback(async (
    onSubmit: (values: T) => Promise<void> | void
  ) => {
    setIsSubmitting(true);
    
    try {
      const isValid = await validateForm();
      
      if (isValid) {
        const values = Object.keys(formState).reduce((acc, key) => {
          acc[key as keyof T] = formState[key].value;
          return acc;
        }, {} as T);
        
        await onSubmit(values);
        
        // Show success state for all fields
        if (showSuccessMessage) {
          setFormState(prev => {
            const newState = { ...prev };
            Object.keys(newState).forEach(key => {
              if (!newState[key].error) {
                newState[key] = { ...newState[key], success: 'Saved successfully' };
              }
            });
            return newState;
          });
        }
      }
    } catch (error) {
      // Handle submission error
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formState, validateForm, showSuccessMessage]);

  // Reset form
  const resetForm = useCallback(() => {
    const state: FormState = {};
    Object.keys(initialValues).forEach(key => {
      state[key] = {
        value: initialValues[key],
        error: null,
        success: null,
        touched: false,
        validating: false,
        dirty: false
      };
    });
    setFormState(state);
    setIsSubmitting(false);
    
    // Clear all timeouts
    Object.values(debounceTimeouts.current).forEach(timeout => {
      clearTimeout(timeout);
    });
    debounceTimeouts.current = {};
  }, [initialValues]);

  // Get form values
  const getValues = useCallback((): T => {
    return Object.keys(formState).reduce((acc, key) => {
      acc[key as keyof T] = formState[key].value;
      return acc;
    }, {} as T);
  }, [formState]);

  // Check if form is valid
  const isValid = Object.values(formState).every(field => !field.error);
  const isDirty = Object.values(formState).some(field => field.dirty);
  const isValidating = Object.values(formState).some(field => field.validating);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimeouts.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  return {
    formState,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    validateForm,
    handleSubmit,
    resetForm,
    getValues,
    isValid,
    isDirty,
    isValidating,
    isSubmitting
  };
}

// Common validation rules
export const validationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address';
      }
      return null;
    }
  },
  
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    custom: (value: string) => {
      if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value)) {
        return 'Please enter a valid phone number';
      }
      return null;
    }
  },
  
  password: {
    minLength: 8,
    custom: (value: string) => {
      if (value && value.length < 8) {
        return 'Password must be at least 8 characters';
      }
      if (value && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }
      return null;
    }
  },
  
  required: {
    required: true
  },
  
  url: {
    pattern: /^https?:\/\/.+/,
    custom: (value: string) => {
      if (value && !/^https?:\/\/.+/.test(value)) {
        return 'Please enter a valid URL';
      }
      return null;
    }
  }
};