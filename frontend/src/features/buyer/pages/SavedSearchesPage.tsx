import { Icon } from '@iconify/react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Layout } from '@/shared/components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { useSavedSearches } from '../hooks/useSavedSearches';
import { PropertyFilters } from '../types';

export function SavedSearchesPage() {
  const { savedSearches, loading, error, deleteSavedSearch } = useSavedSearches();
  const navigate = useNavigate();

  const handleDeleteSearch = async (searchId: number) => {
    try {
      await deleteSavedSearch(searchId);
    } catch (err) {
      console.error('Failed to delete saved search:', err);
    }
  };

  const handleRunSearch = (filters: PropertyFilters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Use 'q' for the location parameter, as expected by the search page
        if (key === 'location') {
          params.append('q', value.toString());
        } else {
          params.append(key, value.toString());
        }
      }
    });
    navigate(`/search?${params.toString()}`);
  };

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
    
    return filterLabels;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Icon icon="solar:refresh-bold" className="size-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight mb-2">
              Saved Searches
            </h1>
            <p className="text-muted-foreground">
              {savedSearches.length} saved search{savedSearches.length !== 1 ? 'es' : ''}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/search')}
          >
            <Icon icon="solar:magnifer-bold" className="size-4 mr-2" />
            New Search
          </Button>
        </div>

        {error && (
          <Alert className="mb-6">
            <Icon icon="solar:danger-bold" className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {savedSearches.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Icon icon="solar:bookmark-bold" className="size-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Saved Searches</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Save your search criteria to quickly find properties that match your preferences. 
                  You can save searches from the property search page.
                </p>
                <Button onClick={() => navigate('/search')}>
                  <Icon icon="solar:magnifer-bold" className="size-4 mr-2" />
                  Start Searching
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedSearches.map((search) => (
              <Card key={search.id} className="hover:shadow-lg transition-shadow">
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
                      onClick={() => handleDeleteSearch(search.id)}
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
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                      <Button
                        size="sm"
                        onClick={() => handleRunSearch(search.filters)}
                        className="flex-1"
                      >
                        <Icon icon="solar:magnifer-bold" className="size-4 mr-1" />
                        Run Search
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tips */}
        {savedSearches.length > 0 && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Icon icon="solar:lightbulb-bold" className="size-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Pro Tips</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Run your saved searches regularly to find new properties</li>
                    <li>• Edit searches to refine your criteria as your needs change</li>
                    <li>• Save multiple searches for different property types or locations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}