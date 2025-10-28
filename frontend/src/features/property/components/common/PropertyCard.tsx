import { Icon } from "@iconify/react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { PropertyCardSkeleton } from "@/shared/components/ui/loading-states";
import { useNavigate } from "react-router-dom";
import { Property, PropertyCardVariant } from "../../types";
import { useFavorites } from "../../contexts/FavoritesContext";
import { formatPrice, formatArea } from "../../utils/propertyHelpers";
import { cn } from "@/shared/lib/utils";

interface PropertyCardProps {
  property: Property;
  variant?: PropertyCardVariant['type'];
  showFavorite?: boolean;
  showStats?: boolean;
  showAgent?: boolean;
  showDescription?: boolean;
  onClick?: (property: Property) => void;
  className?: string;
  loading?: boolean;
}

export function PropertyCard({ 
  property, 
  variant = 'list',
  showFavorite = true,
  showStats = false,
  showAgent = false,
  showDescription = false,
  onClick,
  className,
  loading = false
}: PropertyCardProps) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();

  if (loading) {
    return <PropertyCardSkeleton variant={variant} />;
  }

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
      <Card className={cn(
        "group overflow-hidden cursor-pointer card-interactive",
        "border border-border/50 bg-card/50 backdrop-blur-sm",
        className
      )} onClick={handlePropertyClick}>
        <div className="relative overflow-hidden">
          <div className="aspect-[4/3] overflow-hidden bg-muted">
            <img
              src={getImageUrl()}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          </div>
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {showFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 size-9 bg-white/90 hover:bg-white shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-110"
              onClick={handleFavoriteToggle}
              disabled={isLoading}
            >
              <Icon 
                icon={isFavorite(property.id) ? "solar:heart-bold" : "solar:heart-linear"} 
                className={cn(
                  "size-5 transition-colors duration-200",
                  isFavorite(property.id) ? 'text-red-500' : 'text-gray-600 hover:text-red-400'
                )} 
              />
            </Button>
          )}
          
          {property.isFeatured && (
            <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md">
              <Icon icon="solar:star-bold" className="size-3 mr-1" />
              Featured
            </Badge>
          )}
          
          {/* Status badge */}
          <Badge 
            variant="secondary" 
            className="absolute bottom-3 left-3 bg-white/90 text-gray-800 shadow-md backdrop-blur-sm"
          >
            {property.status ? property.status.replace('_', ' ') : 'Available'}
          </Badge>
        </div>
        
        <CardContent className="p-5 space-y-3">
          <div>
            <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
              {property.title}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Icon icon="solar:map-point-bold" className="size-4 text-primary/70" />
              <span className="line-clamp-1">{property.city}, {property.state}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold text-primary">{formatPrice(property.price)}</p>
              {getListingType() === 'rent' && (
                <span className="text-sm text-muted-foreground">/month</span>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Icon icon="solar:home-2-bold" className="size-4" />
                <span>{formatArea(getArea())}</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon icon="solar:bed-bold" className="size-4" />
                <span>{property.bedrooms || 0} BHK</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon icon="solar:bath-bold" className="size-4" />
                <span>{property.bathrooms || 0}</span>
              </div>
            </div>
            
            {showDescription && property.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {property.description}
              </p>
            )}
            
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs capitalize font-medium">
                {getPropertyType()}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                For {getListingType()}
              </Badge>
            </div>
            
            {showStats && property.stats && (
              <div className="flex gap-4 text-xs text-muted-foreground pt-3 border-t border-border/50">
                <span className="flex items-center gap-1.5">
                  <Icon icon="solar:eye-bold" className="size-3.5" />
                  {property.stats.views} views
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon icon="solar:heart-bold" className="size-3.5" />
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
      <Card className={cn(
        "group overflow-hidden cursor-pointer hover-lift-subtle hover-border",
        "bg-card/80 backdrop-blur-sm",
        className
      )} onClick={handlePropertyClick}>
        <div className="flex">
          <div className="relative w-20 h-16 flex-shrink-0 overflow-hidden">
            <img
              src={getImageUrl()}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            {property.isFeatured && (
              <div className="absolute top-1 left-1">
                <Icon icon="solar:star-bold" className="size-3 text-yellow-500" />
              </div>
            )}
          </div>
          
          <CardContent className="flex-1 p-3 min-w-0">
            <h4 className="font-medium text-sm line-clamp-1 mb-1 group-hover:text-primary transition-colors">
              {property.title}
            </h4>
            <p className="text-sm font-semibold text-primary mb-1">{formatPrice(property.price)}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Icon icon="solar:map-point-bold" className="size-3" />
              <span className="line-clamp-1">{property.city}, {property.state}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>{property.bedrooms || 0} BHK</span>
              <span>•</span>
              <span>{formatArea(getArea())}</span>
            </div>
          </CardContent>
          
          {showFavorite && (
            <div className="p-2 flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 hover:bg-primary/10 transition-colors"
                onClick={handleFavoriteToggle}
                disabled={isLoading}
              >
                <Icon 
                  icon={isFavorite(property.id) ? "solar:heart-bold" : "solar:heart-linear"} 
                  className={cn(
                    "size-4 transition-colors",
                    isFavorite(property.id) ? 'text-red-500' : 'text-gray-600 hover:text-red-400'
                  )} 
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
    <Card className={cn(
      "group overflow-hidden cursor-pointer card-interactive",
      "border border-border/50 bg-card/80 backdrop-blur-sm",
      className
    )} onClick={handlePropertyClick}>
      <div className="flex flex-col lg:flex-row">
        <div className="relative lg:w-80 h-56 lg:h-48 flex-shrink-0 overflow-hidden">
          <img
            src={getImageUrl()}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {showFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 size-10 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110"
              onClick={handleFavoriteToggle}
              disabled={isLoading}
            >
              <Icon 
                icon={isFavorite(property.id) ? "solar:heart-bold" : "solar:heart-linear"} 
                className={cn(
                  "size-5 transition-colors duration-200",
                  isFavorite(property.id) ? 'text-red-500' : 'text-gray-600 hover:text-red-400'
                )} 
              />
            </Button>
          )}
          
          {property.isFeatured && (
            <Badge className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">
              <Icon icon="solar:star-bold" className="size-3 mr-1" />
              Featured
            </Badge>
          )}
          
          {/* Status badge */}
          <Badge 
            variant="secondary" 
            className="absolute bottom-3 left-3 bg-white/90 text-gray-800 shadow-md backdrop-blur-sm"
          >
            {property.status ? property.status.replace('_', ' ') : 'Available'}
          </Badge>
        </div>
        
        <CardContent className="flex-1 p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-xl lg:text-2xl mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-200 leading-tight">
                  {property.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Icon icon="solar:map-point-bold" className="size-4 text-primary/70" />
                  <span>{property.city}, {property.state}</span>
                </div>
              </div>
              
              {showDescription && property.description && (
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {property.description}
                </p>
              )}
              
              {showAgent && property.agent && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon icon="solar:user-bold" className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{property.agent.name}</p>
                    <p className="text-xs text-muted-foreground">Agent</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="lg:text-right space-y-3 lg:min-w-[200px]">
              <div>
                <p className="text-2xl lg:text-3xl font-bold text-primary">{formatPrice(property.price)}</p>
                {getListingType() === 'rent' && (
                  <p className="text-sm text-muted-foreground">/month</p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex lg:justify-end items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Icon icon="solar:home-2-bold" className="size-4" />
                    <span>{formatArea(getArea())}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon icon="solar:bed-bold" className="size-4" />
                    <span>{property.bedrooms || 0} BHK</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon icon="solar:bath-bold" className="size-4" />
                    <span>{property.bathrooms || 0}</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground capitalize lg:text-right">
                  {getPropertyType()} • For {getListingType()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-6 pt-6 border-t border-border/50">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs capitalize font-medium">
                {getPropertyType()}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                For {getListingType()}
              </Badge>
              {property.status && (
                <Badge 
                  variant={property.status === 'active' ? 'default' : 'secondary'} 
                  className="text-xs capitalize"
                >
                  {property.status.replace('_', ' ')}
                </Badge>
              )}
            </div>
            
            {showStats && property.stats && (
              <div className="flex gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Icon icon="solar:eye-bold" className="size-4" />
                  <span>{property.stats.views} views</span>
                </span>
                <span className="flex items-center gap-2">
                  <Icon icon="solar:heart-bold" className="size-4" />
                  <span>{property.stats.favorites}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Icon icon="solar:chat-round-dots-bold" className="size-4" />
                  <span>{property.stats.inquiries}</span>
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}