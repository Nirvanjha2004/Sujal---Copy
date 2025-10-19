import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  collapsible?: boolean;
}

export function DashboardNavigation({
  items,
  activeItem,
  onItemClick,
  className,
  collapsible = false
}: DashboardNavigationProps) {
  const [collapsed, setCollapsed] = useState(false);
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
    
    if (item.children && item.children.length > 0) {
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
          variant={isActive ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start h-auto py-3 px-4',
            level > 0 && 'ml-4 w-auto',
            item.isDisabled && 'opacity-50 cursor-not-allowed',
            isActive && 'bg-primary/10 text-primary border-primary/20'
          )}
          onClick={() => handleItemClick(item)}
          disabled={item.isDisabled}
        >
          <div className="flex items-center gap-3 w-full">
            <Icon 
              icon={item.icon} 
              className={cn(
                'size-5 flex-shrink-0',
                collapsed && 'size-6'
              )} 
            />
            
            {!collapsed && (
              <>
                <span className="flex-1 text-left font-medium">
                  {item.label}
                </span>
                
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  
                  {hasChildren && (
                    <Icon
                      icon={isExpanded ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'}
                      className="size-4"
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </Button>
        
        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={cn('space-y-2', className)}>
      {collapsible && (
        <>
          <div className="flex items-center justify-between p-4">
            {!collapsed && (
              <h2 className="text-lg font-semibold">Dashboard</h2>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
            >
              <Icon 
                icon={collapsed ? 'solar:hamburger-menu-bold' : 'solar:close-square-bold'} 
                className="size-5" 
              />
            </Button>
          </div>
          <Separator />
        </>
      )}
      
      <div className="space-y-1 p-2">
        {items.map(item => renderNavigationItem(item))}
      </div>
    </nav>
  );
}