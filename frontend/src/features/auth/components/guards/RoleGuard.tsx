import { ReactNode } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { UserRole } from '../../types';

interface RoleGuardProps {
  allowedRoles: UserRole | UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
  requireAll?: boolean; // For future use with multiple roles
}

/**
 * Role-based access control component
 * Shows children only if user has required role(s)
 */
export function RoleGuard({ 
  allowedRoles, 
  children, 
  fallback = null,
  requireAll = false 
}: RoleGuardProps) {
  const { state: { user, isAuthenticated } } = useAuth();

  // Not authenticated - don't show content
  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  // Check if user has required role(s)
  const hasRole = requireAll 
    ? roles.every(role => user.role === role) // For future multi-role support
    : roles.includes(user.role);

  if (!hasRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Convenience components for common role checks
 */
export const AdminOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleGuard allowedRoles="admin" fallback={fallback}>
    {children}
  </RoleGuard>
);

export const AgentOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleGuard allowedRoles="agent" fallback={fallback}>
    {children}
  </RoleGuard>
);

export const BuilderOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleGuard allowedRoles="builder" fallback={fallback}>
    {children}
  </RoleGuard>
);

export const OwnerOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleGuard allowedRoles="owner" fallback={fallback}>
    {children}
  </RoleGuard>
);

export const BuyerOnly = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleGuard allowedRoles="buyer" fallback={fallback}>
    {children}
  </RoleGuard>
);

/**
 * Multi-role convenience components
 */
export const AdminOrAgent = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleGuard allowedRoles={['admin', 'agent']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const AdminOrBuilder = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleGuard allowedRoles={['admin', 'builder']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const BuyerOrOwner = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <RoleGuard allowedRoles={['buyer', 'owner']} fallback={fallback}>
    {children}
  </RoleGuard>
);