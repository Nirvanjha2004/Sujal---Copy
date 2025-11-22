import React, { useState, useCallback } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
// import { Slider } from '@/shared/components/ui/slider';
import { Search, MapPin, Filter, X, RotateCcw } from 'lucide-react';
import { PropertyFilters, PropertyType, ListingType } from '../../types';
import { PROPERTY_TYPE_CONFIG, LISTING_TYPE_CONFIG } from '../../constants/propertyTypes';
import { AMENITY_CATEGORIES } from '../../constants/amenities';

export interface PropertySearchFormProps {
  initialFilters?: Partial<PropertyFilters>;
  onSearch: (query: string, filters: PropertyFilters) => void;
  onFiltersChange?: (filters: PropertyFilters) => void;
  isLoading?: boolean;
  showAdvancedFilters?: boolean;
  className?: string;
}

const DEFAULT_FILTERS: PropertyFilters = {
  location: '',
  propertyType: [],
  listingType: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  bedrooms: undefined,
  bathrooms: undefined,
  minArea: undefined,
  maxArea: undefined,
  amenities: [],
  features: [],
  isActive: true,
  isFeatured: undefined
};

export const PropertySearchForm: React.FC<PropertySearchFormProps> = ({
  initialFilters = {},
  onSearch,
  onFiltersChange,
  isLoading = false,
  showAdvancedFilters = false,
  className
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<PropertyFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters
  });
  const [showAdvanced, setShowAdvanced] = useState(showAdvancedFilters);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 10000000
  ]);
  const [areaRange, setAreaRange] = useState<[number, number]>([
    filters.minArea || 0,
    filters.maxArea || 5000
  ]);

  const updateFilters = useCallback((newFilters: Partial<PropertyFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  }, [filters, onFiltersChange]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Update price and area filters from sliders
    const searchFilters = {
      ...filters,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 10000000 ? priceRange[1] : undefined,
      minArea: areaRange[0] > 0 ? areaRange[0] : undefined,
      maxArea: areaRange[1] < 5000 ? areaRange[1] : undefined
    };
    
    onSearch(query, searchFilters);
  };

  const handleReset = () => {
    setQuery('');
    setFilters(DEFAULT_FILTERS);
    setPriceRange([0, 10000000]);
    setAreaRange([0, 5000]);
    onFiltersChange?.(DEFAULT_FILTERS);
  };

  const togglePropertyType = (type: PropertyType) => {
    const currentTypes = Array.isArray(filters.propertyType) ? filters.propertyType : [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t: PropertyType) => t !== type)
      : [...currentTypes, type];
    updateFilters({ propertyType: newTypes });
  };

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    updateFilters({ amenities: newAmenities });
  };

  const removeAmenity = (amenity: string) => {
    const newAmenities = (filters.amenities || []).filter(a => a !== amenity);
    updateFilters({ amenities: newAmenities });
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return '1Cr+';
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}Cr`;
    if (price >= 100000) return `${(price / 100000).toFixed(1)}L`;
    return `₹${price.toLocaleString()}`;
  };

  const activeFilterCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '' && value !== null;
  }).length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Properties
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Badge variant="secondary">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
              </Badge>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {showAdvanced ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-6">
          {/* Basic Search */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by location, property name, or keywords..."
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isLoading} className="px-6">
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <Select
              value={filters.listingType || ''}
              onValueChange={(value) => updateFilters({ 
                listingType: value as ListingType || undefined 
              })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Listing Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {Object.entries(LISTING_TYPE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.bedrooms?.toString() || ''}
              onValueChange={(value) => updateFilters({ 
                bedrooms: value ? parseInt(value) : undefined 
              })}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="1">1 BHK</SelectItem>
                <SelectItem value="2">2 BHK</SelectItem>
                <SelectItem value="3">3 BHK</SelectItem>
                <SelectItem value="4">4 BHK</SelectItem>
                <SelectItem value="5">5+ BHK</SelectItem>
              </SelectContent>
            </Select>

            <Input
              value={filters.location || ''}
              onChange={(e) => updateFilters({ location: e.target.value })}
              placeholder="Location"
              className="w-[160px]"
            />

            {activeFilterCount > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="space-y-6 pt-4 border-t">
              {/* Property Types */}
              <div>
                <label className="block text-sm font-medium mb-3">Property Type</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PROPERTY_TYPE_CONFIG).map(([key, config]) => (
                    <Button
                      key={key}
                      type="button"
                      variant={Array.isArray(filters.propertyType) && filters.propertyType.includes(key as PropertyType) ? "default" : "outline"}
                      size="sm"
                      onClick={() => togglePropertyType(key as PropertyType)}
                      className="flex items-center gap-2"
                    >
                      {config.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                </label>
                {/* <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  max={10000000}
                  min={0}
                  step={100000}
                  className="w-full"
                /> */}
                <div className="text-sm text-muted-foreground">Price range slider temporarily disabled</div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>₹0</span>
                  <span>₹1Cr+</span>
                </div>
              </div>

              {/* Area Range */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Area Range: {areaRange[0]} - {areaRange[1]} sq ft
                </label>
                {/* <Slider
                  value={areaRange}
                  onValueChange={(value) => setAreaRange(value as [number, number])}
                  max={5000}
                  min={0}
                  step={100}
                  className="w-full"
                /> */}
                <div className="text-sm text-muted-foreground">Area range slider temporarily disabled</div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0 sq ft</span>
                  <span>5000+ sq ft</span>
                </div>
              </div>

              {/* Bedrooms and Bathrooms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bedrooms</label>
                  <Select
                    value={filters.bedrooms?.toString() || ''}
                    onValueChange={(value) => updateFilters({ 
                      bedrooms: value ? parseInt(value) : undefined 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bathrooms</label>
                  <Select
                    value={filters.bathrooms?.toString() || ''}
                    onValueChange={(value) => updateFilters({ 
                      bathrooms: value ? parseInt(value) : undefined 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium mb-3">Amenities</label>
                
                {/* Selected Amenities */}
                {filters.amenities && filters.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {filters.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeAmenity(amenity)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Amenity Categories */}
                <div className="space-y-3">
                  {Object.entries(AMENITY_CATEGORIES).slice(0, 3).map(([categoryKey, category]) => (
                    <div key={categoryKey}>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">{category.label}</h4>
                      <div className="flex flex-wrap gap-2">
                        {category.amenities.slice(0, 6).map((amenity) => (
                          <Button
                            key={amenity}
                            type="button"
                            variant={filters.amenities?.includes(amenity) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleAmenity(amenity)}
                            className="text-xs"
                          >
                            {amenity}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Options */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.isFeatured || false}
                    onChange={(e) => updateFilters({ 
                      isFeatured: e.target.checked || undefined 
                    })}
                    className="rounded"
                  />
                  <span className="text-sm">Featured Properties Only</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.isActive !== false}
                    onChange={(e) => updateFilters({ 
                      isActive: e.target.checked 
                    })}
                    className="rounded"
                  />
                  <span className="text-sm">Active Listings Only</span>
                </label>
              </div>
            </div>
          )}

          {/* Search Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={isLoading} className="px-8">
              {isLoading ? 'Searching...' : 'Search Properties'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};