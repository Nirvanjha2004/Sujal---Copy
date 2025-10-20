import React from 'react';
import { Property } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

import { Separator } from '@/shared/components/ui/separator';
import { 
  Wifi, 
  Car, 
  Shield, 
  Waves, 
  Dumbbell, 
  Trees, 
  Zap, 
  Droplets, 
  Wind, 
  Camera,
  Home,
  Building,

  CheckCircle,
  XCircle,
  Star
} from 'lucide-react';
import { formatAmenities } from '../../utils/propertyHelpers';


export interface PropertyFeaturesProps {
  property: Property;
  className?: string;
}

export const PropertyFeatures: React.FC<PropertyFeaturesProps> = ({
  property,
  className = ''
}) => {
  // Get amenities in array format
  const amenitiesList = formatAmenities(property.amenities);
  
  // Get amenity icon based on name
  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    
    if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) return Wifi;
    if (lowerAmenity.includes('parking') || lowerAmenity.includes('garage')) return Car;
    if (lowerAmenity.includes('security') || lowerAmenity.includes('guard')) return Shield;
    if (lowerAmenity.includes('pool') || lowerAmenity.includes('swimming')) return Waves;
    if (lowerAmenity.includes('gym') || lowerAmenity.includes('fitness')) return Dumbbell;
    if (lowerAmenity.includes('garden') || lowerAmenity.includes('park')) return Trees;
    if (lowerAmenity.includes('power') || lowerAmenity.includes('backup')) return Zap;
    if (lowerAmenity.includes('water') || lowerAmenity.includes('supply')) return Droplets;
    if (lowerAmenity.includes('ac') || lowerAmenity.includes('air')) return Wind;
    if (lowerAmenity.includes('cctv') || lowerAmenity.includes('camera')) return Camera;
    
    return Home; // Default icon
  };

  // Group amenities by category
  const groupAmenitiesByCategory = (amenities: string[]) => {
    const categories = {
      'Basic Amenities': [] as string[],
      'Security & Safety': [] as string[],
      'Recreational': [] as string[],
      'Utilities': [] as string[],
      'Other': [] as string[]
    };

    amenities.forEach(amenity => {
      const lowerAmenity = amenity.toLowerCase();
      
      if (lowerAmenity.includes('security') || lowerAmenity.includes('guard') || 
          lowerAmenity.includes('cctv') || lowerAmenity.includes('camera') ||
          lowerAmenity.includes('fire') || lowerAmenity.includes('safety')) {
        categories['Security & Safety'].push(amenity);
      } else if (lowerAmenity.includes('pool') || lowerAmenity.includes('gym') || 
                 lowerAmenity.includes('garden') || lowerAmenity.includes('park') ||
                 lowerAmenity.includes('club') || lowerAmenity.includes('sports')) {
        categories['Recreational'].push(amenity);
      } else if (lowerAmenity.includes('power') || lowerAmenity.includes('water') || 
                 lowerAmenity.includes('wifi') || lowerAmenity.includes('internet') ||
                 lowerAmenity.includes('gas') || lowerAmenity.includes('electricity')) {
        categories['Utilities'].push(amenity);
      } else if (lowerAmenity.includes('parking') || lowerAmenity.includes('elevator') || 
                 lowerAmenity.includes('lift') || lowerAmenity.includes('ac') ||
                 lowerAmenity.includes('furnished') || lowerAmenity.includes('balcony')) {
        categories['Basic Amenities'].push(amenity);
      } else {
        categories['Other'].push(amenity);
      }
    });

    // Remove empty categories
    return Object.entries(categories).filter(([_, items]) => items.length > 0);
  };

  const categorizedAmenities = groupAmenitiesByCategory(amenitiesList);

  // Property specifications from the property object
  const specifications = property.specifications || {};
  
  // Common property features to check
  const commonFeatures = [
    { key: 'furnished', label: 'Furnished', icon: Home },
    { key: 'balcony', label: 'Balcony', icon: Building },
    { key: 'terrace', label: 'Terrace', icon: Building },
    { key: 'garden', label: 'Garden', icon: Trees },
    { key: 'parking', label: 'Parking', icon: Car },
    { key: 'elevator', label: 'Elevator', icon: Building },
    { key: 'powerBackup', label: 'Power Backup', icon: Zap },
    { key: 'waterSupply', label: '24/7 Water Supply', icon: Droplets },
    { key: 'security', label: '24/7 Security', icon: Shield },
    { key: 'gatedCommunity', label: 'Gated Community', icon: Shield }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Property Features */}
      {property.features && property.features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Property Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {property.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {feature.isAvailable ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{feature.name}</div>
                    {feature.category && (
                      <div className="text-sm text-gray-600">{feature.category}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Common Features Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Property Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commonFeatures.map((feature) => {
              const IconComponent = feature.icon;
              const isAvailable = specifications[feature.key] || 
                                amenitiesList.some(amenity => 
                                  amenity.toLowerCase().includes(feature.label.toLowerCase().split(' ')[0])
                                );
              
              return (
                <div key={feature.key} className="flex items-center gap-3 p-3 rounded-lg border">
                  <IconComponent className="h-5 w-5 text-gray-600 flex-shrink-0" />
                  <span className="font-medium text-gray-900 flex-1">{feature.label}</span>
                  {isAvailable ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Amenities by Category */}
      {categorizedAmenities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Amenities & Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {categorizedAmenities.map(([category, amenities], categoryIndex) => (
                <div key={category}>
                  <h4 className="font-semibold text-gray-900 mb-3">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {amenities.map((amenity, index) => {
                      const IconComponent = getAmenityIcon(amenity);
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <IconComponent className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <span className="text-gray-900 font-medium">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                  {categoryIndex < categorizedAmenities.length - 1 && (
                    <Separator className="mt-6" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Amenities (if no categorization) */}
      {categorizedAmenities.length === 0 && amenitiesList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Amenities & Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {amenitiesList.map((amenity, index) => {
                const IconComponent = getAmenityIcon(amenity);
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <IconComponent className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-900 font-medium">{amenity}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Specifications */}
      {Object.keys(specifications).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                  <span className="text-gray-900 font-semibold">
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Features Message */}
      {amenitiesList.length === 0 && (!property.features || property.features.length === 0) && Object.keys(specifications).length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Features Listed</h3>
            <p className="text-gray-600">
              No specific features or amenities have been listed for this property yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};