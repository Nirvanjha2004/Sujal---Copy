import { useSearchParams, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "@/shared/contexts/AuthContext";
import { usePropertySearch } from "../hooks/usePropertySearch";
import { PropertyGrid } from "../components/lists/PropertyGrid";
import { PropertyType, ListingType } from "../types";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { PropertyGridSkeleton } from "@/shared/components/ui/loading";
import { Icon } from "@iconify/react";
import { api } from "@/shared/lib/api";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import type { PropertyFilters as PropertyFiltersType } from "../types/filters";

export function PropertyListingGrid() {
    const navigate = useNavigate();
    const { state: authState } = useAuth();
    const [searchParams] = useSearchParams();
    const [isSaveSearchModalOpen, setIsSaveSearchModalOpen] = useState(false);
    const [saveSearchName, setSaveSearchName] = useState('');

    // Extract filters from URL params
    const filters = useMemo(() => {
        const newFilters: PropertyFiltersType = {};
        const query = searchParams.get("q");
        const propertyType = searchParams.get("property_type");
        const listingType = searchParams.get("listing_type");
        const minPrice = searchParams.get("min_price");
        const maxPrice = searchParams.get("max_price");

        // Helper function to validate PropertyType
        const isValidPropertyType = (type: string): type is PropertyType => {
            return ['apartment', 'house', 'villa', 'plot', 'commercial', 'land'].includes(type);
        };

        // Helper function to validate ListingType
        const isValidListingType = (type: string): type is ListingType => {
            return ['sale', 'rent'].includes(type);
        };

        if (query) newFilters.location = query;
        if (propertyType && propertyType !== "all" && isValidPropertyType(propertyType)) {
            newFilters.property_type = propertyType;
        }
        if (listingType && isValidListingType(listingType)) {
            newFilters.listing_type = listingType;
        }
        if (minPrice) newFilters.min_price = parseInt(minPrice);
        if (maxPrice) newFilters.max_price = parseInt(maxPrice);

        return newFilters;
    }, [searchParams]);

    const { properties, loading, error, total } = usePropertySearch(filters);



    const handleSaveSearchClick = () => {
        if (!authState.isAuthenticated) {
            toast.error('Please log in to save your search.');
            navigate('/login');
            return;
        }
        setIsSaveSearchModalOpen(true);
    };

    const handleConfirmSaveSearch = async () => {
        if (!saveSearchName.trim()) {
            toast.error('Please enter a name for your search.');
            return;
        }

        try {
            console.log("the filters are,", filters)
            await api.createSavedSearch(saveSearchName, filters);
            toast.success(`Search "${saveSearchName}" saved successfully!`);
            setIsSaveSearchModalOpen(false);
            setSaveSearchName('');
        } catch (error) {
            console.error('Failed to save search:', error);
            toast.error('Failed to save search. Please try again.');
        }
    };

    if (loading) {
        return <PropertyGridSkeleton />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Alert className="max-w-md">
                    <Icon icon="solar:danger-bold" className="size-5 text-red-500" />
                    <AlertDescription>
                        Failed to load properties. Please try again later.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
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

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Properties</h2>
                    <Button variant="outline" onClick={handleSaveSearchClick}>
                        <Icon icon="solar:bookmark-bold" className="mr-2 size-4" />
                        Save Search
                    </Button>
                </div>

                <h2 className="text-2xl font-heading font-semibold tracking-tight mb-6">
                    {total || 0} results |{" "}
                    {filters.listing_type === "rent"
                        ? "Properties for Rent"
                        : "Properties for Sale"}
                </h2>

                <Alert className="mb-6 bg-amber-50 border-amber-200">
                    <Icon icon="solar:map-point-bold" className="size-5 text-amber-600" />
                    <AlertDescription className="ml-2">
                        Get to know more about your area
                        <Button variant="link" className="ml-2 p-0 h-auto text-primary font-medium">
                            View Insights
                            <Icon icon="solar:arrow-right-bold" className="size-4 ml-1" />
                        </Button>
                    </AlertDescription>
                </Alert>

                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <Badge
                        variant="outline"
                        className="px-4 py-2 rounded-full cursor-pointer hover:bg-secondary"
                    >
                        New Launch
                    </Badge>
                    <Badge
                        variant="outline"
                        className="px-4 py-2 rounded-full cursor-pointer hover:bg-secondary"
                    >
                        Owner
                    </Badge>
                    <Badge
                        variant="outline"
                        className="px-4 py-2 rounded-full cursor-pointer hover:bg-secondary"
                    >
                        Verified
                    </Badge>
                    <Badge
                        variant="outline"
                        className="px-4 py-2 rounded-full cursor-pointer hover:bg-secondary"
                    >
                        Under Construction
                    </Badge>
                    <Badge
                        variant="outline"
                        className="px-4 py-2 rounded-full cursor-pointer hover:bg-secondary"
                    >
                        Ready to move
                    </Badge>
                    <Badge
                        variant="outline"
                        className="px-4 py-2 rounded-full cursor-pointer hover:bg-secondary"
                    >
                        With Photos
                    </Badge>
                    <Badge
                        variant="outline"
                        className="px-4 py-2 rounded-full cursor-pointer hover:bg-secondary"
                    >
                        With Videos
                    </Badge>
                    <Button size="sm" variant="outline" className="ml-auto">
                        <Icon icon="solar:sort-bold" className="size-4" />
                        Sort By
                        <Icon icon="solar:alt-arrow-down-bold" className="size-4" />
                    </Button>
                </div>

                {/* Property Grid */}
                <PropertyGrid 
                    properties={properties} 
                    isLoading={loading}
                    onPropertyClick={(property) => navigate(`/property/${property.id}`)}
                />
            </div>

            {/* Save Search Modal */}
            <Dialog open={isSaveSearchModalOpen} onOpenChange={setIsSaveSearchModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save Your Search</DialogTitle>
                        <DialogDescription>
                            Give this search a name so you can easily find it later.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="e.g., '2BHK Apartments in Jaipur'"
                            value={saveSearchName}
                            onChange={(e) => setSaveSearchName(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSaveSearchModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmSaveSearch}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Footer */}
            <footer className="bg-gray-900 text-white mt-16">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="font-semibold text-white mb-4">PropHuzzles</h3>
                            <div className="space-y-2">
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Mobile Apps
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Network
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
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-4">Company</h3>
                            <div className="space-y-2">
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    About us
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Contact us
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Careers
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Terms & Conditions
                                </a>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-4">Our Partners</h3>
                            <div className="space-y-2">
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Partner Network
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Professional Services
                                </a>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-4">Support</h3>
                            <div className="space-y-2">
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Help Center
                                </a>
                                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                                    Customer Service
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}