import React, { useState } from 'react';
import { Property } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Separator } from '@/shared/components/ui/separator';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Calendar, 
  User, 
  Building, 
  MapPin, 
  Clock,
  Star,
  Send,
  CheckCircle
} from 'lucide-react';
import { formatDate } from '../../utils/propertyFormatters';

export interface PropertyContactProps {
  property: Property;
  onContact?: (type: 'call' | 'email' | 'message', data?: any) => void;
  onScheduleVisit?: (data: any) => void;
  showContactForm?: boolean;
  className?: string;
}

export const PropertyContact: React.FC<PropertyContactProps> = ({
  property,
  onContact,
  onScheduleVisit,
  showContactForm = true,
  className = ''
}) => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    visitDate: '',
    visitTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (onContact) {
        await onContact('message', {
          propertyId: property.id,
          ...contactForm
        });
      }
      setSubmitSuccess(true);
      setContactForm({
        name: '',
        email: '',
        phone: '',
        message: '',
        visitDate: '',
        visitTime: ''
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleVisit = async () => {
    if (!contactForm.visitDate || !contactForm.visitTime) {
      alert('Please select a date and time for the visit');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onScheduleVisit) {
        await onScheduleVisit({
          propertyId: property.id,
          ...contactForm
        });
      }
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Failed to schedule visit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickContact = (type: 'call' | 'email' | 'message') => {
    if (onContact) {
      onContact(type, { propertyId: property.id });
    }
  };

  // Get contact information
  const agent = property.agent;
  const owner = property.owner;
  const contactPerson = agent || owner;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Contact Person Information */}
      {contactPerson && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage 
                  src={contactPerson.avatar || contactPerson.profile_image} 
                  alt={contactPerson.name || contactPerson.full_name}
                />
                <AvatarFallback>
                  {(contactPerson.name || contactPerson.full_name || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {contactPerson.name || contactPerson.full_name || 'Property Contact'}
                  </h3>
                  {agent && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Agent
                    </Badge>
                  )}
                  {owner && !agent && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Owner
                    </Badge>
                  )}
                </div>

                {contactPerson.title && (
                  <p className="text-gray-600 mb-2">{contactPerson.title}</p>
                )}

                {contactPerson.company && (
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Building className="h-4 w-4" />
                    <span>{contactPerson.company}</span>
                  </div>
                )}

                {contactPerson.location && (
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin className="h-4 w-4" />
                    <span>{contactPerson.location}</span>
                  </div>
                )}

                {/* Contact Rating */}
                {contactPerson.rating && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{contactPerson.rating}</span>
                    </div>
                    {contactPerson.reviewCount && (
                      <span className="text-gray-600 text-sm">
                        ({contactPerson.reviewCount} reviews)
                      </span>
                    )}
                  </div>
                )}

                {/* Quick Contact Actions */}
                <div className="flex flex-wrap gap-2">
                  {contactPerson.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickContact('call')}
                      className="flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </Button>
                  )}

                  {contactPerson.email && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickContact('email')}
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickContact('message')}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </Button>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <Separator className="my-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contactPerson.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-600">Phone</div>
                    <div className="font-medium">{contactPerson.phone}</div>
                  </div>
                </div>
              )}

              {contactPerson.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-medium">{contactPerson.email}</div>
                  </div>
                </div>
              )}

              {contactPerson.workingHours && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-600">Working Hours</div>
                    <div className="font-medium">{contactPerson.workingHours}</div>
                  </div>
                </div>
              )}

              {contactPerson.experience && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-600">Experience</div>
                    <div className="font-medium">{contactPerson.experience} years</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Form */}
      {showContactForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Send Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submitSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-600">
                  Your message has been sent successfully. The property contact will get back to you soon.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSubmitSuccess(false)}
                  className="mt-4"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="I'm interested in this property. Please provide more details..."
                    rows={4}
                    required
                  />
                </div>

                {/* Schedule Visit Section */}
                <Separator />
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule a Visit (Optional)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="visitDate">Preferred Date</Label>
                      <Input
                        id="visitDate"
                        type="date"
                        value={contactForm.visitDate}
                        onChange={(e) => handleInputChange('visitDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <Label htmlFor="visitTime">Preferred Time</Label>
                      <Input
                        id="visitTime"
                        type="time"
                        value={contactForm.visitTime}
                        onChange={(e) => handleInputChange('visitTime', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 flex-1"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>

                  {(contactForm.visitDate && contactForm.visitTime) && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleScheduleVisit}
                      disabled={isSubmitting}
                      className="flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Schedule Visit
                    </Button>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Property Listing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Listing Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Property ID</span>
              <span className="font-medium">#{property.id}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Listed Date</span>
              <span className="font-medium">{formatDate(property.createdAt)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Updated</span>
              <span className="font-medium">{formatDate(property.updatedAt)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status</span>
              <Badge 
                variant={property.status === 'active' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {property.status}
              </Badge>
            </div>

            {property.stats && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {property.stats.views || 0}
                    </div>
                    <div className="text-sm text-gray-600">Views</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {property.stats.inquiries || 0}
                    </div>
                    <div className="text-sm text-gray-600">Inquiries</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">
            <strong>Disclaimer:</strong> All information provided is for informational purposes only. 
            Please verify all details with the property contact before making any decisions. 
            Property prices and availability are subject to change without notice.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};