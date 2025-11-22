import { ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/components/ui/button';

import { Separator } from '@/shared/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { DashboardNavigation } from './DashboardNavigation';
import { cn } from '@/shared/lib/utils';

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

interface DashboardSidebarProps {
  user: User;
  navigationItems: NavigationItem[];
  activeItem?: string;
  collapsed?: boolean;
  onNavigationClick?: (item: NavigationItem) => void;
  onToggleCollapse?: () => void;
  onProfileClick?: () => void;
  footer?: ReactNode;
  className?: string;
}

export function DashboardSidebar({
  user,
  navigationItems,
  activeItem,
  collapsed = false,
  onNavigationClick,
  onToggleCollapse,
  onProfileClick,
  footer,
  className
}: DashboardSidebarProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'agent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'builder':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'owner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'buyer':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-card border-r border-border transition-all duration-300 ease-in-out',
        className
      )}
      role="complementary"
      aria-label="Dashboard navigation"
    >
      {/* Collapse Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2 animate-in fade-in-0 slide-in-from-left-2 duration-300">
            <span className="font-semibold text-foreground">Navigation</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="size-8 hover:bg-muted transition-colors duration-200"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          <Icon
            icon={collapsed ? "solar:alt-arrow-right-bold" : "solar:alt-arrow-left-bold"}
            className="size-4 transition-transform duration-200"
            aria-hidden="true"
          />
        </Button>
      </div>

      {/* User Profile Section - Simplified */}
      {!collapsed && (
        <div className="p-4 border-b border-border animate-in fade-in-0 slide-in-from-left-2 duration-300">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Avatar className="size-10 ring-2 ring-primary/20">
              <AvatarImage src={user.profile_image} alt="" />
              <AvatarFallback className="text-sm font-semibold bg-primary/10">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate text-foreground">
                {user.first_name} {user.last_name}
              </p>
              <Badge 
                variant="secondary" 
                className={cn(
                  'text-xs mt-1 transition-colors duration-200', 
                  getRoleColor(user.role)
                )}
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed User Avatar */}
      {collapsed && (
        <div className="p-4 border-b border-border flex justify-center group">
          <div className="relative">
            <button
              className="focus-visible-enhanced rounded-full"
              onClick={onProfileClick}
              aria-label={`${user.first_name} ${user.last_name}, ${user.role}. Click to view profile.`}
            >
              <Avatar className="size-10 ring-2 ring-primary/20 transition-all duration-200 hover:ring-primary/40 cursor-pointer">
                <AvatarImage src={user.profile_image} alt="" />
                <AvatarFallback className="text-xs font-semibold bg-primary/10">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
            </button>

            {/* Status indicator */}
            <div
              className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-500 border-2 border-card rounded-full"
              aria-hidden="true"
            ></div>

            {/* Tooltip */}
            <div
              className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap"
              role="tooltip"
              aria-hidden="true"
            >
              {user.first_name} {user.last_name}
              <div className="text-xs text-muted-foreground">{user.role}</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Section */}
      <nav className="flex-1 overflow-y-auto" aria-label="Main navigation">
        <DashboardNavigation
          items={navigationItems}
          activeItem={activeItem}
          onItemClick={onNavigationClick}
          collapsed={collapsed}
          className="p-2"
        />
      </nav>

      {/* Footer Section */}
      {footer && !collapsed && (
        <>
          <Separator />
          <div className="p-4">
            {footer}
          </div>
        </>
      )}


    </aside>
  );
}