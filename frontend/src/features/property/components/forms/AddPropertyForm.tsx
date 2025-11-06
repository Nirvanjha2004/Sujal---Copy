import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Loader2, Plus, X, MapPin, Upload } from 'lucide-react';
import { usePropertyForm } from '../../hooks/usePropertyForm';
import { PropertyImageUpload } from '../common/PropertyImageUpload';
import { PROPERTY_TYPE_CONFIG, LISTING_TYPE_CONFIG } from '../../constants/propertyTypes';
import { AMENITY_CATEGORIES } from '../../constants/amenities';
import { Property } from '../../types';

export interface AddPropertyFormProps {
  onSuccess?: (property: Property) => void;
  onCancel?: () => void;
  className?: string;
}

export const AddPropertyForm: React.FC<AddPropertyFormProps> = ({
  onSuccess,
  onCancel,
  className
}) => {
  const [showAmenitySelector, setShowAmenitySelector] = useState(false);
  const [selectedAmenityCategory, setSelectedAmenityCategory] = useState<string>('basic');

  const {
    formData,
    errors,
    isSubmitting,
    isDirty,
    isValid,
    updateField,
    addAmenity,
    removeAmenity,
    validateForm,
    resetForm,
    submitForm
  } = usePropertyForm({
    mode: 'create',
    onSuccess,
    onError: (error) => console.error('Form error:', error)
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await submitForm();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleAddAmenity = (amenity: string) => {
    addAmenity(amenity);
    setShowAmenitySelector(false);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Property Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Enter property title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe your property..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Property Type *</label>
                <Select
                  value={formData.property_type}
                  onValueChange={(value) => updateField('property_type', value)}
                >
                  <SelectTrigger className={errors.property_type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROPERTY_TYPE_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.property_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.property_type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Listing Type *</label>
                <Select
                  value={formData.listing_type}
                  onValueChange={(value) => updateField('listing_type', value)}
                >
                  <SelectTrigger className={errors.listing_type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select listing type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LISTING_TYPE_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.listing_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.listing_type}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price *</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder="Enter price"
                  className={errors.price ? 'border-red-500' : ''}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Area (sq ft) *</label>
                <Input
                  type="number"
                  value={formData.area}
                  onChange={(e) => updateField('area', e.target.value)}
                  placeholder="Enter area"
                  className={errors.area ? 'border-red-500' : ''}
                />
                {errors.area && (
                  <p className="text-red-500 text-sm mt-1">{errors.area}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => updateField('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="SOLD">Sold</SelectItem>
                    <SelectItem value="RENTED">Rented</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="resale">Resale</SelectItem>
                    <SelectItem value="under_construction">Under Construction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bedrooms</label>
                <Input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => updateField('bedrooms', e.target.value)}
                  placeholder="Number of bedrooms"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bathrooms</label>
                <Input
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => updateField('bathrooms', e.target.value)}
                  placeholder="Number of bathrooms"
                  min="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Address *</label>
              <Textarea
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Enter complete address"
                rows={2}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City *</label>
                <Input
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Enter city"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">State *</label>
                <Input
                  value={formData.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  placeholder="Enter state"
                  className={errors.state ? 'border-red-500' : ''}
                />
                {errors.state && (
                  <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Postal Code</label>
                <Input
                  value={formData.postal_code}
                  onChange={(e) => updateField('postal_code', e.target.value)}
                  placeholder="Enter postal code"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity) => (
                <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                  {amenity}
                  <button
                    type="button"
                    onClick={() => removeAmenity(amenity)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAmenitySelector(!showAmenitySelector)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Amenity
              </Button>
            </div>

            {showAmenitySelector && (
              <div className="border rounded-lg p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select
                    value={selectedAmenityCategory}
                    onValueChange={setSelectedAmenityCategory}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(AMENITY_CATEGORIES).map(([key, category]) => (
                        <SelectItem key={key} value={key}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {AMENITY_CATEGORIES[selectedAmenityCategory as keyof typeof AMENITY_CATEGORIES]?.amenities.map((amenity) => (
                    <Button
                      key={amenity}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddAmenity(amenity)}
                      disabled={formData.amenities.includes(amenity)}
                      className="justify-start"
                    >
                      {amenity}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Property Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PropertyImageUpload
              images={formData.images}
              onImagesChange={(images) => updateField('images', images)}
              maxImages={20}
              className="w-full"
            />
            {errors.images && (
              <p className="text-red-500 text-sm mt-2">{errors.images}</p>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            disabled={!isDirty || isSubmitting}
          >
            Reset
          </Button>

          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              'Create Property'
            )}
          </Button>
        </div>

        {/* Form Status */}
        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              Please fix the errors above before submitting the form.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </form>
  );
};