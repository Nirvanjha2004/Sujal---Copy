import { Icon } from "@iconify/react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { useFavorites } from "@/features/buyer/hooks/useFavorites";
import { useNavigate } from "react-router-dom";
import { Property } from "@/features/property/types";
import { getContextualImage, getImageSrcSet, getImageSizes } from "@/shared/utils/imageUtils";

interface PropertyCardProps {
  property: Property;
  variant?: 'grid' | 'list';
}

export function PropertyCard({ property, variant = 'list' }: PropertyCardProps) {
  const navigate = useNavigate();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹ ${(price / 100000).toFixed(2)} Lakh`;
    } else {
      return `₹ ${price.toLocaleString()}`;
    }
  };

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      if (isFavorite(property.id)) {
        await removeFromFavorites(property.id);
      } else {
        await addToFavorites(property.id);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handlePropertyClick = () => {
    navigate(`/property/${property.id}`);
  };

  const primaryImage = property.images?.find(img => img.is_primary) || property.images?.[0];

  if (variant === 'grid') {
    return (
      <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={handlePropertyClick}>
        <div className="relative">
          <img
            src={primaryImage ? getContextualImage(primaryImage, 'grid') : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"}
            srcSet={primaryImage ? getImageSrcSet(primaryImage) : ''}
            sizes={getImageSizes('grid')}
            alt={property.title}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={handleFavoriteToggle}
          >
            <Icon
              icon={isFavorite(property.id) ? "solar:heart-bold" : "solar:heart-linear"}
              className={`size-5 ${isFavorite(property.id) ? 'text-red-500' : 'text-gray-600'}`}
            />
          </Button>
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
              {property.area_sqft || 0} sq ft | {property.bedrooms || 0} BHK | {property.bathrooms || 0} Bath
            </p>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs capitalize">
                {property.property_type}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {property.listing_type}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // List variant
  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={handlePropertyClick}>
      <div className="flex flex-col md:flex-row">
        <div className="relative md:w-64 h-48 md:h-auto">
          <img
            src={primaryImage ? getContextualImage(primaryImage, 'list') : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"}
            srcSet={primaryImage ? getImageSrcSet(primaryImage) : ''}
            sizes={getImageSizes('list')}
            alt={property.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={handleFavoriteToggle}
          >
            <Icon
              icon={isFavorite(property.id) ? "solar:heart-bold" : "solar:heart-linear"}
              className={`size-5 ${isFavorite(property.id) ? 'text-red-500' : 'text-gray-600'}`}
            />
          </Button>
        </div>
        <CardContent className="flex-1 p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-xl mb-2 line-clamp-2">{property.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon icon="solar:map-point-bold" className="size-4" />
                <span>{property.city}, {property.state}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{formatPrice(property.price)}</p>
              <p className="text-sm text-muted-foreground">
                {property.area_sqft || 0} sq ft | {property.bedrooms || 0} BHK | {property.bathrooms || 0} Bath
              </p>
              <p className="text-sm text-muted-foreground capitalize">
                {property.property_type} • {property.listing_type}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Badge variant="secondary" className="text-xs capitalize">
              {property.property_type}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {property.listing_type}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {property.status}
            </Badge>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
