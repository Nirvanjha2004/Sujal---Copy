import { useCallback } from 'react';
import { toast } from 'sonner';

export interface UIError {
  id: string;
  type: 'validation' | 'network' | 'permission' | 'unknown';
  message: string;
  details?: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  context?: Record<string, any>;
}

export function useErrorHandler() {
  const handleError = useCallback((
    error: Error | string | UIError,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      context = {},
    } = options;

    let processedError: UIError;

    // Process different error types
    if (typeof error === 'string') {
      processedError = {
        id: generateErrorId(),
        type: 'unknown',
        message: error,
        timestamp: new Date(),
        context,
      };
    } else if (error instanceof Error) {
      processedError = {
        id: generateErrorId(),
        type: categorizeError(error),
        message: error.message,
        details: error.stack,
        timestamp: new Date(),
        context,
      };
    } else {
      processedError = {
        ...error,
        context: { ...error.context, ...context },
      };
    }

    // Log error for debugging
    if (logError) {
      console.error('Error handled:', processedError);
      
      // In production, send to error reporting service
      if (process.env.NODE_ENV === 'production') {
        reportError(processedError);
      }
    }

    // Show user-friendly toast notification
    if (showToast) {
      const userMessage = getUserFriendlyMessage(processedError);
      
      toast.error(userMessage, {
        description: processedError.details && process.env.NODE_ENV === 'development' 
          ? processedError.details.split('\n')[0] 
          : undefined,
        action: processedError.type === 'network' ? {
          label: 'Retry',
          onClick: () => {
            // Retry logic would be handled by the calling component
            toast.info('Please try your action again');
          },
        } : undefined,
      });
    }

    return processedError;
  }, []);

  const showSuccess = useCallback((message: string, description?: string) => {
    toast.success(message, { description });
  }, []);

  const showWarning = useCallback((message: string, description?: string) => {
    toast.warning(message, { description });
  }, []);

  const showInfo = useCallback((message: string, description?: string) => {
    toast.info(message, { description });
  }, []);

  const showValidationError = useCallback((message: string, field?: string) => {
    const errorMessage = field ? `${field}: ${message}` : message;
    toast.error(errorMessage, {
      description: 'Please check your input and try again.',
    });
  }, []);

  const showNetworkError = useCallback((operation?: string) => {
    const message = operation 
      ? `Failed to ${operation}. Please check your connection and try again.`
      : 'Network error. Please check your connection and try again.';
    
    toast.error(message, {
      action: {
        label: 'Retry',
        onClick: () => toast.info('Please try your action again'),
      },
    });
  }, []);

  const showPermissionError = useCallback((action?: string) => {
    const message = action
      ? `You don't have permission to ${action}.`
      : 'You don\'t have permission to perform this action.';
    
    toast.error(message, {
      description: 'Please contact your administrator if you believe this is an error.',
    });
  }, []);

  return {
    handleError,
    showSuccess,
    showWarning,
    showInfo,
    showValidationError,
    showNetworkError,
    showPermissionError,
  };
}

// Helper functions
function generateErrorId(): string {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function categorizeError(error: Error): UIError['type'] {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return 'network';
  }
  
  if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
    return 'permission';
  }
  
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return 'validation';
  }
  
  return 'unknown';
}

function getUserFriendlyMessage(error: UIError): string {
  switch (error.type) {
    case 'network':
      return 'Connection error. Please check your internet connection and try again.';
    case 'permission':
      return 'You don\'t have permission to perform this action.';
    case 'validation':
      return error.message || 'Please check your input and try again.';
    default:
      return error.message || 'Something went wrong. Please try again.';
  }
}

function reportError(error: UIError): void {
  // In a real application, this would send the error to a monitoring service
  // like Sentry, LogRocket, or a custom error reporting endpoint
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Would report error to monitoring service:', error);
    return;
  }

  // Example implementation:
  // fetch('/api/errors', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(error),
  // }).catch(console.error);
}

// Specialized error handlers for common scenarios
export function useFormErrorHandler() {
  const { handleError, showValidationError } = useErrorHandler();

  const handleFormError = useCallback((error: any, fieldName?: string) => {
    if (error?.response?.data?.errors) {
      // Handle validation errors from API
      const apiErrors = error.response.data.errors;
      Object.entries(apiErrors).forEach(([field, message]) => {
        showValidationError(message as string, field);
      });
    } else if (fieldName && error?.message) {
      showValidationError(error.message, fieldName);
    } else {
      handleError(error, { context: { type: 'form_submission' } });
    }
  }, [handleError, showValidationError]);

  return { handleFormError };
}

export function useApiErrorHandler() {
  const { handleError, showNetworkError, showPermissionError } = useErrorHandler();

  const handleApiError = useCallback((error: any, operation?: string) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      showPermissionError(operation);
    } else if (error?.response?.status >= 500 || error?.code === 'NETWORK_ERROR') {
      showNetworkError(operation);
    } else {
      const message = error?.response?.data?.message || error?.message || 'API request failed';
      handleError(message, { 
        context: { 
          operation,
          status: error?.response?.status,
          url: error?.config?.url,
        }
      });
    }
  }, [handleError, showNetworkError, showPermissionError]);

  return { handleApiError };
}