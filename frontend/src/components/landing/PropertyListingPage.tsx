import { Icon } from "@iconify/react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { useProperty } from "@/shared/hooks/useProperties";
import { useFavorites } from "@/features/buyer/hooks/useFavorites";
import { useParams, useNavigate } from "react-router-dom";
import { PropertyGridSkeleton } from "@/shared/components/ui/loading";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { PropertyGallery } from "@/features/property/components/common/PropertyGallery";
import { PropertyShare } from "@/shared/components/property/PropertyShare";
import { PropertyOwnerProfile } from "@/shared/components/property/PropertyOwnerProfile";
import { useAuth } from "@/shared/contexts/AuthContext";
import { api } from "@/shared/lib/api"; // 1. Import api
import { toast } from "sonner"; // 2. Import toast for notifications
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { Calendar } from "@/shared/components/ui/calendar";
import { format } from "date-fns";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import { ImageGallery } from "../property/ImageGallery";

export function PropertyListingPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { state: authState } = useAuth();
    const propertyId = id ? parseInt(id) : 0;

    // Add these new state variables
    const [isSiteVisitModalOpen, setSiteVisitModalOpen] = useState(false);
    const [visitDate, setVisitDate] = useState<Date | undefined>(undefined);
    const [visitTime, setVisitTime] = useState<string>("10:00");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { property, loading, error } = useProperty(propertyId);
    const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();

    // Remove state related to the contact message as it's no longer needed here
    // const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    // const [contactMessage, setContactMessage] = useState("");

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

        if (!authState.isAuthenticated) {
            navigate('/login');
            return;
        }

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

    const handleContactOwnerClick = async () => {
        // 1. Check for authentication and user details first
        if (!authState.isAuthenticated || !authState.user?.email) {
            toast.info("Please log in to contact the owner.");
            navigate('/login');
            return;
        }

        // 2. Ensure property data is loaded
        if (!property || !property.id) {
            toast.error("Property details not available. Please refresh the page.");
            return;
        }

        try {
            const defaultMessage = `I'm interested in your property: "${property.title}".`;

            console.log('inquiryResponse:', property.id, authState.user.email, authState.user.first_name, authState.user.id);

            // 3. Use guaranteed values from the checks above
            const inquiryResponse = await api.createInquiry({
                property_id: property.id,
                message: defaultMessage,
                name: authState.user.first_name || "Interested Buyer", // Fallback for name
                email: authState.user.email,
                inquirer_id: authState.user.id,
            });


            const inquiry = inquiryResponse.data.inquiry;
            const conversationId = inquiry.conversation_id;

            if (!conversationId) {
                throw new Error("Could not retrieve conversation ID.");
            }

            toast.success("Opening conversation...");

            // Navigate to the specific conversation page
            navigate(`/dashboard/messages/${conversationId}`);

        } catch (err) {
            console.error("Failed to create inquiry:", err);
            toast.error("Could not start conversation. Please try again.");
        }
    };

    // Add these handler functions in your component
    const handleScheduleVisitClick = () => {
        if (!authState.isAuthenticated) {
            toast.info("Please log in to schedule a site visit.");
            navigate('/login');
            return;
        }

        setSiteVisitModalOpen(true);
    };

    const handleScheduleSubmit = async () => {
        if (!visitDate) {
            toast.error("Please select a date for your visit");
            return;
        }

        if (!property || !property.id) {
            toast.error("Property details not available. Please refresh the page.");
            return;
        }

        try {
            setIsSubmitting(true);

            // Format the date and time for submission
            const formattedDate = format(visitDate, 'yyyy-MM-dd');
            const visitDateTime = `${formattedDate}T${visitTime}:00`;

            // Example API call - you'll need to implement this endpoint
            const response = await api.createSiteVisit({
                property_id: property.id,
                scheduled_at: visitDateTime,
                visitor_name: authState.user?.first_name || "Visitor",
                visitor_email: authState.user?.email || "",
                visitor_id: authState.user?.id,
                notes: `Site visit request for ${property.title}`
            });

            // Handle successful submission
            toast.success("Site visit scheduled successfully!");
            setSiteVisitModalOpen(false);

            // Optionally navigate to a confirmation or dashboard page
            // navigate('/dashboard/visits');

        } catch (err) {
            console.error("Failed to schedule site visit:", err);
            toast.error("Could not schedule visit. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <PropertyGridSkeleton />;
    }

    if (error || !property) {
        return (
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
        );
    }

    return (
        <div className="property-listing-page min-h-screen bg-background">
            <header className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                                <Icon icon="solar:home-smile-bold" className="size-8" />
                                <span className="text-xl font-bold">PropHuzzles</span>
                            </div>
                            <nav className="hidden md:flex items-center gap-6 text-sm">
                                <button
                                    onClick={() => navigate('/properties?listing_type=sale')}
                                    className="hover:underline"
                                >
                                    For Buyers
                                </button>
                                <button
                                    onClick={() => navigate('/properties?listing_type=rent')}
                                    className="hover:underline"
                                >
                                    For Tenants
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="hover:underline"
                                >
                                    For Owners
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="hover:underline"
                                >
                                    For Dealers/Builders
                                </button>
                                <button
                                    onClick={() => navigate('/insights')}
                                    className="hover:underline"
                                >
                                    Insights
                                </button>
                            </nav>
                        </div>
                        <div className="flex items-center gap-3">
                            {authState.isAuthenticated ? (
                                <>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="shadow-lg"
                                        onClick={() => navigate('/dashboard')}
                                    >
                                        Post Property FREE
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="rounded-full"
                                        onClick={() => navigate('/profile')}
                                    >
                                        <Icon icon="solar:user-circle-bold" className="size-6" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="shadow-lg"
                                        onClick={() => navigate('/register')}
                                    >
                                        Post Property FREE
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="rounded-full"
                                        onClick={() => navigate('/login')}
                                    >
                                        <Icon icon="solar:user-circle-bold" className="size-6" />
                                    </Button>
                                </>
                            )}
                            <Button size="icon" variant="ghost">
                                <Icon icon="solar:hamburger-menu-bold" className="size-6" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>
            <div className="container mx-auto px-4 py-6">
                <div className="text-sm text-muted-foreground mb-4">
                    Home {">"} {property.city}, {property.state} {">"} {property.title}
                </div>
                <ImageGallery images={property.images || []} title={property.title} />
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <h1 className="text-2xl font-heading font-bold tracking-tight">
                                {property.title}
                            </h1>
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
                        <div className="flex items-center gap-6 mb-4">
                            <div className="flex items-center gap-2">
                                <Icon icon="solar:bed-bold" className="size-5 text-secondary" />
                                <span className="text-sm">{property.bedrooms || 0} Bedrooms</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Icon icon="solar:bath-bold" className="size-5 text-secondary" />
                                <span className="text-sm">{property.bathrooms || 0} Bathrooms</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Icon icon="solar:ruler-bold" className="size-5 text-secondary" />
                                <span className="text-sm">{property.area_sqft || 0} sq ft</span>
                            </div>
                            <Badge variant="destructive" className="text-xs capitalize">
                                {property.status}
                            </Badge>
                        </div>
                        <div className="text-2xl font-bold text-foreground mb-4">{formatPrice(property.price)}</div>
                        <div className="flex flex-wrap gap-2 mb-6">
                            <Badge className="bg-green-600 text-white hover:bg-green-700 capitalize">
                                {property.property_type}
                            </Badge>
                            <Badge variant="secondary" className="capitalize">
                                {property.listing_type}
                            </Badge>
                            <Badge variant="secondary">
                                {property.area_sqft || 0} sq ft
                            </Badge>
                            <Badge variant="secondary" className="capitalize">
                                {property.status}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={handleFavoriteToggle}
                        >
                            <Icon
                                icon={isFavorite(property.id) ? "solar:heart-bold" : "solar:heart-linear"}
                                className={`size-5 mr-2 ${isFavorite(property.id) ? 'text-red-500' : 'text-gray-400'}`}
                            />
                            {isFavorite(property.id) ? 'Saved' : 'Save'}
                        </Button>
                        <Button
                            variant="default"
                            size="lg"
                            className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                            onClick={handleContactOwnerClick}
                        >
                            Contact Owner
                        </Button>
                        <Button
                            variant="default"
                            size="lg"
                            className="bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/20"
                            onClick={handleScheduleVisitClick}
                        >
                            <Icon icon="solar:calendar-bold" className="size-5 mr-2" />
                            Schedule Site Visit
                        </Button>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Property Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Property Type</p>
                                <p className="font-semibold capitalize">{property.property_type}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Listing Type</p>
                                <p className="font-semibold capitalize">{property.listing_type}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="font-semibold capitalize">{property.status}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Listed On</p>
                                <p className="font-semibold">{new Date(property.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    <div>
                        <h2 className="text-xl font-heading font-bold mb-6">Floor Plans</h2>
                        <Card className="border-2 border-accent">
                            <CardContent className="p-6">
                                <div className="text-sm font-semibold mb-2">{property.area_sqft || 0} sq ft.</div>
                                <div className="text-sm text-muted-foreground mb-6">Super Built-up Area {property.bedrooms || 0} BHK</div>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="aspect-square bg-muted rounded flex items-center justify-center">
                                        <img
                                            src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/placeholder/square.png"
                                            alt="3D Floor Plan"
                                            className="w-full h-full object-cover rounded"
                                        />
                                    </div>
                                    <div className="aspect-square bg-muted rounded flex items-center justify-center">
                                        <img
                                            src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/placeholder/square.png"
                                            alt="2D Floor Plan"
                                            className="w-full h-full object-cover rounded"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90">
                                        Request Callback
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-primary">
                                        <Icon icon="solar:phone-bold" className="size-5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div>
                        <h2 className="text-xl font-heading font-bold mb-6">About Property</h2>
                        <div className="mb-6">
                            <div className="text-sm font-semibold mb-2 text-foreground">
                                {property.title}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {property.description}
                            </p>
                        </div>
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold mb-3">Specification</h3>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Configuration: {property.bedrooms || 0} Spacious Bedrooms | {property.bathrooms || 0} Modern Bathrooms</li>
                                <li>• Super Built-up Area: {property.area_sqft || 0} sq ft</li>
                                <li>• Property Type: {property.property_type}</li>
                                <li>• Listing Type: For {property.listing_type}</li>
                                <li>• Status: {property.status}</li>
                                <li>• Location: {property.address}, {property.city}, {property.state}</li>
                                <li>• Price: {formatPrice(property.price)}</li>
                                <li>• Listed On: {new Date(property.created_at).toLocaleDateString()}</li>
                            </ul>
                        </div>
                        <Button variant="default" className="bg-primary hover:bg-primary/90 text-white">
                            <Icon icon="solar:download-bold" className="size-4" />
                            Download Brochure
                        </Button>
                    </div>
                    <div className="space-y-6">
                        {/* Property Owner/Agent Profile */}
                        {property.owner && (
                            <PropertyOwnerProfile
                                owner={property.owner}
                                propertyCount={5} // This would come from API
                                onContact={() => {
                                    // Handle contact action
                                    console.log('Contact owner:', property.owner);
                                }}
                            />
                        )}
                        {/*                         
                        <PropertyShare 
                            propertyId={property.id} 
                            propertyTitle={property.title}
                        /> */}
                    </div>
                </div>
                <div className="mt-12">
                    <h2 className="text-xl font-heading font-bold mb-8">Top facilities</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 mb-12">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
                                <Icon icon="solar:gameboy-bold" className="size-6 text-primary" />
                            </div>
                            <span className="text-xs font-medium">Games Room</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
                                <Icon icon="solar:playground-bold" className="size-6 text-primary" />
                            </div>
                            <span className="text-xs font-medium">Outdoor Kids Play Area</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
                                <Icon icon="solar:swimming-bold" className="size-6 text-primary" />
                            </div>
                            <span className="text-xs font-medium">Swimming Pool</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
                                <Icon icon="solar:playground-bold" className="size-6 text-primary" />
                            </div>
                            <span className="text-xs font-medium">Indoor Kids Play Area</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
                                <Icon icon="solar:car-bold" className="size-6 text-primary" />
                            </div>
                            <span className="text-xs font-medium">Parking</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
                                <Icon icon="solar:shield-check-bold" className="size-6 text-primary" />
                            </div>
                            <span className="text-xs font-medium">24/7 Security</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
                                <Icon icon="solar:spa-bold" className="size-6 text-primary" />
                            </div>
                            <span className="text-xs font-medium">Outdoor Aqua Spa</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
                                <Icon icon="solar:dumbbell-bold" className="size-6 text-primary" />
                            </div>
                            <span className="text-xs font-medium">Open Gym Area</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
                                <Icon icon="solar:meditation-bold" className="size-6 text-primary" />
                            </div>
                            <span className="text-xs font-medium">Yoga & Meditation Space</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
                                <Icon icon="solar:walking-bold" className="size-6 text-primary" />
                            </div>
                            <span className="text-xs font-medium">Nature Walk</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
                                <Icon icon="solar:spa-bold" className="size-6 text-primary" />
                            </div>
                            <span className="text-xs font-medium">Massage Room</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
                                <Icon icon="solar:running-bold" className="size-6 text-primary" />
                            </div>
                            <span className="text-xs font-medium">Jogging Track</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
                                <Icon icon="solar:refresh-bold" className="size-6 text-primary" />
                            </div>
                            <span className="text-xs font-medium">Reflexology Park</span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
                                <Icon icon="solar:lift-bold" className="size-6 text-primary" />
                            </div>
                            <span className="text-xs font-medium">Lifts 2nd Floor</span>
                        </div>
                    </div>
                    <Separator className="mb-8" />
                    <h2 className="text-xl font-heading font-bold mb-6">Location Advantages</h2>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex items-center gap-2">
                            <Icon icon="solar:buildings-bold" className="size-5 text-muted-foreground" />
                            <span className="text-sm">ST. JOSEPH & MARYA SCHOOL DAV PUBLIC SCHOOL</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon icon="solar:heart-bold" className="size-5 text-primary" />
                            <span className="text-sm">99 FOODHALL</span>
                        </div>
                    </div>
                </div>
            </div>
            <footer className="bg-slate-900 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
                        <div>
                            <h3 className="font-semibold text-lg mb-4 text-white">PropHuzzles</h3>
                            <div className="space-y-2">
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Mobile Apps
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Our Services
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Price Trends
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Post your Property
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Real Estate Investments
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Builders in India
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Area Converter
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Articles
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Rent Receipt
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Customer Service
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Sitemap
                                </a>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-4 text-white">Company</h3>
                            <div className="space-y-2">
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    About us
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Contact us
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Careers with us
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Terms & Conditions
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Request Info
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Feedback
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Report a Problem
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Testimonials
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Privacy Policy
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Summons/Notices
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Grievances
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Safety Guide
                                </a>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-4 text-white">Our Partners</h3>
                            <div className="space-y-2">
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Naukri.com - Jobs in India
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Jeevansathi.com - Jobs in middle east
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Jeevansathi.com - Matrimonials
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Shiksha.com - Education Career Info
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Policybazaar.com - Insurance India
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    PaisaBazaar.com
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Ambitionbox.com
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Firstnaukri.com - A jobsite for campus hiring
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Jobhai.com - Find Jobs Near You
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Techminis.com - Tech news on the go
                                </a>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-4 text-white">Contact Us</h3>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-300">Toll Free - 1800 41 99099</p>
                                <p className="text-sm text-gray-300">9:30 AM to 6:30 PM (Mon-Sun)</p>
                                <p className="text-sm text-gray-300">Email - feedback@99acres.com</p>
                                <p className="text-sm text-gray-300">Connect with us</p>
                                <div className="flex gap-3 mt-4">
                                    <Icon
                                        icon="solar:facebook-bold"
                                        className="size-6 text-gray-300 hover:text-white cursor-pointer"
                                    />
                                    <Icon
                                        icon="solar:twitter-bold"
                                        className="size-6 text-gray-300 hover:text-white cursor-pointer"
                                    />
                                    <Icon
                                        icon="solar:instagram-bold"
                                        className="size-6 text-gray-300 hover:text-white cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-4 text-white">Download the App</h3>
                            <div className="space-y-4">
                                <img
                                    alt="Google Play"
                                    src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/placeholder/landscape.png"
                                    className="h-10 w-auto"
                                />
                                <img
                                    alt="App Store"
                                    src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/placeholder/landscape.png"
                                    className="h-10 w-auto"
                                />
                                <p className="text-xs text-gray-400 mt-4">
                                    All trademarks are the property of their respective owners. All rights reserved -
                                    Info Edge (India) Ltd. A naukri.com group venture
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 mt-12 pt-8 text-center">
                        <p className="text-sm text-gray-400">
                            All trademarks are the property of their respective owners. All rights reserved - Info
                            Edge (India) Ltd. A naukri.com group venture
                        </p>
                    </div>
                </div>
            </footer>

            {/* Site Visit Modal */}
            <Dialog open={isSiteVisitModalOpen} onOpenChange={setSiteVisitModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Schedule a Site Visit</DialogTitle>
                        <DialogDescription>
                            Select your preferred date and time to visit this property.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 gap-2">
                            <label className="text-sm font-medium">Select Date</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "justify-start text-left font-normal",
                                            !visitDate && "text-muted-foreground"
                                        )}
                                    >
                                        <Icon icon="solar:calendar-bold" className="mr-2 h-4 w-4" />
                                        {visitDate ? format(visitDate, "PPP") : "Select a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={visitDate}
                                        onSelect={setVisitDate}
                                        initialFocus
                                        disabled={(date) => date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 1))}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            <label className="text-sm font-medium">Select Time</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={visitTime}
                                onChange={(e) => setVisitTime(e.target.value)}
                            >
                                <option value="09:00">9:00 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="12:00">12:00 PM</option>
                                <option value="13:00">1:00 PM</option>
                                <option value="14:00">2:00 PM</option>
                                <option value="15:00">3:00 PM</option>
                                <option value="16:00">4:00 PM</option>
                                <option value="17:00">5:00 PM</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSiteVisitModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleScheduleSubmit}
                            disabled={!visitDate || isSubmitting}
                            className="bg-primary"
                        >
                            {isSubmitting ? (
                                <>
                                    <Icon icon="solar:refresh-bold" className="mr-2 h-4 w-4 animate-spin" />
                                    Scheduling...
                                </>
                            ) : (
                                "Schedule Visit"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
