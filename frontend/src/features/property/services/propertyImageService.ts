import { api } from '@/shared/lib/api';
import type { PropertyImage, PropertyImageType } from '../types';

/**
 * Property image service for image upload, management, and optimization
 */
class PropertyImageService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  private readonly MAX_IMAGES_PER_PROPERTY = 20;

  /**
   * Upload a single property image
   */
  async uploadPropertyImage(
    propertyId: number, 
    imageFile: File,
    imageType: PropertyImageType = 'gallery',
    caption?: string
  ): Promise<PropertyImage> {
    try {
      // Validate file before upload
      this.validateImageFile(imageFile);

      // Optimize image before upload
      const optimizedFile = await this.optimizeImage(imageFile);

      // Create form data for upload
      const formData = new FormData();
      formData.append('images', optimizedFile); // Use 'images' to match backend middleware
      formData.append('property_id', propertyId.toString());
      formData.append('image_type', imageType);
      if (caption) {
        formData.append('caption', caption);
      }

      // Upload using fetch directly since we need to send FormData
      const response = await this.uploadImageFile(formData, propertyId);
      
      return {
        id: response.id,
        property_id: propertyId,
        image_url: response.image_url || response.url,
        alt_text: caption || `Property ${propertyId} image`,
        display_order: response.display_order || 0,
        is_primary: response.is_primary || false,
        created_at: response.created_at || new Date().toISOString(),
        updated_at: response.updated_at || new Date().toISOString()
      };
    } catch (error: any) {
      throw new Error(`Failed to upload property image: ${error.message}`);
    }
  }

  /**
   * Upload multiple property images
   */
  async uploadMultipleImages(
    propertyId: number, 
    imageFiles: File[],
    imageType: PropertyImageType = 'gallery'
  ): Promise<PropertyImage[]> {
    try {
      // Validate total number of images
      const existingImages = await this.getPropertyImages(propertyId);
      if (existingImages.length + imageFiles.length > this.MAX_IMAGES_PER_PROPERTY) {
        throw new Error(`Cannot upload more than ${this.MAX_IMAGES_PER_PROPERTY} images per property`);
      }

      // Create form data for bulk upload
      const formData = new FormData();
      
      // Add all images to the same form data with the field name 'images'
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });
      
      // Add metadata
      formData.append('property_id', propertyId.toString());
      formData.append('image_type', imageType);

      // Upload using fetch directly since we need to send FormData
      const response = await this.uploadMultipleImageFiles(formData, propertyId);
      
      // Transform response to PropertyImage array
      const uploadedImages: PropertyImage[] = [];
      if (response.successful && Array.isArray(response.successful)) {
        response.successful.forEach((imageData: any, index: number) => {
          uploadedImages.push({
            id: imageData.imageId || imageData.id,
            property_id: propertyId,
            image_url: imageData.url || imageData.image_url,
            alt_text: `Property ${propertyId} image ${index + 1}`,
            display_order: existingImages.length + index,
            is_primary: index === 0 && existingImages.length === 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        });
      }

      return uploadedImages;
    } catch (error: any) {
      throw new Error(`Failed to upload multiple images: ${error.message}`);
    }
  }

  /**
   * Get all images for a property
   */
  async getPropertyImages(propertyId: number): Promise<PropertyImage[]> {
    try {
      const response = await api.getPropertyImages(propertyId);
      return response.data.images.map(this.transformImageResponse);
    } catch (error: any) {
      // Return empty array if no images found
      if (error.status === 404) {
        return [];
      }
      throw new Error(`Failed to fetch property images: ${error.message}`);
    }
  }

  /**
   * Delete a property image
   */
  async deletePropertyImage(propertyId: number, imageId: number): Promise<void> {
    try {
      await api.deletePropertyImage(propertyId, imageId);
    } catch (error: any) {
      throw new Error(`Failed to delete property image: ${error.message}`);
    }
  }

  /**
   * Reorder property images
   */
  async reorderPropertyImages(
    propertyId: number, 
    imageOrder: Array<{ id: number; order: number }>
  ): Promise<PropertyImage[]> {
    try {
      // For now, we'll implement this as individual updates
      // This can be optimized with a batch update API endpoint
      const images = await this.getPropertyImages(propertyId);
      
      // Update each image's order - this would need a dedicated API endpoint
      // For now, we'll just return the reordered array

      // Return images sorted by the new order
      return images.sort((a, b) => {
        const aOrder = imageOrder.find(item => item.id === a.id)?.order || a.display_order || 0;
        const bOrder = imageOrder.find(item => item.id === b.id)?.order || b.display_order || 0;
        return aOrder - bOrder;
      });
    } catch (error: any) {
      throw new Error(`Failed to reorder property images: ${error.message}`);
    }
  }

  /**
   * Set primary image for property
   */
  async setPrimaryImage(propertyId: number, imageId: number): Promise<void> {
    try {
      // This would need a dedicated API endpoint
      // For now, we'll simulate the functionality
      console.log(`Setting image ${imageId} as primary for property ${propertyId}`);
    } catch (error: any) {
      throw new Error(`Failed to set primary image: ${error.message}`);
    }
  }

  /**
   * Optimize image before upload
   */
  async optimizeImage(imageFile: File): Promise<File> {
    try {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          // Calculate new dimensions (max 1920x1080 for large images)
          const maxWidth = 1920;
          const maxHeight = 1080;
          let { width, height } = img;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Draw and compress image
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const optimizedFile = new File([blob], imageFile.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(optimizedFile);
              } else {
                reject(new Error('Failed to optimize image'));
              }
            },
            'image/jpeg',
            0.85 // 85% quality
          );
        };

        img.onerror = () => reject(new Error('Failed to load image for optimization'));
        img.src = URL.createObjectURL(imageFile);
      });
    } catch (error: any) {
      console.warn('Image optimization failed, using original file:', error);
      return imageFile; // Return original file if optimization fails
    }
  }

  /**
   * Validate image file
   */
  private validateImageFile(file: File): void {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size must be less than ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed. Allowed types: ${this.ALLOWED_TYPES.join(', ')}`);
    }

    // Check if file is actually an image
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
  }

  /**
   * Upload image file using fetch
   */
  private async uploadImageFile(formData: FormData, propertyId: number): Promise<any> {
    const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001/api/v1';
    
    // Get auth token
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/uploads/properties/${propertyId}/images`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || result;
  }

  /**
   * Upload multiple image files using fetch
   */
  private async uploadMultipleImageFiles(formData: FormData, propertyId: number): Promise<any> {
    const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001/api/v1';
    
    // Get auth token
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/uploads/properties/${propertyId}/images/bulk`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || result;
  }

  /**
   * Transform API response to PropertyImage interface
   */
  private transformImageResponse(apiImage: any): PropertyImage {
    return {
      id: apiImage.id,
      property_id: apiImage.property_id || apiImage.propertyId,
      image_url: apiImage.image_url || apiImage.url,
      alt_text: apiImage.alt_text || apiImage.alt || 'Property image',
      display_order: apiImage.display_order || apiImage.order || 0,
      is_primary: apiImage.is_primary || apiImage.isPrimary || false,
      created_at: apiImage.created_at || apiImage.uploadedAt || new Date().toISOString(),
      updated_at: apiImage.updated_at || apiImage.updatedAt || new Date().toISOString()
    };
  }

  /**
   * Generate thumbnail URL from image URL
   */
  generateThumbnailUrl(imageUrl: string, _size: 'small' | 'medium' | 'large' = 'medium'): string {
    // For now, return the original URL
    // This can be enhanced with a thumbnail generation service
    return imageUrl;
  }

  /**
   * Get image upload progress (for future implementation)
   */
  getUploadProgress(_uploadId: string): Promise<{ progress: number; status: string }> {
    // This would be used for tracking upload progress of large files
    return Promise.resolve({ progress: 100, status: 'completed' });
  }

  /**
   * Validate image dimensions
   */
  async validateImageDimensions(file: File, minWidth = 400, minHeight = 300): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(img.width >= minWidth && img.height >= minHeight);
      };
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
  }
}

export default new PropertyImageService();