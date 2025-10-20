import React from 'react';
import { Property } from '../../types';
import { PropertyCard } from '../common/PropertyCard';
import { Button } from '@/shared/components/ui/button';
import { Loader2, Grid } from 'lucide-react';

export interface PropertyGridProps {
  properties: Property[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onPropertyClick?: (property: Property) => void;

  showFavoriteButton?: boolean;
  showStats?: boolean;
  showAgent?: boolean;
  className?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onPropertyClick,

  showFavoriteButton = true,
  showStats = false,
  showAgent = false,
  className = '',
  emptyMessage = 'No properties found',
  loadingMessage = 'Loading properties...',
  columns = 3,
  gap = 'md'
}) => {
  const getGridClasses = () => {
    const columnClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    };

    const gapClasses = {
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6'
    };

    return `grid ${columnClasses[columns]} ${gapClasses[gap]}`;
  };

  // Loading state
  if (isLoading && properties.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span className="text-gray-600">{loadingMessage}</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && properties.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Grid className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
          <p className="text-gray-600 max-w-md">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Properties Grid */}
      <div className={getGridClasses()}>
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            variant="grid"
            showFavorite={showFavoriteButton}
            showStats={showStats}
            showAgent={showAgent}
            onClick={() => onPropertyClick?.(property)}


          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-8"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Load More Properties'
            )}
          </Button>
        </div>
      )}

      {/* Loading indicator for additional properties */}
      {isLoading && properties.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="flex items-center text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading more properties...
          </div>
        </div>
      )}
    </div>
  );
};

// Skeleton loader for PropertyGrid
export const PropertyGridSkeleton: React.FC<{
  columns?: 1 | 2 | 3 | 4;
  count?: number;
  gap?: 'sm' | 'md' | 'lg';
}> = ({ columns = 3, count = 6, gap = 'md' }) => {
  const getGridClasses = () => {
    const columnClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    };

    const gapClasses = {
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6'
    };

    return `grid ${columnClasses[columns]} ${gapClasses[gap]}`;
  };

  return (
    <div className={getGridClasses()}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border shadow-sm overflow-hidden animate-pulse">
          {/* Image skeleton */}
          <div className="h-48 bg-gray-200" />
          
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            {/* Price */}
            <div className="h-6 bg-gray-200 rounded w-24" />
            
            {/* Title */}
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            
            {/* Location */}
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            
            {/* Details */}
            <div className="flex space-x-4">
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
            
            {/* Actions */}
            <div className="flex justify-between pt-2">
              <div className="h-8 bg-gray-200 rounded w-20" />
              <div className="h-8 bg-gray-200 rounded w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};