import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Layout } from '@/components/layout/Layout';
import { PropertyCard } from '@/components/property/PropertyCard';
import { useFavorites } from '@/hooks/useFavorites';
import { useNavigate } from 'react-router-dom';

export function FavoritesPage() {
  const { favorites, loading, error, removeFromFavorites } = useFavorites();
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date_added' | 'price' | 'title'>('date_added');
  const navigate = useNavigate();



  const handleBulkRemove = async () => {
    try {
      await Promise.all(selectedProperties.map(id => removeFromFavorites(id)));
      setSelectedProperties([]);
    } catch (err) {
      console.error('Failed to remove favorites:', err);
    }
  };

  const handleSelectProperty = (propertyId: number) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProperties.length === favorites.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(favorites.map(prop => prop.id));
    }
  };

  const sortedFavorites = [...favorites].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'title':
        return a.title.localeCompare(b.title);
      case 'date_added':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

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
              Saved Properties
            </h1>
            <p className="text-muted-foreground">
              {favorites.length} propert{favorites.length !== 1 ? 'ies' : 'y'} saved
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/properties')}
          >
            <Icon icon="solar:magnifer-bold" className="size-4 mr-2" />
            Browse Properties
          </Button>
        </div>

        {error && (
          <Alert className="mb-6">
            <Icon icon="solar:danger-bold" className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Icon icon="solar:heart-bold" className="size-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Saved Properties</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Start exploring properties and save your favorites to see them here. 
                  Click the heart icon on any property to add it to your saved list.
                </p>
                <Button onClick={() => navigate('/properties')}>
                  <Icon icon="solar:magnifer-bold" className="size-4 mr-2" />
                  Browse Properties
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {/* Bulk Actions */}
                {selectedProperties.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedProperties.length} selected
                    </span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleBulkRemove}
                    >
                      <Icon icon="solar:trash-bin-trash-bold" className="size-4 mr-1" />
                      Remove Selected
                    </Button>
                  </div>
                )}
                
                {/* Select All */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSelectAll}
                >
                  {selectedProperties.length === favorites.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-input rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="date_added">Date Added</option>
                  <option value="price">Price</option>
                  <option value="title">Title</option>
                </select>

                {/* View Mode */}
                <div className="flex items-center border border-input rounded">
                  <Button
                    size="sm"
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Icon icon="solar:grid-bold" className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <Icon icon="solar:list-bold" className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Properties Grid/List */}
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {sortedFavorites.map((property) => (
                <div key={property.id} className="relative">
                  {/* Selection Checkbox */}
                  <div className="absolute top-3 left-3 z-10">
                    <input
                      type="checkbox"
                      checked={selectedProperties.includes(property.id)}
                      onChange={() => handleSelectProperty(property.id)}
                      className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary focus:ring-2"
                    />
                  </div>

                  {/* Property Card */}
                  <div className={viewMode === 'list' ? 'flex gap-4' : ''}>
                    <PropertyCard
                      property={property}
                      variant={viewMode}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-8 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{favorites.length}</p>
                  <p className="text-sm text-muted-foreground">Total Saved</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">
                    ₹{Math.round(favorites.reduce((sum, prop) => sum + prop.price, 0) / favorites.length / 100000)}L
                  </p>
                  <p className="text-sm text-muted-foreground">Average Price</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary">
                    {Math.round(favorites.reduce((sum, prop) => sum + (prop.area_sqft || 0), 0) / favorites.length)}
                  </p>
                  <p className="text-sm text-muted-foreground">Average Area (sq ft)</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}