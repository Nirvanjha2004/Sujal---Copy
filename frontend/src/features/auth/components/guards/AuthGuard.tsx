import { ReactNode, ComponentType } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';

interface AuthGuardProps {
  requiredRole?: UserRole | UserRole[];
  fallback?: ReactNode;
  children?: ReactNode;
}

interface WithAuthGuardProps {
  requiredRole?: UserRole | UserRole[];
  fallback?: ReactNode;
}

/**
 * Higher-order component for auth protection
 * Can be used as a wrapper component or HOC
 */
export function AuthGuard({ 
  requiredRole, 
  fallback = null, 
  children 
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return fallback;
  }

  // Check authentication
  if (!isAuthenticated || !user) {
    return fallback;
  }

  // Check role requirement
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRequiredRole = allowedRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      return fallback;
    }
  }

  return <>{children}</>;
}

/**
 * Higher-order component wrapper for auth protection
 * Usage: const ProtectedComponent = withAuthGuard(MyComponent, { requiredRole: 'admin' });
 */
export function withAuthGuard<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthGuardProps = {}
) {
  const { requiredRole, fallback } = options;

  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard requiredRole={requiredRole} fallback={fallback}>
        <WrappedComponent {...props} />
      </AuthGuard>
    );
  };
}