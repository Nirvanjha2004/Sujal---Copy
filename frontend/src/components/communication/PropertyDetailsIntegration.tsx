import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { PropertyInquiryForm } from './PropertyInquiryForm';
import { ContactInfoDisplay } from './ContactInfoDisplay';

interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  owner: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: 'owner' | 'agent' | 'builder';
    profileImage?: string;
    isVerified?: boolean;
    responseTime?: string;
    languages?: string[];
  };
}

interface PropertyDetailsIntegrationProps {
  property: Property;
  currentUser?: {
    id: number;
    role: string;
  };
}

export const PropertyDetailsIntegration: React.FC<PropertyDetailsIntegrationProps> = ({
  property,
  currentUser,
}) => {
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

  const handleInquirySuccess = () => {
    setShowInquiryForm(false);
    // You could show a success message or redirect
    alert('Your inquiry has been sent successfully!');
  };

  const handleMessageClick = () => {
    // Navigate to messaging interface or open chat
    console.log('Opening message interface for user:', property.owner.id);
    // You could use React Router to navigate to /messages or open a modal
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Property Details */}
      <Card className="p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
          <p className="text-3xl font-bold text-green-600 mb-4">{formatPrice(property.price)}</p>
          <p className="text-gray-700">{property.description}</p>
        </div>

        {/* Contact Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={() => setShowInquiryForm(true)}
            className="flex-1"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Send Inquiry
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowContactInfo(!showContactInfo)}
            className="flex-1"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {showContactInfo ? 'Hide Contact' : 'View Contact'}
          </Button>

          {currentUser && (
            <Button
              variant="outline"
              onClick={handleMessageClick}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7-4c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
              Message
            </Button>
          )}
        </div>
      </Card>

      {/* Contact Information */}
      {showContactInfo && (
        <ContactInfoDisplay
          contactInfo={{
            name: property.owner.name,
            email: property.owner.email,
            phone: property.owner.phone,
            role: property.owner.role,
            profileImage: property.owner.profileImage,
            isVerified: property.owner.isVerified,
            responseTime: property.owner.responseTime,
            languages: property.owner.languages,
          }}
          onInquiryClick={() => setShowInquiryForm(true)}
          onMessageClick={handleMessageClick}
          showMaskedPhone={!currentUser || currentUser.id !== property.owner.id}
        />
      )}

      {/* Inquiry Form Modal */}
      {showInquiryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <PropertyInquiryForm
              propertyId={property.id}
              propertyTitle={property.title}
              onSuccess={handleInquirySuccess}
              onCancel={() => setShowInquiryForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Example usage component
export const PropertyDetailsExample: React.FC = () => {
  const mockProperty: Property = {
    id: 123,
    title: 'Beautiful 3BR Apartment in Downtown',
    description: 'Stunning apartment with modern amenities, great location, and beautiful city views. Perfect for families or professionals.',
    price: 450000,
    owner: {
      id: 456,
      name: 'Sarah Johnson',
      email: 'sarah@realestate.com',
      phone: '+1-555-0123',
      role: 'agent',
      isVerified: true,
      responseTime: '2 hours',
      languages: ['English', 'Spanish'],
    },
  };

  const mockCurrentUser = {
    id: 789,
    role: 'buyer',
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PropertyDetailsIntegration
        property={mockProperty}
        currentUser={mockCurrentUser}
      />
    </div>
  );
};