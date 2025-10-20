import React, { useState } from 'react';
import { Property } from '../../types';
import { PropertyOverview } from './PropertyOverview.tsx';
import { PropertyFeatures } from './PropertyFeatures.tsx';
import { PropertyContact } from './PropertyContact.tsx';
import { PropertyGallery } from '../common/PropertyGallery';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { 
  Heart, 
  Share2, 
  MapPin, 
  Calendar, 
  Eye, 
  Phone, 
  Mail, 
  MessageCircle,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { usePropertyFavorites } from '../../hooks/usePropertyFavorites';
import { formatIndianNumber as formatPrice, formatArea, formatDate } from '../../utils/propertyFormatters';

export interface PropertyDetailsProps {
  property: Property;
  onBack?: () => void;
  onShare?: () => void;
  onContact?: (type: 'call' | 'email' | 'message') => void;
  onScheduleVisit?: () => void;
  onViewMap?: () => void;
  showBackButton?: boolean;
  showContactForm?: boolean;
  className?: string;
}

export const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  property,
  onBack,
  onShare,
  onContact,
  onScheduleVisit,
  onViewMap,
  showBackButton = true,
  showContactForm = true,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { isFavorite, toggleFavorite, isLoading: favoriteLoading } = usePropertyFavorites();

  const handleFavoriteToggle = async () => {
    try {
      await toggleFavorite(property.id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // Default share functionality
      if (navigator.share) {
        navigator.share({
          title: property.title,
          text: `Check out this ${property.propertyType} for ${property.listingType}`,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        {showBackButton && onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Results
          </Button>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFavoriteToggle}
            disabled={favoriteLoading}
            className="flex items-center gap-2"
          >
            <Heart 
              className={`h-4 w-4 ${isFavorite(property.id) ? 'fill-red-500 text-red-500' : ''}`} 
            />
            {isFavorite(property.id) ? 'Saved' : 'Save'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>

          {onViewMap && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewMap}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View on Map
            </Button>
          )}
        </div>
      </div>

      {/* Property Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={property.listingType === 'sale' ? 'default' : 'secondary'}>
                  For {property.listingType === 'sale' ? 'Sale' : 'Rent'}
                </Badge>
                <Badge variant="outline">
                  {property.propertyType}
                </Badge>
                {property.isFeatured && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Featured
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {property.title}
              </h1>

              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.location?.address || property.address}, {property.city}, {property.state}</span>
              </div>

              <div className="text-3xl font-bold text-blue-600 mb-4">
                {formatPrice(property.price)}
                {property.listingType === 'rent' && <span className="text-lg text-gray-600">/month</span>}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {property.area && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{formatArea(property.area)}</span>
                  </div>
                )}
                {property.bedrooms && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{property.bedrooms} Bedrooms</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{property.bathrooms} Bathrooms</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Listed {formatDate(property.createdAt)}</span>
                </div>
                {property.stats?.views && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{property.stats.views} views</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-3 lg:w-64">
              {onContact && (
                <>
                  <Button
                    onClick={() => onContact('call')}
                    className="flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Call Now
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => onContact('message')}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Send Message
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => onContact('email')}
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email Inquiry
                  </Button>
                </>
              )}

              {onScheduleVisit && (
                <Button
                  variant="outline"
                  onClick={onScheduleVisit}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Schedule Visit
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Gallery */}
      {property.images && property.images.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <PropertyGallery
              images={property.images}
              title={property.title}
              className="rounded-lg overflow-hidden"
            />
          </CardContent>
        </Card>
      )}

      {/* Property Details Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features & Amenities</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <PropertyOverview property={property} />
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <PropertyFeatures property={property} />
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <PropertyContact 
            property={property} 
            onContact={onContact}
            onScheduleVisit={onScheduleVisit}
            showContactForm={showContactForm}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};