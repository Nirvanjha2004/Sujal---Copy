import React, { useState } from 'react';
import { Property, PropertyFilters } from '../../types';
import { PropertyList } from './PropertyList';
import { PropertyGrid } from './PropertyGrid';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Search, Filter, X, MapPin, Bookmark, Share2 } from 'lucide-react';

export interface SearchResultsProps {
  properties: Property[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
  isLoading?: boolean;
  hasMore?: boolean;
  searchQuery?: string;
  activeFilters?: PropertyFilters;
  onLoadMore?: () => void;
  onPropertyClick?: (property: Property) => void;
  onFavoriteToggle?: (propertyId: number) => void;
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onFilterRemove?: (filterKey: keyof PropertyFilters, value?: any) => void;
  onClearAllFilters?: () => void;
  onSaveSearch?: () => void;
  onShareResults?: () => void;
  layout?: 'list' | 'grid';
  onLayoutChange?: (layout: 'list' | 'grid') => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  className?: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  properties,
  totalResults,
  currentPage,
  totalPages,
  isLoading = false,
  hasMore = false,
  searchQuery,
  activeFilters = {},
  onLoadMore,
  onPropertyClick,
  onFavoriteToggle,
  onSortChange,
  onFilterRemove,
  onClearAllFilters,
  onSaveSearch,
  onShareResults,
  layout = 'list',
  onLayoutChange,
  sortBy = 'relevance',
  sortOrder = 'desc',
  className = ''
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Get active filter badges
  const getActiveFilterBadges = () => {
    const badges: Array<{ key: string; label: string; value: any }> = [];

    if (activeFilters.location) {
      badges.push({
        key: 'location',
        label: `Location: ${activeFilters.location}`,
        value: activeFilters.location
      });
    }

    if (activeFilters.propertyType && Array.isArray(activeFilters.propertyType) && activeFilters.propertyType.length > 0) {
      badges.push({
        key: 'propertyType',
        label: `Type: ${activeFilters.propertyType.join(', ')}`,
        value: activeFilters.propertyType
      });
    }

    if (activeFilters.listingType) {
      badges.push({
        key: 'listingType',
        label: `For ${activeFilters.listingType}`,
        value: activeFilters.listingType
      });
    }

    if (activeFilters.minPrice || activeFilters.maxPrice) {
      const priceLabel = activeFilters.minPrice && activeFilters.maxPrice
        ? `₹${activeFilters.minPrice.toLocaleString()} - ₹${activeFilters.maxPrice.toLocaleString()}`
        : activeFilters.minPrice
        ? `₹${activeFilters.minPrice.toLocaleString()}+`
        : `Up to ₹${activeFilters.maxPrice?.toLocaleString()}`;
      badges.push({
        key: 'price',
        label: `Price: ${priceLabel}`,
        value: 'price'
      });
    }

    if (activeFilters.minArea || activeFilters.maxArea) {
      const areaLabel = activeFilters.minArea && activeFilters.maxArea
        ? `${activeFilters.minArea} - ${activeFilters.maxArea} sq ft`
        : activeFilters.minArea
        ? `${activeFilters.minArea}+ sq ft`
        : `Up to ${activeFilters.maxArea} sq ft`;
      badges.push({
        key: 'area',
        label: `Area: ${areaLabel}`,
        value: 'area'
      });
    }

    if (activeFilters.bedrooms) {
      badges.push({
        key: 'bedrooms',
        label: `${activeFilters.bedrooms} BHK`,
        value: activeFilters.bedrooms
      });
    }

    if (activeFilters.amenities && activeFilters.amenities.length > 0) {
      badges.push({
        key: 'amenities',
        label: `Amenities: ${activeFilters.amenities.slice(0, 2).join(', ')}${activeFilters.amenities.length > 2 ? ` +${activeFilters.amenities.length - 2}` : ''}`,
        value: activeFilters.amenities
      });
    }

    if (activeFilters.isFeatured) {
      badges.push({
        key: 'isFeatured',
        label: 'Featured Only',
        value: true
      });
    }

    return badges;
  };

  const activeFilterBadges = getActiveFilterBadges();
  const hasActiveFilters = activeFilterBadges.length > 0;

  const handleFilterRemove = (filterKey: string, value?: any) => {
    if (onFilterRemove) {
      onFilterRemove(filterKey as keyof PropertyFilters, value);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Results
              </CardTitle>
              {searchQuery && (
                <p className="text-sm text-gray-600 mt-1">
                  Results for "{searchQuery}"
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {onSaveSearch && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSaveSearch}
                  className="flex items-center gap-2"
                >
                  <Bookmark className="h-4 w-4" />
                  Save Search
                </Button>
              )}
              
              {onShareResults && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShareResults}
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Results Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {totalResults.toLocaleString()} {totalResults === 1 ? 'property' : 'properties'} found
              </span>
              
              {totalPages > 1 && (
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterBadges.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Filters:</span>
                {onClearAllFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAllFilters}
                    className="text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {activeFilterBadges.map((badge, index) => (
                  <Badge
                    key={`${badge.key}-${index}`}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    {badge.label}
                    <button
                      onClick={() => handleFilterRemove(badge.key, badge.value)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* No Results State */}
      {!isLoading && properties.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Properties Found
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? `We couldn't find any properties matching "${searchQuery}"`
                  : "We couldn't find any properties matching your criteria"
                }. Try adjusting your search filters.
              </p>
              {hasActiveFilters && onClearAllFilters && (
                <Button onClick={onClearAllFilters} variant="outline">
                  Clear All Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results List/Grid */}
      {(properties.length > 0 || isLoading) && (
        <>
          {layout === 'grid' ? (
            <PropertyGrid
              properties={properties}
              isLoading={isLoading}
              hasMore={hasMore}
              onLoadMore={onLoadMore}
              onPropertyClick={onPropertyClick}
              onFavoriteToggle={onFavoriteToggle}
              showFavoriteButton={true}
              showStats={false}
              showAgent={true}
              columns={3}
            />
          ) : (
            <PropertyList
              properties={properties}
              isLoading={isLoading}
              hasMore={hasMore}
              onLoadMore={onLoadMore}
              onPropertyClick={onPropertyClick}
              onFavoriteToggle={onFavoriteToggle}
              onSortChange={onSortChange}
              showFavoriteButton={true}
              showStats={false}
              showAgent={true}
              showDescription={true}
              layout={layout}
              onLayoutChange={onLayoutChange}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          )}
        </>
      )}

      {/* Pagination Info */}
      {totalPages > 1 && properties.length > 0 && (
        <div className="flex justify-center">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * Math.ceil(properties.length / currentPage)) + 1} to{' '}
            {Math.min(currentPage * Math.ceil(properties.length / currentPage), totalResults)} of{' '}
            {totalResults.toLocaleString()} results
          </div>
        </div>
      )}
    </div>
  );
};