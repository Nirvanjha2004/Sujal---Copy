import { useState, useCallback, useRef, useEffect } from 'react';
import { useErrorHandler } from './useErrorHandler';

export interface UseAsyncOperationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
  retryCount?: number;
  retryDelay?: number;
}

export interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isSuccess: boolean;
  isError: boolean;
  retryAttempt: number;
}

export interface AsyncOperationActions<T> {
  execute: (...args: any[]) => Promise<T | undefined>;
  retry: () => Promise<T | undefined>;
  reset: () => void;
  cancel: () => void;
}

export function useAsyncOperation<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOperationOptions<T> = {}
): AsyncOperationState<T> & AsyncOperationActions<T> {
  const {
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage,
    errorMessage,
    retryCount = 0,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
    isSuccess: false,
    isError: false,
    retryAttempt: 0,
  });

  const { handleError, showSuccess } = useErrorHandler();
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastArgsRef = useRef<any[]>([]);

  const execute = useCallback(async (...args: any[]): Promise<T | undefined> => {
    // Cancel any ongoing operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    lastArgsRef.current = args;

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      isSuccess: false,
      isError: false,
    }));

    try {
      const result = await asyncFunction(...args);
      
      // Check if operation was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return undefined;
      }

      setState(prev => ({
        ...prev,
        data: result,
        loading: false,
        isSuccess: true,
        isError: false,
        error: null,
        retryAttempt: 0,
      }));

      // Handle success
      onSuccess?.(result);
      
      if (showSuccessToast && successMessage) {
        showSuccess(successMessage);
      }

      return result;
    } catch (error) {
      // Check if operation was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return undefined;
      }

      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorObj,
        isSuccess: false,
        isError: true,
      }));

      // Handle error
      onError?.(errorObj);
      
      if (showErrorToast) {
        handleError(errorMessage || errorObj.message, {
          context: { operation: asyncFunction.name || 'async_operation' }
        });
      }

      // Auto-retry if configured
      if (retryCount > 0 && state.retryAttempt < retryCount) {
        setTimeout(() => {
          retry();
        }, retryDelay);
      }

      throw errorObj;
    }
  }, [
    asyncFunction,
    onSuccess,
    onError,
    showSuccessToast,
    showErrorToast,
    successMessage,
    errorMessage,
    retryCount,
    retryDelay,
    state.retryAttempt,
    handleError,
    showSuccess,
  ]);

  const retry = useCallback(async (): Promise<T | undefined> => {
    setState(prev => ({
      ...prev,
      retryAttempt: prev.retryAttempt + 1,
    }));
    
    return execute(...lastArgsRef.current);
  }, [execute]);

  const reset = useCallback(() => {
    // Cancel any ongoing operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState({
      data: null,
      loading: false,
      error: null,
      isSuccess: false,
      isError: false,
      retryAttempt: 0,
    });
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState(prev => ({
      ...prev,
      loading: false,
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    execute,
    retry,
    reset,
    cancel,
  };
}

// Specialized hooks for common async operations
export function useAsyncMutation<T = any, P = any>(
  mutationFn: (params: P) => Promise<T>,
  options: UseAsyncOperationOptions<T> = {}
) {
  const operation = useAsyncOperation(mutationFn, {
    showSuccessToast: true,
    ...options,
  });

  const mutate = useCallback(async (params: P) => {
    return operation.execute(params);
  }, [operation.execute]);

  return {
    ...operation,
    mutate,
  };
}

export function useAsyncQuery<T = any>(
  queryFn: () => Promise<T>,
  options: UseAsyncOperationOptions<T> & {
    enabled?: boolean;
    refetchOnMount?: boolean;
  } = {}
) {
  const {
    enabled = true,
    refetchOnMount = true,
    ...operationOptions
  } = options;

  const operation = useAsyncOperation(queryFn, {
    showErrorToast: true,
    ...operationOptions,
  });

  const refetch = useCallback(() => {
    return operation.execute();
  }, [operation.execute]);

  // Auto-execute on mount if enabled
  useEffect(() => {
    if (enabled && refetchOnMount) {
      refetch();
    }
  }, [enabled, refetchOnMount, refetch]);

  return {
    ...operation,
    refetch,
  };
}

// Hook for handling form submissions
export function useFormSubmission<T = any, P = any>(
  submitFn: (data: P) => Promise<T>,
  options: UseAsyncOperationOptions<T> = {}
) {
  return useAsyncMutation(submitFn, {
    showSuccessToast: true,
    successMessage: 'Form submitted successfully!',
    ...options,
  });
}

// Hook for handling delete operations
export function useDeleteOperation<T = any>(
  deleteFn: (id: string | number) => Promise<T>,
  options: UseAsyncOperationOptions<T> = {}
) {
  return useAsyncMutation(deleteFn, {
    showSuccessToast: true,
    successMessage: 'Item deleted successfully!',
    ...options,
  });
}