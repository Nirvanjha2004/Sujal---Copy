import { Icon } from '@iconify/react';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  className?: string;
}

/**
 * Consistent header component for auth pages
 * Provides branding, title, and subtitle for authentication flows
 */
export function AuthHeader({ 
  title, 
  subtitle, 
  showLogo = true, 
  className 
}: AuthHeaderProps) {
  return (
    <div className={`text-center mb-8 ${className || ''}`}>
      {showLogo && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <Icon icon="solar:home-smile-bold" className="size-10 text-primary" />
          <span className="text-2xl font-bold text-primary">PropPuzzle</span>
        </div>
      )}
      <h1 className="text-2xl font-heading font-bold tracking-tight mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
}