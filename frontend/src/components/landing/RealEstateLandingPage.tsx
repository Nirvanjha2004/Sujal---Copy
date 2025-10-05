import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFeaturedProperties, useRecentProperties } from "@/hooks/useProperties";
import { PropertyCardSkeleton } from "@/components/ui/loading";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RealEstateLandingPage.css";

export function RealEstateLandingPage() {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { properties: featuredProperties, loading: featuredLoading } = useFeaturedProperties(4);
  const { properties: recentProperties, loading: recentLoading } = useRecentProperties(8);
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [listingType, setListingType] = useState("buy");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (propertyType !== 'all') params.set('property_type', propertyType);
    if (listingType !== 'buy') params.set('listing_type', listingType);

    navigate(`/search?${params.toString()}`);
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
    <div className="real-estate-landing-page min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <Icon icon="solar:home-smile-bold" className="size-8" />
                <span className="text-xl font-bold">PropPortal</span>
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
                    Dashboard
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full"
                    onClick={() => navigate('/profile')}
                  >
                    <Icon icon="solar:user-bold" className="size-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-primary-foreground hover:bg-primary-foreground/10"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="shadow-lg"
                    onClick={() => navigate('/register')}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 to-secondary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Find Your Perfect Home
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover thousands of properties across India. Buy, sell, or rent with confidence.
            </p>

            {/* Search Form */}
            <Card className="p-6 shadow-xl">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by location, property name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12"
                  />
                </div>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="w-full md:w-48 h-12">
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={listingType} onValueChange={setListingType}>
                  <SelectTrigger className="w-full md:w-32 h-12">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="lg" onClick={handleSearch} className="h-12 px-8">
                  <Icon icon="solar:magnifer-bold" className="size-5 mr-2" />
                  Search
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Featured Properties
            </h2>
            <p className="text-muted-foreground">
              Handpicked properties for you
            </p>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <PropertyCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProperties && featuredProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/property/${property.id}`)}>
                  <div className="relative">
                    <img
                      src={property.images?.[0]?.image_url || '/api/placeholder/300/200'}
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                    <Badge className="absolute top-3 left-3 bg-primary">
                      Featured
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                      {property.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-2">
                      {property.city}, {property.state}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(property.price)}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon icon="solar:bed-bold" className="size-4" />
                        <span>{property.bedrooms}</span>
                        <Icon icon="solar:bath-bold" className="size-4" />
                        <span>{property.bathrooms}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => navigate('/properties')}>
              View All Properties
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Our Services
            </h2>
            <p className="text-muted-foreground">
              Everything you need for your real estate journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="solar:home-2-bold" className="size-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Buy Property</h3>
              <p className="text-muted-foreground">
                Find your dream home from thousands of verified listings
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="solar:key-bold" className="size-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rent Property</h3>
              <p className="text-muted-foreground">
                Discover rental properties that match your lifestyle
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="solar:dollar-bold" className="size-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sell Property</h3>
              <p className="text-muted-foreground">
                List your property and reach thousands of potential buyers
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Properties */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Recent Properties
            </h2>
            <p className="text-muted-foreground">
              Latest additions to our platform
            </p>
          </div>

          {recentLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <PropertyCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentProperties && recentProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/property/${property.id}`)}>
                  <div className="relative">
                    <img
                      src={property.images?.[0]?.image_url || '/api/placeholder/300/200'}
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                      {property.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-2">
                      {property.city}, {property.state}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(property.price)}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon icon="solar:bed-bold" className="size-4" />
                        <span>{property.bedrooms}</span>
                        <Icon icon="solar:bath-bold" className="size-4" />
                        <span>{property.bathrooms}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => navigate('/properties')}>
              View All Properties
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Find Your Dream Home?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers who found their perfect property with us
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate('/properties')}>
              Browse Properties
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" onClick={() => navigate('/register')}>
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Icon icon="solar:home-smile-bold" className="size-8 text-primary" />
                <span className="text-xl font-bold">PropPortal</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Your trusted partner in finding the perfect property. We make real estate simple and accessible for everyone.
              </p>
              <div className="flex gap-4">
                <Icon icon="solar:facebook-bold" className="size-5 text-muted-foreground hover:text-primary cursor-pointer" />
                <Icon icon="solar:twitter-bold" className="size-5 text-muted-foreground hover:text-primary cursor-pointer" />
                <Icon icon="solar:instagram-bold" className="size-5 text-muted-foreground hover:text-primary cursor-pointer" />
                <Icon icon="solar:linkedin-bold" className="size-5 text-muted-foreground hover:text-primary cursor-pointer" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="/properties" className="block text-muted-foreground hover:text-primary">
                  Properties
                </a>
                <a href="/search" className="block text-muted-foreground hover:text-primary">
                  Search
                </a>
                <a href="/dashboard" className="block text-muted-foreground hover:text-primary">
                  Dashboard
                </a>
                <a href="/calculators" className="block text-muted-foreground hover:text-primary">
                  Calculators
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <div className="space-y-2">
                <a href="/properties?listing_type=sale" className="block text-muted-foreground hover:text-primary">
                  Buy Property
                </a>
                <a href="/properties?listing_type=rent" className="block text-muted-foreground hover:text-primary">
                  Rent Property
                </a>
                <a href="/dashboard" className="block text-muted-foreground hover:text-primary">
                  Sell Property
                </a>
                <a href="/dashboard" className="block text-muted-foreground hover:text-primary">
                  Property Management
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  <Icon icon="solar:phone-bold" className="size-4 inline mr-2" />
                  +91 12345 67890
                </p>
                <p className="text-muted-foreground">
                  <Icon icon="solar:letter-bold" className="size-4 inline mr-2" />
                  info@propportal.com
                </p>
                <p className="text-muted-foreground">
                  <Icon icon="solar:map-point-bold" className="size-4 inline mr-2" />
                  Mumbai, India
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground">
              © 2024 PropPortal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
