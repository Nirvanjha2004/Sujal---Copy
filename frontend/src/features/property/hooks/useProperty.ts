import { useState, useEffect, useCallback } from 'react';
import { Property, CreatePropertyRequest, UpdatePropertyRequest } from '../types';
import { propertyService } from '../services';

export interface UsePropertyReturn {
  property: Property | null;
  isLoading: boolean;
  error: string | null;
  refetchProperty: () => Promise<void>;
  updateProperty: (data: Partial<Property>) => Promise<void>;
  deleteProperty: () => Promise<void>;
}

export interface UsePropertyOptions {
  propertyId?: number;
  autoFetch?: boolean;
}

export const useProperty = (options: UsePropertyOptions = {}): UsePropertyReturn => {
  const { propertyId, autoFetch = true } = options;
  
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProperty = useCallback(async () => {
    if (!propertyId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedProperty = await propertyService.getPropertyById(propertyId);
      setProperty(fetchedProperty);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch property';
      setError(errorMessage);
      setProperty(null);
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  const refetchProperty = useCallback(async () => {
    await fetchProperty();
  }, [fetchProperty]);

  const updateProperty = useCallback(async (data: Partial<Property>) => {
    if (!propertyId || !property) {
      throw new Error('Property ID is required for updates');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updateData: UpdatePropertyRequest = {
        id: propertyId,
        title: data.title,
        description: data.description,
        propertyType: data.propertyType,
        listingType: data.listingType,
        status: data.status,
        price: data.price,
        areaSqft: data.area,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        address: data.location?.address || data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode || data.postal_code,
        amenities: Array.isArray(data.amenities) 
          ? data.amenities.reduce((acc, amenity) => {
              acc[amenity] = true;
              return acc;
            }, {} as Record<string, boolean>)
          : data.amenities
      };
      
      const updatedProperty = await propertyService.updateProperty(propertyId, updateData);
      setProperty(updatedProperty);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update property';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, property]);

  const deleteProperty = useCallback(async () => {
    if (!propertyId) {
      throw new Error('Property ID is required for deletion');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await propertyService.deleteProperty(propertyId);
      setProperty(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete property';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    if (autoFetch && propertyId) {
      fetchProperty();
    }
  }, [autoFetch, propertyId, fetchProperty]);

  return {
    property,
    isLoading,
    error,
    refetchProperty,
    updateProperty,
    deleteProperty
  };
};

// Hook for creating new properties
export interface UseCreatePropertyReturn {
  createProperty: (data: CreatePropertyRequest) => Promise<Property>;
  isCreating: boolean;
  error: string | null;
}

export const useCreateProperty = (): UseCreatePropertyReturn => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProperty = useCallback(async (data: CreatePropertyRequest): Promise<Property> => {
    setIsCreating(true);
    setError(null);
    
    try {
      const newProperty = await propertyService.createProperty(data);
      return newProperty;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create property';
      setError(errorMessage);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return {
    createProperty,
    isCreating,
    error
  };
};

// Hook for managing user properties
export interface UseUserPropertiesReturn {
  properties: Property[];
  isLoading: boolean;
  error: string | null;
  refetchProperties: () => Promise<void>;
}

export const useUserProperties = (userId?: number): UseUserPropertiesReturn => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProperties = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userProperties = await propertyService.getUserProperties();
      setProperties(userProperties);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user properties';
      setError(errorMessage);
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const refetchProperties = useCallback(async () => {
    await fetchUserProperties();
  }, [fetchUserProperties]);

  useEffect(() => {
    if (userId) {
      fetchUserProperties();
    }
  }, [userId, fetchUserProperties]);

  return {
    properties,
    isLoading,
    error,
    refetchProperties
  };
};