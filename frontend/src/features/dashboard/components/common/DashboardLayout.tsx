import { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  sidebarWidth?: 'sm' | 'md' | 'lg';
  spacing?: 'sm' | 'md' | 'lg';
}

export function DashboardLayout({
  children,
  sidebar,
  header,
  footer,
  className,
  sidebarWidth = 'md',
  spacing = 'md'
}: DashboardLayoutProps) {
  const getSidebarWidth = () => {
    switch (sidebarWidth) {
      case 'sm':
        return 'w-64';
      case 'md':
        return 'w-80';
      case 'lg':
        return 'w-96';
      default:
        return 'w-80';
    }
  };

  const getSpacing = () => {
    switch (spacing) {
      case 'sm':
        return 'gap-4 p-4';
      case 'md':
        return 'gap-6 p-6';
      case 'lg':
        return 'gap-8 p-8';
      default:
        return 'gap-6 p-6';
    }
  };

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {header && (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          {header}
        </div>
      )}
      
      <div className="flex flex-1">
        {sidebar && (
          <aside className={cn(
            'bg-white border-r border-gray-200 flex-shrink-0 hidden lg:block',
            getSidebarWidth()
          )}>
            <div className="h-full overflow-y-auto">
              {sidebar}
            </div>
          </aside>
        )}
        
        <main className="flex-1 overflow-x-hidden">
          <div className={cn('container mx-auto', getSpacing())}>
            {children}
          </div>
        </main>
      </div>
      
      {footer && (
        <footer className="bg-white border-t border-gray-200 mt-auto">
          {footer}
        </footer>
      )}
    </div>
  );
}