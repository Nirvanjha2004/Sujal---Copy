import React, { lazy, Suspense } from 'react';
import { ComponentType } from 'react';
import { LoadingFallback } from '../components/ui/loading-fallback';
import { load } from 'js-yaml';
import { load } from 'js-yaml';
import { load } from 'js-yaml';
import { load } from 'js-yaml';
import { load } from 'js-yaml';

/**
 * Utility for creating lazy-loaded components with better error handling
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string
): React.LazyExoticComponent<T> {
  const LazyComponent = lazy(async () => {
    try {
      const module = await importFn();
      return module;
    } catch (error) {
      console.error(`Failed to load component: ${componentName}`, error);
      // Return a fallback component
      return {
        default: (() => (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-red-600 mb-2">Failed to load component</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          </div>
        )) as T
      };
    }
  });

  LazyComponent.displayName = `Lazy(${componentName})`;
  return LazyComponent;
}

/**
 * Preload a lazy component
 */
export function preloadComponent(importFn: () => Promise<any>): void {
  importFn().catch(error => {
    console.warn('Failed to preload component:', error);
  });
}

/**
 * Create a lazy component with preloading capability
 */
export function createPreloadableLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string
) {
  const LazyComponent = createLazyComponent(importFn, componentName);
  
  return {
    Component: LazyComponent,
    preload: () => preloadComponent(importFn)
  };
}
// 
Lazy load dashboard components with performance monitoring
export const DashboardPage = createLazyComponent(
  () => import('@/features/dashboard/pages/DashboardPage'),
  'DashboardPage'
);

export const ProfilePage = createLazyComponent(
  () => import('@/features/auth/pages/ProfilePage'),
  'ProfilePage'
);

// Property-related lazy components
export const PropertyListingPage = createLazyComponent(
  () => import('@/features/property/pages/PropertyListingPage'),
  'PropertyListingPage'
);

export const PropertyDetailsPage = createLazyComponent(
  () => import('@/features/property/pages/PropertyDetailsPage'),
  'PropertyDetailsPage'
);

// Dashboard role-specific components
export const AdminDashboardContent = createLazyComponent(
  () => import('@/features/dashboard/components/role-specific/AdminDashboardContent'),
  'AdminDashboardContent'
);

export const AgentDashboardContent = createLazyComponent(
  () => import('@/features/dashboard/components/role-specific/AgentDashboardContent'),
  'AgentDashboardContent'
);

export const BuyerDashboardContent = createLazyComponent(
  () => import('@/features/dashboard/components/role-specific/BuyerDashboardContent'),
  'BuyerDashboardContent'
);

export const BuilderDashboardContent = createLazyComponent(
  () => import('@/features/dashboard/components/role-specific/BuilderDashboardContent'),
  'BuilderDashboardContent'
);

// HOC for wrapping lazy components with suspense
export function withLazyLoading<P extends object>(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<P>>,
  fallback?: React.ReactNode,
  componentName?: string
) {
  return function WrappedComponent(props: P) {
    return (
      <Suspense fallback={fallback || <LoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Preload components for better UX
export const preloadComponents = {
  dashboard: () => import('@/features/dashboard/pages/DashboardPage'),
  profile: () => import('@/features/auth/pages/ProfilePage'),
  properties: () => import('@/features/property/pages/PropertyListingPage'),
  propertyDetails: () => import('@/features/property/pages/PropertyDetailsPage'),
};

// Preload critical components on user interaction
export function preloadOnHover(componentKey: keyof typeof preloadComponents) {
  return {
    onMouseEnter: () => {
      preloadComponents[componentKey]();
    },
    onFocus: () => {
      preloadComponents[componentKey]();
    }
  };
}