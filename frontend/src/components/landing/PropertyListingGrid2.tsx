import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useProperties } from "@/hooks/useProperties";
import { PropertyGridSkeleton } from "@/components/ui/loading";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { PropertyFilters } from "@/lib/api";
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner'; // Assuming you use a toast library like sonner

export function PropertyListingGrid() {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const [searchParams] = useSearchParams();
  const [isSaveSearchModalOpen, setIsSaveSearchModalOpen] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');

  // Extract filters from URL params
  const filters = useMemo(() => {
    const newFilters: PropertyFilters = {};
    const query = searchParams.get("q");
    const propertyType = searchParams.get("property_type");
    const listingType = searchParams.get("listing_type");
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");

    if (query) newFilters.location = query;
    if (propertyType && propertyType !== "all") newFilters.property_type = propertyType;
    if (listingType) newFilters.listing_type = listingType;
    if (minPrice) newFilters.min_price = parseInt(minPrice);
    if (maxPrice) newFilters.max_price = parseInt(maxPrice);

    return newFilters;
  }, [searchParams]);

  const { properties, loading, error, total } = useProperties(filters);

  console.log("The properties are :", properties);

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹ ${(price / 100000).toFixed(2)} Lakh`;
    } else {
      return `₹ ${price.toLocaleString()}`;
    }
  };

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
          {total || 348} results |{" "}
          {filters.listing_type === "rent"
            ? "Flats in Kolkata Central for Rent"
            : "Flats in Kolkata Central for Sale"}
        </h2>
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <Icon icon="solar:map-point-bold" className="size-5 text-amber-600" />
          <AlertDescription className="ml-2">
            Get to know more about Kolkata Central
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
        <div className="space-y-4">
          {!properties || properties.length === 0 ? (
            // If no dynamic properties, show the original static cards
            <>
              <div className="text-center py-12">
                <Icon icon="solar:home-bold" className="size-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No properties found</h3>
                {/* <p className="text-muted-foreground">Showing sample properties below</p> */}
              </div>

              {/* Original static property cards
              <Card className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3">
                    <img
                      alt="Property"
                      src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/landscape/4.webp"
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">B, BALLYGUNGE TERRACE</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Icon
                            icon="solar:star-bold"
                            className="size-4 text-amber-500 [&>path]:fill-amber-500"
                          />
                          <span className="font-medium">4.3</span>
                        </div>
                      </div>
                      <Badge className="bg-accent text-accent-foreground">New Bookings</Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-medium">₹ 2 Cr</p>
                      <p className="text-sm text-muted-foreground">Super Built-up Area</p>
                      <p className="text-sm font-medium">2 C - 4 CH</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Nearby :</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Patikuliar Pelieves Vidyapeth
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          University of Calcutta
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Sterling Hospital
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Netaji Subhash Chandra
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Patikuliar Railway
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Builder</p>
                        <p className="text-sm font-semibold">ROHRA GROUP</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      >
                        View Number
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3">
                    <img
                      alt="Property"
                      src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/landscape/2.webp"
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">17A, PANKAJ MALLICK SARANI</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Icon
                            icon="solar:star-bold"
                            className="size-4 text-amber-500 [&>path]:fill-amber-500"
                          />
                          <span className="font-medium">4.3</span>
                        </div>
                      </div>
                      <Badge className="bg-accent text-accent-foreground">New Bookings</Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm">Address: 17A, Pankaj Mallick Sarani</p>
                      <p className="text-sm text-muted-foreground">Land Area: 3 Cottah (~1450 sqft)</p>
                      <p className="text-sm text-muted-foreground">Property Type: Land | Plot</p>
                      <p className="text-sm font-medium">Price: On Ask</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Nearby :</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Patikuliar Pelieves Vidyapeth
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          University of Calcutta
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Sterling Hospital
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Netaji Subhash Chandra
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Patikuliar Railway
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Builder</p>
                        <p className="text-sm font-semibold">ROHRA GROUP</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      >
                        View Number
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3">
                    <img
                      alt="Property"
                      src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/landscape/5.webp"
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">27/1, HINDUSTHAN PARK</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Icon
                            icon="solar:star-bold"
                            className="size-4 text-amber-500 [&>path]:fill-amber-500"
                          />
                          <span className="font-medium">4.3</span>
                        </div>
                      </div>
                      <Badge className="bg-accent text-accent-foreground">New Bookings</Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm">Address: 27/1, Hindusthan Park</p>
                      <p className="text-sm text-muted-foreground">
                        Land Area: B Cottah: 36 sqft (~Approx. 3,632 sq.ft)
                      </p>
                      <p className="text-sm text-muted-foreground">Property Type: Land | Plot</p>
                      <p className="text-sm font-medium">Price: On Ask</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Nearby :</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Patikuliar Pelieves Vidyapeth
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          University of Calcutta
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Netaji Subhash Chandra
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Patikuliar Railway
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Sterling Hospital
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Builder</p>
                        <p className="text-sm font-semibold">ROHRA GROUP</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      >
                        View Number
                      </Button>
                    </div>
                  </div>
                </div>
              </Card> */}
            </>
          ) : (
            // Dynamic properties from API
            properties &&
            properties.map((property) => (
              <Card key={property.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row" onClick={() => navigate(`/property/${property.id}`)}>
                  <div className="md:w-1/3">
                    <img
                      src={property.images?.[0]?.image_url || "https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/landscape/4.webp"}
                      alt={property.title}
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{property.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Icon icon="solar:map-point-bold" className="size-4" />
                          <span>
                            {property.city}, {property.state}
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-accent text-accent-foreground capitalize">
                        {property.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-lg font-bold">{formatPrice(property.price)}</p>
                      <p className="text-sm text-muted-foreground">
                        {property.area_sqft || 0} sq ft | {property.bedrooms || 0} BHK |{" "}
                        {property.bathrooms || 0} Bath
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        Property Type: {property.property_type} | {property.listing_type}
                      </p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {property.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Listed on</p>
                        <p className="text-sm font-semibold">
                          {new Date(property.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle contact action
                        }}
                      >
                        Contact Owner
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
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
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-white mb-4">99acres</h3>
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
                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                  Request Info
                </a>
                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                  Feedback
                </a>
                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                  Report a problem
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
              <h3 className="font-semibold text-white mb-4">Our Partners</h3>
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
                  Brijj.com - Professional Networking
                </a>
                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                  Shiksha.com - Education Career Info
                </a>
                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                  Policybazaar.com - Insurance India
                </a>
                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                  Paisa.com
                </a>
                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                  Ambitionbox.com
                </a>
                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                  Firstnaukri.com - A jobsite for freshers and experienced
                </a>
                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                  Jobhai.com - Find Jobs Near You
                </a>
                <a href="#" className="block text-sm text-gray-300 hover:text-white">
                  Techgig.com - Tech news on the go
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Contact Us</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-300">Toll Free - 1800 41 99099</p>
                <p className="text-sm text-gray-300">9:30 AM to 6:30 PM (Mon-Sun)</p>
                <p className="text-sm text-gray-300">Email - feedback@99acres.com</p>
                <p className="text-sm text-white font-medium">Connect with us</p>
                <div className="flex gap-3 mt-3">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    <Icon icon="solar:facebook-bold" className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    <Icon icon="solar:youtube-bold" className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    <Icon icon="solar:twitter-bold" className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    <Icon icon="solar:instagram-bold" className="size-4" />
                  </Button>
                </div>
                <p className="text-sm text-white font-medium mt-4">Download the App</p>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 px-3 border-gray-600 text-white hover:bg-gray-700"
                  >
                    <Icon icon="solar:google-play-bold" className="size-4 mr-2" />
                    Google Play
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 px-3 border-gray-600 text-white hover:bg-gray-700"
                  >
                    <Icon icon="solar:apple-bold" className="size-4 mr-2" />
                    App Store
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 mt-8">
            <p className="text-xs text-gray-400 text-center">
              All trademarks are the property of their respective owners. All rights reserved - Info
              Edge (India) Ltd. A Naukri.com group venture
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
