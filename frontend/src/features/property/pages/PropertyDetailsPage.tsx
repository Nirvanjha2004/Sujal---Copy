import { useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { useProperty } from "../hooks/useProperty";
import { useFavorites } from "@/features/buyer/hooks/useFavorites";
import { PropertyDetails } from "../components/details/PropertyDetails";
import { PropertyOverview } from "../components/details/PropertyOverview";
import { PropertyFeatures } from "../components/details/PropertyFeatures";
import { PropertyContact } from "../components/details/PropertyContact";
import { PropertyGallery } from "../components/common/PropertyGallery";
import { PropertyStats } from "../components/common/PropertyStats";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { PropertyGridSkeleton } from "@/shared/components/ui/loading";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Layout } from "@/shared/components/layout/Layout";
import { Icon } from "@iconify/react";
import { toast } from 'sonner';
import { useAuth } from '@/shared/contexts/AuthContext';
import { api } from '@/shared/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Separator } from "@/shared/components/ui/separator";

export function PropertyDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const propertyId = id ? parseInt(id) : 0;

    const { property, isLoading: loading, error } = useProperty({ propertyId });
    const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
    const [activeTab, setActiveTab] = useState('overview');
    const { state: authState } = useAuth();
    const formatPrice = (price: number) => {
        if (price >= 10000000) {
            return `₹ ${(price / 10000000).toFixed(2)} CRORE`;
        } else if (price >= 100000) {
            return `₹ ${(price / 100000).toFixed(2)} LAKH`;
        } else {
            return `₹ ${price.toLocaleString()}`;
        }
    };

    // Show contact card modal instead of redirecting to conversations
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    const handleContactOwnerClick = () => {
        if (!authState.isAuthenticated) {
            toast.info("Please log in to view contact details.");
            navigate('/login');
            return;
        }
        setIsContactModalOpen(true);
    };

    // COMMENTED OUT: Old implementation that redirects to conversations
    // const handleContactOwnerClick = async () => {
    //     if (!authState.isAuthenticated || !authState.user?.email) {
    //         toast.info("Please log in to contact the owner.");
    //         navigate('/login');
    //         return;
    //     }

    //     if (!property || !property.id) {
    //         toast.error("Property details not available. Please refresh the page.");
    //         return;
    //     }

    //     try {
    //         const defaultMessage = `I'm interested in your property: "${property.title}".`;

    //         const inquiryData = {
    //             property_id: property.id,
    //             message: defaultMessage,
    //             name: authState.user.first_name || "Interested Buyer",
    //             email: authState.user.email,
    //             inquirer_id: authState.user.id,
    //         };

    //         const inquiryResponse = await api.createInquiry(inquiryData);

    //         if (!inquiryResponse || !inquiryResponse.data) {
    //             throw new Error("Invalid response from server");
    //         }

    //         const inquiry = inquiryResponse.data.inquiry;
    //         if (!inquiry) {
    //             throw new Error("No inquiry data in response");
    //         }

    //         const conversationId = inquiry.conversation_id;

    //         if (!conversationId) {
    //             throw new Error("Could not retrieve conversation ID.");
    //         }

    //         toast.success("Opening conversation...");
    //         navigate(`/dashboard/messages/${conversationId}`);

    //     } catch (err) {
    //         console.error("Failed to create inquiry:", err);

    //         // More detailed error handling
    //         if (err instanceof Error) {
    //             toast.error(`Error: ${err.message}`);
    //         } else if (typeof err === 'object' && err !== null) {
    //             const errorObj = err as any;
    //             if (errorObj.response?.data?.message) {
    //                 toast.error(`Server error: ${errorObj.response.data.message}`);
    //             } else if (errorObj.message) {
    //                 toast.error(`Error: ${errorObj.message}`);
    //             } else {
    //                 toast.error("Could not start conversation. Please try again.");
    //             }
    //         } else {
    //             toast.error("Could not start conversation. Please try again.");
    //         }
    //     }
    // };


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
                <PropertyGallery images={property.images || []} title={property.title} />

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
                            onClick={handleContactOwnerClick}
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
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="amenities">Amenities</TabsTrigger>
                        <TabsTrigger value="location">Location</TabsTrigger>
                        {/* <TabsTrigger value="contact">Contact</TabsTrigger> */}
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <PropertyOverview property={property} />
                    </TabsContent>

                    <TabsContent value="details" className="space-y-6">
                        <PropertyDetails property={property} />
                    </TabsContent>

                    <TabsContent value="amenities" className="space-y-6">
                        <PropertyFeatures property={property} />
                    </TabsContent>

                    <TabsContent value="location" className="space-y-6">
                        <PropertyDetails property={property} />
                    </TabsContent>

                    <TabsContent value="contact" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <PropertyContact property={property} />

                            {/* Property Stats */}
                            <PropertyStats property={property} />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Contact Owner Modal */}
            <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Contact Owner</DialogTitle>
                        <DialogDescription>
                            Property owner contact information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <Icon icon="solar:user-bold" className="size-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Property Owner</h3>
                                <p className="text-sm text-muted-foreground">Listed by owner</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Icon icon="solar:phone-bold" className="size-5 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">+91 98765 43210</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Icon icon="solar:letter-bold" className="size-5 text-primary" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">owner@example.com</p>
                                </div>
                            </div>
                        </div>
                        <Separator />
                        <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                <Icon icon="solar:info-circle-bold" className="size-4 inline mr-1" />
                                Contact the owner directly for property inquiries and site visits.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsContactModalOpen(false)}>
                            Close
                        </Button>
                        <Button className="bg-primary">
                            <Icon icon="solar:phone-bold" className="mr-2 h-4 w-4" />
                            Call Now
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Layout>
    );
}