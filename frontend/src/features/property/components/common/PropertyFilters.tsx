import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Badge } from '@/shared/components/ui/badge';
import { PropertyFilters as PropertyFiltersType, PropertyType, ListingType } from '../../types';
import { PROPERTY_TYPES, LISTING_TYPES } from '../../constants';
import { AMENITIES_CONFIG } from '../../constants/amenities';

export interface PropertyFiltersProps {
    filters: PropertyFiltersType;
    onFiltersChange: (filters: PropertyFiltersType) => void;
    onApplyFilters?: () => void;
    onClearFilters?: () => void;
    variant?: 'sidebar' | 'horizontal' | 'modal';
    showApplyButton?: boolean;
    className?: string;
}

// Move FilterSection outside to prevent recreation on every render
const FilterSection = ({
    title,
    icon,
    sectionKey,
    children,
    expandedSections,
    toggleSection
}: {
    title: string;
    icon: string;
    sectionKey: string;
    children: React.ReactNode;
    expandedSections: Record<string, boolean>;
    toggleSection: (section: string) => void;
}) => (
    <div className="space-y-4">
        <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto"
            onClick={() => toggleSection(sectionKey)}
        >
            <div className="flex items-center gap-2">
                <Icon icon={icon} className="size-4" />
                <span className="font-medium">{title}</span>
            </div>
            <Icon
                icon={expandedSections[sectionKey] ? "solar:alt-arrow-up-bold" : "solar:alt-arrow-down-bold"}
                className="size-4"
            />
        </Button>
        {expandedSections[sectionKey] && (
            <div className="mt-4">
                {children}
            </div>
        )}
    </div>
);

export function PropertyFilters({
    filters,
    onFiltersChange,
    onApplyFilters,
    onClearFilters,
    variant = 'sidebar',
    showApplyButton = true,
    className = ""
}: PropertyFiltersProps) {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        basic: true,
        price: true,
        size: false,
        amenities: false,
        location: false
    });

    const updateFilter = (key: keyof PropertyFiltersType, value: any) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.propertyType?.length) count++;
        if (filters.listingType) count++;
        if (filters.minPrice || filters.maxPrice) count++;
        if (filters.minArea || filters.maxArea) count++;
        if (filters.bedrooms) count++;
        if (filters.bathrooms) count++;
        if (filters.amenities?.length) count++;
        if (filters.location) count++;
        return count;
    };

    const clearAllFilters = () => {
        const emptyFilters: PropertyFiltersType = {};
        onFiltersChange(emptyFilters);
        if (onClearFilters) onClearFilters();
    };

    if (variant === 'horizontal') {
        return (
            <Card className={className}>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4 items-end">
                        {/* Property Type */}
                        <div className="min-w-[150px]">
                            <Label className="text-xs">Property Type</Label>
                            <Select
                                value={Array.isArray(filters.propertyType) ? filters.propertyType[0] || undefined : filters.propertyType || undefined}
                                onValueChange={(value) => updateFilter('propertyType', value ? [value as PropertyType] : [])}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Any Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Any Type</SelectItem>
                                    {PROPERTY_TYPES.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Listing Type */}
                        <div className="min-w-[120px]">
                            <Label className="text-xs">For</Label>
                            <Select
                                value={filters.listingType || undefined}
                                onValueChange={(value) => updateFilter('listingType', value === 'all' ? undefined : value as ListingType)}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Sale/Rent" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Any</SelectItem>
                                    {LISTING_TYPES.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Price Range */}
                        <div className="min-w-[200px]">
                            <Label className="text-xs">Price Range</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Min"
                                    type="number"
                                    value={filters.minPrice || ""}
                                    onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                                    className="h-9"
                                />
                                <Input
                                    placeholder="Max"
                                    type="number"
                                    value={filters.maxPrice || ""}
                                    onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                                    className="h-9"
                                />
                            </div>
                        </div>

                        {/* Bedrooms */}
                        <div className="min-w-[100px]">
                            <Label className="text-xs">Bedrooms</Label>
                            <Select
                                value={filters.bedrooms?.toString() || undefined}
                                onValueChange={(value) => updateFilter('bedrooms', value === 'all' ? undefined : Number(value))}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Any" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Any</SelectItem>
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <SelectItem key={num} value={num.toString()}>
                                            {num}+ BHK
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            {showApplyButton && (
                                <Button onClick={onApplyFilters} size="sm">
                                    <Icon icon="solar:magnifer-bold" className="size-4 mr-2" />
                                    Search
                                </Button>
                            )}
                            <Button variant="outline" onClick={clearAllFilters} size="sm">
                                <Icon icon="solar:refresh-bold" className="size-4 mr-2" />
                                Clear
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Sidebar variant (default)
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Icon icon="solar:filter-bold" className="size-5" />
                        Filters
                        {getActiveFiltersCount() > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {getActiveFiltersCount()}
                            </Badge>
                        )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                        <Icon icon="solar:refresh-bold" className="size-4" />
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Basic Filters */}
                <FilterSection 
                    title="Basic" 
                    icon="solar:home-bold" 
                    sectionKey="basic"
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                >
                    <div className="space-y-4">
                        {/* Property Type */}
                        <div>
                            <Label className="text-sm font-medium mb-2 block">Property Type</Label>
                            <Select
                                value={Array.isArray(filters.propertyType) ? filters.propertyType[0] || undefined : filters.propertyType || undefined}
                                onValueChange={(value) => updateFilter('propertyType', value === 'all' ? [] : [value as PropertyType])}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select property type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Any Type</SelectItem>
                                    {PROPERTY_TYPES.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Listing Type */}
                        <div>
                            <Label className="text-sm font-medium mb-2 block">Listing Type</Label>
                            <Select
                                value={filters.listingType || undefined}
                                onValueChange={(value) => updateFilter('listingType', value === 'all' ? undefined : value as ListingType)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select listing type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Any</SelectItem>
                                    {LISTING_TYPES.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </FilterSection>

                {/* Price Range */}
                <FilterSection 
                    title="Price Range" 
                    icon="solar:dollar-minimalistic-bold" 
                    sectionKey="price"
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-xs">Min Price</Label>
                                <Input
                                    placeholder="₹ 0"
                                    type="number"
                                    value={filters.minPrice || ""}
                                    onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Max Price</Label>
                                <Input
                                    placeholder="₹ Any"
                                    type="number"
                                    value={filters.maxPrice || ""}
                                    onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                                />
                            </div>
                        </div>
                    </div>
                </FilterSection>

                {/* Size & Layout */}
                <FilterSection 
                    title="Size & Layout" 
                    icon="solar:ruler-bold" 
                    sectionKey="size"
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                >
                    <div className="space-y-4">
                        {/* Area Range */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-xs">Min Area (sq ft)</Label>
                                <Input
                                    placeholder="0"
                                    type="number"
                                    value={filters.minArea || ""}
                                    onChange={(e) => updateFilter('minArea', e.target.value ? Number(e.target.value) : undefined)}
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Max Area (sq ft)</Label>
                                <Input
                                    placeholder="Any"
                                    type="number"
                                    value={filters.maxArea || ""}
                                    onChange={(e) => updateFilter('maxArea', e.target.value ? Number(e.target.value) : undefined)}
                                />
                            </div>
                        </div>

                        {/* Bedrooms */}
                        <div>
                            <Label className="text-sm font-medium mb-2 block">Bedrooms</Label>
                            <div className="flex gap-2 flex-wrap">
                                {[1, 2, 3, 4, 5].map(num => (
                                    <Button
                                        key={num}
                                        variant={filters.bedrooms === num ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => updateFilter('bedrooms', filters.bedrooms === num ? undefined : num)}
                                    >
                                        {num}+
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Bathrooms */}
                        <div>
                            <Label className="text-sm font-medium mb-2 block">Bathrooms</Label>
                            <div className="flex gap-2 flex-wrap">
                                {[1, 2, 3, 4].map(num => (
                                    <Button
                                        key={num}
                                        variant={filters.bathrooms === num ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => updateFilter('bathrooms', filters.bathrooms === num ? undefined : num)}
                                    >
                                        {num}+
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </FilterSection>

                {/* Amenities */}
                <FilterSection 
                    title="Amenities" 
                    icon="solar:star-bold" 
                    sectionKey="amenities"
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                >
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {Object.entries(AMENITIES_CONFIG).slice(0, 10).map(([amenityKey, amenityConfig]) => (
                            <div key={amenityKey} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`amenity-${amenityKey}`}
                                    checked={filters.amenities?.includes(amenityKey) || false}
                                    onCheckedChange={(checked) => {
                                        const currentAmenities = filters.amenities || [];
                                        if (checked) {
                                            updateFilter('amenities', [...currentAmenities, amenityKey]);
                                        } else {
                                            updateFilter('amenities', currentAmenities.filter((a: string) => a !== amenityKey));
                                        }
                                    }}
                                />
                                <Label htmlFor={`amenity-${amenityKey}`} className="text-sm">
                                    {amenityConfig.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                </FilterSection>

                {/* Location */}
                <FilterSection 
                    title="Location" 
                    icon="solar:map-point-bold" 
                    sectionKey="location"
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                >
                    <div className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium mb-2 block">City/Area</Label>
                            <Input
                                placeholder="Enter city or area"
                                value={filters.location || ""}
                                onChange={(e) => updateFilter('location', e.target.value)}
                            />
                        </div>
                    </div>
                </FilterSection>

                {/* Apply Button */}
                {showApplyButton && (
                    <div className="pt-4 border-t">
                        <Button onClick={onApplyFilters} className="w-full">
                            <Icon icon="solar:magnifer-bold" className="size-4 mr-2" />
                            Apply Filters
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}