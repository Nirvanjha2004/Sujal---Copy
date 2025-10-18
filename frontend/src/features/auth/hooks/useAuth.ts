import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  updateUserProfile, 
  loadUser, 
  clearError 
} from '@/store/slices/authSlice';
import { UseAuthReturn, RegisterData, User } from '../types';
import { tokenService } from '../services/tokenService';

/**
 * Core authentication hook that wraps existing AuthContext functionality
 * Maintains compatibility with existing Redux auth slice
 * Provides consistent auth state management interface
 */
export function useAuth(): UseAuthReturn {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  /**
   * Login user with email and password
   */
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
  }, [dispatch]);

  /**
   * Register new user
   */
  const register = useCallback(async (userData: RegisterData): Promise<void> => {
    const result = await dispatch(registerUser(userData));
    if (registerUser.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
  }, [dispatch]);

  /**
   * Logout current user
   */
  const logout = useCallback((): void => {
    dispatch(logoutUser());
  }, [dispatch]);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (userData: Partial<User>): Promise<void> => {
    const result = await dispatch(updateUserProfile(userData));
    if (updateUserProfile.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
  }, [dispatch]);

  /**
   * Clear authentication error
   */
  const handleClearError = useCallback((): void => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Load user from token (for app initialization)
   */
  const loadUserFromToken = useCallback(async (): Promise<void> => {
    const token = tokenService.getValidToken();
    if (token && !authState.isAuthenticated && !authState.isLoading) {
      const result = await dispatch(loadUser());
      if (loadUser.rejected.match(result)) {
        throw new Error(result.payload as string);
      }
    }
  }, [dispatch, authState.isAuthenticated, authState.isLoading]);

  return {
    // State
    user: authState.user,
    token: authState.token,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    error: authState.error,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    clearError: handleClearError,
    
    // Additional utility (not in original interface but useful)
    loadUserFromToken,
  } as UseAuthReturn & { loadUserFromToken: () => Promise<void> };
}

export default useAuth;