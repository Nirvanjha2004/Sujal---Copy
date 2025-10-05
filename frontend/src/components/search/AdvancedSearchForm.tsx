import { useState } from 'react';
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PropertyFilters } from "@/lib/api";

interface AdvancedSearchFormProps {
  onSearch: (filters: PropertyFilters) => void;
  initialFilters?: PropertyFilters;
  className?: string;
}

export function AdvancedSearchForm({ onSearch, initialFilters = {}, className = "" }: AdvancedSearchFormProps) {
  const [filters, setFilters] = useState<PropertyFilters>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Price ranges for quick selection
  const priceRanges = [
    { label: "Under ₹50 Lakh", min: 0, max: 5000000 },
    { label: "₹50L - ₹1 Cr", min: 5000000, max: 10000000 },
    { label: "₹1 - ₹2 Cr", min: 10000000, max: 20000000 },
    { label: "₹2 - ₹5 Cr", min: 20000000, max: 50000000 },
    { label: "Above ₹5 Cr", min: 50000000, max: undefined },
  ];

  // Area ranges for quick selection
  const areaRanges = [
    { label: "Under 1000 sq ft", min: 0, max: 1000 },
    { label: "1000-2000 sq ft", min: 1000, max: 2000 },
    { label: "2000-3000 sq ft", min: 2000, max: 3000 },
    { label: "Above 3000 sq ft", min: 3000, max: undefined },
  ];



  const updateFilter = (key: keyof PropertyFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  const handlePriceRangeSelect = (range: typeof priceRanges[0]) => {
    setFilters(prev => ({
      ...prev,
      min_price: range.min,
      max_price: range.max
    }));
  };

  const handleAreaRangeSelect = (range: typeof areaRanges[0]) => {
    setFilters(prev => ({
      ...prev,
      min_area: range.min,
      max_area: range.max
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const clearFilters = () => {
    setFilters({});
    onSearch({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-6">
        {/* Basic Search Row */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Icon icon="solar:map-point-bold" className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter city, locality, or project name"
                value={filters.location || ''}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          
          <Select value={filters.property_type || 'all'} onValueChange={(value) => updateFilter('property_type', value === 'all' ? undefined : value)}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="land">Land</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.listing_type || 'all'} onValueChange={(value) => updateFilter('listing_type', value === 'all' ? undefined : value)}>
            <SelectTrigger className="w-full lg:w-32">
              <SelectValue placeholder="For" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="sale">Sale</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleSearch} className="px-8">
            <Icon icon="solar:magnifer-bold" className="size-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={showAdvanced ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Icon icon="solar:filter-bold" className="size-4 mr-2" />
            Advanced Filters
            <Icon 
              icon={showAdvanced ? "solar:alt-arrow-up-bold" : "solar:alt-arrow-down-bold"} 
              className="size-4 ml-2" 
            />
          </Button>
          
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <Icon icon="solar:close-circle-bold" className="size-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-6 pt-4 border-t">
            {/* Price Range */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Price Range</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {priceRanges.map((range, index) => (
                  <Badge
                    key={index}
                    variant={
                      filters.min_price === range.min && filters.max_price === range.max
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => handlePriceRangeSelect(range)}
                  >
                    {range.label}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.min_price || ''}
                  onChange={(e) => updateFilter('min_price', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-input rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.max_price || ''}
                  onChange={(e) => updateFilter('max_price', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-input rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <Separator />

            {/* Property Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Bedrooms</label>
                <Select value={filters.bedrooms?.toString() || 'any'} onValueChange={(value) => updateFilter('bedrooms', value === 'any' ? undefined : parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1 BHK</SelectItem>
                    <SelectItem value="2">2 BHK</SelectItem>
                    <SelectItem value="3">3 BHK</SelectItem>
                    <SelectItem value="4">4 BHK</SelectItem>
                    <SelectItem value="5">5+ BHK</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Bathrooms</label>
                <Select value={filters.bathrooms?.toString() || 'any'} onValueChange={(value) => updateFilter('bathrooms', value === 'any' ? undefined : parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Status</label>
                <Select value={filters.status || 'any'} onValueChange={(value) => updateFilter('status', value === 'any' ? undefined : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="resale">Resale</SelectItem>
                    <SelectItem value="under_construction">Under Construction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Area Range */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Area (sq ft)</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {areaRanges.map((range, index) => (
                  <Badge
                    key={index}
                    variant={
                      filters.min_area === range.min && filters.max_area === range.max
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => handleAreaRangeSelect(range)}
                  >
                    {range.label}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min Area"
                  value={filters.min_area || ''}
                  onChange={(e) => updateFilter('min_area', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-input rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  placeholder="Max Area"
                  value={filters.max_area || ''}
                  onChange={(e) => updateFilter('max_area', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-input rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <Separator />

            {/* Popular Amenities */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Popular Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Parking', 'Elevator', 'Swimming Pool', 'Gym', 'Security',
                  'Power Backup', 'Club House', 'Garden', 'CCTV Surveillance',
                  'Air Conditioning', 'Intercom', 'Fire Safety'
                ].map((amenity) => (
                  <Badge
                    key={amenity}
                    variant={
                      filters.amenities?.includes(amenity) ? "default" : "outline"
                    }
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => {
                      const currentAmenities = filters.amenities || [];
                      const isSelected = currentAmenities.includes(amenity);
                      const newAmenities = isSelected
                        ? currentAmenities.filter(a => a !== amenity)
                        : [...currentAmenities, amenity];
                      updateFilter('amenities', newAmenities.length > 0 ? newAmenities : undefined);
                    }}
                  >
                    {amenity}
                    {filters.amenities?.includes(amenity) && (
                      <Icon icon="solar:close-bold" className="size-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
              {filters.amenities && filters.amenities.length > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {filters.amenities.length} amenit{filters.amenities.length > 1 ? 'ies' : 'y'} selected
                </div>
              )}
            </div>

            <Separator />

            {/* Search Actions */}
            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-muted-foreground">
                {hasActiveFilters && "Active filters applied"}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button onClick={handleSearch}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}