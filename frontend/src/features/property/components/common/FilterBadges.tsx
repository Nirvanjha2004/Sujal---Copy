import React from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Icon } from '@iconify/react';
import { PropertyFilters } from '../../types';

export interface FilterBadge {
  key: string;
  label: string;
  value: any;
  removable?: boolean;
}

export interface FilterBadgesProps {
  filters: PropertyFilters;
  onFilterRemove: (filterKey: string, value?: any) => void;
  onClearAll: () => void;
  className?: string;
  maxVisible?: number;
  showClearAll?: boolean;
}

export function FilterBadges({
  filters,
  onFilterRemove,
  onClearAll,
  className = '',
  maxVisible = 10,
  showClearAll = true
}: FilterBadgesProps) {
  const badges = React.useMemo(() => {
    const result: FilterBadge[] = [];

    // Location filter
    if (filters.location) {
      result.push({
        key: 'location',
        label: `Location: ${filters.location}`,
        value: filters.location,
        removable: true
      });
    }

    // Property type filter
    if (filters.propertyType && Array.isArray(filters.propertyType) && filters.propertyType.length > 0) {
      result.push({
        key: 'propertyType',
        label: `Type: ${filters.propertyType.join(', ')}`,
        value: filters.propertyType,
        removable: true
      });
    } else if (filters.propertyType && !Array.isArray(filters.propertyType)) {
      result.push({
        key: 'propertyType',
        label: `Type: ${filters.propertyType}`,
        value: filters.propertyType,
        removable: true
      });
    }

    // Listing type filter
    if (filters.listingType) {
      result.push({
        key: 'listingType',
        label: `For ${filters.listingType}`,
        value: filters.listingType,
        removable: true
      });
    }

    // Price range filter
    if (filters.minPrice || filters.maxPrice) {
      let priceLabel = 'Price: ';
      if (filters.minPrice && filters.maxPrice) {
        priceLabel += `₹${filters.minPrice.toLocaleString()} - ₹${filters.maxPrice.toLocaleString()}`;
      } else if (filters.minPrice) {
        priceLabel += `₹${filters.minPrice.toLocaleString()}+`;
      } else if (filters.maxPrice) {
        priceLabel += `Up to ₹${filters.maxPrice.toLocaleString()}`;
      }
      
      result.push({
        key: 'price',
        label: priceLabel,
        value: 'price',
        removable: true
      });
    }

    // Area range filter
    if (filters.minArea || filters.maxArea) {
      let areaLabel = 'Area: ';
      if (filters.minArea && filters.maxArea) {
        areaLabel += `${filters.minArea} - ${filters.maxArea} sq ft`;
      } else if (filters.minArea) {
        areaLabel += `${filters.minArea}+ sq ft`;
      } else if (filters.maxArea) {
        areaLabel += `Up to ${filters.maxArea} sq ft`;
      }
      
      result.push({
        key: 'area',
        label: areaLabel,
        value: 'area',
        removable: true
      });
    }

    // Bedrooms filter
    if (filters.bedrooms) {
      result.push({
        key: 'bedrooms',
        label: `${filters.bedrooms} BHK`,
        value: filters.bedrooms,
        removable: true
      });
    }

    // Bathrooms filter
    if (filters.bathrooms) {
      result.push({
        key: 'bathrooms',
        label: `${filters.bathrooms} Bathrooms`,
        value: filters.bathrooms,
        removable: true
      });
    }

    // Amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      const amenitiesLabel = filters.amenities.length > 2 
        ? `Amenities: ${filters.amenities.slice(0, 2).join(', ')} +${filters.amenities.length - 2}`
        : `Amenities: ${filters.amenities.join(', ')}`;
      
      result.push({
        key: 'amenities',
        label: amenitiesLabel,
        value: filters.amenities,
        removable: true
      });
    }

    // Features filter
    if (filters.features && filters.features.length > 0) {
      const featuresLabel = filters.features.length > 2 
        ? `Features: ${filters.features.slice(0, 2).join(', ')} +${filters.features.length - 2}`
        : `Features: ${filters.features.join(', ')}`;
      
      result.push({
        key: 'features',
        label: featuresLabel,
        value: filters.features,
        removable: true
      });
    }

    // Featured filter
    if (filters.isFeatured) {
      result.push({
        key: 'isFeatured',
        label: 'Featured Only',
        value: true,
        removable: true
      });
    }

    return result;
  }, [filters]);

  const visibleBadges = badges.slice(0, maxVisible);
  const hiddenCount = Math.max(0, badges.length - maxVisible);
  const hasFilters = badges.length > 0;

  if (!hasFilters) {
    return null;
  }

  const handleRemove = (badge: FilterBadge) => {
    onFilterRemove(badge.key, badge.value);
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-muted-foreground">
        Active filters:
      </span>
      
      {visibleBadges.map((badge, index) => (
        <Badge
          key={`${badge.key}-${index}`}
          variant="secondary"
          className="flex items-center gap-1 pr-1 max-w-xs"
        >
          <span className="truncate">{badge.label}</span>
          {badge.removable && (
            <button
              onClick={() => handleRemove(badge)}
              className="ml-1 hover:text-destructive transition-colors"
              aria-label={`Remove ${badge.label} filter`}
            >
              <Icon icon="solar:close-circle-bold" className="size-3" />
            </button>
          )}
        </Badge>
      ))}
      
      {hiddenCount > 0 && (
        <Badge variant="outline" className="text-xs">
          +{hiddenCount} more
        </Badge>
      )}
      
      {showClearAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-destructive hover:text-destructive h-6 px-2 text-xs"
        >
          <Icon icon="solar:trash-bin-minimalistic-bold" className="size-3 mr-1" />
          Clear all
        </Button>
      )}
    </div>
  );
}

// Quick filter component for common filter combinations
export interface QuickFilter {
  id: string;
  label: string;
  icon: string;
  filters: Partial<PropertyFilters>;
  description?: string;
}

export interface QuickFiltersProps {
  onApplyFilter: (filters: Partial<PropertyFilters>) => void;
  activeFilters?: PropertyFilters;
  className?: string;
}

const QUICK_FILTERS: QuickFilter[] = [
  {
    id: 'new_launch',
    label: 'New Launch',
    icon: 'solar:star-bold',
    filters: { features: ['new_launch'] },
    description: 'Recently launched properties'
  },
  {
    id: 'ready_to_move',
    label: 'Ready to Move',
    icon: 'solar:home-bold',
    filters: { features: ['ready_to_move'] },
    description: 'Properties ready for immediate possession'
  },
  {
    id: 'under_construction',
    label: 'Under Construction',
    icon: 'solar:hammer-bold',
    filters: { features: ['under_construction'] },
    description: 'Properties currently under construction'
  },
  {
    id: 'verified',
    label: 'Verified',
    icon: 'solar:verified-check-bold',
    filters: { features: ['verified'] },
    description: 'Verified properties'
  },
  {
    id: 'with_photos',
    label: 'With Photos',
    icon: 'solar:camera-bold',
    filters: { features: ['with_photos'] },
    description: 'Properties with photo galleries'
  },
  {
    id: 'with_videos',
    label: 'With Videos',
    icon: 'solar:video-library-bold',
    filters: { features: ['with_videos'] },
    description: 'Properties with video tours'
  },
  {
    id: 'owner_properties',
    label: 'Owner',
    icon: 'solar:user-bold',
    filters: { features: ['owner'] as any },
    description: 'Properties listed by owners'
  },
  {
    id: 'featured',
    label: 'Featured',
    icon: 'solar:medal-star-bold',
    filters: { isFeatured: true },
    description: 'Featured properties'
  }
];

export function QuickFilters({
  onApplyFilter,
  activeFilters = {},
  className = ''
}: QuickFiltersProps) {
  const isFilterActive = (quickFilter: QuickFilter) => {
    // Check if the quick filter's filters are currently active
    return Object.entries(quickFilter.filters).every(([key, value]) => {
      const activeValue = activeFilters[key as keyof PropertyFilters];
      
      if (Array.isArray(value) && Array.isArray(activeValue)) {
        return value.every(v => activeValue.includes(v as any));
      }
      
      return activeValue === value;
    });
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {QUICK_FILTERS.map((filter) => {
        const isActive = isFilterActive(filter);
        
        return (
          <Badge
            key={filter.id}
            variant={isActive ? "default" : "outline"}
            className={`cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground ${
              isActive ? 'bg-primary text-primary-foreground' : ''
            }`}
            onClick={() => onApplyFilter(filter.filters)}
            title={filter.description}
          >
            <Icon icon={filter.icon} className="size-3 mr-1" />
            {filter.label}
          </Badge>
        );
      })}
    </div>
  );
}