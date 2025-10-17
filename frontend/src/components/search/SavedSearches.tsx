import { useState, useEffect } from 'react';
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api, PropertyFilters, SavedSearch } from "@/shared/lib/api";

interface SavedSearchesProps {
  onSearchLoad: (filters: PropertyFilters) => void;
  currentFilters?: PropertyFilters;
  className?: string;
}

export function SavedSearches({ onSearchLoad, currentFilters, className = "" }: SavedSearchesProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = async () => {
    try {
      setLoading(true);
      const response = await api.getSavedSearches();
      setSavedSearches(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load saved searches');
      console.error('Error loading saved searches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCurrentSearch = async () => {
    if (!searchName.trim() || !currentFilters) return;

    try {
      setSaving(true);
      await api.saveSearch({
        name: searchName.trim(),
        filters: currentFilters
      });
      
      setSearchName('');
      setShowSaveDialog(false);
      await loadSavedSearches();
    } catch (err) {
      setError('Failed to save search');
      console.error('Error saving search:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSearch = async (id: number) => {
    try {
      await api.deleteSavedSearch(id);
      await loadSavedSearches();
    } catch (err) {
      setError('Failed to delete search');
      console.error('Error deleting search:', err);
    }
  };

  const formatFilters = (filters: PropertyFilters): string => {
    const parts: string[] = [];
    
    if (filters.location) parts.push(filters.location);
    if (filters.property_type) parts.push(filters.property_type);
    if (filters.listing_type) parts.push(`for ${filters.listing_type}`);
    if (filters.min_price || filters.max_price) {
      const min = filters.min_price ? `₹${(filters.min_price / 100000).toFixed(0)}L` : '';
      const max = filters.max_price ? `₹${(filters.max_price / 100000).toFixed(0)}L` : '';
      if (min && max) parts.push(`${min} - ${max}`);
      else if (min) parts.push(`above ${min}`);
      else if (max) parts.push(`below ${max}`);
    }
    if (filters.bedrooms) parts.push(`${filters.bedrooms} BHK`);
    
    return parts.join(' • ') || 'All properties';
  };

  const hasCurrentFilters = currentFilters && Object.values(currentFilters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Icon icon="solar:refresh-bold" className="size-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Saved Searches</CardTitle>
          {hasCurrentFilters && (
            <Button
              size="sm"
              onClick={() => setShowSaveDialog(true)}
              className="text-xs"
            >
              <Icon icon="solar:bookmark-bold" className="size-4 mr-1" />
              Save Current Search
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {error && (
          <Alert className="mb-4">
            <Icon icon="solar:danger-bold" className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="mb-4 p-4 border rounded-lg bg-secondary/50">
            <h4 className="font-semibold mb-2">Save Current Search</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter search name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="text-sm text-muted-foreground">
                <strong>Filters:</strong> {formatFilters(currentFilters || {})}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveCurrentSearch}
                  disabled={!searchName.trim() || saving}
                >
                  {saving ? (
                    <Icon icon="solar:refresh-bold" className="size-4 mr-1 animate-spin" />
                  ) : (
                    <Icon icon="solar:check-circle-bold" className="size-4 mr-1" />
                  )}
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowSaveDialog(false);
                    setSearchName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Saved Searches List */}
        {savedSearches.length === 0 ? (
          <div className="text-center py-8">
            <Icon icon="solar:bookmark-bold" className="size-12 text-muted-foreground mx-auto mb-3" />
            <h4 className="font-semibold mb-2">No Saved Searches</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Save your search criteria to quickly find properties later
            </p>
            {hasCurrentFilters && (
              <Button
                size="sm"
                onClick={() => setShowSaveDialog(true)}
              >
                Save Current Search
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {savedSearches.map((search) => (
              <div
                key={search.id}
                className="flex items-start justify-between p-3 border rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-1 truncate">
                    {search.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {formatFilters(search.filters)}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon icon="solar:calendar-bold" className="size-3" />
                    <span>Saved {new Date(search.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onSearchLoad(search.filters)}
                    className="h-8 px-2"
                  >
                    <Icon icon="solar:magnifer-bold" className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteSearch(search.id)}
                    className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Icon icon="solar:trash-bin-trash-bold" className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {savedSearches.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {savedSearches.length} saved search{savedSearches.length !== 1 ? 'es' : ''}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={loadSavedSearches}
                className="text-xs"
              >
                <Icon icon="solar:refresh-bold" className="size-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}