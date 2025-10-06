import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'agent' | 'user' | 'builder';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { state } = useAuth();
  const location = useLocation();

  // Debug logging
  useEffect(() => {
    console.log('=== ProtectedRoute Debug ===');
    console.log('Current path:', location.pathname);
    console.log('Required role:', requiredRole);
    console.log('Is authenticated:', state.isAuthenticated);
    console.log('User:', state.user);
    console.log('User role:', state.user?.role);
    console.log('Loading:', state.loading);
    console.log('============================');
  }, [state, requiredRole, location.pathname]);

  // Show loading spinner while auth is being initialized
  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!state.isAuthenticated || !state.user) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole && state.user.role !== requiredRole) {
    console.log('Role mismatch:', state.user.role, 'vs required:', requiredRole);
    
    // Show access denied message instead of redirect loop
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-600">Your role: {state.user.role}</p>
          <p className="text-sm text-gray-600">Required role: {requiredRole}</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  console.log('Access granted, rendering children');
  return <>{children}</>;
}