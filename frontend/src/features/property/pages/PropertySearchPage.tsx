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
import { Card, CardContent } from "@/shared/components/ui/card";
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
        clearFilters
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
            newFilters.propertyType = [propertyType as any];
        }
        if (listingTypeParam) {
            newFilters.listingType = listingTypeParam as any;
            setListingType(listingTypeParam);
        }
        if (minPriceParam) {
            newFilters.minPrice = parseInt(minPriceParam);
        }
        if (maxPriceParam) {
            newFilters.maxPrice = parseInt(maxPriceParam);
        }
        if (minAreaParam) {
            newFilters.minArea = parseInt(minAreaParam);
        }
        if (maxAreaParam) {
            newFilters.maxArea = parseInt(maxAreaParam);
        }
        if (bedroomsParam) {
            newFilters.bedrooms = parseInt(bedroomsParam);
        }
        if (statusParam) {
            newFilters.status = statusParam as any;
        }

        setFilters(newFilters);
    }, [searchParams, setFilters]);

    // Fetch properties based on current filters
    const { properties, loading, error, total, searchProperties } = usePropertySearch();

    // Trigger search when filters change or on initial load
    useEffect(() => {
        const query = filters.location || searchQuery || '';
        searchProperties(query, filters);
    }, [filters, searchQuery, searchProperties]);

    // Update URL when filters change
    const updateSearchParams = (newFilters: PropertyFiltersType) => {
        const params = new URLSearchParams();

        if (newFilters.location) params.set('q', newFilters.location);
        if (newFilters.propertyType && newFilters.propertyType.length > 0) params.set('property_type', Array.isArray(newFilters.propertyType) ? newFilters.propertyType[0] : newFilters.propertyType);
        if (newFilters.listingType) params.set('listing_type', newFilters.listingType);
        if (newFilters.minPrice) params.set('min_price', newFilters.minPrice.toString());
        if (newFilters.maxPrice) params.set('max_price', newFilters.maxPrice.toString());
        if (newFilters.minArea) params.set('min_area', newFilters.minArea.toString());
        if (newFilters.maxArea) params.set('max_area', newFilters.maxArea.toString());
        if (newFilters.bedrooms) params.set('bedrooms', newFilters.bedrooms.toString());
        if (newFilters.status) params.set('status', newFilters.status);

        setSearchParams(params);
    };

    const handleSaveSearchClick = () => {
        console.log("Save search button clicked!");
        console.log("Auth state:", authState.isAuthenticated);
        console.log("Filters:", filters);
        console.log("Search query:", searchQuery);
        console.log("Listing type:", listingType);

        if (!authState.isAuthenticated) {
            toast.error("Please log in to save your search.");
            navigate("/login");
            return;
        }

        // Check if there are any search criteria to save (filters, search query, or listing type)
        const hasSearchCriteria = Object.keys(filters).length > 0 ||
            searchQuery.trim() !== '' ||
            listingType !== 'buy';

        if (!hasSearchCriteria) {
            toast.info("Apply some search filters or enter a search query before saving a search.");
            return;
        }

        setIsSaveSearchModalOpen(true);
    };

    const handleConfirmSaveSearch = async () => {
        console.log("Confirm save search called!");
        console.log("Save search name:", saveSearchName);

        if (!saveSearchName.trim()) {
            toast.error("Please enter a name for your search.");
            return;
        }

        try {
            console.log("Current state before processing:");
            console.log("- filters:", filters);
            console.log("- searchQuery:", searchQuery);
            console.log("- listingType:", listingType);

            // Combine all current search state into a comprehensive filter object
            const currentSearchState = {
                ...filters,
                // Include search query as location if not already set
                location: filters.location || searchQuery || undefined,
                // Include listing type if not already set
                listingType: filters.listingType || (listingType !== 'buy' ? listingType : undefined)
            };

            console.log("Current search state after combining:", currentSearchState);

            // Remove undefined values
            const cleanFilters = Object.fromEntries(
                Object.entries(currentSearchState).filter(([_, value]) => value !== undefined && value !== '')
            );

            console.log("Clean filters after removing undefined:", cleanFilters);

            // Transform frontend filters to backend SearchCriteria format
            const searchCriteria: any = {};

            if (cleanFilters.propertyType) {
                searchCriteria.property_type = Array.isArray(cleanFilters.propertyType)
                    ? cleanFilters.propertyType
                    : [cleanFilters.propertyType];
            }
            if (cleanFilters.listingType) {
                searchCriteria.listing_type = cleanFilters.listingType;
            }
            if (cleanFilters.minPrice) {
                searchCriteria.min_price = cleanFilters.minPrice;
            }
            if (cleanFilters.maxPrice) {
                searchCriteria.max_price = cleanFilters.maxPrice;
            }
            if (cleanFilters.minArea) {
                searchCriteria.min_area = cleanFilters.minArea;
            }
            if (cleanFilters.maxArea) {
                searchCriteria.max_area = cleanFilters.maxArea;
            }
            if (cleanFilters.bedrooms) {
                searchCriteria.bedrooms = [cleanFilters.bedrooms];
            }
            if (cleanFilters.bathrooms) {
                searchCriteria.bathrooms = [cleanFilters.bathrooms];
            }
            if (cleanFilters.location) {
                // Parse location to extract city if possible
                searchCriteria.city = [cleanFilters.location];
                searchCriteria.keywords = cleanFilters.location;
            }
            if (cleanFilters.amenities && Array.isArray(cleanFilters.amenities) && cleanFilters.amenities.length > 0) {
                searchCriteria.amenities = cleanFilters.amenities;
            }

            // Ensure we have at least some search criteria
            if (Object.keys(searchCriteria).length === 0) {
                toast.error("Please apply some search filters before saving.");
                return;
            }

            console.log("About to call API with:", { name: saveSearchName, criteria: searchCriteria });
            await api.createSavedSearch(saveSearchName, searchCriteria);
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
        const newFilters = { ...filters, listingType: value as any };
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
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
                                {authState.user?.firstName?.charAt(0) || authState.user?.email?.charAt(0) || 'U'}
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
                                properties={properties || []}
                                totalResults={total || 0}
                                currentPage={1}
                                totalPages={Math.ceil((total || 0) / 20)}
                                isLoading={loading}
                                searchQuery={searchQuery}
                                activeFilters={filters}
                                onPropertyClick={(property) => navigate(`/property/${property.id}`)}
                                onFilterRemove={(filterKey) => {
                                    const newFilters = { ...filters };
                                    // Handle special filter keys that map to multiple properties
                                    if (filterKey === 'price') {
                                        delete newFilters.minPrice;
                                        delete newFilters.maxPrice;
                                    } else if (filterKey === 'area') {
                                        delete newFilters.minArea;
                                        delete newFilters.maxArea;
                                    } else {
                                        // For direct property keys, delete them directly
                                        delete (newFilters as any)[filterKey];
                                    }
                                    setFilters(newFilters);
                                    updateSearchParams(newFilters);
                                }}
                                onClearAllFilters={() => setFilters({})}
                                onSaveSearch={() => setIsSaveSearchModalOpen(true)}
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