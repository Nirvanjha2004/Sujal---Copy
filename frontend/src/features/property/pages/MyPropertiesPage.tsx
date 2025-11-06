import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PropertyGrid } from '../components/lists/PropertyGrid';
import { PropertyList } from '../components/lists/PropertyList';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Layout } from '@/shared/components/layout/Layout';
import { Icon } from '@iconify/react';
import { api } from '@/shared/lib/api';


interface LocalPropertyFilters {
    status: string;
    type: string;
    listingType: string;
    search: string;
}

export function MyPropertiesPage() {
    const navigate = useNavigate();
    const [properties, setProperties] = useState<any[]>([]);
    const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState<LocalPropertyFilters>({
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
                (property.address && property.address.toLowerCase().includes(filters.search.toLowerCase()))
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

    const handleFilterChange = (key: keyof LocalPropertyFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };



    const handlePropertyClick = (property: any) => {
        navigate(`/property/${property.id}`);
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <Icon icon="solar:loading-bold" className="size-8 animate-spin mx-auto mb-4 text-primary" />
                            <p className="text-muted-foreground">Loading your properties...</p>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">My Properties</h1>
                            <p className="text-muted-foreground mt-2">
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
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                    <Tabs defaultValue="grid" className="space-y-6">
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

                        <TabsContent value="grid" className="mt-6">
                            {filteredProperties.length === 0 ? (
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center py-16">
                                        <Icon icon="solar:home-bold" className="size-16 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
                                        <p className="text-muted-foreground text-center mb-6 max-w-md">
                                            {properties.length === 0 
                                                ? "You haven't added any properties yet. Start by adding your first property listing."
                                                : "No properties match your current filters. Try adjusting your search criteria."
                                            }
                                        </p>
                                        <Button onClick={() => navigate('/add-property')}>
                                            <Icon icon="solar:add-circle-bold" className="size-4 mr-2" />
                                            Add Your First Property
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <PropertyGrid 
                                    properties={filteredProperties}
                                    isLoading={false}
                                    onPropertyClick={handlePropertyClick}
                                />
                            )}
                        </TabsContent>

                        <TabsContent value="list" className="mt-6">
                            <PropertyList 
                                properties={filteredProperties}
                                isLoading={false}
                                onPropertyClick={handlePropertyClick}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </Layout>
    );
}