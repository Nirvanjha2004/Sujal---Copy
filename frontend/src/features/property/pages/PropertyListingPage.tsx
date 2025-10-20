import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useProperty } from "../hooks/useProperty";
import { usePropertyFavorites } from "../hooks/usePropertyFavorites";
import { PropertyDetails } from "../components/details/PropertyDetails";
import { PropertyGallery } from "../components/common/PropertyGallery";
import { PropertyStats } from "../components/common/PropertyStats";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { PropertyGridSkeleton } from "@/shared/components/ui/loading";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { api } from "@/shared/lib/api";
import { toast } from "sonner";
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

export function PropertyListingPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { state: authState } = useAuth();
    const propertyId = id ? parseInt(id) : 0;

    // Site visit modal state
    const [isSiteVisitModalOpen, setSiteVisitModalOpen] = useState(false);
    const [visitDate, setVisitDate] = useState<Date | undefined>(undefined);
    const [visitTime, setVisitTime] = useState<string>("10:00");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { property, isLoading: loading, error } = useProperty({ propertyId });
    const { isFavorite, toggleFavorite } = usePropertyFavorites();

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
            await toggleFavorite(property.id);
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    };

    const handleContactOwnerClick = async () => {
        if (!authState.isAuthenticated || !authState.user?.email) {
            toast.info("Please log in to contact the owner.");
            navigate('/login');
            return;
        }

        if (!property || !property.id) {
            toast.error("Property details not available. Please refresh the page.");
            return;
        }

        try {
            const defaultMessage = `I'm interested in your property: "${property.title}".`;

            const inquiryResponse = await api.createInquiry({
                property_id: property.id,
                message: defaultMessage,
                name: authState.user.firstName || "Interested Buyer",
                email: authState.user.email,
                inquirer_id: authState.user.id,
            });

            const inquiry = inquiryResponse.data.inquiry;
            const conversationId = inquiry.conversation_id;

            if (!conversationId) {
                throw new Error("Could not retrieve conversation ID.");
            }

            toast.success("Opening conversation...");
            navigate(`/dashboard/messages/${conversationId}`);

        } catch (err) {
            console.error("Failed to create inquiry:", err);
            toast.error("Could not start conversation. Please try again.");
        }
    };

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

            const formattedDate = format(visitDate, 'yyyy-MM-dd');
            const visitDateTime = `${formattedDate}T${visitTime}:00`;

            await api.createSiteVisit({
                property_id: property.id,
                scheduled_at: visitDateTime,
                visitor_name: authState.user?.firstName || "Visitor",
                visitor_email: authState.user?.email || "",
                visitor_id: authState.user?.id,
                notes: `Site visit request for ${property.title}`
            });

            toast.success("Site visit scheduled successfully!");
            setSiteVisitModalOpen(false);

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
            {/* Header */}
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
                {/* Breadcrumb */}
                <div className="text-sm text-muted-foreground mb-4">
                    Home {">"} {property.city}, {property.state} {">"} {property.title}
                </div>

                {/* Property Gallery */}
                <PropertyGallery images={property.images || []} title={property.title} />

                {/* Property Header */}
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

                {/* Property Details */}
                <PropertyDetails property={property} />

                {/* Property Stats */}
                <PropertyStats property={property} />
            </div>

            {/* Site Visit Modal */}
            <Dialog open={isSiteVisitModalOpen} onOpenChange={setSiteVisitModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Schedule Site Visit</DialogTitle>
                        <DialogDescription>
                            Choose a date and time for your site visit to {property.title}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Select Date</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !visitDate && "text-muted-foreground"
                                        )}
                                    >
                                        <Icon icon="solar:calendar-bold" className="mr-2 h-4 w-4" />
                                        {visitDate ? format(visitDate, "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={visitDate}
                                        onSelect={setVisitDate}
                                        disabled={(date) => date < new Date()}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Select Time</label>
                            <select
                                value={visitTime}
                                onChange={(e) => setVisitTime(e.target.value)}
                                className="w-full mt-1 p-2 border rounded-md"
                            >
                                <option value="10:00">10:00 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="12:00">12:00 PM</option>
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
                        <Button onClick={handleScheduleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? "Scheduling..." : "Schedule Visit"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}