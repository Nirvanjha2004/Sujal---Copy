import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <Icon 
              icon="solar:alt-arrow-right-linear" 
              className="size-4 mx-2 text-gray-400" 
            />
          )}
          
          {item.href ? (
            <Link
              to={item.href}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              {item.icon && <Icon icon={item.icon} className="size-4" />}
              <span>{item.label}</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-foreground font-medium">
              {item.icon && <Icon icon={item.icon} className="size-4" />}
              <span>{item.label}</span>
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

// Predefined breadcrumb configurations for common pages
export const breadcrumbConfigs = {
  home: [
    { label: 'Home', href: '/', icon: 'solar:home-2-bold' }
  ],
  
  properties: [
    { label: 'Home', href: '/', icon: 'solar:home-2-bold' },
    { label: 'Properties', href: '/properties' }
  ],
  
  propertyDetails: (propertyTitle: string) => [
    { label: 'Home', href: '/', icon: 'solar:home-2-bold' },
    { label: 'Properties', href: '/properties' },
    { label: propertyTitle }
  ],
  
  dashboard: [
    { label: 'Home', href: '/', icon: 'solar:home-2-bold' },
    { label: 'Dashboard', icon: 'solar:widget-bold' }
  ],
  
  profile: [
    { label: 'Home', href: '/', icon: 'solar:home-2-bold' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile', icon: 'solar:user-bold' }
  ],
  
  favorites: [
    { label: 'Home', href: '/', icon: 'solar:home-2-bold' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Favorites', icon: 'solar:heart-bold' }
  ],
  
  addProperty: [
    { label: 'Home', href: '/', icon: 'solar:home-2-bold' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Add Property', icon: 'solar:home-add-bold' }
  ]
};