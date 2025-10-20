import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/shared/contexts/AuthContext";
import { usePropertySearch } from "../hooks/usePropertySearch";
import { usePropertyFilters } from "../hooks/usePropertyFilters";
import { PropertyFilters } from "../components/common/PropertyFilters";
import { SearchResults } from "../components/lists/SearchResults";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { PropertyGridSkeleton } from "@/shared/components/ui/loading";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Icon } from "@iconify/react";
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
import type { PropertyFilters as PropertyFiltersType } from "../types/filters";

export function PropertySearchPage() {
    const navigate = useNavigate();
    const { state: authState } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [listingType, setListingType] = useState("buy");
    const [isSaveSearchModalOpen, setIsSaveSearchModalOpen] = useState(false);
    const [saveSearchName, setSaveSearchName] = useState("");

    const {
        filters,
        setFilters,
        clearFilters,
        applyFilters,
        resetFilters,
        activeFilterCount
    } = usePropertyFilters();

    // Extract filters from URL params on component mount
    useEffect(() => {
        const newFilters: PropertyFiltersType = {};
        
        const query = searchParams.get('q');
        const propertyType = searchParams.get('property_type');
        const listingTypeParam = searchParams.get('listing_type');
        const minPriceParam = searchParams.get('min_price');
        const maxPriceParam = searchParams.get('max_price');
        const minAreaParam = searchParams.get('min_area');
        const maxAreaParam = searchParams.get('max_area');
        const bedroomsParam = searchParams.get('bedrooms');
        const statusParam = searchParams.get('status');
        
        if (query) {
            newFilters.location = query;
            setSearchQuery(query);
        }
        if (propertyType && propertyType !== 'all') {
            newFilters.property_type = propertyType;
        }
        if (listingTypeParam) {
            newFilters.listing_type = listingTypeParam;
            setListingType(listingTypeParam);
        }
        if (minPriceParam) {
            newFilters.min_price = parseInt(minPriceParam);
        }
        if (maxPriceParam) {
            newFilters.max_price = parseInt(maxPriceParam);
        }
        if (minAreaParam) {
            newFilters.min_area = parseInt(minAreaParam);
        }
        if (maxAreaParam) {
            newFilters.max_area = parseInt(maxAreaParam);
        }
        if (bedroomsParam) {
            newFilters.bedrooms = parseInt(bedroomsParam);
        }
        if (statusParam) {
            newFilters.status = statusParam;
        }
        
        setFilters(newFilters);
    }, [searchParams, setFilters]);

    // Fetch properties based on current filters
    const { properties, loading, error, total } = usePropertySearch(filters);

    // Update URL when filters change
    const updateSearchParams = (newFilters: PropertyFiltersType) => {
        const params = new URLSearchParams();
        
        if (newFilters.location) params.set('q', newFilters.location);
        if (newFilters.property_type) params.set('property_type', newFilters.property_type);
        if (newFilters.listing_type) params.set('listing_type', newFilters.listing_type);
        if (newFilters.min_price) params.set('min_price', newFilters.min_price.toString());
        if (newFilters.max_price) params.set('max_price', newFilters.max_price.toString());
        if (newFilters.min_area) params.set('min_area', newFilters.min_area.toString());
        if (newFilters.max_area) params.set('max_area', newFilters.max_area.toString());
        if (newFilters.bedrooms) params.set('bedrooms', newFilters.bedrooms.toString());
        if (newFilters.status) params.set('status', newFilters.status);
        
        setSearchParams(params);
    };

    const handleSaveSearchClick = () => {
        if (!authState.isAuthenticated) {
            toast.error("Please log in to save your search.");
            navigate("/login");
            return;
        }
        // Ensure there are filters to save
        if (Object.keys(filters).length === 0) {
            toast.info("Apply some filters before saving a search.");
            return;
        }
        setIsSaveSearchModalOpen(true);
    };

    const handleConfirmSaveSearch = async () => {
        if (!saveSearchName.trim()) {
            toast.error("Please enter a name for your search.");
            return;
        }

        try {
            await api.createSavedSearch(saveSearchName, filters);
            toast.success(`Search "${saveSearchName}" saved successfully!`);
            setIsSaveSearchModalOpen(false);
            setSaveSearchName("");
        } catch (error) {
            console.error("Failed to save search:", error);
            toast.error("Failed to save search. Please try again.");
        }
    };

    // Handle search input change
    const handleSearch = () => {
        const newFilters = { ...filters, location: searchQuery };
        setFilters(newFilters);
        updateSearchParams(newFilters);
    };

    // Handle listing type change
    const handleListingTypeChange = (value: string) => {
        setListingType(value);
        const newFilters = { ...filters, listing_type: value };
        setFilters(newFilters);
        updateSearchParams(newFilters);
    };

    // Remove location filter
    const removeLocationFilter = () => {
        setSearchQuery("");
        const newFilters = { ...filters };
        delete newFilters.location;
        setFilters(newFilters);
        updateSearchParams(newFilters);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-primary py-4 px-3">
                <div className="max-w-[1400px] mx-auto flex items-center gap-6">
                    <h1 
                        className="text-2xl font-bold text-primary-foreground cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        PropHuzzles
                    </h1>
                    <div className="flex-1 flex items-center gap-4 bg-background rounded-lg px-2 py-2">
                        <Select value={listingType} onValueChange={handleListingTypeChange}>
                            <SelectTrigger className="w-24 border-0 shadow-none">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="buy">Buy</SelectItem>
                                <SelectItem value="rent">Rent</SelectItem>
                                <SelectItem value="pg">PG</SelectItem>
                            </SelectContent>
                        </Select>
                        {searchQuery && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded">
                                <span className="text-sm">{searchQuery}</span>
                                <Icon 
                                    icon="lucide:x" 
                                    className="size-4 cursor-pointer" 
                                    onClick={removeLocationFilter}
                                />
                            </div>
                        )}
                        <Input 
                            placeholder="Add more" 
                            className="flex-1 border-0 shadow-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Icon icon="lucide:mic" className="size-5 text-primary cursor-pointer" />
                        <Icon 
                            icon="lucide:search" 
                            className="size-5 text-muted-foreground cursor-pointer"
                            onClick={handleSearch}
                        />
                    </div>
                    <Button 
                        variant="outline" 
                        className="bg-background"
                        onClick={() => navigate('/dashboard')}
                    >
                        Post property{" "}
                        <Badge variant="secondary" className="ml-2 bg-green-500 text-white text-xs">
                            FREE
                        </Badge>
                    </Button>
                    {authState.isAuthenticated ? (
                        <Avatar className="cursor-pointer" onClick={() => navigate('/profile')}>
                            <AvatarFallback className="bg-green-500 text-white">
                                {authState.user?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                    ) : (
                        <Avatar className="cursor-pointer" onClick={() => navigate('/login')}>
                            <AvatarFallback className="bg-green-500 text-white">NJ</AvatarFallback>
                        </Avatar>
                    )}
                    <Icon icon="lucide:menu" className="size-6 text-primary-foreground cursor-pointer" />
                </div>
            </header>
            
            <div className="max-w-[1400px] mx-auto pl-2 pr-9 py-4">
                <div className="text-sm text-muted-foreground mb-6">
                    Home › Property in {searchQuery || 'All Locations'} {listingType === 'rent' ? 'for Rent' : 'for Sale'}
                </div>
                
                <div className="flex gap-6">
                    {/* Sidebar Filters */}
                    <aside className="w-80 shrink-0">
                        <PropertyFilters 
                            filters={filters}
                            onFiltersChange={(newFilters) => {
                                setFilters(newFilters);
                                updateSearchParams(newFilters);
                            }}
                            onClearFilters={() => {
                                clearFilters();
                                updateSearchParams({});
                            }}
                        />
                    </aside>
                    
                    {/* Main Content */}
                    <main className="flex-1 mr-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold">
                                {loading ? 'Loading...' : `${properties.length || 0} results`} | Property in {searchQuery || 'All Locations'}
                            </h2>
                            <Button variant="outline" onClick={handleSaveSearchClick}>
                                <Icon icon="solar:bookmark-bold" className="mr-2 size-4" />
                                Save Search
                            </Button>
                        </div>
                        
                        <Card className="mb-6">
                            <CardContent className="flex items-center gap-3 p-4">
                                <Icon icon="lucide:map-pin" className="size-6 text-primary" />
                                <span className="font-medium">Get to know more about {searchQuery || 'your area'}</span>
                                <Button variant="link" className="text-primary p-0">
                                    View Insights <Icon icon="lucide:chevron-right" className="size-4" />
                                </Button>
                            </CardContent>
                        </Card>
                        
                        <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
                            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full whitespace-nowrap">
                                <Icon icon="solar:star-bold" className="size-5 text-orange-500" />
                                <span className="text-sm font-medium">NEW LAUNCH</span>
                                <sup className="text-xs text-orange-500">*</sup>
                            </div>
                            <Button variant="outline" size="sm" className="rounded-full whitespace-nowrap">
                                Owner
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-full whitespace-nowrap">
                                Verified
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-full whitespace-nowrap">
                                Under construction
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-full whitespace-nowrap">
                                Ready To Move
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-full whitespace-nowrap">
                                With Photos <Icon icon="lucide:chevron-right" className="size-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-full">
                                <Icon icon="lucide:sliders-horizontal" className="size-4" />
                                Sort By
                                <Icon icon="lucide:chevron-down" className="size-4" />
                            </Button>
                        </div>
                        
                        {loading ? (
                            <PropertyGridSkeleton />
                        ) : error ? (
                            <Alert className="mb-6">
                                <Icon icon="solar:danger-bold" className="size-5 text-red-500" />
                                <AlertDescription>
                                    Failed to load properties. Please try again later.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <SearchResults 
                                properties={properties}
                                loading={loading}
                                onPropertyClick={(property) => navigate(`/property/${property.id}`)}
                            />
                        )}
                    </main>
                </div>
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
        </div>
    );
}