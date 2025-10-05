import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AmenitiesSelectorProps {
  selectedAmenities: string[];
  onAmenitiesChange: (amenities: string[]) => void;
}

const AMENITIES_CATEGORIES = {
  basic: {
    title: 'Basic Amenities',
    icon: 'solar:home-bold',
    items: [
      'Parking', 'Elevator', 'Power Backup', 'Water Supply', 
      'Security', 'CCTV Surveillance', 'Intercom', 'Fire Safety'
    ]
  },
  comfort: {
    title: 'Comfort & Convenience',
    icon: 'solar:sofa-bold',
    items: [
      'Air Conditioning', 'Heating', 'Internet/WiFi', 'Cable TV',
      'Laundry', 'Housekeeping', 'Maintenance', 'Waste Disposal'
    ]
  },
  recreation: {
    title: 'Recreation & Fitness',
    icon: 'solar:dumbbell-bold',
    items: [
      'Swimming Pool', 'Gym', 'Yoga Studio', 'Spa', 'Sauna',
      'Jacuzzi', 'Sports Complex', 'Tennis Court', 'Basketball Court',
      'Badminton Court', 'Jogging Track', 'Cycling Track'
    ]
  },
  social: {
    title: 'Social & Community',
    icon: 'solar:users-group-rounded-bold',
    items: [
      'Club House', 'Community Hall', 'Party Hall', 'BBQ Area',
      'Rooftop Terrace', 'Garden', 'Landscaping', 'Amphitheater',
      'Library', 'Conference Room', 'Business Center'
    ]
  },
  family: {
    title: 'Family & Kids',
    icon: 'solar:baby-bold',
    items: [
      'Children Play Area', 'Kids Pool', 'Daycare', 'School Nearby',
      'Playground', 'Sandbox', 'Swing Set', 'Slide'
    ]
  },
  shopping: {
    title: 'Shopping & Dining',
    icon: 'solar:shop-bold',
    items: [
      'Shopping Center', 'Supermarket', 'Cafeteria', 'Restaurant',
      'Food Court', 'Convenience Store', 'ATM', 'Bank'
    ]
  },
  transport: {
    title: 'Transportation',
    icon: 'solar:bus-bold',
    items: [
      'Metro Station', 'Bus Stop', 'Taxi Stand', 'Airport Nearby',
      'Railway Station', 'Highway Access', 'Parking Garage'
    ]
  },
  healthcare: {
    title: 'Healthcare',
    icon: 'solar:health-bold',
    items: [
      'Hospital Nearby', 'Clinic', 'Pharmacy', 'Medical Center',
      'Emergency Services', 'Ambulance Service'
    ]
  }
};

export function AmenitiesSelector({ selectedAmenities, onAmenitiesChange }: AmenitiesSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [customAmenity, setCustomAmenity] = useState('');

  const handleAmenityToggle = (amenity: string) => {
    const isSelected = selectedAmenities.includes(amenity);
    if (isSelected) {
      onAmenitiesChange(selectedAmenities.filter(a => a !== amenity));
    } else {
      onAmenitiesChange([...selectedAmenities, amenity]);
    }
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !selectedAmenities.includes(customAmenity.trim())) {
      onAmenitiesChange([...selectedAmenities, customAmenity.trim()]);
      setCustomAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    onAmenitiesChange(selectedAmenities.filter(a => a !== amenity));
  };

  const clearAllAmenities = () => {
    onAmenitiesChange([]);
  };

  const getFilteredAmenities = (items: string[]) => {
    if (!searchTerm) return items;
    return items.filter(item => 
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getAllAmenities = () => {
    return Object.values(AMENITIES_CATEGORIES).flatMap(category => category.items);
  };

  const getPopularAmenities = () => {
    return [
      'Parking', 'Swimming Pool', 'Gym', 'Security', 'Elevator',
      'Garden', 'Children Play Area', 'Club House', 'Power Backup',
      'CCTV Surveillance', 'Internet/WiFi', 'Air Conditioning'
    ];
  };

  return (
    <div className="space-y-6">
      {/* Search and Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Icon icon="solar:magnifer-bold" className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search amenities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={clearAllAmenities}
          disabled={selectedAmenities.length === 0}
        >
          <Icon icon="solar:trash-bin-minimalistic-bold" className="size-4 mr-2" />
          Clear All
        </Button>
      </div>

      {/* Selected Amenities */}
      {selectedAmenities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="solar:check-circle-bold" className="size-5 text-green-600" />
              Selected Amenities ({selectedAmenities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedAmenities.map((amenity) => (
                <Badge
                  key={amenity}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={() => removeAmenity(amenity)}
                >
                  {amenity}
                  <Icon icon="solar:close-bold" className="size-3 ml-1" />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Amenities Selection */}
      <Tabs defaultValue="popular" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="popular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="solar:star-bold" className="size-5 text-yellow-500" />
                Popular Amenities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {getFilteredAmenities(getPopularAmenities()).map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={`popular-${amenity}`}
                      checked={selectedAmenities.includes(amenity)}
                      onCheckedChange={() => handleAmenityToggle(amenity)}
                    />
                    <Label
                      htmlFor={`popular-${amenity}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {Object.entries(AMENITIES_CATEGORIES).map(([key, category]) => {
            const filteredItems = getFilteredAmenities(category.items);
            if (filteredItems.length === 0 && searchTerm) return null;

            return (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon icon={category.icon} className="size-5" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredItems.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${key}-${amenity}`}
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={() => handleAmenityToggle(amenity)}
                        />
                        <Label
                          htmlFor={`${key}-${amenity}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="solar:add-circle-bold" className="size-5" />
                Add Custom Amenity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter custom amenity..."
                  value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomAmenity();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addCustomAmenity}
                  disabled={!customAmenity.trim() || selectedAmenities.includes(customAmenity.trim())}
                >
                  <Icon icon="solar:add-bold" className="size-4 mr-2" />
                  Add
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Add any specific amenity that's not listed in the categories above.
              </p>
            </CardContent>
          </Card>

          {/* Show all amenities for reference */}
          <Card>
            <CardHeader>
              <CardTitle>All Available Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                {getAllAmenities().map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={`all-${amenity}`}
                      checked={selectedAmenities.includes(amenity)}
                      onCheckedChange={() => handleAmenityToggle(amenity)}
                    />
                    <Label
                      htmlFor={`all-${amenity}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}