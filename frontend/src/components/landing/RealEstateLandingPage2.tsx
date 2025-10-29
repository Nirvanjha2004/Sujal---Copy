import { Icon } from "@iconify/react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { useFeaturedProperties, useRecentProperties, useRecommendedProperties } from "@/shared/hooks/useProperties";
import { PropertyCardSkeleton } from "@/shared/components/ui/loading";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PROPERTY_TYPES } from "@/features/property/constants";
import { api } from "@/shared/lib/api";

export function RealEstateLandingPage() {
  const navigate = useNavigate();
  const { state: { isAuthenticated } } = useAuth();
  const { properties: featuredProperties, loading: featuredLoading } = useFeaturedProperties(4);
  const { properties: recentProperties, loading: recentLoading } = useRecentProperties(8);
  const { properties: recommendedProperties, loading: recommendedLoading } = useRecommendedProperties(4);
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [listingType, setListingType] = useState("buy");
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [recommendedSlide, setRecommendedSlide] = useState(0);
  const [projectsSlide, setProjectsSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const recommendedCarouselRef = useRef<HTMLDivElement>(null);
  const projectsCarouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRecentProjects = async () => {
      try {
        setIsLoadingProjects(true);
        const response = await api.getRecentProjects(6);
        if (response.success) {
          setRecentProjects(response.data);
        }
      } catch (error) {
        console.error('Error fetching recent projects:', error);
        // Keep empty array as fallback
        setRecentProjects([]);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchRecentProjects();
  }, []);

  // Handle window resize for responsive carousel
  useEffect(() => {
    const handleResize = () => {
      const visibleCards = getVisibleCards();
      
      // Reset property types carousel
      const maxSlide = Math.max(0, PROPERTY_TYPES.length - visibleCards);
      if (currentSlide > maxSlide) {
        setCurrentSlide(maxSlide);
      }
      
      // Reset recommended properties carousel
      const totalRecommended = recommendedProperties?.length || 4;
      const maxRecommendedSlide = Math.max(0, totalRecommended - visibleCards);
      if (recommendedSlide > maxRecommendedSlide) {
        setRecommendedSlide(maxRecommendedSlide);
      }
      
      // Reset projects carousel
      const totalProjects = recentProjects?.length || 4;
      const maxProjectsSlide = Math.max(0, totalProjects - visibleCards);
      if (projectsSlide > maxProjectsSlide) {
        setProjectsSlide(maxProjectsSlide);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentSlide, recommendedSlide, projectsSlide, recommendedProperties, recentProjects]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (propertyType !== 'all') params.set('property_type', propertyType);
    if (listingType !== 'buy') params.set('listing_type', listingType);

    navigate(`/search?${params.toString()}`);
  };

  // Carousel navigation functions
  const getVisibleCards = () => {
    if (window.innerWidth >= 1024) return 4; // lg screens
    if (window.innerWidth >= 768) return 3;  // md screens
    return 1; // mobile
  };

  const nextSlide = () => {
    const visibleCards = getVisibleCards();
    const maxSlide = Math.max(0, PROPERTY_TYPES.length - visibleCards);
    setCurrentSlide(prev => Math.min(prev + 1, maxSlide));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  const canGoNext = () => {
    const visibleCards = getVisibleCards();
    return currentSlide < PROPERTY_TYPES.length - visibleCards;
  };

  const canGoPrev = () => {
    return currentSlide > 0;
  };

  // Recommended Properties Carousel Functions
  const nextRecommendedSlide = () => {
    const visibleCards = getVisibleCards();
    const totalItems = recommendedProperties?.length || 4; // fallback to 4 static cards
    const maxSlide = Math.max(0, totalItems - visibleCards);
    setRecommendedSlide(prev => Math.min(prev + 1, maxSlide));
  };

  const prevRecommendedSlide = () => {
    setRecommendedSlide(prev => Math.max(prev - 1, 0));
  };

  const canGoNextRecommended = () => {
    const visibleCards = getVisibleCards();
    const totalItems = recommendedProperties?.length || 4;
    return recommendedSlide < totalItems - visibleCards;
  };

  const canGoPrevRecommended = () => {
    return recommendedSlide > 0;
  };

  // Projects Carousel Functions
  const nextProjectsSlide = () => {
    const visibleCards = getVisibleCards();
    const totalItems = recentProjects?.length || 4; // fallback to 4 static cards
    const maxSlide = Math.max(0, totalItems - visibleCards);
    setProjectsSlide(prev => Math.min(prev + 1, maxSlide));
  };

  const prevProjectsSlide = () => {
    setProjectsSlide(prev => Math.max(prev - 1, 0));
  };

  const canGoNextProjects = () => {
    const visibleCards = getVisibleCards();
    const totalItems = recentProjects?.length || 4;
    return projectsSlide < totalItems - visibleCards;
  };

  const canGoPrevProjects = () => {
    return projectsSlide > 0;
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹ ${(price / 100000).toFixed(2)} Lakh`;
    } else {
      return `₹ ${price.toLocaleString()}`;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <header className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                  <Icon icon="solar:home-smile-bold" className="size-8" />
                  <span className="text-xl font-bold">PropPortal</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isAuthenticated ? (
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
        <section className="relative bg-gradient-to-br from-primary/10 to-accent/10 py-16 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Find Your Dream Home
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Discover the perfect property from thousands of listings across India
              </p>
              <Card className="shadow-2xl">
                <CardContent className="p-0">
                  <Tabs className="w-full" defaultValue="buy">

                    <TabsContent value="buy" className="p-6">
                      <div className="flex flex-col md:flex-row gap-3">
                        <Select value={listingType} onValueChange={setListingType}>
                          <SelectTrigger className="md:w-32">
                            <SelectValue placeholder="Buy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="buy">Buy</SelectItem>
                            <SelectItem value="rent">Rent</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={propertyType} onValueChange={setPropertyType}>
                          <SelectTrigger className="md:w-48">
                            <SelectValue placeholder="All Residential" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Residential</SelectItem>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="villa">Villa</SelectItem>
                            <SelectItem value="plot">Plot</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex-1 relative">
                          <Icon
                            icon="solar:magnifer-bold"
                            className="size-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          />
                          <Input
                            className="pl-10 pr-12"
                            placeholder="Search 'Localities, Projects, Landmarks'"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleSearch();
                              }
                            }}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                          >
                            <Icon icon="solar:map-point-bold" className="size-5 text-accent" />
                          </Button>
                        </div>
                        <Button
                          className="shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-primary/90 md:w-32"
                          onClick={handleSearch}
                        >
                          Search
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-3xl font-semibold tracking-tight mb-2">
                  Recommended Properties
                </h2>
                <p className="text-muted-foreground">The most searched properties</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevRecommendedSlide}
                  disabled={!canGoPrevRecommended()}
                  className="rounded-full"
                >
                  <Icon icon="solar:arrow-left-bold" className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextRecommendedSlide}
                  disabled={!canGoNextRecommended()}
                  className="rounded-full"
                >
                  <Icon icon="solar:arrow-right-bold" className="size-4" />
                </Button>
              </div>
            </div>
            {recommendedLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <PropertyCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <div className="relative overflow-hidden">
                <div 
                  ref={recommendedCarouselRef}
                  className="flex transition-transform duration-300 ease-in-out gap-6"
                  style={{
                    transform: `translateX(-${recommendedSlide * (100 / getVisibleCards())}%)`
                  }}
                >
                  {recommendedProperties && recommendedProperties.length > 0 ? (
                    recommendedProperties.map((property) => (
                      <Card 
                        key={property.id} 
                        className="hover:shadow-lg transition-shadow cursor-pointer flex-shrink-0" 
                        style={{ width: `calc(${100 / getVisibleCards()}% - ${(getVisibleCards() - 1) * 1.5}rem / ${getVisibleCards()})` }}
                        onClick={() => navigate(`/property/${property.id}`)}
                      >
                        <CardContent className="p-0">
                          <img
                            alt="Project"
                            src={property.images?.[0]?.image_url || "https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/landscape/4.webp"}
                            className="w-full h-48 object-cover rounded-t-xl"
                          />
                          <div className="p-4">
                            <h3 className="font-semibold text-lg mb-1">{property.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {property.address}, {property.city}
                            </p>
                            <div className="flex items-center gap-2 text-sm mb-2">
                              <Icon icon="solar:home-bold" className="size-4 text-muted-foreground" />
                              <span>{property.bedrooms} BHK {property.property_type}</span>
                            </div>
                            <p className="font-bold text-lg">{formatPrice(property.price)}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    // Fallback to original static content if no properties available
                    <>
                      <Card 
                        className="hover:shadow-lg transition-shadow flex-shrink-0"
                        style={{ width: `calc(${100 / getVisibleCards()}% - ${(getVisibleCards() - 1) * 1.5}rem / ${getVisibleCards()})` }}
                      >
                        <CardContent className="p-0">
                          <img
                            alt="Project"
                            src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/landscape/4.webp"
                            className="w-full h-48 object-cover rounded-t-xl"
                          />
                          <div className="p-4">
                            <h3 className="font-semibold text-lg mb-1">PANDITIA</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              3 BHK Apartment Sett Lake Mahadananda Ring Road
                            </p>
                            <div className="flex items-center gap-2 text-sm mb-2">
                              <Icon icon="solar:home-bold" className="size-4 text-muted-foreground" />
                              <span>3 BHK Apartment</span>
                            </div>
                            <p className="font-bold text-lg">₹ 1.55 - 1.60 CRORE / 1.46 CRORE</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card 
                        className="hover:shadow-lg transition-shadow flex-shrink-0"
                        style={{ width: `calc(${100 / getVisibleCards()}% - ${(getVisibleCards() - 1) * 1.5}rem / ${getVisibleCards()})` }}
                      >
                        <CardContent className="p-0">
                          <img
                            alt="Project"
                            src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/landscape/2.webp"
                            className="w-full h-48 object-cover rounded-t-xl"
                          />
                          <div className="p-4">
                            <h3 className="font-semibold text-lg mb-1">IBL NANDAN ROAD</h3>
                            <p className="text-sm text-muted-foreground mb-2">NEAR TOLLYGUNGE</p>
                            <div className="flex items-center gap-2 text-sm mb-2">
                              <Icon icon="solar:home-bold" className="size-4 text-muted-foreground" />
                              <span>3 BHK Apartment</span>
                            </div>
                            <p className="font-bold text-lg">₹ 2 Cr</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card 
                        className="hover:shadow-lg transition-shadow flex-shrink-0"
                        style={{ width: `calc(${100 / getVisibleCards()}% - ${(getVisibleCards() - 1) * 1.5}rem / ${getVisibleCards()})` }}
                      >
                        <CardContent className="p-0">
                          <img
                            alt="Project"
                            src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/landscape/5.webp"
                            className="w-full h-48 object-cover rounded-t-xl"
                          />
                          <div className="p-4">
                            <h3 className="font-semibold text-lg mb-1">BIRLA MANDIR</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              4 BHK Apartment NO.5, QUEENS PARK
                            </p>
                            <div className="flex items-center gap-2 text-sm mb-2">
                              <Icon icon="solar:home-bold" className="size-4 text-muted-foreground" />
                              <span>4 BHK Apartment</span>
                            </div>
                            <p className="font-bold text-lg">₹ 9.25 Cr</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card 
                        className="hover:shadow-lg transition-shadow flex-shrink-0"
                        style={{ width: `calc(${100 / getVisibleCards()}% - ${(getVisibleCards() - 1) * 1.5}rem / ${getVisibleCards()})` }}
                      >
                        <CardContent className="p-0">
                          <img
                            alt="Project"
                            src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/landscape/1.webp"
                            className="w-full h-48 object-cover rounded-t-xl"
                          />
                          <div className="p-4">
                            <h3 className="font-semibold text-lg mb-1">IBC, FERN ROAD</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              2 BHK Apartment (BALLYGUNGE MOTOR TRAINING SCHOOL)
                            </p>
                            <div className="flex items-center gap-2 text-sm mb-2">
                              <Icon icon="solar:home-bold" className="size-4 text-muted-foreground" />
                              <span>2 BHK Apartment</span>
                            </div>
                            <p className="font-bold text-lg">₹ 85 Lakh</p>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-3xl font-semibold tracking-tight mb-2">
                  Apartments, Villas and more
                </h2>
                <p className="text-muted-foreground">in South Kolkata</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevSlide}
                  disabled={!canGoPrev()}
                  className="rounded-full"
                >
                  <Icon icon="solar:arrow-left-bold" className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextSlide}
                  disabled={!canGoNext()}
                  className="rounded-full"
                >
                  <Icon icon="solar:arrow-right-bold" className="size-4" />
                </Button>
              </div>
            </div>
            <div className="relative overflow-hidden">
              <div 
                ref={carouselRef}
                className="flex transition-transform duration-300 ease-in-out gap-6"
                style={{
                  transform: `translateX(-${currentSlide * (100 / getVisibleCards())}%)`
                }}
              >
                {PROPERTY_TYPES.map((propertyType) => {
                  // Define images for each property type
                  const propertyImages = {
                    apartment: "https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/3.webp",
                    house: "https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/2.webp",
                    villa: "https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/1.webp",
                    plot: "https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/4.webp",
                    commercial: "https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/5.webp",
                    land: "https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/4.webp"
                  };

                  // Define property counts (you can make this dynamic by fetching from API later)
                  const propertyCounts = {
                    apartment: "8400+",
                    house: "1400+",
                    villa: "1200+",
                    plot: "1700+",
                    commercial: "800+",
                    land: "900+"
                  };

                  return (
                    <Card
                      key={propertyType.value}
                      className="hover:shadow-lg transition-shadow cursor-pointer flex-shrink-0"
                      style={{ width: `calc(${100 / getVisibleCards()}% - ${(getVisibleCards() - 1) * 1.5}rem / ${getVisibleCards()})` }}
                      onClick={() => navigate(`/search?property_type=${propertyType.value}`)}
                    >
                      <CardContent className="p-0">
                        <img
                          alt={propertyType.label}
                          src={propertyImages[propertyType.value] || "https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/placeholder/square.png"}
                          className="w-full h-48 object-cover rounded-t-xl"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-1">{propertyType.label}</h3>
                          <p className="text-sm text-muted-foreground">{propertyCounts[propertyType.value]} properties</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 bg-gradient-to-br from-primary to-accent">
          <div className="container mx-auto px-4">
            <Card className="overflow-hidden border-0 shadow-2xl">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="p-12 flex flex-col justify-center bg-gradient-to-br from-primary/5 to-accent/5">
                    <div className="mb-6">
                      <Icon icon="solar:home-smile-bold" className="size-16 text-primary" />
                    </div>
                    <h2 className="font-heading text-3xl font-bold tracking-tight mb-4">
                      Ready to Find Your Perfect Home?
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Join thousands of happy homeowners who found their dream property with us
                    </p>
                    <Button
                      size="lg"
                      className="w-fit shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-primary/90"
                      onClick={() => navigate('/contact')}
                    >
                      <Icon icon="solar:chat-round-bold" className="size-5" />
                      Talk to Our Expert
                    </Button>
                  </div>
                  <div className="relative h-full min-h-[400px]">
                    <img
                      alt="Happy Family"
                      src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/portrait/3.webp"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="font-heading text-3xl font-semibold tracking-tight mb-2">
                Upcoming Projects
              </h2>
              <p className="text-muted-foreground">
                Visit these projects and get early bird benefits
              </p>
            </div>
            <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="p-8 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Raaga by 3A, ISWAR GANGULY STREET</h3>
                      <p className="text-blue-100 mb-4">3A, ISWAR GANGULY STREET</p>
                      <div className="flex items-center gap-4 mb-6">
                        <div>
                          <p className="text-3xl font-bold">3 BHK Apartment</p>
                          <p className="text-blue-100">₹ 80.00 Lakh</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <span>Interested in this project?</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          className="bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => navigate('/contact')}
                        >
                          View Number
                        </Button>
                        <Icon icon="solar:arrow-right-bold" className="size-5" />
                      </div>
                    </div>
                    <div className="mt-4 text-sm">
                      <p>PROP PUZZLES</p>
                    </div>
                  </div>
                  <div className="relative h-full min-h-[300px]">
                    <img
                      alt="Raaga Project"
                      src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/landscape/6.webp"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        <section className="py-16 bg-gradient-to-br from-red-50 to-red-100">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Icon icon="solar:home-smile-bold" className="size-8 text-red-500" />
                  <h2 className="font-heading text-3xl font-semibold tracking-tight text-red-600">
                    Newly Launched Projects
                  </h2>
                </div>
                <p className="text-muted-foreground">Limited launch offers available</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevProjectsSlide}
                  disabled={!canGoPrevProjects()}
                  className="rounded-full"
                >
                  <Icon icon="solar:arrow-left-bold" className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextProjectsSlide}
                  disabled={!canGoNextProjects()}
                  className="rounded-full"
                >
                  <Icon icon="solar:arrow-right-bold" className="size-4" />
                </Button>
              </div>
            </div>
            {isLoadingProjects ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {Array.from({ length: 4 }).map((_, index) => (
                  <PropertyCardSkeleton key={index} />
                ))}
              </div>
            ) : (
              <div className="relative overflow-hidden mb-8">
                <div 
                  ref={projectsCarouselRef}
                  className="flex transition-transform duration-300 ease-in-out gap-6"
                  style={{
                    transform: `translateX(-${projectsSlide * (100 / getVisibleCards())}%)`
                  }}
                >
                  {recentProjects && recentProjects.length > 0 ? (
                    recentProjects.map((project) => {
                      const formatPrice = (pricing: any) => {
                        if (pricing?.min && pricing?.max) {
                          const formatAmount = (amount: number) => {
                            if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
                            if (amount >= 100000) return `₹${(amount / 100000).toFixed(0)}L`;
                            return `₹${amount.toLocaleString()}`;
                          };
                          return `${formatAmount(pricing.min)} - ${formatAmount(pricing.max)}`;
                        }
                        return 'Price on request';
                      };

                      return (
                        <Card 
                          key={project.id} 
                          className="hover:shadow-lg transition-shadow bg-white cursor-pointer flex-shrink-0" 
                          style={{ width: `calc(${100 / getVisibleCards()}% - ${(getVisibleCards() - 1) * 1.5}rem / ${getVisibleCards()})` }}
                          onClick={() => navigate(`/project/${project.id}`)}
                        >
                          <CardContent className="p-0">
                            <img
                              alt={project.name}
                              src={project.images?.[0] || "https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/1.webp"}
                              className="w-full h-32 object-cover rounded-t-xl"
                            />
                            <div className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="destructive" className="text-xs">
                                  NEW LAUNCH
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-sm mb-1">{project.name}</h3>
                              <p className="text-xs text-muted-foreground mb-2">
                                {project.total_units} units | {project.project_type}
                              </p>
                              <p className="text-xs text-muted-foreground mb-2">
                                {project.location}, {project.city}
                              </p>
                              <p className="text-xs text-muted-foreground mb-2">
                                {formatPrice(project.pricing)}
                              </p>
                              <div className="flex items-center gap-1 text-xs mb-2">
                                <Icon icon="solar:heart-bold" className="size-3 text-red-500" />
                                <span>by {project.builder?.first_name} {project.builder?.last_name}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                <Icon icon="solar:eye-bold" className="size-3" />
                                <span>{project.available_units} units available</span>
                              </div>
                              <Button size="sm" className="w-full mt-3 bg-black text-white hover:bg-gray-800">
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    // Fallback to original static content
                    <>
                      <Card 
                        className="hover:shadow-lg transition-shadow bg-white flex-shrink-0"
                        style={{ width: `calc(${100 / getVisibleCards()}% - ${(getVisibleCards() - 1) * 1.5}rem / ${getVisibleCards()})` }}
                      >
                        <CardContent className="p-0">
                          <img
                            alt="Project"
                            src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/1.webp"
                            className="w-full h-32 object-cover rounded-t-xl"
                          />
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="destructive" className="text-xs">
                                NEW LAUNCH
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-sm mb-1">3A, MIRAGE VISTA AVENUE</h3>
                            <p className="text-xs text-muted-foreground mb-2">
                              2500 Sq Ft | 3, 4 BHK Apartment
                            </p>
                            <p className="text-xs text-muted-foreground mb-2">
                              Ready to move | Luxurious living
                            </p>
                            <div className="flex items-center gap-1 text-xs mb-2">
                              <Icon icon="solar:heart-bold" className="size-3 text-red-500" />
                              <span>Pre-preferred options</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Icon icon="solar:eye-bold" className="size-3" />
                              <span>Aerial Photography</span>
                            </div>
                            <Button size="sm" className="w-full mt-3 bg-black text-white hover:bg-gray-800">
                              View Brochure
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      <Card 
                        className="hover:shadow-lg transition-shadow bg-white flex-shrink-0"
                        style={{ width: `calc(${100 / getVisibleCards()}% - ${(getVisibleCards() - 1) * 1.5}rem / ${getVisibleCards()})` }}
                      >
                        <CardContent className="p-0">
                          <img
                            alt="Project"
                            src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/2.webp"
                            className="w-full h-32 object-cover rounded-t-xl"
                          />
                          <div className="p-4">
                            <h3 className="font-semibold text-sm mb-1">3A, MIRAGE VISTA AVENUE</h3>
                            <p className="text-xs text-muted-foreground mb-2">Luxury Real Bangalore</p>
                            <p className="text-xs text-muted-foreground mb-2">
                              ₹7500 Sq Ft | 2, 3 BHK Apartment
                            </p>
                            <div className="flex items-center gap-1 text-xs mb-2">
                              <Icon icon="solar:heart-bold" className="size-3 text-red-500" />
                              <span>Pre-preferred options</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Icon icon="solar:eye-bold" className="size-3" />
                              <span>Aerial Photography</span>
                            </div>
                            <Button size="sm" className="w-full mt-3 bg-black text-white hover:bg-gray-800">
                              View Brochure
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      <Card 
                        className="hover:shadow-lg transition-shadow bg-white flex-shrink-0"
                        style={{ width: `calc(${100 / getVisibleCards()}% - ${(getVisibleCards() - 1) * 1.5}rem / ${getVisibleCards()})` }}
                      >
                        <CardContent className="p-0">
                          <img
                            alt="Project"
                            src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/3.webp"
                            className="w-full h-32 object-cover rounded-t-xl"
                          />
                          <div className="p-4">
                            <h3 className="font-semibold text-sm mb-1">3A, ISWAR GANGULY STREET</h3>
                            <p className="text-xs text-muted-foreground mb-2">
                              ₹3500 Sq Ft | 3, 4 BHK Apartment
                            </p>
                            <p className="text-xs text-muted-foreground mb-2">
                              1725 price increase in last 3 months
                            </p>
                            <div className="flex items-center gap-1 text-xs mb-2">
                              <Icon icon="solar:heart-bold" className="size-3 text-red-500" />
                              <span>Pre-preferred options</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Icon icon="solar:eye-bold" className="size-3" />
                              <span>Aerial Photography</span>
                            </div>
                            <Button size="sm" className="w-full mt-3 bg-black text-white hover:bg-gray-800">
                              View Brochure
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      <Card 
                        className="hover:shadow-lg transition-shadow bg-white flex-shrink-0"
                        style={{ width: `calc(${100 / getVisibleCards()}% - ${(getVisibleCards() - 1) * 1.5}rem / ${getVisibleCards()})` }}
                      >
                        <CardContent className="p-0">
                          <img
                            alt="Project"
                            src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/4.webp"
                            className="w-full h-32 object-cover rounded-t-xl"
                          />
                          <div className="p-4">
                            <h3 className="font-semibold text-sm mb-1">Swapnalaya Royale</h3>
                            <p className="text-xs text-muted-foreground mb-2">
                              ₹2500 Sq Ft | 2, 3 BHK Apartment
                            </p>
                            <p className="text-xs text-muted-foreground mb-2">
                              1810 price increase in last 3 months
                            </p>
                            <div className="flex items-center gap-1 text-xs mb-2">
                              <Icon icon="solar:heart-bold" className="size-3 text-red-500" />
                              <span>Pre-preferred options</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Icon icon="solar:eye-bold" className="size-3" />
                              <span>Aerial Photography</span>
                            </div>
                            <Button size="sm" className="w-full mt-3 bg-black text-white hover:bg-gray-800">
                              View Brochure
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
      {/* <section eid="new1" className="py-16">
        <div eid="new2" className="container mx-auto px-4">
          <div eid="new3" className="mb-8">
            <h2 eid="new4" className="font-heading text-3xl font-semibold tracking-tight mb-2">
              Emerging localities
            </h2>
            <p eid="new5" className="text-muted-foreground">
              Localities with recent development in Kolkata
            </p>
          </div>
          <div eid="new6" className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
            <Card eid="new7" className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent eid="new8" className="p-0">
                <img
                  alt="Salt lake"
                  eid="new9"
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/1.webp"
                  className="w-full h-32 object-cover rounded-t-xl"
                />
                <div eid="new10" className="p-4">
                  <h3 eid="new11" className="font-semibold text-sm mb-1">
                    Salt lake 4.3★
                  </h3>
                  <p eid="new12" className="text-xs text-muted-foreground mb-3">
                    82 New Projects
                  </p>
                  <div eid="new13" className="flex gap-2">
                    <Button eid="new14" size="sm" variant="outline" className="text-xs h-7 px-3">
                      Insights
                    </Button>
                    <Button eid="new15" size="sm" variant="outline" className="text-xs h-7 px-3">
                      Projects
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card eid="new16" className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent eid="new17" className="p-0">
                <img
                  alt="Jodhpur Park"
                  eid="new18"
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/2.webp"
                  className="w-full h-32 object-cover rounded-t-xl"
                />
                <div eid="new19" className="p-4">
                  <h3 eid="new20" className="font-semibold text-sm mb-1">
                    Jodhpur Park 4.3★
                  </h3>
                  <p eid="new21" className="text-xs text-muted-foreground mb-3">
                    54 New Projects
                  </p>
                  <div eid="new22" className="flex gap-2">
                    <Button eid="new23" size="sm" variant="outline" className="text-xs h-7 px-3">
                      Insights
                    </Button>
                    <Button eid="new24" size="sm" variant="outline" className="text-xs h-7 px-3">
                      Projects
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card eid="new25" className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent eid="new26" className="p-0">
                <img
                  alt="Jadavpur"
                  eid="new27"
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/3.webp"
                  className="w-full h-32 object-cover rounded-t-xl"
                />
                <div eid="new28" className="p-4">
                  <h3 eid="new29" className="font-semibold text-sm mb-1">
                    Jadavpur 4.2★
                  </h3>
                  <p eid="new30" className="text-xs text-muted-foreground mb-3">
                    73 New Projects
                  </p>
                  <div eid="new31" className="flex gap-2">
                    <Button eid="new32" size="sm" variant="outline" className="text-xs h-7 px-3">
                      Insights
                    </Button>
                    <Button eid="new33" size="sm" variant="outline" className="text-xs h-7 px-3">
                      Projects
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card eid="new34" className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent eid="new35" className="p-0">
                <img
                  alt="Southern Avenue"
                  eid="new36"
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/4.webp"
                  className="w-full h-32 object-cover rounded-t-xl"
                />
                <div eid="new37" className="p-4">
                  <h3 eid="new38" className="font-semibold text-sm mb-1">
                    Southern Avenue 4.3★
                  </h3>
                  <p eid="new39" className="text-xs text-muted-foreground mb-3">
                    24 New Projects
                  </p>
                  <div eid="new40" className="flex gap-2">
                    <Button eid="new41" size="sm" variant="outline" className="text-xs h-7 px-3">
                      Insights
                    </Button>
                    <Button eid="new42" size="sm" variant="outline" className="text-xs h-7 px-3">
                      Projects
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card eid="new43" className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent eid="new44" className="p-0">
                <img
                  alt="Lake Gardens"
                  eid="new45"
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/landscape/1.webp"
                  className="w-full h-32 object-cover rounded-t-xl"
                />
                <div eid="new46" className="p-4">
                  <h3 eid="new47" className="font-semibold text-sm mb-1">
                    Lake Gardens 4.2★
                  </h3>
                  <p eid="new48" className="text-xs text-muted-foreground mb-3">
                    35 New Projects
                  </p>
                  <div eid="new49" className="flex gap-2">
                    <Button eid="new50" size="sm" variant="outline" className="text-xs h-7 px-3">
                      Insights
                    </Button>
                    <Button eid="new51" size="sm" variant="outline" className="text-xs h-7 px-3">
                      Projects
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div eid="new52" className="space-y-8">
            <Card
              eid="new53"
              className="bg-gradient-to-r from-green-50 to-green-100 border-green-200"
            >
              <CardContent eid="new54" className="p-6">
                <div eid="new55" className="flex items-center gap-4">
                  <div
                    eid="new56"
                    className="w-16 h-16 bg-green-200 rounded-lg flex items-center justify-center"
                  >
                    <Icon
                      eid="new57"
                      icon="solar:shield-check-bold"
                      className="size-8 text-green-600"
                    />
                  </div>
                  <div eid="new58" className="flex-1">
                    <h3 eid="new59" className="font-semibold text-lg mb-2">
                      View properties verified by Prop Puzzle
                    </h3>
                    <p eid="new60" className="text-muted-foreground">
                      Verified on site for genuineness. Check out real photos of the property
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}
      {/* <section eid="new74" className="py-16 bg-secondary/30">
        <div eid="new75" className="container mx-auto px-4">
          <div eid="new76" className="mb-8">
            <h2 eid="new77" className="font-heading text-3xl font-semibold tracking-tight mb-2">
              Top articles on home buying
            </h2>
            <div eid="new78" className="flex items-center justify-between">
              <div eid="new79" className="flex gap-6">
                <Button
                  eid="new80"
                  variant="ghost"
                  className="text-primary border-b-2 border-primary rounded-none"
                >
                  News
                </Button>
                <Button eid="new81" variant="ghost" className="text-muted-foreground">
                  Tax & Legal
                </Button>
                <Button eid="new82" variant="ghost" className="text-muted-foreground">
                  Help Guides
                </Button>
                <Button eid="new83" variant="ghost" className="text-muted-foreground">
                  Investment
                </Button>
              </div>
              <Button eid="new84" variant="link" className="text-primary">
                Read realty news, guides & articles
              </Button>
            </div>
          </div>
          <div eid="new85" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card eid="new86" className="hover:shadow-lg transition-shadow">
              <CardContent eid="new87" className="p-0">
                <img
                  alt="Article"
                  eid="new88"
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/placeholder/landscape.png"
                  className="w-full h-32 object-cover rounded-t-xl"
                />
                <div eid="new89" className="p-4">
                  <h3 eid="new90" className="font-semibold text-sm mb-1">
                    PANDITIA
                  </h3>
                  <p eid="new91" className="text-xs text-muted-foreground mb-2">
                    3 BHK Apartment Sett lake Mahadananda Ring Road
                  </p>
                  <p eid="new92" className="text-xs text-muted-foreground">
                    16th Jan
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card eid="new93" className="hover:shadow-lg transition-shadow">
              <CardContent eid="new94" className="p-0">
                <img
                  alt="Article"
                  eid="new95"
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/placeholder/landscape.png"
                  className="w-full h-32 object-cover rounded-t-xl"
                />
                <div eid="new96" className="p-4">
                  <h3 eid="new97" className="font-semibold text-sm mb-1">
                    IBL NANDAN ROAD, NEAR TOLLYGUNGE
                  </h3>
                  <p eid="new98" className="text-xs text-muted-foreground mb-2">
                    3 BHK Apartment
                  </p>
                  <p eid="new99" className="text-xs text-muted-foreground">
                    16th Jan
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card eid="new100" className="hover:shadow-lg transition-shadow">
              <CardContent eid="new101" className="p-0">
                <img
                  alt="Article"
                  eid="new102"
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/placeholder/landscape.png"
                  className="w-full h-32 object-cover rounded-t-xl"
                />
                <div eid="new103" className="p-4">
                  <h3 eid="new104" className="font-semibold text-sm mb-1">
                    BIRLA MANDIR
                  </h3>
                  <p eid="new105" className="text-xs text-muted-foreground mb-2">
                    4 BHK Apartment NO.5, QUEENS PARK
                  </p>
                  <p eid="new106" className="text-xs text-muted-foreground">
                    7th Feb
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card eid="new107" className="hover:shadow-lg transition-shadow">
              <CardContent eid="new108" className="p-0">
                <img
                  alt="Article"
                  eid="new109"
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/placeholder/landscape.png"
                  className="w-full h-32 object-cover rounded-t-xl"
                />
                <div eid="new110" className="p-4">
                  <h3 eid="new111" className="font-semibold text-sm mb-1">
                    IBC, FERN ROAD
                  </h3>
                  <p eid="new112" className="text-xs text-muted-foreground mb-2">
                    2 BHK Apartment (BALLYGUNGE MOTOR TRAINING SCHOOL)
                  </p>
                  <p eid="new113" className="text-xs text-muted-foreground">
                    5th Feb
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card eid="new114" className="hover:shadow-lg transition-shadow">
              <CardContent eid="new115" className="p-0">
                <img
                  alt="Article"
                  eid="new116"
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/placeholder/landscape.png"
                  className="w-full h-32 object-cover rounded-t-xl"
                />
                <div eid="new117" className="p-4">
                  <h3 eid="new118" className="font-semibold text-sm mb-1">
                    4D, JODHPUR PARK
                  </h3>
                  <p eid="new119" className="text-xs text-muted-foreground mb-2">
                    3 BHK Apartment
                  </p>
                  <p eid="new120" className="text-xs text-muted-foreground">
                    3rd March
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}
      <section eid="new121" className="py-16 bg-gradient-to-br from-pink-50 to-pink-100">
        <div eid="new122" className="container mx-auto px-4">
          <Card eid="new123" className="overflow-hidden border-0 shadow-2xl">
            <CardContent eid="new124" className="p-0">
              <div eid="new125" className="grid md:grid-cols-2 gap-0">
                <div eid="new126" className="p-12 flex flex-col justify-center">
                  <div eid="new127" className="mb-6">
                    <p eid="new128" className="text-sm text-muted-foreground mb-2">
                      SELL OR RENT YOUR PROPERTY
                    </p>
                    <h2
                      eid="new129"
                      className="font-heading text-4xl font-bold tracking-tight mb-4"
                    >
                      Register to post your property for
                    </h2>
                    <p eid="new130" className="text-muted-foreground mb-6">
                      Post your residential / commercial property
                    </p>
                  </div>
                  <div eid="new131" className="grid grid-cols-3 gap-8 mb-8">
                    <div eid="new132" className="text-center">
                      <h3 eid="new133" className="text-3xl font-bold text-primary mb-1">
                        10L+
                      </h3>
                      <p eid="new134" className="text-sm text-muted-foreground">
                        Property Listings
                      </p>
                    </div>
                    <div eid="new135" className="text-center">
                      <h3 eid="new136" className="text-3xl font-bold text-primary mb-1">
                        45L+
                      </h3>
                      <p eid="new137" className="text-sm text-muted-foreground">
                        Monthly Searches
                      </p>
                    </div>
                    <div eid="new138" className="text-center">
                      <h3 eid="new139" className="text-3xl font-bold text-primary mb-1">
                        2L+
                      </h3>
                      <p eid="new140" className="text-sm text-muted-foreground">
                        Owner advertise monthly
                      </p>
                    </div>
                  </div>
                  <Button
                    eid="new141"
                    size="lg"
                    className="w-fit mb-4 shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-primary/90"
                  >
                    Post your property for free
                  </Button>
                  <p eid="new142" className="text-sm text-muted-foreground">
                    Or post via{" "}
                    <Icon eid="new143" icon="solar:phone-bold" className="size-4 inline" /> Whatsapp
                    send a 'hi' to +91 7428887036
                  </p>
                </div>
                <div eid="new144" className="relative h-full min-h-[400px]">
                  <img
                    alt="Happy Couple"
                    eid="new145"
                    src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/portrait/2.webp"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      <section
        eid="e613"
        className="py-16 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300"
      >
        <div eid="e614" className="container mx-auto px-4">
          <div eid="e615" className="mb-8">
            <h2 eid="e616" className="font-heading text-3xl font-semibold tracking-tight mb-2">
              Explore our services
            </h2>
          </div>
          <div eid="e617" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card eid="e618" className="hover:shadow-lg transition-shadow bg-white">
              <CardContent eid="e619" className="p-6">
                <div eid="e620" className="flex items-start gap-4">
                  <img
                    alt="Commercial Property"
                    eid="e621"
                    src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/commercial-listings/square/1.webp"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div eid="e622">
                    <h3 eid="e623" className="font-semibold text-lg mb-2">
                      Buying a commercial property
                    </h3>
                    <p eid="e624" className="text-sm text-muted-foreground">
                      Shops, offices, land, factories, warehouses and more
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card eid="e625" className="hover:shadow-lg transition-shadow bg-white">
              <CardContent eid="e626" className="p-6">
                <div eid="e627" className="flex items-start gap-4">
                  <img
                    alt="Leasing Property"
                    eid="e628"
                    src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/commercial-listings/square/2.webp"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div eid="e629">
                    <h3 eid="e630" className="font-semibold text-lg mb-2">
                      Leasing a commercial property
                    </h3>
                    <p eid="e631" className="text-sm text-muted-foreground">
                      Shops, offices, land, factories, warehouses and more
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card eid="e632" className="hover:shadow-lg transition-shadow bg-white">
              <CardContent eid="e633" className="p-6">
                <div eid="e634" className="flex items-start gap-4">
                  <img
                    alt="Plot/Land"
                    eid="e635"
                    src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/4.webp"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div eid="e636">
                    <h3 eid="e637" className="font-semibold text-lg mb-2">
                      Buy Plot/Land
                    </h3>
                    <p eid="e638" className="text-sm text-muted-foreground">
                      Residential plots, agricultural land, farm lands, etc. Lands and more
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card eid="e639" className="hover:shadow-lg transition-shadow bg-white">
              <CardContent eid="e640" className="p-6">
                <div eid="e641" className="flex items-start gap-4">
                  <img
                    alt="Renting Home"
                    eid="e642"
                    src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/1.webp"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div eid="e643">
                    <h3 eid="e644" className="font-semibold text-lg mb-2">
                      Renting a home
                    </h3>
                    <p eid="e645" className="text-sm text-muted-foreground">
                      Apartments, builder floors, villas and more
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card eid="e646" className="hover:shadow-lg transition-shadow bg-white">
              <CardContent eid="e647" className="p-6">
                <div eid="e648" className="flex items-start gap-4">
                  <img
                    alt="PG Co-living"
                    eid="e649"
                    src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/3.webp"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div eid="e650">
                    <h3 eid="e651" className="font-semibold text-lg mb-2">
                      PG and co-living
                    </h3>
                    <p eid="e652" className="text-sm text-muted-foreground">
                      Organised, owner and broker listed PGs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section eid="e653" className="py-16 bg-gradient-to-br from-orange-50 to-orange-100">
        <div eid="e654" className="container mx-auto px-4">
          <div eid="e655" className="grid md:grid-cols-2 gap-8 items-center">
            <div eid="e656">
              <h2 eid="e657" className="font-heading text-4xl font-bold tracking-tight mb-4">
                Download PropPortal Mobile App
              </h2>
              <p eid="e658" className="text-muted-foreground mb-6">
                and never miss out any update
              </p>
              <div eid="e659" className="space-y-4 mb-8">
                <div eid="e660" className="flex items-center gap-3">
                  <Icon
                    eid="e661"
                    icon="solar:check-circle-bold"
                    className="size-6 text-green-600"
                  />
                  <p eid="e662" className="text-muted-foreground">
                    Get to know about newly posted properties as soon as they are posted
                  </p>
                </div>
                <div eid="e663" className="flex items-center gap-3">
                  <Icon
                    eid="e664"
                    icon="solar:check-circle-bold"
                    className="size-6 text-green-600"
                  />
                  <p eid="e665" className="text-muted-foreground">
                    Manage your properties with ease and get instant alerts about responses
                  </p>
                </div>
              </div>
              <div eid="e666" className="flex gap-4">
                <img
                  alt="Google Play"
                  eid="e667"
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/placeholder/landscape.png"
                  className="h-12 w-auto"
                />
                <img
                  alt="App Store"
                  eid="e668"
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/placeholder/landscape.png"
                  className="h-12 w-auto"
                />
              </div>
            </div>
            <div eid="e669" className="relative">
              <img
                alt="Mobile App"
                eid="e670"
                src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/placeholder/portrait.png"
                className="w-full max-w-sm mx-auto"
              />
              <div
                eid="e671"
                className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold"
              />
            </div>
          </div>
        </div>
      </section>
      {/* <section eid="e672" className="py-16">
        <div eid="e673" className="container mx-auto px-4">
          <div eid="e674" className="mb-8">
            <h2 eid="e675" className="font-heading text-3xl font-semibold tracking-tight mb-2">
              Top Localities in Bangalore
            </h2>
            <div eid="e676" className="flex gap-6 mb-6">
              <Button
                eid="e677"
                variant="ghost"
                className="text-primary border-b-2 border-primary rounded-none"
              >
                Buy
              </Button>
              <Button eid="e678" variant="ghost" className="text-muted-foreground">
                Rent / Lease
              </Button>
            </div>
          </div>
          <div eid="e679" className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div eid="e680">
              <h3 eid="e681" className="font-semibold text-lg mb-4">
                New Projects in Top Localities of Bangalore
              </h3>
              <div eid="e682" className="space-y-2">
                <a
                  eid="e683"
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  New Projects in Whitefield
                </a>
                <a
                  eid="e684"
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  New Projects in Devanahalli
                </a>
                <a
                  eid="e685"
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  New Projects in Sarjapur Road
                </a>
                <a
                  eid="e686"
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  View 14 More
                </a>
              </div>
            </div>
            <div eid="e687">
              <h3 eid="e688" className="font-semibold text-lg mb-4">
                Flats in Top Localities of Bangalore
              </h3>
              <div eid="e689" className="space-y-2">
                <a
                  eid="e690"
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  Flats for sale in Whitefield
                </a>
                <a
                  eid="e691"
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  Flats for sale in Sarjapur Road
                </a>
                <a
                  eid="e692"
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  Flats for sale in Marathahalli
                </a>
                <a
                  eid="e693"
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  View 14 More
                </a>
              </div>
            </div>
            <div eid="e694">
              <h3 eid="e695" className="font-semibold text-lg mb-4">
                House in Top Localities of Bangalore
              </h3>
              <div eid="e696" className="space-y-2">
                <a
                  eid="e697"
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  Houses for sale in Whitefield
                </a>
                <a
                  eid="e698"
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  Houses for sale in Marathahalli
                </a>
                <a
                  eid="e699"
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  Houses for sale in Sarjapur Road
                </a>
                <a
                  eid="e700"
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  View 14 More
                </a>
              </div>
            </div>
          </div>
        </div>
      </section> */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4 text-white">PropPortal</h3>
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
                  Nptelhub.com - A portal for campus hiring
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
                <p className="text-sm text-gray-300">Email - feedback@PropPortal.com</p>
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
    </>
  );
}
