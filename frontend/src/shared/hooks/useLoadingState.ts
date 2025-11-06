import { useState, useCallback, useRef, useEffect } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  progress?: number;
}

interface UseLoadingStateOptions {
  initialLoading?: boolean;
  minLoadingTime?: number; // Minimum time to show loading state (prevents flashing)
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const {
    initialLoading = false,
    minLoadingTime = 300,
    onError,
    onSuccess
  } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: initialLoading,
    error: null,
    progress: undefined
  });

  const loadingStartTime = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    if (loading) {
      loadingStartTime.current = Date.now();
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    } else {
      const elapsed = loadingStartTime.current ? Date.now() - loadingStartTime.current : 0;
      const remainingTime = Math.max(0, minLoadingTime - elapsed);

      if (remainingTime > 0) {
        timeoutRef.current = setTimeout(() => {
          setState(prev => ({ ...prev, isLoading: false }));
          onSuccess?.();
        }, remainingTime);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
        onSuccess?.();
      }
    }
  }, [minLoadingTime, onSuccess]);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
    if (error) {
      onError?.(error);
    }
  }, [onError]);

  const setProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress }));
  }, []);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setState({ isLoading: false, error: null, progress: undefined });
  }, []);

  // Async operation wrapper
  const executeAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: { showProgress?: boolean }
  ): Promise<T> => {
    try {
      setLoading(true);
      if (options?.showProgress) {
        setProgress(0);
      }
      
      const result = await operation();
      
      if (options?.showProgress) {
        setProgress(100);
        // Small delay to show completion
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      setLoading(false);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    }
  }, [setLoading, setError, setProgress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    setLoading,
    setError,
    setProgress,
    reset,
    executeAsync
  };
}

// Hook for managing multiple loading states
export function useMultipleLoadingStates<T extends string>(
  keys: readonly T[]
): Record<T, LoadingState> & {
  setLoading: (key: T, loading: boolean) => void;
  setError: (key: T, error: string | null) => void;
  setProgress: (key: T, progress: number) => void;
  isAnyLoading: boolean;
  hasAnyError: boolean;
  reset: (key?: T) => void;
} {
  const initialState = keys.reduce((acc, key) => {
    acc[key] = { isLoading: false, error: null, progress: undefined };
    return acc;
  }, {} as Record<T, LoadingState>);

  const [states, setStates] = useState(initialState);

  const setLoading = useCallback((key: T, loading: boolean) => {
    setStates(prev => ({
      ...prev,
      [key]: { ...prev[key], isLoading: loading, error: loading ? null : prev[key].error }
    }));
  }, []);

  const setError = useCallback((key: T, error: string | null) => {
    setStates(prev => ({
      ...prev,
      [key]: { ...prev[key], error, isLoading: false }
    }));
  }, []);

  const setProgress = useCallback((key: T, progress: number) => {
    setStates(prev => ({
      ...prev,
      [key]: { ...prev[key], progress }
    }));
  }, []);

  const reset = useCallback((key?: T) => {
    if (key) {
      setStates(prev => ({
        ...prev,
        [key]: { isLoading: false, error: null, progress: undefined }
      }));
    } else {
      setStates(initialState);
    }
  }, [initialState]);

  const isAnyLoading = Object.values(states).some(state => state.isLoading);
  const hasAnyError = Object.values(states).some(state => state.error !== null);

  return {
    ...states,
    setLoading,
    setError,
    setProgress,
    isAnyLoading,
    hasAnyError,
    reset
  };
}

// Hook for debounced loading states (useful for search/filter operations)
export function useDebouncedLoadingState(delay: number = 300) {
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedLoading, setDebouncedLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (loading) {
      timeoutRef.current = setTimeout(() => {
        setDebouncedLoading(true);
      }, delay);
    } else {
      setDebouncedLoading(false);
    }
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    debouncedLoading,
    setLoading
  };
}