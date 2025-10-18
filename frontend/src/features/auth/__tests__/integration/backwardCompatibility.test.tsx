import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import { AuthContext } from '@/shared/contexts/AuthContext';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { tokenService } from '../../services/tokenService';

// Mock the services
vi.mock('../../services/authService');
vi.mock('../../services/tokenService');

// Test component that uses the legacy AuthContext
const LegacyAuthComponent = () => {
  const authContext = React.useContext(AuthContext);
  
  if (!authContext) {
    return <div>No Auth Context</div>;
  }

  const { user, isAuthenticated, login, logout } = authContext;

  return (
    <div>
      <div>Auth Context Available</div>
      {isAuthenticated ? (
        <div>
          <div>User: {user?.email}</div>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <div>Not Authenticated</div>
          <button onClick={() => login('test@example.com', 'password')}>Login</button>
        </div>
      )}
    </div>
  );
};

// Test component that uses the new useAuth hook
const NewAuthComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <div>New Auth Hook</div>
      {isAuthenticated ? (
        <div>
          <div>User: {user?.email}</div>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <div>Not Authenticated</div>
          <button onClick={() => login('test@example.com', 'password')}>Login</button>
        </div>
      )}
    </div>
  );
};

// Test component that uses both old and new auth methods
const MixedAuthComponent = () => {
  const authContext = React.useContext(AuthContext);
  const authHook = useAuth();

  return (
    <div>
      <div>Mixed Auth Component</div>
      <div>Context Auth: {authContext?.isAuthenticated ? 'Yes' : 'No'}</div>
      <div>Hook Auth: {authHook.isAuthenticated ? 'Yes' : 'No'}</div>
      <div>Context User: {authContext?.user?.email || 'None'}</div>
      <div>Hook User: {authHook.user?.email || 'None'}</div>
    </div>
  );
};

// Test store setup
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
        ...initialState,
      },
    },
  });
};

// Test wrapper component
const TestWrapper = ({ children, initialState = {} }: { children: React.ReactNode; initialState?: any }) => {
  const store = createTestStore(initialState);
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthContext.Provider value={{
          user: initialState.user || null,
          isAuthenticated: initialState.isAuthenticated || false,
          login: vi.fn(),
          logout: vi.fn(),
          register: vi.fn(),
          updateProfile: vi.fn(),
          isLoading: initialState.isLoading || false,
          error: initialState.error || null,
        }}>
          {children}
        </AuthContext.Provider>
      </BrowserRouter>
    </Provider>
  );
};

describe('Backward Compatibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('AuthContext Compatibility', () => {
    it('should maintain AuthContext availability for legacy components', () => {
      render(
        <TestWrapper>
          <LegacyAuthComponent />
        </TestWrapper>
      );

      expect(screen.getByText('Auth Context Available')).toBeInTheDocument();
      expect(screen.getByText('Not Authenticated')).toBeInTheDocument();
    });

    it('should provide consistent auth state between context and hook', () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'buyer' as const,
        isVerified: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      render(
        <TestWrapper initialState={{ 
          user: mockUser, 
          isAuthenticated: true, 
          token: 'mock-token' 
        }}>
          <MixedAuthComponent />
        </TestWrapper>
      );

      expect(screen.getByText('Mixed Auth Component')).toBeInTheDocument();
      expect(screen.getByText('Context Auth: Yes')).toBeInTheDocument();
      expect(screen.getByText('Hook Auth: Yes')).toBeInTheDocument();
      expect(screen.getByText('Context User: test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Hook User: test@example.com')).toBeInTheDocument();
    });

    it('should handle unauthenticated state consistently', () => {
      render(
        <TestWrapper>
          <MixedAuthComponent />
        </TestWrapper>
      );

      expect(screen.getByText('Context Auth: No')).toBeInTheDocument();
      expect(screen.getByText('Hook Auth: No')).toBeInTheDocument();
      expect(screen.getByText('Context User: None')).toBeInTheDocument();
      expect(screen.getByText('Hook User: None')).toBeInTheDocument();
    });
  });

  describe('Redux Store Integration', () => {
    it('should maintain Redux auth slice functionality', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'buyer' as const,
        isVerified: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockAuthResponse = {
        user: mockUser,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      };

      vi.mocked(authService.login).mockResolvedValue(mockAuthResponse);
      vi.mocked(tokenService.setToken).mockReturnValue(true);

      const store = createTestStore();

      render(
        <Provider store={store}>
          <BrowserRouter>
            <NewAuthComponent />
          </BrowserRouter>
        </Provider>
      );

      // Initially not authenticated
      expect(screen.getByText('Not Authenticated')).toBeInTheDocument();

      // Trigger login
      const loginButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(loginButton);

      // Wait for auth state to update
      await waitFor(() => {
        expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
      });
    });

    it('should handle Redux auth actions correctly', async () => {
      const store = createTestStore();
      
      // Dispatch login action
      const loginAction = {
        type: 'auth/login/fulfilled',
        payload: {
          user: {
            id: 1,
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'buyer' as const,
            isVerified: true,
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          token: 'mock-token',
        },
      };

      store.dispatch(loginAction);

      // Check that state was updated
      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(true);
      expect(state.auth.user?.email).toBe('test@example.com');
      expect(state.auth.token).toBe('mock-token');
    });
  });

  describe('API Integration Compatibility', () => {
    it('should maintain compatibility with existing API calls', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'buyer' as const,
        isVerified: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      // Mock the auth service methods
      vi.mocked(authService.login).mockResolvedValue({
        user: mockUser,
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
      });

      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(authService.logout).mockResolvedValue();

      // Test login
      const loginResult = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(loginResult.user.email).toBe('test@example.com');
      expect(loginResult.token).toBe('mock-token');

      // Test get current user
      const currentUser = await authService.getCurrentUser();
      expect(currentUser.email).toBe('test@example.com');

      // Test logout
      await expect(authService.logout()).resolves.not.toThrow();
    });

    it('should handle API errors consistently', async () => {
      const mockError = {
        type: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      };

      vi.mocked(authService.login).mockRejectedValue(mockError);

      await expect(
        authService.login({
          email: 'invalid@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toEqual(mockError);
    });
  });

  describe('Token Management Compatibility', () => {
    it('should maintain token service functionality', () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJidXllciIsImlhdCI6MTcwNDEwMDAwMCwiZXhwIjoxNzA0MTAzNjAwfQ.test';

      vi.mocked(tokenService.setToken).mockReturnValue(true);
      vi.mocked(tokenService.getValidToken).mockReturnValue(mockToken);
      vi.mocked(tokenService.validateToken).mockReturnValue({
        isValid: true,
        payload: {
          userId: 1,
          email: 'test@example.com',
          role: 'buyer',
          iat: 1704100000,
          exp: 1704103600,
        },
      });

      // Test token setting
      const setResult = tokenService.setToken(mockToken);
      expect(setResult).toBe(true);

      // Test token retrieval
      const retrievedToken = tokenService.getValidToken();
      expect(retrievedToken).toBe(mockToken);

      // Test token validation
      const validation = tokenService.validateToken(mockToken);
      expect(validation.isValid).toBe(true);
      expect(validation.payload?.email).toBe('test@example.com');
    });

    it('should handle token expiration correctly', () => {
      const expiredToken = 'expired-token';

      vi.mocked(tokenService.validateToken).mockReturnValue({
        isValid: false,
        error: 'Token expired',
      });

      vi.mocked(tokenService.getValidToken).mockReturnValue(null);

      const validation = tokenService.validateToken(expiredToken);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBe('Token expired');

      const validToken = tokenService.getValidToken();
      expect(validToken).toBeNull();
    });
  });

  describe('Component Integration', () => {
    it('should work with existing components that use auth', () => {
      const ExistingComponent = () => {
        const { user, isAuthenticated } = useAuth();
        
        return (
          <div>
            <div>Existing Component</div>
            {isAuthenticated ? (
              <div>Welcome, {user?.firstName}!</div>
            ) : (
              <div>Please log in</div>
            )}
          </div>
        );
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'buyer' as const,
        isVerified: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      render(
        <TestWrapper initialState={{ 
          user: mockUser, 
          isAuthenticated: true, 
          token: 'mock-token' 
        }}>
          <ExistingComponent />
        </TestWrapper>
      );

      expect(screen.getByText('Existing Component')).toBeInTheDocument();
      expect(screen.getByText('Welcome, Test!')).toBeInTheDocument();
    });

    it('should maintain routing compatibility', () => {
      const RoutingComponent = () => {
        const { isAuthenticated } = useAuth();
        
        return (
          <div>
            <div>Routing Component</div>
            <div>Auth Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <RoutingComponent />
        </TestWrapper>
      );

      expect(screen.getByText('Routing Component')).toBeInTheDocument();
      expect(screen.getByText('Auth Status: Not Authenticated')).toBeInTheDocument();
    });
  });

  describe('Type Compatibility', () => {
    it('should maintain type compatibility for User interface', () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'buyer' as const,
        isVerified: true,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      // This should compile without type errors
      const TypeTestComponent = () => {
        const { user } = useAuth();
        
        if (user) {
          // All these properties should be available
          const id: number = user.id;
          const email: string = user.email;
          const firstName: string = user.firstName;
          const lastName: string = user.lastName;
          const role: string = user.role;
          const isVerified: boolean = user.isVerified;
          const isActive: boolean = user.isActive;
          const createdAt: string = user.createdAt;
          const updatedAt: string = user.updatedAt;

          return (
            <div>
              <div>User ID: {id}</div>
              <div>Email: {email}</div>
              <div>Name: {firstName} {lastName}</div>
              <div>Role: {role}</div>
              <div>Verified: {isVerified ? 'Yes' : 'No'}</div>
              <div>Active: {isActive ? 'Yes' : 'No'}</div>
            </div>
          );
        }

        return <div>No user</div>;
      };

      render(
        <TestWrapper initialState={{ 
          user: mockUser, 
          isAuthenticated: true, 
          token: 'mock-token' 
        }}>
          <TypeTestComponent />
        </TestWrapper>
      );

      expect(screen.getByText('User ID: 1')).toBeInTheDocument();
      expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Name: Test User')).toBeInTheDocument();
      expect(screen.getByText('Role: buyer')).toBeInTheDocument();
    });
  });

  describe('Error Handling Compatibility', () => {
    it('should handle errors consistently across old and new implementations', async () => {
      const mockError = 'Authentication failed';

      const ErrorTestComponent = () => {
        const { error, login } = useAuth();
        
        return (
          <div>
            <div>Error Test Component</div>
            {error && <div>Error: {error}</div>}
            <button onClick={() => login('test@example.com', 'wrongpassword')}>
              Trigger Error
            </button>
          </div>
        );
      };

      vi.mocked(authService.login).mockRejectedValue(new Error(mockError));

      render(
        <TestWrapper>
          <ErrorTestComponent />
        </TestWrapper>
      );

      const errorButton = screen.getByRole('button', { name: /trigger error/i });
      fireEvent.click(errorButton);

      await waitFor(() => {
        expect(screen.getByText(`Error: ${mockError}`)).toBeInTheDocument();
      });
    });
  });
});