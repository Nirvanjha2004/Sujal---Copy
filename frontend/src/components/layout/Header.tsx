import { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import { useNavigate } from "react-router-dom";
import { MobileNav } from "./MobileNav";

interface HeaderProps {
  variant?: 'landing' | 'default';
}

export function Header({ variant = 'default' }: HeaderProps) {
  const { state: authState, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleAuthAction = () => {
    if (authState.isAuthenticated) {
      logout();
    } else {
      navigate('/login');
    }
  };

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
          <h1 className="text-lg font-heading font-semibold tracking-tight hidden md:block">
            PropPortal
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {authState.isAuthenticated ? (
          <>
            <span className="text-sm hidden md:block">
              Welcome, {authState.user?.name || authState.user?.email}
            </span>
            <Button 
              size="sm" 
              className="bg-white text-foreground hover:bg-white/90 hidden md:flex"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-9 rounded-full bg-white/10 hover:bg-white/20"
              onClick={() => navigate('/dashboard')}
            >
              <Icon icon="solar:user-bold" className="size-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-9 rounded-full bg-white/10 hover:bg-white/20"
              onClick={logout}
            >
              <Icon icon="solar:logout-bold" className="size-5" />
            </Button>
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