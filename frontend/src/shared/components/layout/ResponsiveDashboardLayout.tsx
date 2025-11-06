import { ReactNode, useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { DashboardSidebar } from '@/features/dashboard/components/common/DashboardSidebar';
import { Breadcrumb } from '@/features/dashboard/components/common/Breadcrumb';
import type { User } from '@/features/auth/types';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  isActive?: boolean;
  isDisabled?: boolean;
  children?: NavigationItem[];
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface ResponsiveDashboardLayoutProps {
  user: User;
  navigationItems: NavigationItem[];
  activeItem?: string;
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
  onNavigationClick?: (item: NavigationItem) => void;
  className?: string;
}

export function ResponsiveDashboardLayout({
  user,
  navigationItems,
  activeItem,
  breadcrumbs,
  children,
  header,
  sidebar,
  onNavigationClick,
  className
}: ResponsiveDashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen, isMobile]);

  const handleSidebarToggle = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleNavigationClick = (item: NavigationItem) => {
    onNavigationClick?.(item);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Mobile Overlay */}
      {mobileMenuOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen">
        {/* Desktop Sidebar */}
        <div className={cn(
          'transition-all duration-300 ease-in-out border-r border-border bg-card',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}>
          {sidebar || (
            <DashboardSidebar
              user={user}
              navigationItems={navigationItems}
              activeItem={activeItem}
              collapsed={sidebarCollapsed}
              onNavigationClick={handleNavigationClick}
              onToggleCollapse={handleSidebarToggle}
              className="h-full"
            />
          )}
        </div>

        {/* Desktop Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop Header */}
          <header className="bg-background border-b border-border px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {breadcrumbs && (
                <Breadcrumb items={breadcrumbs} />
              )}
            </div>
            {header}
          </header>

          {/* Desktop Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSidebarToggle}
              className="text-primary-foreground hover:bg-primary-foreground/20 min-h-[44px] min-w-[44px]"
            >
              <Icon icon="solar:hamburger-menu-bold" className="size-6" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="bg-primary-foreground/10 p-1 rounded">
                <Icon icon="solar:home-smile-bold" className="size-6" />
              </div>
              <span className="font-semibold text-lg">PropPuzzle</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {header}
            <Button
              size="icon"
              variant="ghost"
              className="text-primary-foreground hover:bg-primary-foreground/20 min-h-[44px] min-w-[44px]"
            >
              <Icon icon="solar:bell-bold" className="size-5" />
            </Button>
          </div>
        </header>

        {/* Mobile Breadcrumbs */}
        {breadcrumbs && (
          <div className="bg-muted/30 px-4 py-2 border-b border-border">
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}

        {/* Mobile Sidebar */}
        <div className={cn(
          'fixed top-0 left-0 h-full w-80 max-w-[85vw] z-50 transform transition-transform duration-300 ease-out',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          {sidebar || (
            <DashboardSidebar
              user={user}
              navigationItems={navigationItems}
              activeItem={activeItem}
              collapsed={false}
              onNavigationClick={handleNavigationClick}
              onToggleCollapse={() => setMobileMenuOpen(false)}
              className="h-full shadow-2xl"
            />
          )}
        </div>

        {/* Mobile Content */}
        <main className="p-4 pb-20">
          <div className="space-y-6">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-2 z-20">
          <div className="flex items-center justify-around">
            {navigationItems.slice(0, 4).map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => handleNavigationClick(item)}
                className={cn(
                  'flex-col gap-1 h-12 px-2 text-xs',
                  item.isActive || activeItem === item.id 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground'
                )}
              >
                <Icon icon={item.icon} className="size-5" />
                <span className="truncate max-w-[60px]">{item.label}</span>
                {item.badge && (
                  <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {item.badge}
                  </div>
                )}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSidebarToggle}
              className="flex-col gap-1 h-12 px-2 text-xs text-muted-foreground"
            >
              <Icon icon="solar:menu-dots-bold" className="size-5" />
              <span>More</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for responsive dashboard layout
export function useResponsiveDashboard() {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return {
    isMobile,
    sidebarCollapsed,
    setSidebarCollapsed
  };
}