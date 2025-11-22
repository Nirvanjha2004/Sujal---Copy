
import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export interface ProfileNavigationItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  disabled?: boolean;
}

export interface ProfileSidebarProps {
  navigation: ProfileNavigationItem[];
  activeItem?: string;
  onItemClick?: (item: ProfileNavigationItem) => void;
  className?: string;
}

export function ProfileSidebar({
  navigation,
  activeItem,
  onItemClick,
  className
}: ProfileSidebarProps) {
  const handleItemClick = (item: ProfileNavigationItem) => {
    if (item.disabled) return;
    
    if (item.onClick) {
      item.onClick();
    } else if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <Card className={cn("sticky top-6", className)}>
      <CardContent className="p-2">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = activeItem === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-auto py-3 px-3 text-left",
                  "transition-all duration-200",
                  isActive && "bg-primary/10 text-primary border-primary/20 shadow-sm",
                  !isActive && "hover:bg-muted/50 hover:text-foreground",
                  item.disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={cn(
                    "flex items-center justify-center size-8 rounded-md transition-colors duration-200",
                    isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    <Icon icon={item.icon} className="size-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {item.label}
                    </div>
                  </div>
                  
                  {item.badge && (
                    <div className="flex items-center justify-center min-w-[20px] h-5 px-2 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                      {item.badge}
                    </div>
                  )}
                </div>
              </Button>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
}

ProfileSidebar.displayName = 'ProfileSidebar';