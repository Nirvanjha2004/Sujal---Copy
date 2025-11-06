import { Icon } from "@iconify/react";
import { Button } from "./button";
import { Badge } from "./badge";
import { Card, CardContent } from "./card";
import { cn } from "@/shared/lib/utils";

// Types
export interface ListItem {
  id: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  };
  metadata?: Array<{
    icon?: string;
    label: string;
    value: string | number;
  }>;
  actions?: Array<{
    icon: string;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  }>;
  status?: {
    text: string;
    color: 'success' | 'warning' | 'error' | 'info' | 'default';
  };
}

export interface EnhancedListProps {
  items: ListItem[];
  loading?: boolean;
  variant?: 'default' | 'compact' | 'detailed' | 'grid';
  showImages?: boolean;
  showActions?: boolean;
  showMetadata?: boolean;
  emptyState?: {
    icon?: string;
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  onItemClick?: (item: ListItem) => void;
  className?: string;
  itemClassName?: string;
}

// Enhanced List Component
export function EnhancedList({
  items,
  loading = false,
  variant = 'default',
  showImages = true,
  showActions = true,
  showMetadata = true,
  emptyState,
  onItemClick,
  className,
  itemClassName,
}: EnhancedListProps) {
  // Loading skeleton
  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: 5 }).map((_, index) => (
          <ListItemSkeleton key={index} variant={variant} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!loading && items.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
        {emptyState ? (
          <>
            {emptyState.icon && (
              <Icon 
                icon={emptyState.icon} 
                className="size-16 text-muted-foreground mb-4" 
              />
            )}
            <h3 className="text-xl font-semibold mb-2">{emptyState.title}</h3>
            {emptyState.description && (
              <p className="text-muted-foreground mb-6 max-w-md">
                {emptyState.description}
              </p>
            )}
            {emptyState.action && (
              <Button onClick={emptyState.action.onClick}>
                {emptyState.action.label}
              </Button>
            )}
          </>
        ) : (
          <>
            <Icon 
              icon="solar:inbox-bold" 
              className="size-16 text-muted-foreground mb-4" 
            />
            <h3 className="text-xl font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground">
              There are no items to display at the moment.
            </p>
          </>
        )}
      </div>
    );
  }

  // Grid variant
  if (variant === 'grid') {
    return (
      <div className={cn(
        "grid gap-4",
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}>
        {items.map((item) => (
          <GridListItem
            key={item.id}
            item={item}
            showImages={showImages}
            showActions={showActions}
            showMetadata={showMetadata}
            onItemClick={onItemClick}
            className={itemClassName}
          />
        ))}
      </div>
    );
  }

  // List variants (default, compact, detailed)
  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => (
        <ListItemCard
          key={item.id}
          item={item}
          variant={variant}
          showImages={showImages}
          showActions={showActions}
          showMetadata={showMetadata}
          onItemClick={onItemClick}
          className={itemClassName}
        />
      ))}
    </div>
  );
}

// List Item Card Component
interface ListItemCardProps {
  item: ListItem;
  variant: 'default' | 'compact' | 'detailed';
  showImages: boolean;
  showActions: boolean;
  showMetadata: boolean;
  onItemClick?: (item: ListItem) => void;
  className?: string;
}

function ListItemCard({
  item,
  variant,
  showImages,
  showActions,
  showMetadata,
  onItemClick,
  className,
}: ListItemCardProps) {
  const handleClick = () => {
    onItemClick?.(item);
  };

  const getStatusColor = (color: string) => {
    switch (color) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (variant === 'compact') {
    return (
      <Card className={cn(
        "group transition-all duration-200 hover:shadow-md hover:border-primary/20",
        "cursor-pointer bg-card/80 backdrop-blur-sm",
        className
      )} onClick={handleClick}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {showImages && item.image && (
              <div className="size-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  {item.subtitle && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {item.subtitle}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.badge && (
                    <Badge variant={item.badge.variant} className="text-xs">
                      {item.badge.text}
                    </Badge>
                  )}
                  
                  {item.status && (
                    <div className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium border",
                      getStatusColor(item.status.color)
                    )}>
                      {item.status.text}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {showActions && item.actions && item.actions.length > 0 && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.actions.slice(0, 2).map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick();
                    }}
                    title={action.label}
                  >
                    <Icon icon={action.icon} className="size-4" />
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default and detailed variants
  return (
    <Card className={cn(
      "group transition-all duration-300 hover:shadow-lg hover:border-primary/20",
      "cursor-pointer bg-card/80 backdrop-blur-sm",
      className
    )} onClick={handleClick}>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {showImages && item.image && (
            <div className="size-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors mb-1">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                    {item.subtitle}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {item.badge && (
                  <Badge variant={item.badge.variant}>
                    {item.badge.text}
                  </Badge>
                )}
                
                {item.status && (
                  <div className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium border",
                    getStatusColor(item.status.color)
                  )}>
                    {item.status.text}
                  </div>
                )}
              </div>
            </div>
            
            {variant === 'detailed' && item.description && (
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                {item.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              {showMetadata && item.metadata && item.metadata.length > 0 && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {item.metadata.slice(0, 3).map((meta, index) => (
                    <div key={index} className="flex items-center gap-1">
                      {meta.icon && (
                        <Icon icon={meta.icon} className="size-4" />
                      )}
                      <span className="font-medium">{meta.label}:</span>
                      <span>{meta.value}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {showActions && item.actions && item.actions.length > 0 && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick();
                      }}
                      className="gap-1"
                    >
                      <Icon icon={action.icon} className="size-4" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Grid List Item Component
interface GridListItemProps {
  item: ListItem;
  showImages: boolean;
  showActions: boolean;
  showMetadata: boolean;
  onItemClick?: (item: ListItem) => void;
  className?: string;
}

function GridListItem({
  item,
  showImages,
  showActions,
  showMetadata,
  onItemClick,
  className,
}: GridListItemProps) {
  const handleClick = () => {
    onItemClick?.(item);
  };

  const getStatusColor = (color: string) => {
    switch (color) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className={cn(
      "group transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      "cursor-pointer bg-card/80 backdrop-blur-sm border-border/50",
      className
    )} onClick={handleClick}>
      {showImages && item.image && (
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          
          {item.badge && (
            <Badge 
              variant={item.badge.variant} 
              className="absolute top-3 left-3 shadow-md"
            >
              {item.badge.text}
            </Badge>
          )}
          
          {item.status && (
            <div className={cn(
              "absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium border shadow-md",
              getStatusColor(item.status.color)
            )}>
              {item.status.text}
            </div>
          )}
        </div>
      )}
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-1">
            {item.title}
          </h3>
          {item.subtitle && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {item.subtitle}
            </p>
          )}
        </div>
        
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {item.description}
          </p>
        )}
        
        {showMetadata && item.metadata && item.metadata.length > 0 && (
          <div className="space-y-2">
            {item.metadata.slice(0, 2).map((meta, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                {meta.icon && (
                  <Icon icon={meta.icon} className="size-4 text-primary/70" />
                )}
                <span className="font-medium">{meta.label}:</span>
                <span>{meta.value}</span>
              </div>
            ))}
          </div>
        )}
        
        {showActions && item.actions && item.actions.length > 0 && (
          <div className="flex gap-2 pt-2 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
            {item.actions.slice(0, 2).map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                className="flex-1 gap-1"
              >
                <Icon icon={action.icon} className="size-4" />
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Loading Skeleton Component
interface ListItemSkeletonProps {
  variant: 'default' | 'compact' | 'detailed' | 'grid';
}

function ListItemSkeleton({ variant }: ListItemSkeletonProps) {
  if (variant === 'compact') {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-lg bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
            <div className="h-6 w-16 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'grid') {
    return (
      <Card className="animate-pulse">
        <div className="aspect-[4/3] bg-muted" />
        <CardContent className="p-4 space-y-3">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded" />
            <div className="h-3 bg-muted rounded w-5/6" />
          </div>
          <div className="flex gap-2 pt-2">
            <div className="h-8 bg-muted rounded flex-1" />
            <div className="h-8 bg-muted rounded flex-1" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default and detailed variants
  return (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="size-16 rounded-lg bg-muted flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              <div className="h-5 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
            {variant === 'detailed' && (
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-5/6" />
                <div className="h-3 bg-muted rounded w-4/5" />
              </div>
            )}
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <div className="h-4 bg-muted rounded w-20" />
                <div className="h-4 bg-muted rounded w-16" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-muted rounded" />
                <div className="h-8 w-16 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { ListItemSkeleton };