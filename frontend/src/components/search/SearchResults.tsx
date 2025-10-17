import { useState } from 'react';
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyGridSkeleton } from "@/components/ui/loading";
import { Property, PropertyFilters } from "@/shared/lib/api";

interface SearchResultsProps {
  properties: Property[];
  total: number;
  loading: boolean;
  error?: string;
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  onPropertyClick: (property: Property) => void;
}

type SortOption = 'relevance' | 'price_low' | 'price_high' | 'date_new' | 'date_old' | 'area_large' | 'area_small';

export function SearchResults({
  properties,
  total,
  loading,
  error,
  filters,
  onFiltersChange,
  onPropertyClick
}: SearchResultsProps) {
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'date_new', label: 'Newest First' },
    { value: 'date_old', label: 'Oldest First' },
    { value: 'area_large', label: 'Area: Large to Small' },
    { value: 'area_small', label: 'Area: Small to Large' },
  ];

  const quickFilters = [
    { key: 'new_launch', label: 'New Launch', filter: { status: 'new' } },
    { key: 'owner', label: 'Owner', filter: {} }, // This would need backend support
    { key: 'verified', label: 'Verified', filter: {} }, // This would need backend support
    { key: 'under_construction', label: 'Under Construction', filter: { status: 'under_construction' } },
    { key: 'ready_to_move', label: 'Ready to Move', filter: { status: 'resale' } },
    { key: 'with_photos', label: 'With Photos', filter: {} }, // This would need backend support
  ];

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    
    // Convert sort option to API parameters
    let sortFilters: Partial<PropertyFilters> = {};
    
    switch (value) {
      case 'price_low':
        sortFilters = { ...filters, sort_by: 'price', sort_order: 'asc' };
        break;
      case 'price_high':
        sortFilters = { ...filters, sort_by: 'price', sort_order: 'desc' };
        break;
      case 'date_new':
        sortFilters = { ...filters, sort_by: 'created_at', sort_order: 'desc' };
        break;
      case 'date_old':
        sortFilters = { ...filters, sort_by: 'created_at', sort_order: 'asc' };
        break;
      case 'area_large':
        sortFilters = { ...filters, sort_by: 'area', sort_order: 'desc' };
        break;
      case 'area_small':
        sortFilters = { ...filters, sort_by: 'area', sort_order: 'asc' };
        break;
      default:
        sortFilters = { ...filters, sort_by: undefined, sort_order: undefined };
    }
    
    onFiltersChange(sortFilters);
  };

  const handleQuickFilter = (quickFilter: typeof quickFilters[0]) => {
    const newFilters = { ...filters, ...quickFilter.filter };
    onFiltersChange(newFilters);
  };

  const isQuickFilterActive = (quickFilter: typeof quickFilters[0]) => {
    return Object.entries(quickFilter.filter).every(([key, value]) => 
      filters[key as keyof PropertyFilters] === value
    );
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹ ${(price / 100000).toFixed(2)} Lakh`;
    } else {
      return `₹ ${price.toLocaleString()}`;
    }
  };

  if (loading) {
    return <PropertyGridSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Icon icon="solar:danger-bold" className="size-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Properties</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">
            {total.toLocaleString()} Properties Found
          </h2>
          {filters.location && (
            <p className="text-muted-foreground">
              in {filters.location}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3"
            >
              <Icon icon="solar:list-bold" className="size-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3"
            >
              <Icon icon="solar:grid-bold" className="size-4" />
            </Button>
          </div>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-48">
              <Icon icon="solar:sort-bold" className="size-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((quickFilter) => (
          <Badge
            key={quickFilter.key}
            variant={isQuickFilterActive(quickFilter) ? "default" : "outline"}
            className="cursor-pointer hover:bg-secondary px-3 py-1"
            onClick={() => handleQuickFilter(quickFilter)}
          >
            {quickFilter.label}
          </Badge>
        ))}
      </div>

      {/* Results */}
      {!properties || properties.length === 0 ? (
        <div className="text-center py-12">
          <Icon icon="solar:home-bold" className="size-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search criteria or filters
          </p>
          <Button 
            variant="outline" 
            onClick={() => onFiltersChange({})}
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {properties && properties.map((property) => (
            viewMode === 'grid' ? (
              <PropertyCard
                key={property.id}
                property={property}
                variant="grid"
              />
            ) : (
              <Card 
                key={property.id} 
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onPropertyClick(property)}
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3">
                    <img
                      src={property.images?.[0]?.image_url || "/api/placeholder/400/300"}
                      alt={property.title}
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{property.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Icon icon="solar:map-point-bold" className="size-4" />
                          <span>{property.city}, {property.state}</span>
                        </div>
                      </div>
                      <Badge className="bg-accent text-accent-foreground capitalize">
                        {property.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-2xl font-bold">{formatPrice(property.price)}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{property.area_sqft || 0} sq ft</span>
                        <span>{property.bedrooms} BHK</span>
                        <span>{property.bathrooms} Bath</span>
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">
                        {property.property_type} • For {property.listing_type}
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {property.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Listed on</p>
                        <p className="text-sm font-semibold">
                          {new Date(property.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle contact action
                        }}
                      >
                        Contact Owner
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          ))}
        </div>
      )}

      {/* Load More / Pagination could go here */}
      {properties && properties.length > 0 && properties.length < total && (
        <div className="text-center pt-8">
          <Button variant="outline" size="lg">
            Load More Properties
            <Icon icon="solar:alt-arrow-down-bold" className="size-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}