import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/shared/components/ui/button";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { MobileNav } from "./MobileNav";
import { cn } from "@/shared/lib/utils";

interface HeaderProps {
  variant?: 'landing' | 'default';
}

export function Header({ variant = 'default' }: HeaderProps) {
  const { state: authState, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleAuthAction = () => {
    if (authState.isAuthenticated) {
      logout();
    } else {
      navigate('/login');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'landing') {
    return (
      <header className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <Icon icon="solar:home-smile-bold" className="size-8" />
                <span className="text-xl font-bold">PropPortal</span>
              </div>
              <nav className="hidden md:flex items-center gap-6 text-sm">
                <button 
                  onClick={() => navigate('/properties?listing_type=sale')}
                  className="hover:underline"
                >
                  For Buyers
                </button>
                <button 
                  onClick={() => navigate('/properties?listing_type=rent')}
                  className="hover:underline"
                >
                  For Tenants
                </button>
                <button 
                  onClick={() => navigate('/calculators')}
                  className="hover:underline"
                >
                  Calculators
                </button>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="hover:underline"
                >
                  For Owners
                </button>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="hover:underline"
                >
                  For Dealers/Builders
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              {authState.isAuthenticated ? (
                <>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="shadow-lg"
                    onClick={() => navigate('/dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="rounded-full"
                    onClick={() => navigate('/dashboard')}
                  >
                    <Icon icon="solar:user-circle-bold" className="size-6" />
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="shadow-lg"
                    onClick={() => navigate('/dashboard')}
                  >
                    Post Property FREE
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="rounded-full"
                    onClick={handleAuthAction}
                  >
                    <Icon icon="solar:user-circle-bold" className="size-6" />
                  </Button>
                </>
              )}
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => setIsMobileNavOpen(true)}
              >
                <Icon icon="solar:hamburger-menu-bold" className="size-6" />
              </Button>
            </div>
          </div>
        </div>
        <MobileNav 
          isOpen={isMobileNavOpen} 
          onToggle={() => setIsMobileNavOpen(!isMobileNavOpen)} 
        />
      </header>
    );
  }

  return (
    <>
      <MobileNav 
        isOpen={isMobileNavOpen} 
        onToggle={() => setIsMobileNavOpen(!isMobileNavOpen)} 
      />
      <header className="bg-primary text-primary-foreground py-3 px-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-8">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="bg-white p-2 rounded">
              <Icon icon="solar:home-smile-bold" className="size-8 text-primary" />
            </div>
            <h1 className="text-lg font-heading font-semibold tracking-tight">
              PropPortal
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {authState.isAuthenticated ? (
            <>
              <span className="text-sm hidden lg:block">
                Welcome, {authState.user?.first_name || authState.user?.email}
              </span>
              
              {/* User Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Icon icon="solar:user-bold" className="size-4" />
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {authState.user?.first_name || 'User'}
                  </span>
                  <Icon 
                    icon="solar:alt-arrow-down-bold" 
                    className={cn(
                      "size-3 hidden md:block transition-transform duration-200",
                      isDropdownOpen && "rotate-180"
                    )} 
                  />
                </Button>
                
                {/* Dropdown Menu */}
                <div className={cn(
                  "absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-200 z-50",
                  isDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"
                )}>
                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Icon icon="solar:widget-bold" className="size-4" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Icon icon="solar:user-bold" className="size-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Icon icon="solar:settings-bold" className="size-4" />
                      Settings
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Icon icon="solar:logout-bold" className="size-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Button 
                size="sm" 
                className="bg-white text-foreground hover:bg-white/90 hidden md:flex"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="size-9 rounded-full bg-white/10 hover:bg-white/20"
                onClick={handleAuthAction}
              >
                <Icon icon="solar:user-bold" className="size-5" />
              </Button>
            </>
          )}
          
          <Button 
            size="icon" 
            variant="ghost" 
            className="size-9 hover:bg-white/20 md:hidden"
            onClick={() => setIsMobileNavOpen(true)}
          >
            <Icon icon="solar:hamburger-menu-bold" className="size-6" />
          </Button>
        </div>
      </header>
    </>
  );
}