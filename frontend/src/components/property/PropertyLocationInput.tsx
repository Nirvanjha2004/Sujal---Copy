import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface LocationData {
  address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
}

interface LocationInputProps {
  location: LocationData;
  onLocationChange: (location: LocationData) => void;
  errors?: Record<string, string>;
}

interface LocationSuggestion {
  id: string;
  display_name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
}

export function LocationInput({ location, onLocationChange, errors = {} }: LocationInputProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock location suggestions - In real implementation, this would call a geocoding API
  const mockSuggestions: LocationSuggestion[] = [
    {
      id: '1',
      display_name: 'Bandra West, Mumbai, Maharashtra, India',
      address: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal_code: '400050',
      latitude: 19.0596,
      longitude: 72.8295
    },
    {
      id: '2',
      display_name: 'Koramangala, Bangalore, Karnataka, India',
      address: 'Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      postal_code: '560034',
      latitude: 12.9352,
      longitude: 77.6245
    },
    {
      id: '3',
      display_name: 'Connaught Place, New Delhi, Delhi, India',
      address: 'Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      postal_code: '110001',
      latitude: 28.6315,
      longitude: 77.2167
    }
  ];

  const handleInputChange = (field: keyof LocationData, value: string) => {
    onLocationChange({ ...location, [field]: value });
  };

  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.display_name.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.city.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.state.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
      setIsSearching(false);
    }, 500);
  };

  const selectSuggestion = (suggestion: LocationSuggestion) => {
    onLocationChange({
      address: suggestion.address,
      city: suggestion.city,
      state: suggestion.state,
      postal_code: suggestion.postal_code,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude
    });
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // In real implementation, reverse geocode these coordinates
          onLocationChange({
            ...location,
            latitude,
            longitude
          });
          console.log('Current location:', { latitude, longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  useEffect(() => {
    if (searchQuery) {
      searchLocations(searchQuery);
    }
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Location Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:map-point-bold" className="size-5" />
            Location Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Search for location</Label>
            <div className="relative">
              <div className="relative">
                <Icon icon="solar:magnifer-bold" className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search for city, area, or landmark..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {isSearching && (
                  <Icon icon="solar:loading-bold" className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
                )}
              </div>
              
              {/* Location Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0"
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon icon="solar:map-point-bold" className="size-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{suggestion.display_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {suggestion.city}, {suggestion.state} - {suggestion.postal_code}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              className="flex-1"
            >
              <Icon icon="solar:gps-bold" className="size-4 mr-2" />
              Use Current Location
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setShowSuggestions(false);
              }}
            >
              <Icon icon="solar:close-bold" className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual Address Input */}
      <Card>
        <CardHeader>
          <CardTitle>Address Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Full Address *</Label>
            <Textarea
              id="address"
              placeholder="Enter complete address including building name, street, area..."
              value={location.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={errors.address ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="e.g., Mumbai"
                value={location.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                placeholder="e.g., Maharashtra"
                value={location.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className={errors.state ? 'border-red-500' : ''}
              />
              {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                placeholder="e.g., 400001"
                value={location.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
              />
            </div>
          </div>

          {/* Coordinates Display */}
          {location.latitude && location.longitude && (
            <div className="pt-4 border-t">
              <Label className="mb-2 block">Coordinates</Label>
              <div className="flex gap-4 text-sm">
                <Badge variant="outline">
                  Lat: {location.latitude.toFixed(6)}
                </Badge>
                <Badge variant="outline">
                  Lng: {location.longitude.toFixed(6)}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:map-bold" className="size-5" />
            Location Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
            {location.latitude && location.longitude ? (
              <div className="text-center text-muted-foreground">
                <Icon icon="solar:map-point-bold" className="size-12 mx-auto mb-2 text-primary" />
                <p className="font-medium">Location Selected</p>
                <p className="text-sm">
                  {location.city}, {location.state}
                </p>
                <p className="text-xs mt-1">
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </p>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Icon icon="solar:map-bold" className="size-12 mx-auto mb-2" />
                <p>Interactive Map</p>
                <p className="text-sm">Map integration coming soon</p>
                <p className="text-xs mt-1">
                  Location will be displayed here once selected
                </p>
              </div>
            )}
            
            {/* Map placeholder overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none" />
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button variant="outline" size="sm" disabled>
              <Icon icon="solar:maximize-bold" className="size-4 mr-2" />
              View Full Map (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}