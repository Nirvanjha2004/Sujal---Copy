import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

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

interface DashboardNavigationProps {
  items: NavigationItem[];
  activeItem?: string;
  onItemClick?: (item: NavigationItem) => void;
  className?: string;
  collapsed?: boolean;
}

export function DashboardNavigation({
  items,
  activeItem,
  onItemClick,
  className,
  collapsed = false
}: DashboardNavigationProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.isDisabled) return;
    
    if (item.children && item.children.length > 0 && !collapsed) {
      toggleExpanded(item.id);
    } else {
      onItemClick?.(item);
    }
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = item.isActive || activeItem === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    return (
      <div key={item.id}>
        <Button
          variant="ghost"
          className={cn(
            'w-full nav-item group relative',
            collapsed ? 'justify-center px-2 py-3' : 'justify-start px-3 py-2.5',
            level > 0 && !collapsed && 'ml-6 w-auto',
            item.isDisabled && 'opacity-50 cursor-not-allowed',
            isActive && 'active bg-primary/10 text-primary hover:bg-primary/15 border-r-2 border-primary',
            !isActive && 'hover:bg-muted/50'
          )}
          onClick={() => handleItemClick(item)}
          disabled={item.isDisabled}
          title={collapsed ? item.label : undefined}
        >
          <div className={cn(
            'flex items-center w-full',
            collapsed ? 'justify-center' : 'gap-3'
          )}>
            <Icon 
              icon={item.icon} 
              className={cn(
                'flex-shrink-0 transition-transform group-hover:scale-110',
                collapsed ? 'size-5' : 'size-4'
              )} 
            />
            
            {!collapsed && (
              <>
                <span className="flex-1 text-left font-medium text-sm">
                  {item.label}
                </span>
                
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-1.5 py-0.5 bg-primary/20 text-primary border-primary/30"
                    >
                      {item.badge}
                    </Badge>
                  )}
                  
                  {hasChildren && (
                    <Icon
                      icon={isExpanded ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'}
                      className="size-3 transition-transform"
                    />
                  )}
                </div>
              </>
            )}
          </div>

          {/* Tooltip for collapsed state */}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
              {item.label}
              {item.badge && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
          )}
        </Button>
        
        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={cn('space-y-1', className)}>
      <div className={cn('space-y-1', collapsed ? 'px-1' : 'px-2')}>
        {items.map(item => renderNavigationItem(item))}
      </div>
    </nav>
  );
}