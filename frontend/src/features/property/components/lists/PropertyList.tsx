import React from 'react';
import { Property, PropertySortOption } from '../../types';
import { PropertyCard } from '../common/PropertyCard';
import { PropertySort } from '../common/PropertySort';
import { Button } from '@/shared/components/ui/button';

import { Loader2, List, Grid } from 'lucide-react';

export interface PropertyListProps {
  properties: Property[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onPropertyClick?: (property: Property) => void;

  onSortChange?: (sortBy: PropertySortOption, sortOrder: 'asc' | 'desc') => void;
  showFavoriteButton?: boolean;
  showStats?: boolean;
  showAgent?: boolean;
  showDescription?: boolean;
  layout?: 'list' | 'grid';
  onLayoutChange?: (layout: 'list' | 'grid') => void;
  sortBy?: PropertySortOption;
  sortOrder?: 'asc' | 'desc';
  className?: string;
  emptyMessage?: string;
  loadingMessage?: string;
}

// Sort options are now handled by the PropertySort component

export const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onPropertyClick,

  onSortChange,
  showFavoriteButton = true,
  showStats = false,
  showAgent = false,
  showDescription = true,
  layout = 'list',
  onLayoutChange,
  sortBy = 'relevance',
  sortOrder = 'desc',
  className = '',
  emptyMessage = 'No properties found',
  loadingMessage = 'Loading properties...'
}) => {
  // Sort handling is now done by the PropertySort component

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
          <List className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
          <p className="text-gray-600 max-w-md">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort controls */}
          {onSortChange && (
            <PropertySort
              sortBy={sortBy || 'relevance'}
              sortOrder={sortOrder || 'desc'}
              onSortChange={onSortChange}
              isLoading={isLoading}
              variant="select"
              showLabel={true}
            />
          )}

          {/* Layout toggle */}
          {onLayoutChange && (
            <div className="flex items-center border rounded-md">
              <Button
                variant={layout === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onLayoutChange('list')}
                className="rounded-r-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={layout === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onLayoutChange('grid')}
                className="rounded-l-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Properties List */}
      <div className={layout === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
        : 'space-y-4'
      }>
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            variant={layout === 'grid' ? 'grid' : 'list'}
            showFavorite={showFavoriteButton}
            showStats={showStats}
            showAgent={showAgent}
            showDescription={showDescription}
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

// Skeleton loader for PropertyList
export const PropertyListSkeleton: React.FC<{
  layout?: 'list' | 'grid';
  count?: number;
}> = ({ layout = 'list', count = 5 }) => {
  if (layout === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border shadow-sm overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-24" />
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border shadow-sm overflow-hidden animate-pulse">
          <div className="flex">
            <div className="w-64 h-48 bg-gray-200 flex-shrink-0" />
            <div className="flex-1 p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32" />
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-16 bg-gray-200 rounded w-full" />
              <div className="flex space-x-6">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};