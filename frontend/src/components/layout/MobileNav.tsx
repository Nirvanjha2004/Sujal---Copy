
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';

interface MobileNavProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function MobileNav({ isOpen, onToggle }: MobileNavProps) {
  const { state: authState, logout } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    onToggle(); // Close menu after navigation
  };

  const publicNavItems = [
    { icon: 'solar:home-2-bold', label: 'Home', path: '/' },
    { icon: 'solar:buildings-2-bold', label: 'Properties', path: '/properties' },
    { icon: 'solar:calculator-bold', label: 'Calculators', path: '/calculators' },
    { icon: 'solar:phone-bold', label: 'Contact', path: '/contact' },
  ];

  const userNavItems = [
    { icon: 'solar:widget-bold', label: 'Dashboard', path: '/dashboard' },
    { icon: 'solar:heart-bold', label: 'Favorites', path: '/favorites' },
    { icon: 'solar:bookmark-bold', label: 'Saved Searches', path: '/saved-searches' },
    { icon: 'solar:history-bold', label: 'Activity', path: '/activity' },
    { icon: 'solar:home-add-bold', label: 'Add Property', path: '/add-property' },
    { icon: 'solar:chat-round-dots-bold', label: 'Communication', path: '/communication' },
    { icon: 'solar:letter-bold', label: 'Inquiries', path: '/inquiries' },
    { icon: 'solar:user-bold', label: 'Profile', path: '/profile' },
    { icon: 'solar:settings-bold', label: 'Settings', path: '/settings' },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Mobile Navigation */}
      <nav
        className={cn(
          "fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
          <div className="flex items-center gap-2">
            <Icon icon="solar:home-smile-bold" className="size-6" />
            <span className="text-lg font-bold">PropPortal</span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onToggle}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <Icon icon="solar:close-circle-bold" className="size-5" />
          </Button>
        </div>

        {/* User Info */}
        {authState.isAuthenticated && authState.user && (
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="size-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                <Icon icon="solar:user-bold" className="size-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {`${authState.user.firstName} ${authState.user.lastName}` || 'User'}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {authState.user.email}
                </p>
                {authState.user.role && (
                  <p className="text-xs text-primary capitalize">
                    {authState.user.role}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto">
          {/* Public Navigation */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Explore
            </h3>
            <div className="space-y-1">
              {publicNavItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className="flex items-center gap-3 w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icon icon={item.icon} className="size-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User Navigation */}
          {authState.isAuthenticated && (
            <div className="p-4 border-t">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                My Account
              </h3>
              <div className="space-y-1">
                {userNavItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className="flex items-center gap-3 w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Icon icon={item.icon} className="size-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50">
          {authState.isAuthenticated ? (
            <Button
              onClick={() => {
                logout();
                onToggle();
              }}
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
            >
              <Icon icon="solar:logout-bold" className="size-5 mr-2" />
              Logout
            </Button>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={() => handleNavigation('/login')}
                className="w-full"
              >
                Login
              </Button>
              <Button
                onClick={() => handleNavigation('/register')}
                variant="outline"
                className="w-full"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}