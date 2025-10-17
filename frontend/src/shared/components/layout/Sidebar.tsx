import { ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/shared/lib/utils';

interface SidebarProps {
  children: ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  position?: 'left' | 'right';
  className?: string;
}

export function Sidebar({ 
  children, 
  isOpen = false, 
  onToggle, 
  position = 'left',
  className 
}: SidebarProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 h-full bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out",
          "w-80 lg:w-64",
          position === 'left' ? 'left-0' : 'right-0',
          isOpen ? 'translate-x-0' : position === 'left' ? '-translate-x-full' : 'translate-x-full',
          "lg:relative lg:translate-x-0 lg:shadow-none lg:border-r",
          className
        )}
      >
        {/* Close button for mobile */}
        <div className="flex items-center justify-between p-4 border-b lg:hidden">
          <h2 className="text-lg font-semibold">Menu</h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={onToggle}
          >
            <Icon icon="solar:close-circle-bold" className="size-5" />
          </Button>
        </div>
        
        {/* Sidebar content */}
        <div className="p-4 h-full overflow-y-auto">
          {children}
        </div>
      </aside>
    </>
  );
}

interface FilterSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function FilterSidebar({ isOpen, onToggle, children }: FilterSidebarProps) {
  return (
    <Sidebar 
      isOpen={isOpen} 
      onToggle={onToggle}
      className="lg:w-80"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filters</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // Reset filters logic would go here
            }}
          >
            Clear All
          </Button>
        </div>
        {children}
      </div>
    </Sidebar>
  );
}

interface UserMenuSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    avatar?: string;
  };
}

export function UserMenuSidebar({ isOpen, onToggle, user }: UserMenuSidebarProps) {
  const menuItems = [
    { icon: 'solar:user-bold', label: 'Profile', href: '/profile' },
    { icon: 'solar:heart-bold', label: 'Favorites', href: '/favorites' },
    { icon: 'solar:bookmark-bold', label: 'Saved Searches', href: '/saved-searches' },
    { icon: 'solar:home-add-bold', label: 'My Properties', href: '/my-properties' },
    { icon: 'solar:chat-round-dots-bold', label: 'Messages', href: '/messages' },
    { icon: 'solar:settings-bold', label: 'Settings', href: '/settings' },
  ];

  return (
    <Sidebar 
      isOpen={isOpen} 
      onToggle={onToggle}
      position="right"
    >
      <div className="space-y-6">
        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="size-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="size-12 rounded-full" />
              ) : (
                <Icon icon="solar:user-bold" className="size-6" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{`${user.firstName} ${user.lastName}` || 'User'}</p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
              {user.role && (
                <p className="text-xs text-primary capitalize">{user.role}</p>
              )}
            </div>
          </div>
        )}

        {/* Menu items */}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon icon={item.icon} className="size-5" />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Logout */}
        <div className="pt-4 border-t">
          <button className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full">
            <Icon icon="solar:logout-bold" className="size-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </Sidebar>
  );
}