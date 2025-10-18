import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { api } from '@/shared/lib/api';
import { useAuth } from '@/features/auth';

interface PropertyFormData {
  title: string;
  description: string;
  property_type: string;
  listing_type: string;
  status: string;
  price: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  amenities: string[];
  images: File[];
}

interface ImagePreview {
  file: File;
  url: string;
  id: string;
}

const AMENITIES_LIST = [
  'Swimming Pool', 'Gym', 'Parking', 'Security', 'Garden', 'Balcony',
  'Air Conditioning', 'Elevator', 'Power Backup', 'Water Supply',
  'Internet', 'Club House', 'Children Play Area', 'Jogging Track',
  'Tennis Court', 'Basketball Court', 'Spa', 'Sauna', 'Jacuzzi',
  'Conference Room', 'Library', 'Cafeteria', 'Shopping Center',
  'Hospital Nearby', 'School Nearby', 'Metro Station', 'Bus Stop'
];

export function AddPropertyPage() {
  const navigate = useNavigate();
  const { state } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user has permission to create properties
  const allowedRoles = ['owner', 'agent', 'builder'];
  const canCreateProperty = state.user && allowedRoles.includes(state.user.role);
  
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    property_type: '',
    listing_type: '',
    status: '',
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    amenities: [],
    images: []
  });

  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTab, setCurrentTab] = useState('basic');

  const handleInputChange = (field: keyof PropertyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview: ImagePreview = {
            file,
            url: e.target?.result as string,
            id: Math.random().toString(36).substr(2, 9)
          };
          setImagePreviews(prev => [...prev, preview]);
          setFormData(prev => ({ ...prev, images: [...prev.images, file] }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (id: string) => {
    setImagePreviews(prev => prev.filter(img => img.id !== id));
    const imageToRemove = imagePreviews.find(img => img.id === id);
    if (imageToRemove) {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(img => img !== imageToRemove.file)
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.property_type) newErrors.property_type = 'Property type is required';
    if (!formData.listing_type) newErrors.listing_type = 'Listing type is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.price.trim()) newErrors.price = 'Price is required';
    if (!formData.area.trim()) newErrors.area = 'Area is required';
    if (!formData.bedrooms.trim()) newErrors.bedrooms = 'Number of bedrooms is required';
    if (!formData.bathrooms.trim()) newErrors.bathrooms = 'Number of bathrooms is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';

    if (formData.price && isNaN(Number(formData.price))) {
      newErrors.price = 'Price must be a valid number';
    }
    if (formData.area && isNaN(Number(formData.area))) {
      newErrors.area = 'Area must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Convert amenities array to object format expected by backend
      const amenitiesObject: Record<string, boolean> = {};
      
      // Map frontend amenity names to backend field names
      const amenityMapping: Record<string, string> = {
        'Swimming Pool': 'swimming_pool',
        'Gym': 'gym',
        'Parking': 'parking',
        'Security': 'security',
        'Garden': 'garden',
        'Balcony': 'balcony',
        'Air Conditioning': 'air_conditioning',
        'Elevator': 'elevator',
        'Power Backup': 'power_backup',
        'Water Supply': 'water_supply',
        'Internet': 'internet',
        'Club House': 'club_house',
        'Children Play Area': 'playground',
        'Jogging Track': 'jogging_track',
        'Tennis Court': 'tennis_court',
        'Basketball Court': 'basketball_court',
        'Spa': 'spa',
        'Sauna': 'sauna',
        'Jacuzzi': 'jacuzzi',
        'Conference Room': 'conference_room',
        'Library': 'library',
        'Cafeteria': 'cafeteria',
        'Shopping Center': 'shopping_center',
        'Hospital Nearby': 'hospital_nearby',
        'School Nearby': 'school_nearby',
        'Metro Station': 'metro_station',
        'Bus Stop': 'bus_stop'
      };

      // Convert selected amenities to object format
      formData.amenities.forEach(amenity => {
        const backendKey = amenityMapping[amenity] || amenity.toLowerCase().replace(/\s+/g, '_');
        amenitiesObject[backendKey] = true;
      });

      // Prepare property data for API
      const propertyData = {
        title: formData.title,
        description: formData.description,
        propertyType: formData.property_type,
        listingType: formData.listing_type,
        status: formData.status,
        price: parseFloat(formData.price),
        areaSqft: parseInt(formData.area),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postal_code,
        amenities: amenitiesObject,
        // Images will be handled separately in image upload task
      };

      await api.createProperty(propertyData);
      
      // Navigate to my properties page to see the created property
      navigate('/my-properties');
    } catch (error: any) {
      console.error('Error creating property:', error);
      setErrors({ submit: error.message || 'Failed to create property. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (value: string) => {
    const num = value.replace(/[^\d]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Icon icon="solar:arrow-left-bold" className="size-5" />
          </Button>
          <h1 className="text-2xl font-bold">Add New Property</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {!canCreateProperty && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <Icon icon="solar:danger-bold" className="size-5 text-red-500" />
            <AlertDescription className="text-red-700">
              You need to be a Property Owner, Agent, or Builder to create property listings. 
              Please contact support to update your account type.
            </AlertDescription>
          </Alert>
        )}

        {errors.submit && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <Icon icon="solar:danger-bold" className="size-5 text-red-500" />
            <AlertDescription className="text-red-700">
              {errors.submit}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={canCreateProperty ? handleSubmit : (e) => e.preventDefault()}>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Property Details</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="media">Images & Amenities</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Property Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Luxury 3BHK Apartment in Downtown"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your property in detail..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className={`min-h-[120px] ${errors.description ? 'border-red-500' : ''}`}
                    />
                    {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Property Type *</Label>
                      <Select
                        value={formData.property_type}
                        onValueChange={(value) => handleInputChange('property_type', value)}
                      >
                        <SelectTrigger className={errors.property_type ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="land">Land</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.property_type && <p className="text-sm text-red-500">{errors.property_type}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Listing Type *</Label>
                      <Select
                        value={formData.listing_type}
                        onValueChange={(value) => handleInputChange('listing_type', value)}
                      >
                        <SelectTrigger className={errors.listing_type ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sale">For Sale</SelectItem>
                          <SelectItem value="rent">For Rent</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.listing_type && <p className="text-sm text-red-500">{errors.listing_type}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Status *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleInputChange('status', value)}
                      >
                        <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="resale">Resale</SelectItem>
                          <SelectItem value="under_construction">Under Construction</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ({formData.listing_type === 'rent' ? 'per month' : 'total'}) *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                        <Input
                          id="price"
                          placeholder="0"
                          value={formatPrice(formData.price)}
                          onChange={(e) => handleInputChange('price', e.target.value.replace(/[^\d]/g, ''))}
                          className={`pl-8 ${errors.price ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="area">Area (sq ft) *</Label>
                      <Input
                        id="area"
                        placeholder="e.g., 1200"
                        value={formData.area}
                        onChange={(e) => handleInputChange('area', e.target.value)}
                        className={errors.area ? 'border-red-500' : ''}
                      />
                      {errors.area && <p className="text-sm text-red-500">{errors.area}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">Bedrooms *</Label>
                      <Select
                        value={formData.bedrooms}
                        onValueChange={(value) => handleInputChange('bedrooms', value)}
                      >
                        <SelectTrigger className={errors.bedrooms ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select bedrooms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Bedroom</SelectItem>
                          <SelectItem value="2">2 Bedrooms</SelectItem>
                          <SelectItem value="3">3 Bedrooms</SelectItem>
                          <SelectItem value="4">4 Bedrooms</SelectItem>
                          <SelectItem value="5">5+ Bedrooms</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.bedrooms && <p className="text-sm text-red-500">{errors.bedrooms}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bathrooms">Bathrooms *</Label>
                      <Select
                        value={formData.bathrooms}
                        onValueChange={(value) => handleInputChange('bathrooms', value)}
                      >
                        <SelectTrigger className={errors.bathrooms ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select bathrooms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Bathroom</SelectItem>
                          <SelectItem value="2">2 Bathrooms</SelectItem>
                          <SelectItem value="3">3 Bathrooms</SelectItem>
                          <SelectItem value="4">4+ Bathrooms</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.bathrooms && <p className="text-sm text-red-500">{errors.bathrooms}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="location" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Location Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter complete address..."
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={errors.address ? 'border-red-500' : ''}
                    />
                    {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="e.g., Mumbai"
                        value={formData.city}
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
                        value={formData.state}
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
                        value={formData.postal_code}
                        onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* TODO: Add map integration */}
                  <div className="mt-6">
                    <Label>Location on Map</Label>
                    <div className="mt-2 h-64 bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Icon icon="solar:map-point-bold" className="size-12 mx-auto mb-2" />
                        <p>Map integration coming soon</p>
                        <p className="text-sm">You can manually enter the address above</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Property Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Upload Images</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                      <div className="text-center">
                        <Icon icon="solar:cloud-upload-bold" className="size-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg font-medium mb-2">Upload Property Images</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Drag and drop images here, or click to browse
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Icon icon="solar:gallery-bold" className="size-4 mr-2" />
                          Choose Images
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="space-y-2">
                      <Label>Image Previews ({imagePreviews.length})</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {imagePreviews.map((preview) => (
                          <div key={preview.id} className="relative group">
                            <img
                              src={preview.url}
                              alt="Property preview"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="absolute top-2 right-2 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(preview.id)}
                            >
                              <Icon icon="solar:close-bold" className="size-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Label>Select Available Amenities</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {AMENITIES_LIST.map((amenity) => (
                        <div key={amenity} className="flex items-center space-x-2">
                          <Checkbox
                            id={amenity}
                            checked={formData.amenities.includes(amenity)}
                            onCheckedChange={() => handleAmenityToggle(amenity)}
                          />
                          <Label
                            htmlFor={amenity}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {amenity}
                          </Label>
                        </div>
                      ))}
                    </div>
                    
                    {formData.amenities.length > 0 && (
                      <div className="mt-4">
                        <Label className="mb-2 block">Selected Amenities:</Label>
                        <div className="flex flex-wrap gap-2">
                          {formData.amenities.map((amenity) => (
                            <Badge
                              key={amenity}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => handleAmenityToggle(amenity)}
                            >
                              {amenity}
                              <Icon icon="solar:close-bold" className="size-3 ml-1" />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator className="my-8" />

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {currentTab !== 'basic' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const tabs = ['basic', 'details', 'location', 'media'];
                    const currentIndex = tabs.indexOf(currentTab);
                    if (currentIndex > 0) {
                      setCurrentTab(tabs[currentIndex - 1]);
                    }
                  }}
                >
                  <Icon icon="solar:arrow-left-bold" className="size-4 mr-2" />
                  Previous
                </Button>
              )}
              
              {currentTab !== 'media' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const tabs = ['basic', 'details', 'location', 'media'];
                    const currentIndex = tabs.indexOf(currentTab);
                    if (currentIndex < tabs.length - 1) {
                      setCurrentTab(tabs[currentIndex + 1]);
                    }
                  }}
                >
                  Next
                  <Icon icon="solar:arrow-right-bold" className="size-4 ml-2" />
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !canCreateProperty}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Icon icon="solar:loading-bold" className="size-4 mr-2 animate-spin" />
                    Creating Property...
                  </>
                ) : (
                  <>
                    <Icon icon="solar:add-circle-bold" className="size-4 mr-2" />
                    Create Property
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}