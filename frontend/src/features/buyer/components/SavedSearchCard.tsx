import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PropertyFilters, SavedSearch } from '../types/savedSearches';

interface SavedSearchCardProps {
  search: SavedSearch;
  onDelete: (id: number) => void;
  onRun: (filters: PropertyFilters) => void;
}

export function SavedSearchCard({ search, onDelete, onRun }: SavedSearchCardProps) {
  const formatFilters = (filters: PropertyFilters) => {
    const filterLabels: string[] = [];
    
    if (filters.location) filterLabels.push(`Location: ${filters.location}`);
    if (filters.property_type) filterLabels.push(`Type: ${filters.property_type}`);
    if (filters.listing_type) filterLabels.push(`For: ${filters.listing_type}`);
    if (filters.min_price || filters.max_price) {
      const priceRange = `₹${filters.min_price || '0'} - ₹${filters.max_price || 'Any'}`;
      filterLabels.push(`Price: ${priceRange}`);
    }
    if (filters.bedrooms) filterLabels.push(`${filters.bedrooms} BHK`);
    if (filters.bathrooms) filterLabels.push(`${filters.bathrooms} Bath`);
    if (filters.min_area || filters.max_area || filters.area_min || filters.area_max) {
      const minArea = filters.min_area || filters.area_min || '0';
      const maxArea = filters.max_area || filters.area_max || 'Any';
      filterLabels.push(`Area: ${minArea} - ${maxArea} sq ft`);
    }
    if (filters.status) filterLabels.push(`Status: ${filters.status}`);
    if (filters.is_featured) filterLabels.push('Featured Only');
    if (filters.keywords) filterLabels.push(`Keywords: ${filters.keywords}`);
    
    return filterLabels;
  };

  const handleDelete = () => {
    onDelete(search.id);
  };

  const handleRunSearch = () => {
    onRun(search.filters);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{search.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Saved on {new Date(search.created_at).toLocaleDateString()}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDelete}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive size-8"
          >
            <Icon icon="solar:trash-bin-trash-bold" className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Filter Tags */}
          <div className="flex flex-wrap gap-2">
            {formatFilters(search.filters).map((filter, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {filter}
              </Badge>
            ))}
            {formatFilters(search.filters).length === 0 && (
              <Badge variant="outline" className="text-xs">
                No filters applied
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              size="sm"
              onClick={handleRunSearch}
              className="flex-1"
            >
              <Icon icon="solar:magnifer-bold" className="size-4 mr-1" />
              Run Search
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}