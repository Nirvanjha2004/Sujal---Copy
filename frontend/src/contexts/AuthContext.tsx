import React, { createContext, useContext, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, registerUser, logoutUser, updateUserProfile, loadUser, clearError } from '@/store/slices/authSlice';
import { User } from '@/lib/api';
import { getValidToken } from '@/utils/tokenUtils';

interface AuthContextType {
  state: {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
  };
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; password: string; firstName: string; lastName: string; role?: string; phone?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  // Check if user is authenticated on app load
  useEffect(() => {
    const token = getValidToken();
    if (token && !authState.isAuthenticated && !authState.isLoading) {
      dispatch(loadUser());
    }
  }, [dispatch, authState.isAuthenticated, authState.isLoading]);

  const login = async (email: string, password: string) => {
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
  };

  const register = async (userData: { email: string; password: string; firstName: string; lastName: string; role?: string; phone?: string }) => {
    const result = await dispatch(registerUser(userData));
    if (registerUser.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
  };

  const logout = () => {
    dispatch(logoutUser());
  };

  const updateUser = async (userData: Partial<User>) => {
    const result = await dispatch(updateUserProfile(userData));
    if (updateUserProfile.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return (
    <AuthContext.Provider value={{ 
      state: authState, 
      login, 
      register, 
      logout, 
      updateUser, 
      clearError: handleClearError 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}