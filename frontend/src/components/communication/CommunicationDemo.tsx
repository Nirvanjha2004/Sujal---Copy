import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { PropertyInquiryForm } from './PropertyInquiryForm';
import { ContactInfoDisplay } from './ContactInfoDisplay';
import { InquiryList } from './InquiryList';
import { MessagingInterface } from './MessagingInterface';
import { CommunicationPage } from './CommunicationPage';

export const CommunicationDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string>('overview');
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  // Mock data for demonstration
  const mockUser = {
    id: 1,
    role: 'buyer' as const,
    name: 'John Doe',
    email: 'john@example.com',
  };

  const mockContactInfo = {
    name: 'Sarah Johnson',
    email: 'sarah@realestate.com',
    phone: '+1-555-0123',
    role: 'agent' as const,
    isVerified: true,
    responseTime: '2 hours',
    languages: ['English', 'Spanish'],
  };

  const mockProperty = {
    id: 123,
    title: 'Beautiful 3BR Apartment in Downtown',
  };

  const renderDemo = () => {
    switch (activeDemo) {
      case 'overview':
        return (
          <CommunicationPage currentUser={mockUser} />
        );

      case 'inquiry-form':
        return (
          <div className="max-w-2xl mx-auto">
            <PropertyInquiryForm
              propertyId={mockProperty.id}
              propertyTitle={mockProperty.title}
              onSuccess={() => alert('Inquiry sent successfully!')}
              onCancel={() => setShowInquiryForm(false)}
            />
          </div>
        );

      case 'contact-info':
        return (
          <div className="max-w-2xl mx-auto">
            <ContactInfoDisplay
              contactInfo={mockContactInfo}
              propertyId={mockProperty.id}
              propertyTitle={mockProperty.title}
              onInquiryClick={() => setShowInquiryForm(true)}
              onMessageClick={() => alert('Opening message interface...')}
              showMaskedPhone={true}
            />
          </div>
        );

      case 'inquiry-list':
        return (
          <div className="max-w-4xl mx-auto">
            <InquiryList
              userRole="owner"
              onInquiryClick={(inquiry) => alert(`Viewing inquiry: ${inquiry.id}`)}
            />
          </div>
        );

      case 'messaging':
        return (
          <div className="max-w-6xl mx-auto">
            <MessagingInterface
              currentUserId={mockUser.id}
              selectedConversationId={undefined}
              onConversationSelect={(id) => console.log('Selected conversation:', id)}
            />
          </div>
        );

      default:
        return <div>Select a demo from the navigation</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Communication Interface Demo</h1>
            <div className="flex space-x-2">
              <Button
                variant={activeDemo === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveDemo('overview')}
              >
                Overview
              </Button>
              <Button
                variant={activeDemo === 'inquiry-form' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveDemo('inquiry-form')}
              >
                Inquiry Form
              </Button>
              <Button
                variant={activeDemo === 'contact-info' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveDemo('contact-info')}
              >
                Contact Info
              </Button>
              <Button
                variant={activeDemo === 'inquiry-list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveDemo('inquiry-list')}
              >
                Inquiry List
              </Button>
              <Button
                variant={activeDemo === 'messaging' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveDemo('messaging')}
              >
                Messaging
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDemo()}
      </div>

      {/* Inquiry Form Modal */}
      {showInquiryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full">
            <PropertyInquiryForm
              propertyId={mockProperty.id}
              propertyTitle={mockProperty.title}
              onSuccess={() => {
                alert('Inquiry sent successfully!');
                setShowInquiryForm(false);
              }}
              onCancel={() => setShowInquiryForm(false)}
            />
          </div>
        </div>
      )}

      {/* Demo Info */}
      <div className="fixed bottom-4 right-4">
        <Card className="p-4 max-w-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Demo Features</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Property inquiry forms</li>
            <li>• Contact information display</li>
            <li>• Inquiry history and tracking</li>
            <li>• In-app messaging interface</li>
            <li>• Status indicators and badges</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};