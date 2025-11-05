
import { Icon } from '@iconify/react';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';
import { useState, useEffect } from 'react';

interface MobileNavProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function MobileNav({ isOpen, onToggle }: MobileNavProps) {
  const { state: authState, logout } = useAuth();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onToggle();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onToggle]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleNavigation = (path: string) => {
    navigate(path);
    onToggle(); // Close menu after navigation
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
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
      {/* Overlay with improved touch handling */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onToggle}
          onTouchStart={onToggle}
        />
      )}
      
      {/* Mobile Navigation with enhanced touch interactions */}
      <nav
        className={cn(
          "fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-background shadow-2xl z-50 transform transition-all duration-300 ease-out lg:hidden",
          "border-r border-border/50",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Enhanced Header with better touch targets */}
        <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground min-h-[60px]">
          <div className="flex items-center gap-2">
            <div className="bg-primary-foreground/10 p-1.5 rounded-md">
              <Icon icon="solar:home-smile-bold" className="size-6" />
            </div>
            <span className="text-lg font-bold">PropPortal</span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onToggle}
            className="text-primary-foreground hover:bg-primary-foreground/20 min-h-[44px] min-w-[44px]"
          >
            <Icon icon="solar:close-circle-bold" className="size-6" />
          </Button>
        </div>

        {/* Enhanced User Info with better visual hierarchy */}
        {authState.isAuthenticated && authState.user && (
          <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="size-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center ring-2 ring-primary/20">
                <Icon icon="solar:user-bold" className="size-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-foreground">
                  {`${authState.user.first_name} ${authState.user.last_name}` || 'User'}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {authState.user.email}
                </p>
                {authState.user.role && (
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1">
                    {authState.user.role.charAt(0).toUpperCase() + authState.user.role.slice(1)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Navigation Items with better touch targets */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Public Navigation with collapsible sections */}
          <div className="p-4">
            <button
              onClick={() => toggleSection('explore')}
              className="flex items-center justify-between w-full text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 py-2 hover:text-foreground transition-colors"
            >
              <span>Explore</span>
              <Icon 
                icon={expandedSections.has('explore') ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'} 
                className="size-4 transition-transform duration-200" 
              />
            </button>
            <div className={cn(
              "space-y-1 overflow-hidden transition-all duration-300",
              expandedSections.has('explore') ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}>
              {publicNavItems.map((item, index) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className="flex items-center gap-3 w-full px-3 py-3 text-left text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-200 min-h-[44px] group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Icon icon={item.icon} className="size-5 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User Navigation with enhanced organization */}
          {authState.isAuthenticated && (
            <div className="p-4 border-t">
              <button
                onClick={() => toggleSection('account')}
                className="flex items-center justify-between w-full text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 py-2 hover:text-foreground transition-colors"
              >
                <span>My Account</span>
                <Icon 
                  icon={expandedSections.has('account') ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'} 
                  className="size-4 transition-transform duration-200" 
                />
              </button>
              <div className={cn(
                "space-y-1 overflow-hidden transition-all duration-300",
                expandedSections.has('account') ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}>
                {userNavItems.map((item, index) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className="flex items-center gap-3 w-full px-3 py-3 text-left text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-all duration-200 min-h-[44px] group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Icon icon={item.icon} className="size-5 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions Section */}
          {authState.isAuthenticated && (
            <div className="p-4 border-t">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleNavigation('/add-property')}
                  variant="outline"
                  size="sm"
                  className="h-12 flex-col gap-1 text-xs"
                >
                  <Icon icon="solar:home-add-bold" className="size-4" />
                  Add Property
                </Button>
                <Button
                  onClick={() => handleNavigation('/search')}
                  variant="outline"
                  size="sm"
                  className="h-12 flex-col gap-1 text-xs"
                >
                  <Icon icon="solar:magnifer-bold" className="size-4" />
                  Search
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Footer Actions with better touch targets */}
        <div className="p-4 border-t bg-muted/30">
          {authState.isAuthenticated ? (
            <Button
              onClick={() => {
                logout();
                onToggle();
              }}
              variant="outline"
              className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10 min-h-[44px]"
            >
              <Icon icon="solar:logout-bold" className="size-5 mr-2" />
              Logout
            </Button>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={() => handleNavigation('/login')}
                className="w-full min-h-[44px]"
              >
                <Icon icon="solar:login-bold" className="size-5 mr-2" />
                Login
              </Button>
              <Button
                onClick={() => handleNavigation('/register')}
                variant="outline"
                className="w-full min-h-[44px]"
              >
                <Icon icon="solar:user-plus-bold" className="size-5 mr-2" />
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}