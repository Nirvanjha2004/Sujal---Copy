import { Icon } from "@iconify/react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { useLandingPageData } from "@/shared/hooks/useLandingPageData";
import { PropertyCardSkeleton } from "@/shared/components/ui/loading";
import { useAuth } from "@/shared/contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PROPERTY_TYPES } from "@/features/property/constants";
import { Header } from "@/shared/components/layout/Header";


export function RealEstateLandingPage() {
  const navigate = useNavigate();

  // OPTIMIZED: Single hook with only 2 API calls instead of 4+
  const { data, loading } = useLandingPageData();
  const { recommendedProperties, recentProjects } = data;
  const isLoadingProperties = loading;
  const isLoadingProjects = loading;

  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [listingType, setListingType] = useState("buy");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [recommendedSlide, setRecommendedSlide] = useState(0);
  const [projectsSlide, setProjectsSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const recommendedCarouselRef = useRef<HTMLDivElement>(null);
  const projectsCarouselRef = useRef<HTMLDivElement>(null);

  // Data fetching is now handled by useLandingPageData hook - no manual API calls needed!

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
        <Header variant="landing" />
        <section 
          className="relative py-20 overflow-hidden bg-cover bg-center bg-no-repeat full-width-element"
          style={{
            backgroundImage: 'url(/landingpage/images/topbanner.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          
          <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl">
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-white drop-shadow-lg">
                Buy in Kolkata South
              </h1>
              <p className="text-lg md:text-xl text-white/95 mb-10 drop-shadow-md">
                Discover the perfect property from thousands of listings across India
              </p>
              <Card className="shadow-2xl bg-white/95 backdrop-blur-sm">
                <CardContent className="p-0">
                  {/* Tabs for Buy/Rent/New Launch etc */}
                  <div className="border-b border-gray-200">
                    <div className="flex items-center gap-1 p-2">
                      <Button
                        variant={listingType === 'buy' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setListingType('buy')}
                        className="rounded-md"
                      >
                        Buy
                      </Button>
                      <Button
                        variant={listingType === 'rent' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setListingType('rent')}
                        className="rounded-md"
                      >
                        Rent
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/projects')}
                        className="rounded-md"
                      >
                        New Launch
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/properties?listing_type=pg')}
                        className="rounded-md"
                      >
                        PG/Co-living
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/properties?property_type=commercial')}
                        className="rounded-md"
                      >
                        Commercial
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/properties?property_type=plot')}
                        className="rounded-md"
                      >
                        Plot/land
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/projects')}
                        className="rounded-md"
                      >
                        Projects
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 md:p-6">
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
                          className="pl-10 pr-12 h-11"
                          placeholder="Search 'Form Houses in 1 cr'"
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
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        >
                          <Icon icon="solar:map-point-bold" className="size-5 text-primary" />
                        </Button>
                      </div>
                      <Button
                        className="gradient-button h-11 px-8 font-semibold"
                        onClick={handleSearch}
                      >
                        Search
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* City Selection Buttons */}
              <div className="flex items-center gap-4 mt-6">
                <Button
                  variant="secondary"
                  className="bg-white/95 hover:bg-white shadow-md"
                  onClick={() => navigate('/properties?city=kolkata')}
                >
                  <Icon icon="solar:home-bold" className="size-4 mr-2 text-primary" />
                  Buy in Kolkata
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  onClick={() => navigate('/cities')}
                >
                  <Icon icon="solar:map-bold" className="size-4 mr-2" />
                  Explore new city
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight mb-1">
                  Recommended Projects
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">The most searched projects in Kolkata South</p>
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
            {isLoadingProperties ? (
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
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight mb-1">
                  Apartments, Villas and more
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">in South Kolkata</p>
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
        <section className="py-16 bg-gradient-to-br from-primary to-accent full-width-element">
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
                  <div className="relative h-full min-h-[25rem]">
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
                  <div className="relative h-full min-h-[18.75rem]">
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
        <section className="py-16 bg-gradient-to-br from-red-50 to-red-100 full-width-element">
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
      {/* <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="font-heading text-3xl font-semibold tracking-tight mb-2">
              Emerging localities
            </h2>
            <p className="text-muted-foreground">
              Localities with recent development in Kolkata
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <img
                  alt="Salt lake"
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/1.webp"
                  className="w-full h-32 object-cover rounded-t-xl"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1">
                    Salt lake 4.3★
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    82 New Projects
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs h-7 px-3">
                      Insights
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-7 px-3">
                      Projects
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <img
                  alt="Jodhpur Park"
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/2.webp"
                  className="w-full h-32 object-cover rounded-t-xl"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1">
                    Jodhpur Park 4.3★
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    54 New Projects
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs h-7 px-3">
                      Insights
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-7 px-3">
                      Projects
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <img
                  alt="Jadavpur"
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/3.webp"
                  className="w-full h-32 object-cover rounded-t-xl"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1">
                    Jadavpur 4.2★
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    73 New Projects
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs h-7 px-3">
                      Insights
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-7 px-3">
                      Projects
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <img
                  alt="Southern Avenue"
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/4.webp"
                  className="w-full h-32 object-cover rounded-t-xl"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1">
                    Southern Avenue 4.3★
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    24 New Projects
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs h-7 px-3">
                      Insights
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-7 px-3">
                      Projects
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <img
                  alt="Lake Gardens"
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/landscape/1.webp"
                  className="w-full h-32 object-cover rounded-t-xl"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1">
                    Lake Gardens 4.2★
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    35 New Projects
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs h-7 px-3">
                      Insights
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-7 px-3">
                      Projects
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
            <Card
              className="bg-gradient-to-r from-green-50 to-green-100 border-green-200"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 bg-green-200 rounded-lg flex items-center justify-center"
                  >
                    <Icon
                      icon="solar:shield-check-bold"
                      className="size-8 text-green-600"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">
                      View properties verified by Prop Puzzle
                    </h3>
                    <p className="text-muted-foreground">
                      Verified on site for genuineness. Check out real photos of the property
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}
      {/* <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="font-heading text-3xl font-semibold tracking-tight mb-2">
              Top articles on home buying
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex gap-6">
                <Button
                  variant="ghost"
                  className="text-primary border-b-2 border-primary rounded-none"
                >
                  News
                </Button>
                <Button variant="ghost" className="text-muted-foreground">
                  Tax & Legal
                </Button>
                <Button variant="ghost" className="text-muted-foreground">
                  Help Guides
                </Button>
                <Button variant="ghost" className="text-muted-foreground">
                  Investment
                </Button>
              </div>
              <Button variant="link" className="text-primary">
                Read realty news, guides & articles
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <img
                  alt="Article"
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/placeholder/landscape.png"
                  className="w-full h-32 object-cover rounded-t-xl"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1">
                    PANDITIA
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    3 BHK Apartment Sett lake Mahadananda Ring Road
                  </p>
                  <p className="text-xs text-muted-foreground">
                    16th Jan
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <img
                  alt="Article"
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/placeholder/landscape.png"
                  className="w-full h-32 object-cover rounded-t-xl"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1">
                    IBL NANDAN ROAD, NEAR TOLLYGUNGE
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    3 BHK Apartment
                  </p>
                  <p className="text-xs text-muted-foreground">
                    16th Jan
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <img
                  alt="Article"
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/placeholder/landscape.png"
                  className="w-full h-32 object-cover rounded-t-xl"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1">
                    BIRLA MANDIR
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    4 BHK Apartment NO.5, QUEENS PARK
                  </p>
                  <p className="text-xs text-muted-foreground">
                    7th Feb
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <img
                  alt="Article"
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/placeholder/landscape.png"
                  className="w-full h-32 object-cover rounded-t-xl"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1">
                    IBC, FERN ROAD
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    2 BHK Apartment (BALLYGUNGE MOTOR TRAINING SCHOOL)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    5th Feb
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <img
                  alt="Article"
                  src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/placeholder/landscape.png"
                  className="w-full h-32 object-cover rounded-t-xl"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1">
                    4D, JODHPUR PARK
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    3 BHK Apartment
                  </p>
                  <p className="text-xs text-muted-foreground">
                    3rd March
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}
      <section className="py-16 bg-gradient-to-br from-pink-50 to-pink-100 full-width-element">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden border-0 shadow-2xl">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-12 flex flex-col justify-center">
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-2">
                      SELL OR RENT YOUR PROPERTY
                    </p>
                    <h2
                      className="font-heading text-4xl font-bold tracking-tight mb-4"
                    >
                      Register to post your property for
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Post your residential / commercial property
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-8 mb-8">
                    <div className="text-center">
                      <h3 className="text-3xl font-bold text-primary mb-1">
                        10L+
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Property Listings
                      </p>
                    </div>
                    <div className="text-center">
                      <h3 className="text-3xl font-bold text-primary mb-1">
                        45L+
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Monthly Searches
                      </p>
                    </div>
                    <div className="text-center">
                      <h3 className="text-3xl font-bold text-primary mb-1">
                        2L+
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Owner advertise monthly
                      </p>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="w-fit mb-4 shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-primary/90"
                  >
                    Post your property for free
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Or post via{" "}
                    <Icon icon="solar:phone-bold" className="size-4 inline" /> Whatsapp
                    send a 'hi' to +91 7428887036
                  </p>
                </div>
                <div className="relative h-full min-h-[25rem]">
                  <img
                    alt="Happy Couple"
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
        className="py-16 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 full-width-element"
      >
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="font-heading text-3xl font-semibold tracking-tight mb-2">
              Explore our services
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow bg-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <img
                    alt="Commercial Property"
                    src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/commercial-listings/square/1.webp"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Buying a commercial property
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Shops, offices, land, factories, warehouses and more
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow bg-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <img
                    alt="Leasing Property"
                    src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/commercial-listings/square/2.webp"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Leasing a commercial property
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Shops, offices, land, factories, warehouses and more
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow bg-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <img
                    alt="Plot/Land"
                    src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/4.webp"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Buy Plot/Land
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Residential plots, agricultural land, farm lands, etc. Lands and more
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow bg-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <img
                    alt="Renting Home"
                    src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/1.webp"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Renting a home
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Apartments, builder floors, villas and more
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow bg-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <img
                    alt="PG Co-living"
                    src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/square/3.webp"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      PG and co-living
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Organised, owner and broker listed PGs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="font-heading text-3xl font-semibold tracking-tight mb-2">
              Top Localities in Bangalore
            </h2>
            <div className="flex gap-6 mb-6">
              <Button
                variant="ghost"
                className="text-primary border-b-2 border-primary rounded-none"
              >
                Buy
              </Button>
              <Button variant="ghost" className="text-muted-foreground">
                Rent / Lease
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">
                New Projects in Top Localities of Bangalore
              </h3>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  New Projects in Whitefield
                </a>
                <a
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  New Projects in Devanahalli
                </a>
                <a
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  New Projects in Sarjapur Road
                </a>
                <a
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  View 14 More
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">
                Flats in Top Localities of Bangalore
              </h3>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  Flats for sale in Whitefield
                </a>
                <a
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  Flats for sale in Sarjapur Road
                </a>
                <a
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  Flats for sale in Marathahalli
                </a>
                <a
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  View 14 More
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">
                House in Top Localities of Bangalore
              </h3>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  Houses for sale in Whitefield
                </a>
                <a
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  Houses for sale in Marathahalli
                </a>
                <a
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-primary"
                >
                  Houses for sale in Sarjapur Road
                </a>
                <a
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
      <footer className="bg-slate-900 text-white py-16 full-width-element">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4 text-white">PropPuzzle</h3>
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
                <p className="text-sm text-gray-300">Email - feedback@PropPuzzle.com</p>
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
