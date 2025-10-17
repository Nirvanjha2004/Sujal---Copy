import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/layout/Layout';
import { api, Property } from '@/shared/lib/api';

interface PropertyFilters {
  status: string;
  type: string;
  listingType: string;
  search: string;
}

export function MyPropertiesPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<PropertyFilters>({
    status: 'all',
    type: 'all',
    listingType: 'all',
    search: ''
  });

  useEffect(() => {
    loadMyProperties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [properties, filters]);

  const loadMyProperties = async () => {
    try {
      setIsLoading(true);
      const response = await api.getUserProperties();
      setProperties(response.data || []);
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...properties];

    if (filters.search) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        property.address.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(property => property.status === filters.status);
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(property => property.property_type === filters.type);
    }

    if (filters.listingType !== 'all') {
      filtered = filtered.filter(property => property.listing_type === filters.listingType);
    }

    setFilteredProperties(filtered);
  };

  const handleFilterChange = (key: keyof PropertyFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDeleteProperty = async (propertyId: number) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await api.deleteProperty(propertyId);
        setProperties(prev => prev.filter(p => p.id !== propertyId));
      } catch (error) {
        console.error('Failed to delete property:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Icon icon="solar:loading-bold" className="size-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your properties...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Properties</h1>
            <p className="text-muted-foreground">
              Manage your property listings
            </p>
          </div>
          <Button onClick={() => navigate('/add-property')} className="bg-primary hover:bg-primary/90">
            <Icon icon="solar:add-circle-bold" className="size-4 mr-2" />
            Add Property
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Search properties..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Property Type</label>
                <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Listing Type</label>
                <Select value={filters.listingType} onValueChange={(value) => handleFilterChange('listingType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Listings</SelectItem>
                    <SelectItem value="sale">For Sale</SelectItem>
                    <SelectItem value="rent">For Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties List */}
        <Tabs defaultValue="grid" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="grid">
                <Icon icon="solar:grid-bold" className="size-4 mr-2" />
                Grid View
              </TabsTrigger>
              <TabsTrigger value="list">
                <Icon icon="solar:list-bold" className="size-4 mr-2" />
                List View
              </TabsTrigger>
            </TabsList>
            
            <div className="text-sm text-muted-foreground">
              {filteredProperties.length} of {properties.length} properties
            </div>
          </div>

          <TabsContent value="grid">
            {filteredProperties.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Icon icon="solar:home-bold" className="size-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {properties.length === 0 
                      ? "You haven't added any properties yet."
                      : "No properties match your current filters."
                    }
                  </p>
                  <Button onClick={() => navigate('/add-property')}>
                    <Icon icon="solar:add-circle-bold" className="size-4 mr-2" />
                    Add Your First Property
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={property.images?.[0]?.image_url || "https://via.placeholder.com/400x200"}
                        alt={property.title}
                        className="w-full h-48 object-cover"
                      />
                      <Badge className={`absolute top-2 right-2 ${getStatusColor(property.status)}`}>
                        {property.status}
                      </Badge>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
                        <p className="text-2xl font-bold text-primary">{formatPrice(property.price)}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{property.address}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon icon="solar:bed-bold" className="size-4" />
                            {property.bedrooms} bed
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon icon="solar:bath-bold" className="size-4" />
                            {property.bathrooms} bath
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon icon="solar:ruler-bold" className="size-4" />
                            {property.area_sqft || 0} sq ft
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex gap-2">
                            <Badge variant="outline">{property.property_type}</Badge>
                            <Badge variant="outline">{property.listing_type}</Badge>
                          </div>
                          
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/property/${property.id}`)}
                            >
                              <Icon icon="solar:eye-bold" className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/edit-property/${property.id}`)}
                            >
                              <Icon icon="solar:pen-bold" className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteProperty(property.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Icon icon="solar:trash-bin-bold" className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="list">
            <div className="space-y-4">
              {filteredProperties.map((property) => (
                <Card key={property.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      <img
                        src={property.images?.[0]?.image_url || "https://via.placeholder.com/150x100"}
                        alt={property.title}
                        className="w-32 h-24 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{property.title}</h3>
                            <p className="text-sm text-muted-foreground">{property.address}</p>
                          </div>
                          <Badge className={getStatusColor(property.status)}>
                            {property.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon icon="solar:bed-bold" className="size-4" />
                            {property.bedrooms} bed
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon icon="solar:bath-bold" className="size-4" />
                            {property.bathrooms} bath
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon icon="solar:ruler-bold" className="size-4" />
                            {property.area_sqft || 0} sq ft
                          </span>
                          <Badge variant="outline">{property.property_type}</Badge>
                          <Badge variant="outline">{property.listing_type}</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-2xl font-bold text-primary">{formatPrice(property.price)}</p>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/property/${property.id}`)}
                            >
                              <Icon icon="solar:eye-bold" className="size-4 mr-2" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/edit-property/${property.id}`)}
                            >
                              <Icon icon="solar:pen-bold" className="size-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteProperty(property.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Icon icon="solar:trash-bin-bold" className="size-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
