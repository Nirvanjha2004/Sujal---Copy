import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useAuth } from '@/shared/contexts/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  fallbackPath?: string;
  showAccessDenied?: boolean;
}

/**
 * Enhanced ProtectedRoute with better error handling and role checking
 * Supports multiple roles and custom fallback behavior
 */
export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallbackPath = '/login',
  showAccessDenied = true
}: ProtectedRouteProps) {
  const { state: { user, isAuthenticated, isLoading } } = useAuth();
  const location = useLocation();

  // Debug logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('=== ProtectedRoute Debug ===');
      console.log('Current path:', location.pathname);
      console.log('Required role:', requiredRole);
      console.log('Is authenticated:', isAuthenticated);
      console.log('User:', user);
      console.log('User role:', user?.role);
      console.log('Loading:', isLoading);
      console.log('============================');
    }
  }, [isAuthenticated, user, requiredRole, location.pathname, isLoading]);

  // Show loading spinner while auth is being initialized
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Icon icon="solar:loading-bold" className="size-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRequiredRole = allowedRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      if (!showAccessDenied) {
        // Redirect to appropriate dashboard based on user role
        const dashboardPath = user.role === 'admin' ? '/admin' : '/dashboard';
        return <Navigate to={dashboardPath} replace />;
      }

      // Show access denied page
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 size-16 rounded-full bg-red-100 flex items-center justify-center">
                <Icon icon="solar:shield-cross-bold" className="size-8 text-red-600" />
              </div>
              <CardTitle className="text-xl">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                You don't have permission to access this page.
              </p>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Your role:</span> {user.role}
                </p>
                <p>
                  <span className="font-medium">Required role:</span>{' '}
                  {Array.isArray(requiredRole) ? requiredRole.join(', ') : requiredRole}
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  <Icon icon="solar:arrow-left-bold" className="size-4 mr-2" />
                  Go Back
                </Button>
                <Button 
                  onClick={() => {
                    const dashboardPath = user.role === 'admin' ? '/admin' : '/dashboard';
                    window.location.href = dashboardPath;
                  }}
                >
                  <Icon icon="solar:home-bold" className="size-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
}