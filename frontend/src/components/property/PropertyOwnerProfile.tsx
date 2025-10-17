import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User } from "@/shared/lib/api";

interface PropertyOwnerProfileProps {
  owner: User;
  propertyCount?: number;
  showContactButton?: boolean;
  onContact?: () => void;
}

export function PropertyOwnerProfile({ 
  owner, 
  propertyCount = 0, 
  showContactButton = true,
  onContact 
}: PropertyOwnerProfileProps) {
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'agent': return 'Real Estate Agent';
      case 'builder': return 'Builder/Developer';
      case 'owner': return 'Property Owner';
      default: return 'Property Professional';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'agent': return 'solar:user-speak-bold';
      case 'builder': return 'solar:buildings-bold';
      case 'owner': return 'solar:home-bold';
      default: return 'solar:user-bold';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'agent': return 'bg-blue-100 text-blue-800';
      case 'builder': return 'bg-purple-100 text-purple-800';
      case 'owner': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon icon="solar:user-bold" className="size-5" />
          Property Contact
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Owner Avatar and Basic Info */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {owner.avatar ? (
                <img
                  src={owner.avatar}
                  alt={`${owner.firstName} ${owner.lastName}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <Icon 
                  icon={getRoleIcon(owner.role)} 
                  className="size-8 text-primary" 
                />
              )}
            </div>
            {/* Verification Badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Icon icon="solar:check-circle-bold" className="size-4 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              {owner.firstName} {owner.lastName}
            </h3>
            <Badge className={`text-xs ${getRoleBadgeColor(owner.role)}`}>
              {getRoleDisplayName(owner.role)}
            </Badge>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Icon icon="solar:calendar-bold" className="size-4" />
                <span>Member since {new Date(owner.created_at).getFullYear()}</span>
              </div>
              {propertyCount > 0 && (
                <div className="flex items-center gap-1">
                  <Icon icon="solar:home-bold" className="size-4" />
                  <span>{propertyCount} properties</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Contact Information */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Contact Information</h4>
          
          {owner.phone && (
            <div className="flex items-center gap-3">
              <Icon icon="solar:phone-bold" className="size-4 text-muted-foreground" />
              <span className="text-sm">{owner.phone}</span>
              <Button size="sm" variant="outline" className="ml-auto">
                <Icon icon="solar:phone-calling-bold" className="size-4" />
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <Icon icon="solar:letter-bold" className="size-4 text-muted-foreground" />
            <span className="text-sm">{owner.email}</span>
            <Button size="sm" variant="outline" className="ml-auto">
              <Icon icon="solar:letter-bold" className="size-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Professional Details for Agents/Builders */}
        {(owner.role === 'agent' || owner.role === 'builder') && (
          <>
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Professional Details</h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Experience</span>
                  <div className="font-medium">5+ Years</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Specialization</span>
                  <div className="font-medium">
                    {owner.role === 'agent' ? 'Residential Sales' : 'Luxury Homes'}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Rating</span>
                  <div className="flex items-center gap-1">
                    <Icon icon="solar:star-bold" className="size-4 text-yellow-500" />
                    <span className="font-medium">4.8</span>
                    <span className="text-muted-foreground">(24 reviews)</span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Response Time</span>
                  <div className="font-medium">Within 2 hours</div>
                </div>
              </div>
            </div>

            <Separator />
          </>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {showContactButton && (
            <Button 
              className="w-full" 
              onClick={onContact}
            >
              <Icon icon="solar:chat-round-bold" className="size-4 mr-2" />
              Contact {owner.role === 'agent' ? 'Agent' : owner.role === 'builder' ? 'Builder' : 'Owner'}
            </Button>
          )}
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              <Icon icon="solar:phone-calling-bold" className="size-4 mr-2" />
              Call Now
            </Button>
            <Button variant="outline" size="sm">
              <Icon icon="solar:chat-round-bold" className="size-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Icon icon="solar:shield-check-bold" className="size-4 text-green-600" />
            <span className="text-sm font-medium">Verified Professional</span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Icon icon="solar:check-circle-bold" className="size-3 text-green-600" />
              <span>Identity Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="solar:check-circle-bold" className="size-3 text-green-600" />
              <span>Phone Number Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="solar:check-circle-bold" className="size-3 text-green-600" />
              <span>Email Verified</span>
            </div>
            {(owner.role === 'agent' || owner.role === 'builder') && (
              <div className="flex items-center gap-2">
                <Icon icon="solar:check-circle-bold" className="size-3 text-green-600" />
                <span>Professional License Verified</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats for Professionals */}
        {(owner.role === 'agent' || owner.role === 'builder') && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-primary/5 rounded-lg p-2">
              <div className="text-lg font-bold text-primary">{propertyCount}</div>
              <div className="text-xs text-muted-foreground">Active Listings</div>
            </div>
            <div className="bg-green-50 rounded-lg p-2">
              <div className="text-lg font-bold text-green-600">24</div>
              <div className="text-xs text-muted-foreground">Deals Closed</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-2">
              <div className="text-lg font-bold text-blue-600">98%</div>
              <div className="text-xs text-muted-foreground">Client Satisfaction</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}