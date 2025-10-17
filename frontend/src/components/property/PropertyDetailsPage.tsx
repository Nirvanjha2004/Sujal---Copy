import { useState } from 'react';
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProperty } from "@/shared/hooks/useProperties";
import { useFavorites } from "@/shared/hooks/useFavorites";
import { useParams, useNavigate } from "react-router-dom";
import { PropertyGridSkeleton } from "@/components/ui/loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageGallery } from "@/components/property/ImageGallery";
import { PropertyShare } from "@/components/property/PropertyShare";
import { PropertyOwnerProfile } from "@/components/property/PropertyOwnerProfile";
import { PropertyMap } from "@/components/search/PropertyMap";
import { Layout } from "@/components/layout/Layout";

export function PropertyDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const propertyId = id ? parseInt(id) : 0;
    
    const { property, loading, error } = useProperty(propertyId);
    const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
    const [activeTab, setActiveTab] = useState('overview');

    const formatPrice = (price: number) => {
        if (price >= 10000000) {
            return `₹ ${(price / 10000000).toFixed(2)} CRORE`;
        } else if (price >= 100000) {
            return `₹ ${(price / 100000).toFixed(2)} LAKH`;
        } else {
            return `₹ ${price.toLocaleString()}`;
        }
    };

    const handleFavoriteToggle = async () => {
        if (!property) return;
        
        try {
            if (isFavorite(property.id)) {
                await removeFromFavorites(property.id);
            } else {
                await addToFavorites(property.id);
            }
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    };

    const getAmenitiesList = (amenities: any) => {
        if (!amenities || typeof amenities !== 'object') return [];
        
        const amenityLabels: Record<string, string> = {
            parking: 'Parking',
            gym: 'Gym',
            swimming_pool: 'Swimming Pool',
            garden: 'Garden',
            security: '24/7 Security',
            elevator: 'Elevator',
            power_backup: 'Power Backup',
            water_supply: '24/7 Water Supply',
            internet: 'High-Speed Internet',
            air_conditioning: 'Air Conditioning',
            furnished: 'Furnished',
            pet_friendly: 'Pet Friendly',
            balcony: 'Balcony',
            terrace: 'Terrace',
            club_house: 'Club House',
            playground: 'Children Play Area'
        };

        return Object.entries(amenities)
            .filter(([_, value]) => value === true)
            .map(([key, _]) => amenityLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
    };

    if (loading) {
        return (
            <Layout>
                <PropertyGridSkeleton />
            </Layout>
        );
    }

    if (error || !property) {
        return (
            <Layout>
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <Alert className="max-w-md">
                        <Icon icon="solar:danger-bold" className="size-5 text-red-500" />
                        <AlertDescription>
                            Property not found or failed to load.
                        </AlertDescription>
                        <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => navigate('/properties')}
                        >
                            Back to Properties
                        </Button>
                    </Alert>
                </div>
            </Layout>
        );
    }

    const amenitiesList = getAmenitiesList(property.amenities);

    return (
        <Layout>
            <div className="container mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <div className="text-sm text-muted-foreground mb-4">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate('/properties')}
                        className="p-0 h-auto font-normal"
                    >
                        Properties
                    </Button>
                    {" > "}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate(`/properties?city=${property.city}`)}
                        className="p-0 h-auto font-normal"
                    >
                        {property.city}, {property.state}
                    </Button>
                    {" > "} {property.title}
                </div>

                {/* Image Gallery */}
                <ImageGallery images={property.images || []} title={property.title} />

                {/* Property Header */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
                    <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="flex-1">
                                <h1 className="text-3xl font-heading font-bold tracking-tight mb-2">
                                    {property.title}
                                </h1>
                                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                                    <Icon icon="solar:map-point-bold" className="size-5" />
                                    <span>{property.address}, {property.city}, {property.state}</span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleFavoriteToggle}
                                className="hover:bg-red-50"
                            >
                                <Icon 
                                    icon={isFavorite(property.id) ? "solar:heart-bold" : "solar:heart-linear"} 
                                    className={`size-6 ${isFavorite(property.id) ? 'text-red-500' : 'text-gray-400'}`} 
                                />
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 mb-4">
                            <div className="flex items-center gap-2">
                                <Icon icon="solar:bed-bold" className="size-5 text-primary" />
                                <span className="font-medium">{property.bedrooms || 0} Bedrooms</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Icon icon="solar:bath-bold" className="size-5 text-primary" />
                                <span className="font-medium">{property.bathrooms || 0} Bathrooms</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Icon icon="solar:ruler-bold" className="size-5 text-primary" />
                                <span className="font-medium">{property.area_sqft || 0} sq ft</span>
                            </div>
                            {property.area_sqft && property.price && (
                                <div className="flex items-center gap-2">
                                    <Icon icon="solar:calculator-bold" className="size-5 text-primary" />
                                    <span className="font-medium">₹{Math.round(property.price / property.area_sqft)}/sq ft</span>
                                </div>
                            )}
                        </div>

                        <div className="text-3xl font-bold text-primary mb-4">
                            {formatPrice(property.price)}
                            {property.listing_type === 'rent' && <span className="text-lg text-muted-foreground">/month</span>}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Badge className="bg-primary text-primary-foreground capitalize">
                                {property.property_type}
                            </Badge>
                            <Badge variant="secondary" className="capitalize">
                                For {property.listing_type}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                                {property.status}
                            </Badge>
                            {property.is_featured && (
                                <Badge className="bg-yellow-500 text-white">
                                    Featured
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 lg:w-64">
                        <Button
                            size="lg"
                            className="w-full shadow-lg shadow-primary/20"
                        >
                            <Icon icon="solar:phone-calling-bold" className="size-5 mr-2" />
                            Contact Owner
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="outline"
                                onClick={handleFavoriteToggle}
                            >
                                <Icon 
                                    icon={isFavorite(property.id) ? "solar:heart-bold" : "solar:heart-linear"} 
                                    className={`size-4 mr-2 ${isFavorite(property.id) ? 'text-red-500' : ''}`} 
                                />
                                {isFavorite(property.id) ? 'Saved' : 'Save'}
                            </Button>
                            <Button variant="outline">
                                <Icon icon="solar:share-bold" className="size-4 mr-2" />
                                Share
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Property Details Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="amenities">Amenities</TabsTrigger>
                        <TabsTrigger value="location">Location</TabsTrigger>
                        <TabsTrigger value="contact">Contact</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>About This Property</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed">
                                    {property.description || 'No description available for this property.'}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Key Features</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                        <Icon icon="solar:home-bold" className="size-5 text-primary" />
                                        <div>
                                            <div className="font-medium">Property Type</div>
                                            <div className="text-sm text-muted-foreground capitalize">{property.property_type}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                        <Icon icon="solar:tag-bold" className="size-5 text-primary" />
                                        <div>
                                            <div className="font-medium">Listing Type</div>
                                            <div className="text-sm text-muted-foreground capitalize">For {property.listing_type}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                        <Icon icon="solar:calendar-bold" className="size-5 text-primary" />
                                        <div>
                                            <div className="font-medium">Listed On</div>
                                            <div className="text-sm text-muted-foreground">
                                                {new Date(property.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Property Specifications</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Property Type</span>
                                            <span className="font-medium capitalize">{property.property_type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Listing Type</span>
                                            <span className="font-medium capitalize">For {property.listing_type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Status</span>
                                            <span className="font-medium capitalize">{property.status}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Area</span>
                                            <span className="font-medium">{property.area_sqft || 0} sq ft</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Bedrooms</span>
                                            <span className="font-medium">{property.bedrooms || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Bathrooms</span>
                                            <span className="font-medium">{property.bathrooms || 0}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Price</span>
                                            <span className="font-medium">{formatPrice(property.price)}</span>
                                        </div>
                                        {property.area_sqft && property.price && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Price per sq ft</span>
                                                <span className="font-medium">₹{Math.round(property.price / property.area_sqft)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">City</span>
                                            <span className="font-medium">{property.city}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">State</span>
                                            <span className="font-medium">{property.state}</span>
                                        </div>
                                        {property.postal_code && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Postal Code</span>
                                                <span className="font-medium">{property.postal_code}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Listed On</span>
                                            <span className="font-medium">
                                                {new Date(property.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="amenities" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Available Amenities</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {amenitiesList.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {amenitiesList.map((amenity, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                                <Icon icon="solar:check-circle-bold" className="size-5 text-green-600" />
                                                <span className="font-medium">{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Icon icon="solar:home-bold" className="size-12 mx-auto mb-4 opacity-50" />
                                        <p>No amenities information available for this property.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="location" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Location & Neighborhood</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Address</h4>
                                    <p className="text-muted-foreground">{property.address}</p>
                                    <p className="text-muted-foreground">{property.city}, {property.state} {property.postal_code}</p>
                                </div>
                                
                                {/* Map */}
                                <div>
                                    <h4 className="font-medium mb-2">Map View</h4>
                                    <PropertyMap 
                                        properties={[property]} 
                                        height="400px"
                                        className="w-full"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="contact" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Owner Profile */}
                            {property.owner && (
                                <PropertyOwnerProfile 
                                    owner={property.owner}
                                    propertyCount={5}
                                    onContact={() => {
                                        console.log('Contact owner:', property.owner);
                                    }}
                                />
                            )}
                            
                            {/* Share Options */}
                            <PropertyShare 
                                propertyId={property.id} 
                                propertyTitle={property.title}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </Layout>
    );
}