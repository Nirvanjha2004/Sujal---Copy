import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { PropertySortOption } from '../../types/search';

export interface PropertySortProps {
  sortBy: PropertySortOption;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: PropertySortOption, sortOrder: 'asc' | 'desc') => void;
  isLoading?: boolean;
  variant?: 'button' | 'select' | 'dropdown';
  showLabel?: boolean;
  className?: string;
}

const SORT_OPTIONS: Array<{
  value: PropertySortOption;
  label: string;
  description: string;
  icon: string;
  defaultOrder: 'asc' | 'desc';
}> = [
  {
    value: 'relevance',
    label: 'Relevance',
    description: 'Most relevant to your search',
    icon: 'solar:star-bold',
    defaultOrder: 'desc'
  },
  {
    value: 'price_low',
    label: 'Price: Low to High',
    description: 'Cheapest properties first',
    icon: 'solar:sort-from-bottom-to-top-bold',
    defaultOrder: 'asc'
  },
  {
    value: 'price_high',
    label: 'Price: High to Low',
    description: 'Most expensive properties first',
    icon: 'solar:sort-from-top-to-bottom-bold',
    defaultOrder: 'desc'
  },
  {
    value: 'date_new',
    label: 'Newest First',
    description: 'Recently added properties',
    icon: 'solar:calendar-add-bold',
    defaultOrder: 'desc'
  },
  {
    value: 'date_old',
    label: 'Oldest First',
    description: 'Properties added earlier',
    icon: 'solar:calendar-bold',
    defaultOrder: 'asc'
  },
  {
    value: 'area_large',
    label: 'Area: Large to Small',
    description: 'Largest properties first',
    icon: 'solar:maximize-bold',
    defaultOrder: 'desc'
  },
  {
    value: 'area_small',
    label: 'Area: Small to Large',
    description: 'Smallest properties first',
    icon: 'solar:minimize-bold',
    defaultOrder: 'asc'
  }
];

export function PropertySort({
  sortBy,
  sortOrder,
  onSortChange,
  isLoading = false,
  variant = 'button',
  showLabel = true,
  className = ''
}: PropertySortProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentSort = SORT_OPTIONS.find(option => option.value === sortBy);
  const currentLabel = currentSort?.label || 'Sort By';

  const handleSortSelect = (newSortBy: PropertySortOption) => {
    const option = SORT_OPTIONS.find(opt => opt.value === newSortBy);
    const newOrder = option?.defaultOrder || 'desc';
    
    // If same sort option is selected, toggle order
    if (newSortBy === sortBy) {
      onSortChange(newSortBy, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(newSortBy, newOrder);
    }
    
    setIsOpen(false);
  };

  const toggleSortOrder = () => {
    onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
  };

  if (variant === 'select') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showLabel && (
          <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
        )}
        <Select
          value={sortBy}
          onValueChange={(value) => handleSortSelect(value as PropertySortOption)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select sort option" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <Icon icon={option.icon} className="size-4" />
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {sortBy !== 'relevance' && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
            disabled={isLoading}
            className="px-2"
          >
            <Icon
              icon={sortOrder === 'asc' ? 'solar:sort-from-bottom-to-top-bold' : 'solar:sort-from-top-to-bottom-bold'}
              className="size-4"
            />
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`justify-between ${className}`}
            disabled={isLoading}
          >
            <div className="flex items-center gap-2">
              {currentSort && <Icon icon={currentSort.icon} className="size-4" />}
              <span>{currentLabel}</span>
              {sortBy !== 'relevance' && (
                <Badge variant="secondary" className="ml-1">
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Badge>
              )}
            </div>
            <Icon
              icon={isOpen ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'}
              className="size-4"
            />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4">
            <h4 className="font-medium mb-3">Sort Properties</h4>
            <div className="space-y-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortSelect(option.value)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors hover:bg-accent ${
                    sortBy === option.value ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  disabled={isLoading}
                >
                  <div className="flex items-start gap-3">
                    <Icon icon={option.icon} className="size-5 mt-0.5 text-primary" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{option.label}</span>
                        {sortBy === option.value && (
                          <Badge variant="secondary" className="text-xs">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Default button variant
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground">Sort:</span>
      )}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="justify-between min-w-32"
            disabled={isLoading}
          >
            <div className="flex items-center gap-2">
              <Icon icon="solar:sort-bold" className="size-4" />
              <span className="hidden sm:inline">{currentLabel}</span>
            </div>
            <Icon
              icon={isOpen ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'}
              className="size-4"
            />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-72 p-0" align="end">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Sort Options</h4>
              <div className="space-y-1">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortSelect(option.value)}
                    className={`w-full text-left p-2 rounded-md transition-colors hover:bg-accent ${
                      sortBy === option.value ? 'bg-primary/10 text-primary' : ''
                    }`}
                    disabled={isLoading}
                  >
                    <div className="flex items-center gap-2">
                      <Icon icon={option.icon} className="size-4" />
                      <span className="text-sm">{option.label}</span>
                      {sortBy === option.value && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
      
      {sortBy !== 'relevance' && (
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSortOrder}
          disabled={isLoading}
          className="px-2"
        >
          <Icon
            icon={sortOrder === 'asc' ? 'solar:sort-from-bottom-to-top-bold' : 'solar:sort-from-top-to-bottom-bold'}
            className="size-4"
          />
        </Button>
      )}
    </div>
  );
}