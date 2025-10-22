import { Icon } from "@iconify/react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Property, PropertyCardVariant } from "../../types";
import { useFavorites } from "../../contexts/FavoritesContext";
import { formatPrice, formatArea } from "../../utils/propertyHelpers";

interface PropertyCardProps {
  property: Property;
  variant?: PropertyCardVariant['type'];
  showFavorite?: boolean;
  showStats?: boolean;
  showAgent?: boolean;
  showDescription?: boolean;
  onClick?: (property: Property) => void;
}

export function PropertyCard({ 
  property, 
  variant = 'list',
  showFavorite = true,
  showStats = false,
  showAgent = false,
  showDescription = false,
  onClick
}: PropertyCardProps) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();
  const isPropertyFavorite = isFavorite(property.id);

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await toggleFavorite(property.id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handlePropertyClick = () => {
    if (onClick) {
      onClick(property);
    } else {
      navigate(`/property/${property.id}`);
    }
  };

  const getImageUrl = () => {
    const primaryImage = property.images?.find(img => img.isPrimary || img.is_primary);
    const firstImage = property.images?.[0];
    return primaryImage?.url || primaryImage?.image_url || 
           firstImage?.url || firstImage?.image_url ||
           "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";
  };

  const getPropertyType = () => property.propertyType || property.property_type || 'apartment';
  const getListingType = () => property.listingType || property.listing_type || 'sale';
  const getArea = () => property.area || property.areaSqft || property.area_sqft || 0;

  if (variant === 'grid') {
    return (
      <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group" onClick={handlePropertyClick}>
        <div className="relative">
          <img
            src={getImageUrl()}
            alt={property.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {showFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              onClick={handleFavoriteToggle}
              disabled={isLoading}
            >
              <Icon 
                icon={isFavorite(property.id) ? "solar:heart-bold" : "solar:heart-linear"} 
                className={`size-5 ${isFavorite(property.id) ? 'text-red-500' : 'text-gray-600'}`} 
              />
            </Button>
          )}
          {property.isFeatured && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-50">
              Featured
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="mb-2">
            <h3 className="font-semibold text-lg mb-1 line-clamp-1">{property.title}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Icon icon="solar:map-point-bold" className="size-4" />
              <span className="line-clamp-1">{property.city}, {property.state}</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold">{formatPrice(property.price)}</p>
            <p className="text-sm text-muted-foreground">
              {formatArea(getArea())} | {property.bedrooms || 0} BHK | {property.bathrooms || 0} Bath
            </p>
            {showDescription && property.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{property.description}</p>
            )}
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs capitalize">
                {getPropertyType()}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {getListingType()}
              </Badge>
            </div>
            {showStats && property.stats && (
              <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t">
                <span className="flex items-center gap-1">
                  <Icon icon="solar:eye-bold" className="size-3" />
                  {property.stats.views}
                </span>
                <span className="flex items-center gap-1">
                  <Icon icon="solar:heart-bold" className="size-3" />
                  {property.stats.favorites}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={handlePropertyClick}>
        <div className="flex">
          <div className="relative w-24 h-20">
            <img
              src={getImageUrl()}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="flex-1 p-3">
            <h4 className="font-medium text-sm line-clamp-1 mb-1">{property.title}</h4>
            <p className="text-sm font-semibold text-primary">{formatPrice(property.price)}</p>
            <p className="text-xs text-muted-foreground">{property.city}, {property.state}</p>
          </CardContent>
          {showFavorite && (
            <div className="p-2">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={handleFavoriteToggle}
                disabled={isLoading}
              >
                <Icon 
                  icon={isFavorite(property.id) ? "solar:heart-bold" : "solar:heart-linear"} 
                  className={`size-4 ${isFavorite(property.id) ? 'text-red-500' : 'text-gray-600'}`} 
                />
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // List variant (default)
  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={handlePropertyClick}>
      <div className="flex flex-col md:flex-row">
        <div className="relative md:w-64 h-48 md:h-auto">
          <img
            src={getImageUrl()}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          {showFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              onClick={handleFavoriteToggle}
              disabled={isLoading}
            >
              <Icon 
                icon={isFavorite(property.id) ? "solar:heart-bold" : "solar:heart-linear"} 
                className={`size-5 ${isFavorite(property.id) ? 'text-red-500' : 'text-gray-600'}`} 
              />
            </Button>
          )}
          {property.isFeatured && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-50">
              Featured
            </Badge>
          )}
        </div>
        <CardContent className="flex-1 p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-xl mb-2 line-clamp-2">{property.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Icon icon="solar:map-point-bold" className="size-4" />
                <span>{property.city}, {property.state}</span>
              </div>
              {showDescription && property.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{property.description}</p>
              )}
              {showAgent && property.agent && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon icon="solar:user-bold" className="size-4" />
                  <span>{property.agent.name}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{formatPrice(property.price)}</p>
              <p className="text-sm text-muted-foreground">
                {formatArea(getArea())} | {property.bedrooms || 0} BHK | {property.bathrooms || 0} Bath
              </p>
              <p className="text-sm text-muted-foreground capitalize">
                {getPropertyType()} • {getListingType()}
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs capitalize">
                {getPropertyType()}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {getListingType()}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {property.status}
              </Badge>
            </div>
            {showStats && property.stats && (
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Icon icon="solar:eye-bold" className="size-3" />
                  {property.stats.views}
                </span>
                <span className="flex items-center gap-1">
                  <Icon icon="solar:heart-bold" className="size-3" />
                  {property.stats.favorites}
                </span>
                <span className="flex items-center gap-1">
                  <Icon icon="solar:chat-round-dots-bold" className="size-3" />
                  {property.stats.inquiries}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}