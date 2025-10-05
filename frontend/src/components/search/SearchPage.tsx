import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdvancedSearchForm } from './AdvancedSearchForm';
import { SearchResults } from './SearchResults';
import { PropertyMap } from './PropertyMap';
import { SavedSearches } from './SavedSearches';
import { useSearchProperties } from '@/hooks/useProperties';
import { Property, PropertyFilters } from '@/lib/api';

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [showSavedSearches, setShowSavedSearches] = useState(false);

  // Extract filters from URL params on component mount
  useEffect(() => {
    const newFilters: PropertyFilters = {};
    
    const query = searchParams.get('q');
    const propertyType = searchParams.get('property_type');
    const listingType = searchParams.get('listing_type');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const bedrooms = searchParams.get('bedrooms');
    const bathrooms = searchParams.get('bathrooms');
    const minArea = searchParams.get('min_area');
    const maxArea = searchParams.get('max_area');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sort_by');
    const sortOrder = searchParams.get('sort_order');
    
    // Set search query separately from filters
    setSearchQuery(query || '');
    
    if (propertyType && propertyType !== 'all') newFilters.property_type = propertyType;
    if (listingType) newFilters.listing_type = listingType;
    if (minPrice) newFilters.min_price = parseInt(minPrice);
    if (maxPrice) newFilters.max_price = parseInt(maxPrice);
    if (bedrooms) newFilters.bedrooms = parseInt(bedrooms);
    if (bathrooms) newFilters.bathrooms = parseInt(bathrooms);
    if (minArea) newFilters.min_area = parseInt(minArea);
    if (maxArea) newFilters.max_area = parseInt(maxArea);
    if (status) newFilters.status = status;
    if (sortBy) newFilters.sort_by = sortBy;
    if (sortOrder) newFilters.sort_order = sortOrder as 'asc' | 'desc';
    
    setFilters(newFilters);
  }, [searchParams]);

  const { properties, loading, error, total } = useSearchProperties(searchQuery, filters);

  // Update URL when filters change
  const updateFilters = (newFilters: PropertyFilters, newQuery?: string) => {
    setFilters(newFilters);
    if (newQuery !== undefined) {
      setSearchQuery(newQuery);
    }
    
    const params = new URLSearchParams();
    
    // Add search query if it exists
    if (newQuery !== undefined && newQuery) {
      params.set('q', newQuery);
    } else if (searchQuery) {
      params.set('q', searchQuery);
    }
    
    // Add filters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      }
    });
    
    setSearchParams(params);
  };

  const handlePropertyClick = (property: Property) => {
    navigate(`/property/${property.id}`);
  };

  const handleMapBoundsChange = (bounds: google.maps.LatLngBounds) => {
    // Optionally filter properties by map bounds
    // This would require backend support for geographic filtering
    console.log('Map bounds changed:', bounds);
  };

  const handleSavedSearchLoad = (savedFilters: PropertyFilters) => {
    updateFilters(savedFilters);
    setShowSavedSearches(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-3 px-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-8">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="bg-white p-2 rounded">
              <Icon icon="solar:home-smile-bold" className="size-8 text-primary" />
            </div>
            <h1 className="text-lg font-heading font-semibold tracking-tight hidden md:block">
              PropPortal
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            size="sm" 
            className="bg-white text-foreground hover:bg-white/90 hidden md:flex"
            onClick={() => navigate('/dashboard')}
          >
            Post Property<span className="ml-1 text-xs">Free</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="bg-white/10 hover:bg-white/20"
            onClick={() => setShowSavedSearches(!showSavedSearches)}
          >
            <Icon icon="solar:bookmark-bold" className="size-4 mr-2" />
            Saved
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-9 rounded-full bg-white/10 hover:bg-white/20"
            onClick={() => navigate('/login')}
          >
            <Icon icon="solar:user-bold" className="size-5" />
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search Form */}
            <AdvancedSearchForm
              onSearch={updateFilters}
              initialFilters={filters}
            />

            {/* Saved Searches */}
            {showSavedSearches && (
              <SavedSearches
                onSearchLoad={handleSavedSearchLoad}
                currentFilters={filters}
              />
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'map')}>
              <div className="flex items-center justify-between mb-6">
                <TabsList className="grid w-48 grid-cols-2">
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <Icon icon="solar:list-bold" className="size-4" />
                    List
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center gap-2">
                    <Icon icon="solar:map-bold" className="size-4" />
                    Map
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon icon="solar:info-circle-bold" className="size-4" />
                  <span>
                    {loading ? 'Searching...' : `${total} properties found`}
                  </span>
                </div>
              </div>

              <TabsContent value="list" className="mt-0">
                <SearchResults
                  properties={properties}
                  total={total}
                  loading={loading}
                  error={error || undefined}
                  filters={filters}
                  onFiltersChange={updateFilters}
                  onPropertyClick={handlePropertyClick}
                />
              </TabsContent>

              <TabsContent value="map" className="mt-0">
                <div className="space-y-6">
                  <PropertyMap
                    properties={properties}
                    onPropertySelect={handlePropertyClick}
                    onBoundsChange={handleMapBoundsChange}
                    filters={filters}
                    height="600px"
                  />
                  
                  {/* Map Results Summary */}
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Properties on Map</h3>
                        <p className="text-sm text-muted-foreground">
                          Showing {properties.length} of {total} properties
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('list')}
                      >
                        View as List
                        <Icon icon="solar:list-bold" className="size-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Mobile Search Toggle */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Button
          size="lg"
          className="rounded-full shadow-lg"
          onClick={() => setShowSavedSearches(!showSavedSearches)}
        >
          <Icon icon="solar:filter-bold" className="size-5" />
        </Button>
      </div>
    </div>
  );
}