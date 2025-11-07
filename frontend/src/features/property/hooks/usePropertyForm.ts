import { useState, useCallback, useEffect } from 'react';
import { Property, CreatePropertyRequest, UpdatePropertyRequest, PropertyImage } from '../types';
import { propertyService, propertyImageService } from '../services';
import { validatePropertyForm } from '../utils/propertyValidation';

export interface PropertyFormData {
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
  latitude?: string;
  longitude?: string;
  specifications?: Record<string, any>;
  existingImages?: PropertyImage[];
}

export interface UsePropertyFormReturn {
  formData: PropertyFormData;
  errors: Record<string, string>;
  isLoading: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  updateField: (field: keyof PropertyFormData, value: any) => void;
  addAmenity: (amenity: string) => void;
  removeAmenity: (amenity: string) => void;
  addImages: (files: File[]) => void;
  removeImage: (index: number) => void;
  removeExistingImage: (imageId: number) => Promise<void>;
  reorderImages: (fromIndex: number, toIndex: number) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  submitForm: () => Promise<Property>;
  loadProperty: (property: Property) => void;
}

export interface UsePropertyFormOptions {
  propertyId?: number;
  mode: 'create' | 'edit';
  onSuccess?: (property: Property) => void;
  onError?: (error: string) => void;
}

const getInitialFormData = (): PropertyFormData => ({
  title: '',
  description: '',
  property_type: '',
  listing_type: '',
  status: 'ACTIVE',
  price: '',
  area: '',
  bedrooms: '',
  bathrooms: '',
  address: '',
  city: '',
  state: '',
  postal_code: '',
  amenities: [],
  images: [],
  latitude: undefined,
  longitude: undefined,
  specifications: {},
  existingImages: []
});

export const usePropertyForm = (options: UsePropertyFormOptions): UsePropertyFormReturn => {
  const { propertyId, mode, onSuccess, onError } = options;
  
  const [formData, setFormData] = useState<PropertyFormData>(getInitialFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [initialFormData, setInitialFormData] = useState<PropertyFormData>(getInitialFormData());

  const isValid = Object.keys(errors).length === 0;

  const updateField = useCallback((field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear field-specific errors when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);



  const addAmenity = useCallback((amenity: string) => {
    if (amenity && !formData.amenities.includes(amenity)) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenity]
      }));
      setIsDirty(true);
    }
  }, [formData.amenities]);

  const removeAmenity = useCallback((amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
    setIsDirty(true);
  }, []);



  const addImages = useCallback((files: File[]) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
    setIsDirty(true);
  }, []);

  const removeImage = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  }, []);

  const removeExistingImage = useCallback(async (imageId: number) => {
    if (!propertyId) {
      throw new Error('Property ID is required to remove existing images');
    }
    
    try {
      await propertyImageService.deletePropertyImage(propertyId, imageId);
      setFormData(prev => ({
        ...prev,
        existingImages: prev.existingImages?.filter(img => img.id !== imageId) || []
      }));
      setIsDirty(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove image';
      onError?.(errorMessage);
      throw err;
    }
  }, [propertyId, onError]);

  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return { ...prev, images: newImages };
    });
    setIsDirty(true);
  }, []);

  const validateForm = useCallback((): boolean => {
    console.log('Validating form data:', formData);
    const validationResult = validatePropertyForm(formData);
    console.log('Validation result:', validationResult);
    setErrors(validationResult.errors);
    return validationResult.isValid;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setIsDirty(false);
  }, [initialFormData]);

  const loadProperty = useCallback((property: Property) => {
    const propertyFormData: PropertyFormData = {
      title: property.title,
      description: property.description || '',
      property_type: property.property_type,
      listing_type: property.listing_type,
      status: property.status,
      price: property.price.toString(),
      area: property.area_sqft?.toString() || '',
      bedrooms: property.bedrooms?.toString() || '',
      bathrooms: property.bathrooms?.toString() || '',
      address: property.address || '',
      city: property.city,
      state: property.state,
      postal_code: property.postal_code || '',
      amenities: Array.isArray(property.amenities) ? property.amenities : [],
      images: [],
      latitude: property.latitude?.toString(),
      longitude: property.longitude?.toString(),
      specifications: {},
      existingImages: property.images || []
    };
    
    setFormData(propertyFormData);
    setInitialFormData(propertyFormData);
    setIsDirty(false);
    setErrors({});
  }, []);

  const submitForm = useCallback(async (): Promise<Property> => {
    if (!validateForm()) {
      throw new Error('Form validation failed');
    }
    
    setIsSubmitting(true);
    
    try {
      let property: Property;
      
      if (mode === 'create') {
        const createData: CreatePropertyRequest = {
          title: formData.title || 'Property Title',
          description: formData.description,
          property_type: formData.property_type || 'apartment' as any,
          listing_type: formData.listing_type || 'sale' as any,
          price: Number(formData.price) || 0,
          area_sqft: Number(formData.area) || 0,
          bedrooms: Number(formData.bedrooms) || 0,
          bathrooms: Number(formData.bathrooms) || 0,
          address: formData.address || 'Address not provided',
          city: formData.city || 'City not provided',
          state: formData.state || 'State not provided',
          postal_code: formData.postal_code || '',
          amenities: formData.amenities.reduce((acc, amenity) => {
            acc[amenity] = true;
            return acc;
          }, {} as Record<string, boolean>)
        };
        
        property = await propertyService.createProperty(createData);
      } else {
        if (!propertyId) {
          throw new Error('Property ID is required for updates');
        }
        
        const updateData: UpdatePropertyRequest = {
          id: propertyId,
          title: formData.title || 'Untitled Property',
          description: formData.description || '',
          property_type: formData.property_type || 'apartment' as any,
          listing_type: formData.listing_type || 'sale' as any,
          price: Number(formData.price) || 0,
          area_sqft: Number(formData.area) || 0,
          bedrooms: Number(formData.bedrooms) || 0,
          bathrooms: Number(formData.bathrooms) || 0,
          address: formData.address || 'Address not provided',
          city: formData.city || 'City not provided',
          state: formData.state || 'State not provided',
          postal_code: formData.postal_code || '',
          amenities: formData.amenities.reduce((acc, amenity) => {
            acc[amenity] = true;
            return acc;
          }, {} as Record<string, boolean>)
        };
        
        property = await propertyService.updateProperty(propertyId, updateData);
      }
      
      // Upload new images if any
      if (formData.images.length > 0) {
        await propertyImageService.uploadMultipleImages(property.id, formData.images);
      }
      
      setIsDirty(false);
      onSuccess?.(property);
      return property;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit form';
      onError?.(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, mode, propertyId, validateForm, onSuccess, onError]);

  // Load property data for edit mode
  useEffect(() => {
    if (mode === 'edit' && propertyId) {
      setIsLoading(true);
      propertyService.getPropertyById(propertyId)
        .then(property => {
          loadProperty(property);
        })
        .catch(err => {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load property';
          onError?.(errorMessage);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [mode, propertyId, loadProperty, onError]);

  return {
    formData,
    errors,
    isLoading,
    isSubmitting,
    isDirty,
    isValid,
    updateField,
    addAmenity,
    removeAmenity,
    addImages,
    removeImage,
    removeExistingImage,
    reorderImages,
    validateForm,
    resetForm,
    submitForm,
    loadProperty
  };
};

// Hook for property image management within forms
export interface UsePropertyImageFormReturn {
  images: File[];
  existingImages: PropertyImage[];
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  addImages: (files: File[]) => void;
  removeImage: (index: number) => void;
  removeExistingImage: (imageId: number) => Promise<void>;
  reorderImages: (fromIndex: number, toIndex: number) => void;
  uploadImages: (propertyId: number) => Promise<PropertyImage[]>;
  clearImages: () => void;
}

export const usePropertyImageForm = (): UsePropertyImageFormReturn => {
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const addImages = useCallback((files: File[]) => {
    setImages(prev => [...prev, ...files]);
    setError(null);
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeExistingImage = useCallback(async (imageId: number) => {
    // This would need propertyId from context or parameter
    const propertyId = 0; // This should be passed as parameter or from context
    try {
      await propertyImageService.deletePropertyImage(propertyId, imageId);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove image';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
  }, []);

  const uploadImages = useCallback(async (propertyId: number): Promise<PropertyImage[]> => {
    if (images.length === 0) return [];
    
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      const uploadedImages = await propertyImageService.uploadMultipleImages(propertyId, images);
      setImages([]); // Clear uploaded images
      setUploadProgress(100);
      return uploadedImages;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload images';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [images]);

  const clearImages = useCallback(() => {
    setImages([]);
    setExistingImages([]);
    setError(null);
    setUploadProgress(0);
  }, []);

  return {
    images,
    existingImages,
    isUploading,
    uploadProgress,
    error,
    addImages,
    removeImage,
    removeExistingImage,
    reorderImages,
    uploadImages,
    clearImages
  };
};