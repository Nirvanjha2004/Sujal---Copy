import { ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  onNavigationClick?: (item: NavigationItem) => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
  footer?: ReactNode;
  className?: string;
}

export function DashboardSidebar({
  user,
  navigationItems,
  activeItem,
  onNavigationClick,
  onProfileClick,
  onSettingsClick,
  onLogoutClick,
  footer,
  className
}: DashboardSidebarProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'agent':
        return 'bg-blue-100 text-blue-800';
      case 'builder':
        return 'bg-orange-100 text-orange-800';
      case 'owner':
        return 'bg-green-100 text-green-800';
      case 'buyer':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* User Profile Section */}
      <div className="p-6 border-b">
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback className="text-sm font-semibold">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
                <Badge variant="secondary" className={cn('text-xs mt-1', getRoleColor(user.role))}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-8"
                onClick={onProfileClick}
              >
                <Icon icon="solar:user-bold" className="size-4 mr-1" />
                Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-8"
                onClick={onSettingsClick}
              >
                <Icon icon="solar:settings-bold" className="size-4 mr-1" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto">
        <DashboardNavigation
          items={navigationItems}
          activeItem={activeItem}
          onItemClick={onNavigationClick}
          className="p-4"
        />
      </div>

      {/* Footer Section */}
      {footer && (
        <>
          <Separator />
          <div className="p-4">
            {footer}
          </div>
        </>
      )}

      {/* Logout Section */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onLogoutClick}
        >
          <Icon icon="solar:logout-2-bold" className="size-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}