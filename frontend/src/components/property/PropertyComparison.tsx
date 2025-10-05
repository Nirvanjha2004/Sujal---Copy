import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Property {
  id: number;
  title: string;
  description: string;
  property_type: string;
  listing_type: string;
  status: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  images?: Array<{
    id: number;
    image_url: string;
    alt_text?: string;
  }>;
  created_at: string;
  amenities?: string[];
}

interface PropertyComparisonProps {
  properties: Property[];
  onRemoveProperty: (propertyId: number) => void;
  onClearAll: () => void;
}

export function PropertyComparison({ properties, onRemoveProperty, onClearAll }: PropertyComparisonProps) {
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹ ${(price / 100000).toFixed(2)} Lakh`;
    } else {
      return `₹ ${price.toLocaleString()}`;
    }
  };

  const formatPricePerSqFt = (price: number, area: number) => {
    const pricePerSqFt = price / area;
    return `₹ ${pricePerSqFt.toLocaleString()}`;
  };

  if (properties.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Icon icon="solar:scale-bold" className="size-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Properties to Compare</h3>
          <p className="text-muted-foreground">
            Add properties to your comparison list to see them side by side
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Property Comparison</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClearAll}>
            <Icon icon="solar:trash-bin-minimalistic-bold" className="size-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties && properties.map((property) => (
          <Card key={property.id} className="relative">
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
              onClick={() => onRemoveProperty(property.id)}
            >
              <Icon icon="solar:close-bold" className="size-4" />
            </Button>
            
            <div className="relative">
              <img
                src={property.images?.[0]?.image_url || "https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/photos/residential-listings/landscape/4.webp"}
                alt={property.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <Badge className="absolute bottom-2 left-2 bg-accent text-accent-foreground capitalize">
                {property.status}
              </Badge>
            </div>

            <CardContent className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-lg line-clamp-2">{property.title}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Icon icon="solar:map-point-bold" className="size-4" />
                  <span className="line-clamp-1">{property.location}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="font-bold text-lg">{formatPrice(property.price)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Price/sq ft</span>
                  <span className="font-semibold">{formatPricePerSqFt(property.price, property.area_sqft || 0)}</span>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Area</span>
                    <span className="font-medium">{property.area_sqft || 0} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bedrooms</span>
                    <span className="font-medium">{property.bedrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bathrooms</span>
                    <span className="font-medium">{property.bathrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium capitalize">{property.property_type}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <span className="text-sm text-muted-foreground mb-2 block">Listing Type</span>
                  <Badge variant="secondary" className="capitalize">
                    {property.listing_type}
                  </Badge>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground mb-2 block">Listed On</span>
                  <span className="text-sm font-medium">
                    {new Date(property.created_at).toLocaleDateString()}
                  </span>
                </div>

                {property.amenities && property.amenities.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground mb-2 block">Key Amenities</span>
                    <div className="flex flex-wrap gap-1">
                      {property.amenities.slice(0, 3).map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {property.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{property.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Button className="w-full" size="sm">
                <Icon icon="solar:eye-bold" className="size-4 mr-2" />
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Summary */}
      {properties.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Price Range</h4>
                <p className="text-sm text-muted-foreground">
                  {properties && properties.length > 0 ? `${formatPrice(Math.min(...properties.map(p => p.price)))} - ${formatPrice(Math.max(...properties.map(p => p.price)))}` : 'N/A'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Area Range</h4>
                <p className="text-sm text-muted-foreground">
                  {properties && properties.length > 0 ? `${Math.min(...properties.map(p => p.area_sqft || 0))} - ${Math.max(...properties.map(p => p.area_sqft || 0))} sq ft` : 'N/A'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Property Types</h4>
                <div className="flex flex-wrap gap-1">
                  {properties && properties.length > 0 ? [...new Set(properties.map(p => p.property_type))].map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs capitalize">
                      {type}
                    </Badge>
                  )) : null}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}