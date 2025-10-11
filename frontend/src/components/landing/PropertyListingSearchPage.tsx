import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useProperties } from "@/hooks/useProperties";
import { PropertyFilters } from "@/lib/api";
import { PropertyGridSkeleton } from "@/components/ui/loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function PropertyListingSearchPage() {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [listingType, setListingType] = useState("buy");
  const [hideAlreadySeen, setHideAlreadySeen] = useState(false);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [minPrice, setMinPrice] = useState<string>("no-min");
  const [maxPrice, setMaxPrice] = useState<string>("no-max");
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [bedrooms, setBedrooms] = useState<string[]>([]);
  const [localities, setLocalities] = useState<string[]>([]);
  const [minArea, setMinArea] = useState<string>("no-min");
  const [maxArea, setMaxArea] = useState<string>("no-max");
  const [postedBy, setPostedBy] = useState<string[]>([]);
  const [constructionStatus, setConstructionStatus] = useState<string[]>([]);
  const [isSaveSearchModalOpen, setIsSaveSearchModalOpen] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState("");

  // Extract filters from URL params on component mount
  useEffect(() => {
    const newFilters: PropertyFilters = {};
    
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
      setPropertyTypes([propertyType]);
    }
    if (listingTypeParam) {
      newFilters.listing_type = listingTypeParam;
      setListingType(listingTypeParam);
    }
    if (minPriceParam) {
      newFilters.min_price = parseInt(minPriceParam);
      setMinPrice(minPriceParam);
    }
    if (maxPriceParam) {
      newFilters.max_price = parseInt(maxPriceParam);
      setMaxPrice(maxPriceParam);
    }
    if (minAreaParam) {
      newFilters.min_area = parseInt(minAreaParam);
      setMinArea(minAreaParam);
    }
    if (maxAreaParam) {
      newFilters.max_area = parseInt(maxAreaParam);
      setMaxArea(maxAreaParam);
    }
    if (bedroomsParam) {
      newFilters.bedrooms = parseInt(bedroomsParam);
      setBedrooms([bedroomsParam]);
    }
    if (statusParam) {
      newFilters.status = statusParam;
      setConstructionStatus([statusParam]);
    }
    
    setFilters(newFilters);
  }, [searchParams]);

  // Fetch properties based on current filters
  const { properties, loading, error, total } = useProperties(filters);

  // Update URL when filters change
  const updateSearchParams = (newFilters: PropertyFilters) => {
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

  // Handle budget filters
  const handleBudgetChange = (type: 'min' | 'max', value: string) => {
    if (type === 'min') {
      setMinPrice(value);
      const newFilters = { ...filters };
      if (value === 'no-min') {
        delete newFilters.min_price;
      } else {
        newFilters.min_price = parseInt(value) * 100000;
      }
      setFilters(newFilters);
      updateSearchParams(newFilters);
    } else {
      setMaxPrice(value);
      const newFilters = { ...filters };
      if (value === 'no-max') {
        delete newFilters.max_price;
      } else {
        newFilters.max_price = parseInt(value) * 100000;
      }
      setFilters(newFilters);
      updateSearchParams(newFilters);
    }
  };

  // Handle area filters
  const handleAreaChange = (type: 'min' | 'max', value: string) => {
    if (type === 'min') {
      setMinArea(value);
      const newFilters = { ...filters };
      if (value === 'no-min') {
        delete newFilters.min_area;
      } else {
        newFilters.min_area = parseInt(value);
      }
      setFilters(newFilters);
      updateSearchParams(newFilters);
    } else {
      setMaxArea(value);
      const newFilters = { ...filters };
      if (value === 'no-max') {
        delete newFilters.max_area;
      } else {
        newFilters.max_area = parseInt(value);
      }
      setFilters(newFilters);
      updateSearchParams(newFilters);
    }
  };

  // Handle property type toggle
  const togglePropertyType = (type: string) => {
    const newFilters = { ...filters, property_type: type };
    setFilters(newFilters);
    updateSearchParams(newFilters);
    setPropertyTypes([type]);
  };

  // Handle bedroom filter
  const toggleBedrooms = (bedroom: string) => {
    const newFilters = { ...filters, bedrooms: parseInt(bedroom) };
    setFilters(newFilters);
    updateSearchParams(newFilters);
    setBedrooms([bedroom]);
  };

  // Handle construction status filter
  const toggleConstructionStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'New Launch': 'new',
      'Under Construction': 'under_construction',
      'Ready to move': 'ready'
    };
    const newFilters = { ...filters, status: statusMap[status] };
    setFilters(newFilters);
    updateSearchParams(newFilters);
    setConstructionStatus([status]);
  };

  // Format price for display
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹ ${(price / 100000).toFixed(2)} Lakh`;
    } else {
      return `₹ ${price.toLocaleString()}`;
    }
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
          <aside className="w-80 shrink-0">
            
            <Card className="mb-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Budget</CardTitle>
                <Icon icon="lucide:chevron-up" className="size-5" />
              </CardHeader>
              <CardContent className="flex gap-3">
                <Select value={minPrice} onValueChange={(value) => handleBudgetChange('min', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="No min" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-min">No min</SelectItem>
                    <SelectItem value="10">10 Lakh</SelectItem>
                    <SelectItem value="20">20 Lakh</SelectItem>
                    <SelectItem value="30">30 Lakh</SelectItem>
                    <SelectItem value="50">50 Lakh</SelectItem>
                    <SelectItem value="100">1 Cr</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={maxPrice} onValueChange={(value) => handleBudgetChange('max', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="No max" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-max">No max</SelectItem>
                    <SelectItem value="50">50 Lakh</SelectItem>
                    <SelectItem value="100">1 Cr</SelectItem>
                    <SelectItem value="200">2 Cr</SelectItem>
                    <SelectItem value="500">5 Cr</SelectItem>
                    <SelectItem value="1000">10 Cr</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            
            <Card className="mb-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Type of property</CardTitle>
                <Icon icon="lucide:chevron-up" className="size-5" />
              </CardHeader>
              <CardContent className="space-y-3">
                {['apartment', 'house', 'villa', 'plot', 'commercial'].map((type) => (
                  <div 
                    key={type}
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => togglePropertyType(type)}
                  >
                    <Icon 
                      icon={propertyTypes.includes(type) ? "lucide:check" : "lucide:plus"} 
                      className="size-4 text-muted-foreground" 
                    />
                    <span className="text-sm capitalize">{type}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card className="mb-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">No. of Bedrooms</CardTitle>
                <Icon icon="lucide:chevron-up" className="size-5" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {['1', '2', '3', '4', '5'].map((bedroom) => (
                    <div 
                      key={bedroom}
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => toggleBedrooms(bedroom)}
                    >
                      <Icon 
                        icon={bedrooms.includes(bedroom) ? "lucide:check" : "lucide:plus"} 
                        className="size-4 text-muted-foreground" 
                      />
                      <span className="text-sm">{bedroom} BHK</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Area</CardTitle>
                <Icon icon="lucide:chevron-up" className="size-5" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-muted-foreground">sq.ft.</span>
                  <Icon icon="lucide:chevron-down" className="size-4 text-muted-foreground" />
                </div>
                <div className="flex gap-3">
                  <Select value={minArea} onValueChange={(value) => handleAreaChange('min', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="No min" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-min">No min</SelectItem>
                      <SelectItem value="500">500 sq.ft</SelectItem>
                      <SelectItem value="1000">1000 sq.ft</SelectItem>
                      <SelectItem value="1500">1500 sq.ft</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={maxArea} onValueChange={(value) => handleAreaChange('max', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="No max" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-max">No max</SelectItem>
                      <SelectItem value="2000">2000 sq.ft</SelectItem>
                      <SelectItem value="3000">3000 sq.ft</SelectItem>
                      <SelectItem value="5000">5000 sq.ft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Construction Status</CardTitle>
                <Icon icon="lucide:chevron-up" className="size-5" />
              </CardHeader>
              <CardContent className="space-y-3">
                {['New Launch', 'Under Construction', 'Ready to move'].map((status) => (
                  <div 
                    key={status}
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => toggleConstructionStatus(status)}
                  >
                    <Icon 
                      icon={constructionStatus.includes(status) ? "lucide:check" : "lucide:plus"} 
                      className="size-4 text-muted-foreground" 
                    />
                    <span className="text-sm">{status}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
          
          <main className="flex-1 mr-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {loading ? 'Loading...' : `${total || 0} results`} | Property in {searchQuery || 'All Locations'}
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
              <div className="space-y-6">
                {!properties || properties.length === 0 ? (
                  <div className="text-center py-12">
                    <Icon icon="lucide:search-x" className="size-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No properties found</h3>
                    <p className="text-muted-foreground">Try adjusting your search filters or search terms</p>
                  </div>
                ) : (
                  properties.map((property) => (
                    <Card key={property.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <div 
                        className="flex gap-6"
                        onClick={() => navigate(`/property/${property.id}`)}
                      >
                        <div className="relative w-80 shrink-0">
                          {property.featured && (
                            <Badge className="absolute top-3 left-3 bg-blue-600 text-white z-10">
                              FEATURED
                            </Badge>
                          )}
                          <img
                            src={property.images?.[0]?.image_url || "https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/landscape/4.webp"}
                            alt={property.title}
                            className="w-full h-full object-cover rounded-l-xl"
                          />
                          <Icon
                            icon="lucide:heart"
                            className="absolute top-3 right-3 size-6 text-white cursor-pointer z-10"
                          />
                          {property.images && property.images.length > 1 && (
                            <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                              <Icon icon="lucide:image" className="size-3" />
                              {property.images.length}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 py-6 pr-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold mb-1">{property.title}</h3>
                              <p className="text-muted-foreground">
                                {property.bedrooms} BHK {property.property_type} in {property.city}, {property.state}
                              </p>
                            </div>
                            <Badge variant="secondary" className="capitalize">
                              {property.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-8 mb-4">
                            <div>
                              <div className="text-2xl font-bold">{formatPrice(property.price)}</div>
                              <div className="text-sm text-muted-foreground">
                                ₹{Math.round(property.price / (property.area_sqft || 1)).toLocaleString()} /sqft
                              </div>
                            </div>
                            <div>
                              <div className="font-semibold">
                                {property.area_sqft || 0} sqft
                              </div>
                              <div className="text-sm text-muted-foreground">Super Built-up Area</div>
                            </div>
                            <div>
                              <div className="font-semibold">{property.bedrooms} BHK</div>
                              <div className="text-sm text-muted-foreground capitalize">{property.status}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm font-medium">Nearby :</span>
                            <Badge variant="outline" className="font-normal">
                              Shopping Mall
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                              Metro Station
                            </Badge>
                            <span className="text-sm text-primary">+3</span>
                          </div>
                          <div className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {property.description}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              Listed on {new Date(property.created_at).toLocaleDateString()}
                              <div className="text-foreground">PropHuzzles</div>
                            </div>
                            <div className="flex gap-3">
                              <Button 
                                variant="outline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View Number
                              </Button>
                              <Button onClick={(e) => e.stopPropagation()}>
                                <Icon icon="lucide:phone" className="size-4" />
                                Contact
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
            
            {/* Keep the existing "Ready to move projects" section */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Icon icon="lucide:home" className="size-8 text-orange-500" />
                  <div>
                    <h3 className="text-xl font-bold">Ready to move projects</h3>
                    <p className="text-muted-foreground">Where you can start living</p>
                  </div>
                </div>
                <Button variant="link" className="text-primary">
                  View All
                </Button>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-4">
                <div className="min-w-[200px] relative">
                  <div className="relative mb-3">
                    <Badge className="absolute top-3 left-3 bg-green-600 text-white z-10">
                      RERA
                    </Badge>
                    <img
                      src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/1.webp"
                      alt="Alamo XS Real Estate"
                      className="w-full h-40 object-cover rounded-xl"
                    />
                  </div>
                  <h4 className="font-semibold mb-1">Alamo XS Real Estate</h4>
                  <p className="text-sm text-muted-foreground mb-2">Siruseri, Chennai</p>
                  <p className="font-bold text-lg">₹ 30 L - 1.18 Cr</p>
                </div>
                <div className="min-w-[200px] relative">
                  <div className="relative mb-3">
                    <Badge className="absolute top-3 left-3 bg-green-600 text-white z-10">
                      RERA
                    </Badge>
                    <img
                      src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/2.webp"
                      alt="Navins Starwood"
                      className="w-full h-40 object-cover rounded-xl"
                    />
                  </div>
                  <h4 className="font-semibold mb-1">Navins Starwood</h4>
                  <p className="text-sm text-muted-foreground mb-2">Medavakkam, Chennai</p>
                  <p className="font-bold text-lg">₹ 79 L - 1.16 Cr</p>
                </div>
                <div className="min-w-[200px] relative">
                  <div className="relative mb-3">
                    <Badge className="absolute top-3 left-3 bg-green-600 text-white z-10">
                      RERA
                    </Badge>
                    <img
                      src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/3.webp"
                      alt="Ek Uplands"
                      className="w-full h-40 object-cover rounded-xl"
                    />
                  </div>
                  <h4 className="font-semibold mb-1">Ek Uplands</h4>
                  <p className="text-sm text-muted-foreground mb-2">Medavakkam, Chennai</p>
                  <p className="font-bold text-lg">₹ 1 - 1.44 Cr</p>
                </div>
                <div className="min-w-[200px] relative">
                  <div className="relative mb-3">
                    <Badge className="absolute top-3 left-3 bg-green-600 text-white z-10">
                      RERA
                    </Badge>
                    <img
                      src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/4.webp"
                      alt="Bhaggyam Vriddhi"
                      className="w-full h-40 object-cover rounded-xl"
                    />
                  </div>
                  <h4 className="font-semibold mb-1">Bhaggyam Vriddhi</h4>
                  <p className="text-sm text-muted-foreground mb-2">T Nagar, Chennai</p>
                  <p className="font-bold text-lg">₹ 34 - 4.01 Cr</p>
                </div>
                <div className="min-w-[200px] relative">
                  <div className="relative mb-3">
                    <Badge className="absolute top-3 left-3 bg-green-600 text-white z-10">
                      RERA
                    </Badge>
                    <img
                      src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/placeholder/square.png"
                      alt="RLD Merlion Estates"
                      className="w-full h-40 object-cover rounded-xl"
                    />
                  </div>
                  <h4 className="font-semibold mb-1">RLD Merlion Estates</h4>
                  <p className="text-sm text-muted-foreground mb-2">Vanagaram, Chennai</p>
                  <p className="font-bold text-lg">₹ 85 L - 2.15 Cr</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      
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

      <Button size="icon" className="fixed bottom-6 right-6 rounded-full size-14 shadow-lg">
        <Icon icon="lucide:message-circle" className="size-6" />
        <Badge className="absolute -top-1 -right-1 size-5 p-0 flex items-center justify-center bg-red-500">
          3
        </Badge>
      </Button>
      
      <footer className="bg-slate-800 text-white py-12 px-6 mt-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-5 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">PropHuzzles</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Mobile App
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Our Services
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Price Trends
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Post your Property
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Real Estate Investment
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Builders in India
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Area Converter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Articles
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Rent Receipt
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Customer Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Sitemap
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-blue-400">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Feedback
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Report a Problem
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Testimonials
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Unsubscribe
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Grievances
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Safety Guide
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Our Partners</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Times Internet - Jobs in India
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Zigwheels.com - Jobs in mobile apps
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Zigwheels.com
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Gaadi.com
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Shiksha.com
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Education Career Info
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Policybazaar.com
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Insurance Info
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Bankbazaar.com
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Amlakbazaar.com
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Indiatimes.com
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    for campus hiring
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Jagran.com - Find Jobs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Near You
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Timesjobs.com - Tech
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400">
                    Recruitment
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-2 text-sm">
                <li>Toll Free - 1800 41 99099</li>
                <li>9:30 AM to 6:30 PM</li>
                <li>Mon-Sun</li>
                <li>Email: feedback@PropHuzzles.com</li>
                <li>Connect with us</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Download the App</h3>
              <div className="space-y-3">
                <img
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/placeholder/landscape.png"
                  alt="Download on App Store"
                  className="w-32 h-10 object-contain bg-white rounded"
                />
                <img
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/placeholder/landscape.png"
                  alt="Get it on Google Play"
                  className="w-32 h-10 object-contain bg-white rounded"
                />
              </div>
              <p className="text-xs mt-4 text-gray-400">
                All trademarks are the property of their respective owners. All rights reserved -
                PropHuzzles Ltd. A property portal venture
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
