import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { SavedSearchCard } from './SavedSearchCard';
import { SavedSearch, PropertyFilters } from '../types';

interface SavedSearchesListProps {
  savedSearches: SavedSearch[];
  loading?: boolean;
  error?: string | null;
  onDeleteSearch: (searchId: number) => Promise<void>;
  onRunSearch: (filters: PropertyFilters) => void;
  onNewSearch?: () => void;
}

export function SavedSearchesList({ 
  savedSearches, 
  loading = false, 
  error = null, 
  onDeleteSearch,
  onRunSearch,
  onNewSearch 
}: SavedSearchesListProps) {
  const [selectedSearches, setSelectedSearches] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<'date_created' | 'name' | 'last_used'>('date_created');

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedSearches.map(id => onDeleteSearch(id)));
      setSelectedSearches([]);
    } catch (err) {
      console.error('Failed to delete saved searches:', err);
    }
  };

  const handleSelectSearch = (searchId: number) => {
    setSelectedSearches(prev => 
      prev.includes(searchId) 
        ? prev.filter(id => id !== searchId)
        : [...prev, searchId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSearches.length === savedSearches.length) {
      setSelectedSearches([]);
    } else {
      setSelectedSearches(savedSearches.map(search => search.id));
    }
  };

  const sortedSearches = [...savedSearches].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'last_used':
        return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
      case 'date_created':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon icon="solar:refresh-bold" className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="mb-6">
        <Icon icon="solar:danger-bold" className="size-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (savedSearches.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <Icon icon="solar:bookmark-bold" className="size-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Saved Searches</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Save your search criteria to quickly find properties that match your preferences. 
              You can save searches from the property search page.
            </p>
            {onNewSearch && (
              <Button onClick={onNewSearch}>
                <Icon icon="solar:magnifer-bold" className="size-4 mr-2" />
                Start Searching
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Bulk Actions */}
          {selectedSearches.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedSearches.length} selected
              </span>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
              >
                <Icon icon="solar:trash-bin-trash-bold" className="size-4 mr-1" />
                Delete Selected
              </Button>
            </div>
          )}
          
          {/* Select All */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleSelectAll}
          >
            {selectedSearches.length === savedSearches.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-input rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="date_created">Date Created</option>
            <option value="name">Name</option>
            <option value="last_used">Last Used</option>
          </select>
        </div>
      </div>

      {/* Searches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedSearches.map((search) => (
          <div key={search.id} className="relative">
            {/* Selection Checkbox */}
            <div className="absolute top-3 left-3 z-10">
              <input
                type="checkbox"
                checked={selectedSearches.includes(search.id)}
                onChange={() => handleSelectSearch(search.id)}
                className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
              />
            </div>

            {/* Search Card */}
            <SavedSearchCard
              search={search}
              onDelete={onDeleteSearch}
              onRun={onRunSearch}
            />
          </div>
        ))}
      </div>

      {/* Tips */}
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
                <li>• Use bulk operations to manage multiple searches at once</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="mt-8 pt-6 border-t">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{savedSearches.length}</p>
            <p className="text-sm text-muted-foreground">Total Searches</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent">
              {savedSearches.filter(search => 
                Object.keys(search.filters).some(key => search.filters[key as keyof PropertyFilters])
              ).length}
            </p>
            <p className="text-sm text-muted-foreground">With Filters</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-secondary">
              {savedSearches.filter(search => 
                new Date(search.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length}
            </p>
            <p className="text-sm text-muted-foreground">Created This Week</p>
          </div>
        </div>
      </div>
    </div>
  );
}