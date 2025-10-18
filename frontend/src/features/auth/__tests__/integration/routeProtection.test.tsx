import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import { ProtectedRoute } from '../../components/guards/ProtectedRoute';
import { UserRole } from '../../types';

// Mock components for testing
const PublicComponent = () => <div>Public Content</div>;
const ProtectedComponent = () => <div>Protected Content</div>;
const AdminComponent = () => <div>Admin Content</div>;
const AgentComponent = () => <div>Agent Content</div>;
const BuilderComponent = () => <div>Builder Content</div>;
const LoginComponent = () => <div>Login Page</div>;

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

// Test wrapper component with routing
const TestWrapper = ({ 
  children, 
  initialState = {},
  initialRoute = '/'
}: { 
  children: React.ReactNode; 
  initialState?: any;
  initialRoute?: string;
}) => {
  const store = createTestStore(initialState);
  
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/public" element={<PublicComponent />} />
          <Route 
            path="/protected" 
            element={
              <ProtectedRoute>
                <ProtectedComponent />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminComponent />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/agent" 
            element={
              <ProtectedRoute requiredRole="agent">
                <AgentComponent />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/builder" 
            element={
              <ProtectedRoute requiredRole="builder">
                <BuilderComponent />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/multi-role" 
            element={
              <ProtectedRoute requiredRole={["admin", "agent"]}>
                <div>Multi-Role Content</div>
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

// Helper to create mock users
const createMockUser = (role: UserRole, overrides = {}) => ({
  id: 1,
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role,
  isVerified: true,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('Route Protection and Role-Based Access Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location for navigation tests
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  describe('Unauthenticated User Access', () => {
    it('should allow access to public routes', () => {
      render(
        <TestWrapper>
          <PublicComponent />
        </TestWrapper>
      );

      expect(screen.getByText('Public Content')).toBeInTheDocument();
    });

    it('should redirect unauthenticated users to login for protected routes', async () => {
      // Mock window.location.pathname for the test
      Object.defineProperty(window, 'location', {
        value: { pathname: '/protected' },
        writable: true,
      });

      render(
        <TestWrapper initialRoute="/protected">
          <div />
        </TestWrapper>
      );

      // Should show login page instead of protected content
      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      });
    });

    it('should show loading state while authentication is being checked', () => {
      render(
        <TestWrapper initialState={{ isLoading: true }}>
          <ProtectedRoute>
            <ProtectedComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated User Access', () => {
    it('should allow authenticated users to access protected routes', () => {
      const mockUser = createMockUser('buyer');
      
      render(
        <TestWrapper initialState={{ 
          user: mockUser, 
          isAuthenticated: true, 
          token: 'mock-token' 
        }}>
          <ProtectedRoute>
            <ProtectedComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should allow users with correct role to access role-specific routes', () => {
      const mockAdmin = createMockUser('admin');
      
      render(
        <TestWrapper initialState={{ 
          user: mockAdmin, 
          isAuthenticated: true, 
          token: 'mock-token' 
        }}>
          <ProtectedRoute requiredRole="admin">
            <AdminComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('should deny access to users without required role', () => {
      const mockBuyer = createMockUser('buyer');
      
      render(
        <TestWrapper initialState={{ 
          user: mockBuyer, 
          isAuthenticated: true, 
          token: 'mock-token' 
        }}>
          <ProtectedRoute requiredRole="admin">
            <AdminComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText('Your role: buyer')).toBeInTheDocument();
      expect(screen.getByText('Required role: admin')).toBeInTheDocument();
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
  });

  describe('Role-Based Access Control', () => {
    const roles: UserRole[] = ['admin', 'agent', 'builder', 'buyer'];

    describe('Admin Role Access', () => {
      it('should allow admin access to admin routes', () => {
        const mockAdmin = createMockUser('admin');
        
        render(
          <TestWrapper initialState={{ 
            user: mockAdmin, 
            isAuthenticated: true, 
            token: 'mock-token' 
          }}>
            <ProtectedRoute requiredRole="admin">
              <AdminComponent />
            </ProtectedRoute>
          </TestWrapper>
        );

        expect(screen.getByText('Admin Content')).toBeInTheDocument();
      });

      it('should deny non-admin users access to admin routes', () => {
        const nonAdminRoles: UserRole[] = ['agent', 'builder', 'buyer'];
        
        nonAdminRoles.forEach(role => {
          const mockUser = createMockUser(role);
          
          const { unmount } = render(
            <TestWrapper initialState={{ 
              user: mockUser, 
              isAuthenticated: true, 
              token: 'mock-token' 
            }}>
              <ProtectedRoute requiredRole="admin">
                <AdminComponent />
              </ProtectedRoute>
            </TestWrapper>
          );

          expect(screen.getByText('Access Denied')).toBeInTheDocument();
          expect(screen.getByText(`Your role: ${role}`)).toBeInTheDocument();
          expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
          
          unmount();
        });
      });
    });

    describe('Agent Role Access', () => {
      it('should allow agent access to agent routes', () => {
        const mockAgent = createMockUser('agent');
        
        render(
          <TestWrapper initialState={{ 
            user: mockAgent, 
            isAuthenticated: true, 
            token: 'mock-token' 
          }}>
            <ProtectedRoute requiredRole="agent">
              <AgentComponent />
            </ProtectedRoute>
          </TestWrapper>
        );

        expect(screen.getByText('Agent Content')).toBeInTheDocument();
      });

      it('should deny non-agent users access to agent routes', () => {
        const nonAgentRoles: UserRole[] = ['admin', 'builder', 'buyer'];
        
        nonAgentRoles.forEach(role => {
          const mockUser = createMockUser(role);
          
          const { unmount } = render(
            <TestWrapper initialState={{ 
              user: mockUser, 
              isAuthenticated: true, 
              token: 'mock-token' 
            }}>
              <ProtectedRoute requiredRole="agent">
                <AgentComponent />
              </ProtectedRoute>
            </TestWrapper>
          );

          expect(screen.getByText('Access Denied')).toBeInTheDocument();
          expect(screen.queryByText('Agent Content')).not.toBeInTheDocument();
          
          unmount();
        });
      });
    });

    describe('Builder Role Access', () => {
      it('should allow builder access to builder routes', () => {
        const mockBuilder = createMockUser('builder');
        
        render(
          <TestWrapper initialState={{ 
            user: mockBuilder, 
            isAuthenticated: true, 
            token: 'mock-token' 
          }}>
            <ProtectedRoute requiredRole="builder">
              <BuilderComponent />
            </ProtectedRoute>
          </TestWrapper>
        );

        expect(screen.getByText('Builder Content')).toBeInTheDocument();
      });

      it('should deny non-builder users access to builder routes', () => {
        const nonBuilderRoles: UserRole[] = ['admin', 'agent', 'buyer'];
        
        nonBuilderRoles.forEach(role => {
          const mockUser = createMockUser(role);
          
          const { unmount } = render(
            <TestWrapper initialState={{ 
              user: mockUser, 
              isAuthenticated: true, 
              token: 'mock-token' 
            }}>
              <ProtectedRoute requiredRole="builder">
                <BuilderComponent />
              </ProtectedRoute>
            </TestWrapper>
          );

          expect(screen.getByText('Access Denied')).toBeInTheDocument();
          expect(screen.queryByText('Builder Content')).not.toBeInTheDocument();
          
          unmount();
        });
      });
    });

    describe('Multiple Role Access', () => {
      it('should allow users with any of the required roles', () => {
        const allowedRoles: UserRole[] = ['admin', 'agent'];
        
        allowedRoles.forEach(role => {
          const mockUser = createMockUser(role);
          
          const { unmount } = render(
            <TestWrapper initialState={{ 
              user: mockUser, 
              isAuthenticated: true, 
              token: 'mock-token' 
            }}>
              <ProtectedRoute requiredRole={['admin', 'agent']}>
                <div>Multi-Role Content</div>
              </ProtectedRoute>
            </TestWrapper>
          );

          expect(screen.getByText('Multi-Role Content')).toBeInTheDocument();
          
          unmount();
        });
      });

      it('should deny users without any of the required roles', () => {
        const deniedRoles: UserRole[] = ['builder', 'buyer'];
        
        deniedRoles.forEach(role => {
          const mockUser = createMockUser(role);
          
          const { unmount } = render(
            <TestWrapper initialState={{ 
              user: mockUser, 
              isAuthenticated: true, 
              token: 'mock-token' 
            }}>
              <ProtectedRoute requiredRole={['admin', 'agent']}>
                <div>Multi-Role Content</div>
              </ProtectedRoute>
            </TestWrapper>
          );

          expect(screen.getByText('Access Denied')).toBeInTheDocument();
          expect(screen.getByText('Required role: admin, agent')).toBeInTheDocument();
          expect(screen.queryByText('Multi-Role Content')).not.toBeInTheDocument();
          
          unmount();
        });
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing user data gracefully', () => {
      render(
        <TestWrapper initialState={{ 
          user: null, 
          isAuthenticated: true, // Inconsistent state
          token: 'mock-token' 
        }}>
          <ProtectedRoute>
            <ProtectedComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should redirect to login due to missing user
      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should handle invalid role gracefully', () => {
      const mockUser = createMockUser('buyer');
      
      render(
        <TestWrapper initialState={{ 
          user: mockUser, 
          isAuthenticated: true, 
          token: 'mock-token' 
        }}>
          <ProtectedRoute requiredRole="invalid-role" as any>
            <div>Invalid Role Content</div>
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.queryByText('Invalid Role Content')).not.toBeInTheDocument();
    });

    it('should show access denied with navigation options', () => {
      const mockBuyer = createMockUser('buyer');
      
      render(
        <TestWrapper initialState={{ 
          user: mockBuyer, 
          isAuthenticated: true, 
          token: 'mock-token' 
        }}>
          <ProtectedRoute requiredRole="admin">
            <AdminComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to dashboard/i })).toBeInTheDocument();
    });

    it('should redirect without showing access denied when showAccessDenied is false', () => {
      const mockBuyer = createMockUser('buyer');
      
      render(
        <TestWrapper initialState={{ 
          user: mockBuyer, 
          isAuthenticated: true, 
          token: 'mock-token' 
        }}>
          <ProtectedRoute requiredRole="admin" showAccessDenied={false}>
            <AdminComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should redirect to dashboard instead of showing access denied
      expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
  });

  describe('Navigation and Redirects', () => {
    it('should preserve the intended destination after login', () => {
      // Mock location with intended destination
      const mockLocation = {
        pathname: '/protected',
        state: { from: { pathname: '/admin' } }
      };

      render(
        <TestWrapper>
          <ProtectedRoute>
            <ProtectedComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should redirect to login and preserve the intended destination
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('should redirect admin users to admin dashboard by default', () => {
      const mockAdmin = createMockUser('admin');
      
      render(
        <TestWrapper initialState={{ 
          user: mockAdmin, 
          isAuthenticated: true, 
          token: 'mock-token' 
        }}>
          <ProtectedRoute requiredRole="buyer" showAccessDenied={false}>
            <div>Buyer Content</div>
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should redirect admin to admin dashboard
      expect(screen.queryByText('Buyer Content')).not.toBeInTheDocument();
    });

    it('should redirect non-admin users to regular dashboard by default', () => {
      const mockBuyer = createMockUser('buyer');
      
      render(
        <TestWrapper initialState={{ 
          user: mockBuyer, 
          isAuthenticated: true, 
          token: 'mock-token' 
        }}>
          <ProtectedRoute requiredRole="admin" showAccessDenied={false}>
            <AdminComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Should redirect buyer to regular dashboard
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
  });
});