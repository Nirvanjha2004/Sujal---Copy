import { api } from '@/shared/lib/api';
import type { Property as ApiProperty, PropertyFilters as ApiPropertyFilters } from '@/shared/lib/api';
import type { 
  Property, 
  PropertyFilters, 
  PaginatedResponse, 
  CreatePropertyRequest,
  UpdatePropertyRequest,
  PaginationOptions,
  PropertyStats
} from '../types';

/**
 * Property service error types
 */
export enum PropertyErrorType {
  PROPERTY_NOT_FOUND = 'PROPERTY_NOT_FOUND',
  PROPERTY_ACCESS_DENIED = 'PROPERTY_ACCESS_DENIED',
  PROPERTY_VALIDATION_ERROR = 'PROPERTY_VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR'
}

export interface PropertyError {
  type: PropertyErrorType;
  message: string;
  details?: any;
}

/**
 * Core property service for CRUD operations and basic property management
 */
class PropertyService {
  /**
   * Get all properties with optional filters and pagination
   */
  async getProperties(
    filters?: PropertyFilters, 
    pagination?: PaginationOptions
  ): Promise<PaginatedResponse<Property>> {
    try {
      const params = new URLSearchParams();
      
      // Add pagination parameters
      if (pagination?.page) {
        params.append('page', pagination.page.toString());
      }
      if (pagination?.limit) {
        params.append('limit', pagination.limit.toString());
      }
      if (pagination?.offset) {
        params.append('offset', pagination.offset.toString());
      }

      // Add filter parameters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            // Handle array values (like amenities)
            if (Array.isArray(value)) {
              if (value.length > 0) {
                params.append(key, value.join(','));
              }
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }


      const apiFilters = this.transformFiltersToApi(filters);
      const response = await api.getProperties(apiFilters);
      
      return {
        data: response.data.map(this.transformApiPropertyToProperty),
        total: response.total,
        page: response.page || 1,
        limit: response.limit || 20,
        totalPages: Math.ceil(response.total / (response.limit || 20))
      };
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch properties');
    }
  }

  /**
   * Get property by ID
   */
  async getPropertyById(id: number): Promise<Property> {
    try {
      const response = await api.getProperty(id);
      return this.transformApiPropertyToProperty(response);
    } catch (error: any) {
      if (error.status === 404) {
        throw this.createError(
          PropertyErrorType.PROPERTY_NOT_FOUND,
          `Property with ID ${id} not found`
        );
      }
      if (error.status === 403) {
        throw this.createError(
          PropertyErrorType.PROPERTY_ACCESS_DENIED,
          'Access denied to this property'
        );
      }
      throw this.handleError(error, `Failed to fetch property ${id}`);
    }
  }

  /**
   * Create new property
   */
  async createProperty(propertyData: CreatePropertyRequest): Promise<Property> {
    try {
      // Transform frontend data to backend format
      console.log('Original property data from form:', propertyData);
      const backendData = this.transformToBackendFormat(propertyData);
      console.log('Transformed data being sent to backend:', backendData);
      const response = await api.createProperty(backendData);
      return this.transformApiPropertyToProperty(response.data);
    } catch (error: any) {
      console.error('Property creation error:', error);
      if (error.status === 400) {
        throw this.createError(
          PropertyErrorType.PROPERTY_VALIDATION_ERROR,
          'Invalid property data provided',
          error
        );
      }
      if (error.status === 403) {
        throw this.createError(
          PropertyErrorType.PERMISSION_ERROR,
          'Permission denied to create property'
        );
      }
      throw this.handleError(error, 'Failed to create property');
    }
  }

  /**
   * Update property
   */
  async updateProperty(id: number, propertyData: UpdatePropertyRequest): Promise<Property> {
    try {
      // Transform frontend data to backend format
      const backendData = this.transformToBackendFormat(propertyData);
      const response = await api.updateProperty(id, backendData);
      return this.transformApiPropertyToProperty(response);
    } catch (error: any) {
      if (error.status === 404) {
        throw this.createError(
          PropertyErrorType.PROPERTY_NOT_FOUND,
          `Property with ID ${id} not found`
        );
      }
      if (error.status === 403) {
        throw this.createError(
          PropertyErrorType.PROPERTY_ACCESS_DENIED,
          'Access denied to update this property'
        );
      }
      if (error.status === 400) {
        throw this.createError(
          PropertyErrorType.PROPERTY_VALIDATION_ERROR,
          'Invalid property data provided',
          error
        );
      }
      throw this.handleError(error, `Failed to update property ${id}`);
    }
  }

  /**
   * Delete property
   */
  async deleteProperty(id: number): Promise<void> {
    try {
      await api.deleteProperty(id);
    } catch (error: any) {
      if (error.status === 404) {
        throw this.createError(
          PropertyErrorType.PROPERTY_NOT_FOUND,
          `Property with ID ${id} not found`
        );
      }
      if (error.status === 403) {
        throw this.createError(
          PropertyErrorType.PROPERTY_ACCESS_DENIED,
          'Access denied to delete this property'
        );
      }
      throw this.handleError(error, `Failed to delete property ${id}`);
    }
  }

  /**
   * Get user's properties
   */
  async getUserProperties(): Promise<Property[]> {
    try {
      const response = await api.getUserProperties();
      return response.data.map(this.transformApiPropertyToProperty);
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch user properties');
    }
  }

  /**
   * Toggle property favorite status
   */
  async toggleFavorite(propertyId: number): Promise<{ isFavorite: boolean }> {
    try {
      await api.addToFavorites(propertyId);
      return { isFavorite: true };
    } catch (error: any) {
      // If already favorited, try to remove
      if (error.status === 409 || error.status === 400) {
        try {
          await api.removeFromFavorites(propertyId);
          return { isFavorite: false };
        } catch (removeError: any) {
          throw this.handleError(removeError, 'Failed to toggle favorite status');
        }
      }
      throw this.handleError(error, 'Failed to toggle favorite status');
    }
  }

  /**
   * Get user's favorite properties
   */
  async getFavoriteProperties(): Promise<Property[]> {
    try {
      const response = await api.getFavorites();
      return response.data.map(this.transformApiPropertyToProperty);
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch favorite properties');
    }
  }

  /**
   * Get similar properties
   */
  async getSimilarProperties(propertyId: number): Promise<Property[]> {
    try {
      // For now, we'll implement a basic similar properties logic
      // This can be enhanced with ML-based recommendations later
      const property = await this.getPropertyById(propertyId);
      
      const filters: PropertyFilters = {
        propertyType: property.propertyType,
        listingType: property.listingType,
        location: property.city,
        minPrice: Math.max(0, property.price * 0.8),
        maxPrice: property.price * 1.2,
      };

      const response = await this.getProperties(filters, { limit: 6 });
      
      // Filter out the current property and return up to 5 similar ones
      return response.data
        .filter(p => p.id !== propertyId)
        .slice(0, 5);
    } catch (error: any) {
      throw this.handleError(error, `Failed to fetch similar properties for ${propertyId}`);
    }
  }

  /**
   * Get property statistics
   */
  async getPropertyStats(propertyId: number): Promise<PropertyStats> {
    try {
      const response = await api.getPropertyAnalytics(propertyId);
      return {
        views: response.data?.views || 0,
        favorites: response.data?.favorites || 0,
        inquiries: response.data?.inquiries || 0,
        shares: response.data?.shares || 0,
        lastViewed: response.data?.lastViewed,
        averageViewDuration: response.data?.averageViewDuration
      };
    } catch (error: any) {
      // Return default stats if analytics not available
      return {
        views: 0,
        favorites: 0,
        inquiries: 0,
        shares: 0
      };
    }
  }

  /**
   * Transform frontend property data to backend format
   */
  private transformToBackendFormat(data: any): any {
    const transformed: any = {};

    // Required fields - ensure they are always present with meaningful defaults
    transformed.title = data.title || 'Untitled Property';
    transformed.description = data.description || '';
    transformed.property_type = data.propertyType || 'apartment';
    transformed.listing_type = data.listingType || 'sale';
    transformed.status = data.status || 'ACTIVE';
    transformed.price = Number(data.price) || 0;
    transformed.area_sqft = Number(data.areaSqft || data.area) || 0;
    transformed.address = data.address || 'Address not provided';
    transformed.city = data.city || 'City not provided';
    transformed.state = data.state || 'State not provided';

    // Optional fields - only include if they have values
    if (data.bedrooms !== undefined && data.bedrooms !== '') {
      transformed.bedrooms = Number(data.bedrooms);
    }
    if (data.bathrooms !== undefined && data.bathrooms !== '') {
      transformed.bathrooms = Number(data.bathrooms);
    }
    if (data.postalCode) {
      transformed.postal_code = data.postalCode;
    }
    if (data.latitude !== undefined && data.latitude !== '') {
      transformed.latitude = Number(data.latitude);
    }
    if (data.longitude !== undefined && data.longitude !== '') {
      transformed.longitude = Number(data.longitude);
    }

    // Handle amenities - ensure it's always an object
    if (data.amenities) {
      if (typeof data.amenities === 'object' && !Array.isArray(data.amenities)) {
        // Already in object format {amenity: true/false}
        transformed.amenities = data.amenities;
      } else if (Array.isArray(data.amenities)) {
        // Convert array to object format
        transformed.amenities = data.amenities.reduce((acc: Record<string, boolean>, amenity: string) => {
          acc[amenity] = true;
          return acc;
        }, {});
      } else {
        transformed.amenities = {};
      }
    } else {
      // Ensure amenities is always an object, even if empty
      transformed.amenities = {};
    }

    // Handle boolean fields with defaults
    transformed.is_active = data.isActive !== undefined ? data.isActive : true;
    transformed.is_featured = data.isFeatured !== undefined ? data.isFeatured : false;

    return transformed;
  }

  /**
   * Create a standardized error object
   */
  private createError(type: PropertyErrorType, message: string, details?: any): PropertyError {
    return {
      type,
      message,
      details
    };
  }

  /**
   * Handle and transform API errors
   */
  private handleError(error: any, defaultMessage: string): PropertyError {
    if (error.type && Object.values(PropertyErrorType).includes(error.type)) {
      return error;
    }

    if (error.status === 0 || !error.status) {
      return this.createError(
        PropertyErrorType.NETWORK_ERROR,
        'Network error occurred. Please check your connection.',
        error
      );
    }

    return this.createError(
      PropertyErrorType.NETWORK_ERROR,
      error.message || defaultMessage,
      error
    );
  }

  /**
   * Transform API property to feature property type
   */
  private transformApiPropertyToProperty(apiProperty: ApiProperty): Property {
    return {
      id: apiProperty.id,
      title: apiProperty.title,
      description: apiProperty.description || '',
      propertyType: (apiProperty.property_type || 'apartment') as any,
      listingType: (apiProperty.listing_type || 'sale') as any,
      price: apiProperty.price,
      area: apiProperty.area_sqft || apiProperty.area || 0,
      areaSqft: apiProperty.area_sqft,
      area_sqft: apiProperty.area_sqft,
      bedrooms: apiProperty.bedrooms,
      bathrooms: apiProperty.bathrooms,
      location: {
        address: apiProperty.address,
        city: apiProperty.city,
        state: apiProperty.state,
        postalCode: apiProperty.postal_code,
        latitude: apiProperty.latitude,
        longitude: apiProperty.longitude
      },
      address: apiProperty.address,
      city: apiProperty.city,
      state: apiProperty.state,
      postalCode: apiProperty.postal_code,
      postal_code: apiProperty.postal_code,
      latitude: apiProperty.latitude,
      longitude: apiProperty.longitude,
      amenities: [],
      images: apiProperty.images?.map(img => ({
        id: img.id,
        propertyId: img.property_id,
        url: img.image_url,
        thumbnailUrl: img.image_url,
        alt: img.alt_text || 'Property image',
        order: img.display_order || 0,
        isPrimary: img.is_primary || false,
        uploadedAt: apiProperty.created_at
      })) || [],
      isActive: true,
      is_active: true,
      isFeatured: false,
      is_featured: false,
      status: (apiProperty.status || 'active') as any,
      ownerId: apiProperty.owner?.id || 0,
      owner_id: apiProperty.owner?.id,
      agentId: undefined,
      agent_id: undefined,
      createdAt: apiProperty.created_at,
      created_at: apiProperty.created_at,
      updatedAt: apiProperty.updated_at,
      updated_at: apiProperty.updated_at,
      owner: apiProperty.owner,
      agent: undefined
    };
  }

  /**
   * Transform feature filters to API filters
   */
  private transformFiltersToApi(filters?: PropertyFilters): ApiPropertyFilters | undefined {
    if (!filters) return undefined;

    const apiFilters: ApiPropertyFilters = {};

    if (filters.location) apiFilters.location = filters.location;
    if (filters.propertyType) {
      apiFilters.property_type = Array.isArray(filters.propertyType) 
        ? filters.propertyType[0] 
        : filters.propertyType;
    }
    if (filters.listingType) apiFilters.listing_type = filters.listingType;
    if (filters.minPrice) apiFilters.min_price = filters.minPrice;
    if (filters.maxPrice) apiFilters.max_price = filters.maxPrice;
    if (filters.bedrooms) apiFilters.bedrooms = filters.bedrooms;
    if (filters.bathrooms) apiFilters.bathrooms = filters.bathrooms;
    if (filters.minArea) apiFilters.min_area = filters.minArea;
    if (filters.maxArea) apiFilters.max_area = filters.maxArea;
    // Note: amenities handling would need to be implemented in API filters
    if (filters.isActive !== undefined) apiFilters.is_featured = filters.isActive;
    if (filters.isFeatured !== undefined) apiFilters.is_featured = filters.isFeatured;

    return apiFilters;
  }
}

export default new PropertyService();