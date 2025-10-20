import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
// import { Slider } from '@/shared/components/ui/slider';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Separator } from '@/shared/components/ui/separator';
import { Filter, X, RotateCcw, Save, Bookmark } from 'lucide-react';
import { PropertyFilters, PropertyType, ListingType } from '../../types';
import { usePropertyFilters } from '../../hooks/usePropertyFilters';
import { PROPERTY_TYPE_CONFIG, LISTING_TYPE_CONFIG } from '../../constants/propertyTypes';
import { AMENITY_FILTERS } from '../../constants/amenities';

export interface PropertyFiltersFormProps {
    initialFilters?: Partial<PropertyFilters>;
    onFiltersChange: (filters: PropertyFilters) => void;
    onSaveFilters?: (name: string, filters: PropertyFilters) => void;
    showSaveOption?: boolean;
    className?: string;
}

interface FilterPreset {
    id: string;
    name: string;
    filters: PropertyFilters;
}

const POPULAR_PRESETS: FilterPreset[] = [
    {
        id: 'budget-apartments',
        name: 'Budget Apartments',
        filters: {
            propertyType: ['apartment'],
            listingType: 'sale',
            maxPrice: 5000000,
            bedrooms: 2,
            amenities: ['parking', 'security', 'elevator']
        }
    },
    {
        id: 'luxury-villas',
        name: 'Luxury Villas',
        filters: {
            propertyType: ['villa'],
            listingType: 'sale',
            minPrice: 20000000,
            minArea: 2000,
            amenities: ['swimming_pool', 'gym', 'garden', 'security']
        }
    },
    {
        id: 'rental-houses',
        name: 'Rental Houses',
        filters: {
            propertyType: ['house', 'apartment'],
            listingType: 'rent',
            maxPrice: 50000,
            amenities: ['parking', 'security']
        }
    },
    {
        id: 'investment-plots',
        name: 'Investment Plots',
        filters: {
            propertyType: ['plot', 'land'],
            listingType: 'sale',
            minArea: 1000,
            amenities: ['road_access', 'electricity_connection']
        }
    }
];

export const PropertyFiltersForm: React.FC<PropertyFiltersFormProps> = ({
    initialFilters = {},
    onFiltersChange,
    onSaveFilters,
    showSaveOption = false,
    className
}) => {
    const {
        filters,
        setFilters,
        resetFilters,
        activeFilterCount
    } = usePropertyFilters({ initialFilters });

    const [priceRange, setPriceRange] = useState<[number, number]>([
        filters.minPrice || 0,
        filters.maxPrice || 10000000
    ]);
    const [areaRange, setAreaRange] = useState<[number, number]>([
        filters.minArea || 0,
        filters.maxArea || 5000
    ]);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [filterName, setFilterName] = useState('');

    // Sync with parent component
    useEffect(() => {
        onFiltersChange(filters);
    }, [filters, onFiltersChange]);

    // Update price and area ranges when filters change
    useEffect(() => {
        setPriceRange([filters.minPrice || 0, filters.maxPrice || 10000000]);
        setAreaRange([filters.minArea || 0, filters.maxArea || 5000]);
    }, [filters.minPrice, filters.maxPrice, filters.minArea, filters.maxArea]);

    const updateFilters = useCallback((newFilters: Partial<PropertyFilters>) => {
        setFilters({ ...filters, ...newFilters });
    }, [filters, setFilters]);

    const handlePriceRangeChange = (range: number[]) => {
        const typedRange = range as [number, number];
        setPriceRange(typedRange);
        updateFilters({
            minPrice: typedRange[0] > 0 ? typedRange[0] : undefined,
            maxPrice: typedRange[1] < 10000000 ? typedRange[1] : undefined
        });
    };

    const handleAreaRangeChange = (range: number[]) => {
        const typedRange = range as [number, number];
        setAreaRange(typedRange);
        updateFilters({
            minArea: typedRange[0] > 0 ? typedRange[0] : undefined,
            maxArea: typedRange[1] < 5000 ? typedRange[1] : undefined
        });
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

    const applyPreset = (preset: FilterPreset) => {
        setFilters(preset.filters);
    };

    const handleSaveFilters = () => {
        if (filterName.trim() && onSaveFilters) {
            onSaveFilters(filterName.trim(), filters);
            setFilterName('');
            setShowSaveDialog(false);
        }
    };

    const formatPrice = (price: number) => {
        if (price >= 10000000) return '1Cr+';
        if (price >= 1000000) return `${(price / 1000000).toFixed(1)}Cr`;
        if (price >= 100000) return `${(price / 100000).toFixed(1)}L`;
        return `₹${price.toLocaleString()}`;
    };

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Advanced Filters
                    </div>
                    <div className="flex items-center gap-2">
                        {activeFilterCount > 0 && (
                            <Badge variant="secondary">
                                {activeFilterCount} active
                            </Badge>
                        )}
                        {showSaveOption && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSaveDialog(true)}
                                className="flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                Save
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={resetFilters}
                            className="flex items-center gap-2"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Filter Presets */}
                <div>
                    <h3 className="text-sm font-medium mb-3">Popular Filters</h3>
                    <div className="flex flex-wrap gap-2">
                        {POPULAR_PRESETS.map((preset) => (
                            <Button
                                key={preset.id}
                                variant="outline"
                                size="sm"
                                onClick={() => applyPreset(preset)}
                                className="flex items-center gap-2"
                            >
                                <Bookmark className="h-3 w-3" />
                                {preset.name}
                            </Button>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* Listing Type */}
                <div>
                    <label className="block text-sm font-medium mb-3">Listing Type</label>
                    <div className="flex gap-2">
                        {Object.entries(LISTING_TYPE_CONFIG).map(([key, config]) => (
                            <Button
                                key={key}
                                type="button"
                                variant={filters.listingType === key ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateFilters({
                                    listingType: filters.listingType === key ? undefined : key as ListingType
                                })}
                            >
                                {config.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Property Types */}
                <div>
                    <label className="block text-sm font-medium mb-3">Property Type</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(PROPERTY_TYPE_CONFIG).map(([key, config]) => (
                            <Button
                                key={key}
                                type="button"
                                variant={Array.isArray(filters.propertyType) && filters.propertyType.includes(key as PropertyType) ? "default" : "outline"}
                                size="sm"
                                onClick={() => togglePropertyType(key as PropertyType)}
                                className="justify-start"
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
            onValueChange={handlePriceRangeChange}
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
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <Input
                            type="number"
                            placeholder="Min Price"
                            value={priceRange[0] || ''}
                            onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                handlePriceRangeChange([value, priceRange[1]]);
                            }}
                        />
                        <Input
                            type="number"
                            placeholder="Max Price"
                            value={priceRange[1] === 10000000 ? '' : priceRange[1]}
                            onChange={(e) => {
                                const value = parseInt(e.target.value) || 10000000;
                                handlePriceRangeChange([priceRange[0], value]);
                            }}
                        />
                    </div>
                </div>

                {/* Area Range */}
                <div>
                    <label className="block text-sm font-medium mb-3">
                        Area Range: {areaRange[0]} - {areaRange[1]} sq ft
                    </label>
                    {/* <Slider
            value={areaRange}
            onValueChange={handleAreaRangeChange}
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
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <Input
                            type="number"
                            placeholder="Min Area"
                            value={areaRange[0] || ''}
                            onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                handleAreaRangeChange([value, areaRange[1]]);
                            }}
                        />
                        <Input
                            type="number"
                            placeholder="Max Area"
                            value={areaRange[1] === 5000 ? '' : areaRange[1]}
                            onChange={(e) => {
                                const value = parseInt(e.target.value) || 5000;
                                handleAreaRangeChange([areaRange[0], value]);
                            }}
                        />
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

                {/* Location */}
                <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <Input
                        value={filters.location || ''}
                        onChange={(e) => updateFilters({ location: e.target.value })}
                        placeholder="Enter city, area, or pincode"
                    />
                </div>

                {/* Amenities */}
                <div>
                    <label className="block text-sm font-medium mb-3">Amenities</label>

                    {/* Selected Amenities */}
                    {filters.amenities && filters.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
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

                    {/* Popular Amenities */}
                    <div className="space-y-4">
                        {Object.entries(AMENITY_FILTERS).map(([filterKey, amenities]) => (
                            <div key={filterKey}>
                                <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                                    {filterKey.replace('_', ' ')} Amenities
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {amenities.map((amenity) => (
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
                <div>
                    <label className="block text-sm font-medium mb-3">Additional Options</label>
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="featured"
                                checked={filters.isFeatured || false}
                                onCheckedChange={(checked) => updateFilters({
                                    isFeatured: checked === true ? true : undefined
                                })}
                            />
                            <label htmlFor="featured" className="text-sm">
                                Featured Properties Only
                            </label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="active"
                                checked={filters.isActive !== false}
                                onCheckedChange={(checked) => updateFilters({
                                    isActive: checked === true
                                })}
                            />
                            <label htmlFor="active" className="text-sm">
                                Active Listings Only
                            </label>
                        </div>
                    </div>
                </div>

                {/* Save Filter Dialog */}
                {showSaveDialog && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="text-sm font-medium mb-2">Save Filter</h4>
                        <div className="flex gap-2">
                            <Input
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                placeholder="Enter filter name"
                                className="flex-1"
                            />
                            <Button
                                size="sm"
                                onClick={handleSaveFilters}
                                disabled={!filterName.trim()}
                            >
                                Save
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowSaveDialog(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};