import { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { Breadcrumb, useBreadcrumbs } from './Breadcrumb';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
  current?: boolean;
}

interface DashboardLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
  breadcrumbs?: BreadcrumbItem[];
  showBreadcrumbs?: boolean;
  breadcrumbLabels?: Record<string, string>;
}

export function DashboardLayout({
  children,
  header,
  footer,
  className,
  spacing = 'md',
  breadcrumbs,
  showBreadcrumbs = true,
  breadcrumbLabels
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Generate breadcrumbs from current path if not provided
  const autoBreadcrumbs = useBreadcrumbs(location.pathname, breadcrumbLabels);
  const displayBreadcrumbs = breadcrumbs || autoBreadcrumbs;

  const getSpacing = () => {
    switch (spacing) {
      case 'sm':
        return 'p-4';
      case 'md':
        return 'p-6';
      case 'lg':
        return 'p-8';
      default:
        return 'p-6';
    }
  };

  return (
    <div className={cn('min-h-screen bg-muted/30', className)}>
      {/* Header - only render if explicitly provided */}
      {header}

      {/* Breadcrumbs */}
      {showBreadcrumbs && displayBreadcrumbs.length > 1 && (
        <div className="bg-card border-b border-border">
          <div className="px-6 py-3">
            <Breadcrumb
              items={displayBreadcrumbs}
              onItemClick={(item) => {
                if (item.href) {
                  navigate(item.href);
                }
              }}
              maxItems={3}
            />
          </div>
        </div>
      )}

      {/* Main Content - Full Width */}
      <main className="flex-1">
        <div className={cn('container mx-auto max-w-none', getSpacing())}>
          {children}
        </div>
      </main>

      {/* Footer */}
      {footer && (
        <footer className="bg-card border-t border-border mt-auto">
          {footer}
        </footer>
      )}
    </div>
  );
}