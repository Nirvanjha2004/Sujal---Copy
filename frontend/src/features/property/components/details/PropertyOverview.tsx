import React from 'react';
import { Property } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { 
  Home, 
  MapPin, 
  Calendar, 
  User, 
  Building, 
  Ruler, 
  Bed, 
  Bath, 
  Car,
  TrendingUp
} from 'lucide-react';
import { formatIndianNumber as formatPrice, formatArea, formatDate } from '../../utils/propertyFormatters';

export interface PropertyOverviewProps {
  property: Property;
  className?: string;
}

export const PropertyOverview: React.FC<PropertyOverviewProps> = ({
  property,
  className = ''
}) => {
  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'apartment':
        return Building;
      case 'house':
      case 'villa':
        return Home;
      default:
        return Home;
    }
  };

  const PropertyTypeIcon = getPropertyTypeIcon(property.property_type);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            {property.description || 'No description available for this property.'}
          </p>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <PropertyTypeIcon className="h-4 w-4" />
                    <span>Property Type</span>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {property.property_type}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>Listing Type</span>
                  </div>
                  <Badge variant={property.listing_type === 'sale' ? 'default' : 'secondary'}>
                    For {property.listing_type === 'sale' ? 'Sale' : 'Rent'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>Price</span>
                  </div>
                  <span className="font-semibold text-blue-600">
                    {formatPrice(property.price)}
                    {property.listing_type === 'rent' && '/month'}
                  </span>
                </div>

                {property.area_sqft && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Ruler className="h-4 w-4" />
                      <span>Area</span>
                    </div>
                    <span className="font-medium">{formatArea(property.area_sqft)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>Status</span>
                  </div>
                  <Badge 
                    variant={property.status === 'active' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {property.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Room Details */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 mb-3">Room Details</h4>
              
              <div className="space-y-3">
                {property.bedrooms && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Bed className="h-4 w-4" />
                      <span>Bedrooms</span>
                    </div>
                    <span className="font-medium">{property.bedrooms}</span>
                  </div>
                )}

                {property.bathrooms && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Bath className="h-4 w-4" />
                      <span>Bathrooms</span>
                    </div>
                    <span className="font-medium">{property.bathrooms}</span>
                  </div>
                )}

                {/* Parking - derived from amenities */}
                {Array.isArray(property.amenities) && property.amenities.includes('Parking') && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Car className="h-4 w-4" />
                      <span>Parking</span>
                    </div>
                    <span className="font-medium">Available</span>
                  </div>
                )}

                {property.is_featured && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>Featured Property</span>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Yes
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Address</label>
              <p className="text-gray-900">
                {property.address}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">City</label>
                <p className="text-gray-900">{property.city}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">State</label>
                <p className="text-gray-900">{property.state}</p>
              </div>

              {property.postal_code && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Postal Code</label>
                  <p className="text-gray-900">{property.postal_code}</p>
                </div>
              )}
            </div>

            {(property.latitude && property.longitude) && (
              <div className="pt-2">
                <label className="text-sm font-medium text-gray-600">Coordinates</label>
                <p className="text-gray-900 text-sm">
                  {property.latitude}, {property.longitude}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>



      {/* Property History */}
      <Card>
        <CardHeader>
          <CardTitle>Property History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Listed Date</span>
              </div>
              <span className="font-medium">{formatDate(property.created_at)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Last Updated</span>
              </div>
              <span className="font-medium">{formatDate(property.updated_at)}</span>
            </div>

            {property.owner && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="h-4 w-4" />
                    <span>Listed By</span>
                  </div>
                  <span className="font-medium">
                    {property.owner.name || 'Property Owner'}
                  </span>
                </div>
              </>
            )}


          </div>
        </CardContent>
      </Card>
    </div>
  );
};