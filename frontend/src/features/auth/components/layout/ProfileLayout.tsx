import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export interface ProfileLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function ProfileLayout({
  children,
  sidebar,
  title,
  subtitle,
  actions,
  className
}: ProfileLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile sidebar toggle */}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleSidebar}
                className="lg:hidden"
              >
                <Icon 
                  icon={sidebarCollapsed ? "solar:hamburger-menu-bold" : "solar:close-square-bold"} 
                  className="size-5" 
                />
              </Button>
              
              <div>
                <h1 className="text-2xl font-heading font-bold tracking-tight text-foreground">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside 
            className={cn(
              "w-64 flex-shrink-0 transition-all duration-300 ease-in-out",
              "lg:block", // Always visible on desktop
              sidebarCollapsed ? "hidden" : "block", // Toggle on mobile
              "lg:w-64" // Fixed width on desktop
            )}
          >
            <div className="sticky top-6">
              {sidebar}
            </div>
          </aside>

          {/* Content Area */}
          <main className="flex-1 min-w-0">
            <div className="max-w-4xl">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}

ProfileLayout.displayName = 'ProfileLayout';