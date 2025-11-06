import { Fragment } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  className?: string;
  onItemClick?: (item: BreadcrumbItem) => void;
}

export function Breadcrumb({
  items,
  separator,
  maxItems = 4,
  className,
  onItemClick
}: BreadcrumbProps) {
  const defaultSeparator = (
    <Icon 
      icon="solar:alt-arrow-right-linear" 
      className="size-4 text-muted-foreground" 
    />
  );

  // Handle truncation for long paths
  const displayItems = items.length > maxItems 
    ? [
        items[0], // Always show first item
        { label: '...', href: undefined, current: false }, // Ellipsis
        ...items.slice(-(maxItems - 2)) // Show last items
      ]
    : items;

  const handleItemClick = (item: BreadcrumbItem) => {
    if (item.current || !item.href) return;
    onItemClick?.(item);
  };

  return (
    <nav 
      className={cn('flex items-center space-x-1 text-sm', className)}
      aria-label="Breadcrumb navigation"
    >
      <ol className="flex items-center space-x-1">
        {displayItems.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            <li className="flex items-center">
              {item.label === '...' ? (
                <span className="px-2 py-1 text-muted-foreground" aria-label="More pages">...</span>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-auto px-2 py-1 font-medium transition-colors duration-200 focus-visible-enhanced',
                    item.current 
                      ? 'text-foreground cursor-default hover:bg-transparent' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                    !item.href && !item.current && 'cursor-default hover:bg-transparent'
                  )}
                  onClick={() => handleItemClick(item)}
                  disabled={item.current || !item.href}
                  aria-current={item.current ? 'page' : undefined}
                  aria-label={item.current ? `Current page: ${item.label}` : `Navigate to ${item.label}`}
                >
                  <div className="flex items-center gap-1.5">
                    {item.icon && (
                      <Icon 
                        icon={item.icon} 
                        className="size-4" 
                        aria-hidden="true"
                      />
                    )}
                    <span className="truncate max-w-[150px] sm:max-w-[200px]">
                      {item.label}
                    </span>
                  </div>
                </Button>
              )}
            </li>
            
            {/* Separator */}
            {index < displayItems.length - 1 && (
              <li className="flex items-center" aria-hidden="true">
                {separator || defaultSeparator}
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

// Utility function to generate breadcrumb items from pathname
export function generateBreadcrumbs(
  pathname: string,
  customLabels?: Record<string, string>
): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Add home/dashboard as first item
  breadcrumbs.push({
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'solar:home-2-bold'
  });

  // Build breadcrumbs from path segments
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Skip the first 'dashboard' segment as we already added it
    if (segment === 'dashboard' && index === 0) return;
    
    const isLast = index === segments.length - 1;
    const label = customLabels?.[segment] || 
                  segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    
    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
      current: isLast
    });
  });

  return breadcrumbs;
}

// Hook for managing breadcrumbs
export function useBreadcrumbs(
  pathname: string,
  customLabels?: Record<string, string>
) {
  return generateBreadcrumbs(pathname, customLabels);
}