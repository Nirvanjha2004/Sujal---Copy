import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  role: 'owner' | 'agent' | 'builder';
  profileImage?: string;
  isVerified?: boolean;
  responseTime?: string;
  languages?: string[];
}

interface ContactInfoDisplayProps {
  contactInfo: ContactInfo;
  propertyId?: number;
  propertyTitle?: string;
  onInquiryClick?: () => void;
  onMessageClick?: () => void;
  showMaskedPhone?: boolean;
}

export const ContactInfoDisplay: React.FC<ContactInfoDisplayProps> = ({
  contactInfo,
  onInquiryClick,
  onMessageClick,
  showMaskedPhone = false,
}) => {
  const [showFullPhone, setShowFullPhone] = useState(false);

  const maskPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 6) return phone;
    
    const firstPart = digits.slice(0, 2);
    const lastPart = digits.slice(-2);
    const middlePart = '*'.repeat(digits.length - 4);
    
    return `${firstPart}${middlePart}${lastPart}`;
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Property Owner';
      case 'agent':
        return 'Real Estate Agent';
      case 'builder':
        return 'Builder/Developer';
      default:
        return 'Contact';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-green-100 text-green-800';
      case 'agent':
        return 'bg-blue-100 text-blue-800';
      case 'builder':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const displayPhone = showMaskedPhone && !showFullPhone 
    ? maskPhoneNumber(contactInfo.phone || '') 
    : contactInfo.phone;

  return (
    <Card className="p-6">
      <div className="flex items-start space-x-4">
        {/* Profile Image */}
        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
          {contactInfo.profileImage ? (
            <img
              src={contactInfo.profileImage}
              alt={contactInfo.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <span className="text-xl font-medium text-gray-600">
              {contactInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          )}
        </div>

        {/* Contact Details */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{contactInfo.name}</h3>
            {contactInfo.isVerified && (
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-green-600 ml-1">Verified</span>
              </div>
            )}
          </div>

          <Badge className={`mb-3 ${getRoleBadgeColor(contactInfo.role)}`}>
            {getRoleLabel(contactInfo.role)}
          </Badge>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{contactInfo.email}</span>
            </div>

            {contactInfo.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{displayPhone}</span>
                {showMaskedPhone && !showFullPhone && contactInfo.phone && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowFullPhone(true)}
                    className="ml-2 p-0 h-auto text-xs text-blue-600"
                  >
                    Show full number
                  </Button>
                )}
              </div>
            )}

            {contactInfo.responseTime && (
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Typically responds within {contactInfo.responseTime}</span>
              </div>
            )}

            {contactInfo.languages && contactInfo.languages.length > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span>Speaks: {contactInfo.languages.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onInquiryClick}
              className="flex-1"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Inquiry
            </Button>
            
            {onMessageClick && (
              <Button
                variant="outline"
                onClick={onMessageClick}
                className="flex-1"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7-4c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
                Message
              </Button>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Your contact information will be shared with this {getRoleLabel(contactInfo.role).toLowerCase()} 
              when you send an inquiry.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};