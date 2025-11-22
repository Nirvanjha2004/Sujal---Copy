import { PropertyImage } from '../models/PropertyImage';
import { Property } from '../models/Property';
import { 
  processImage, 
  generateThumbnail, 
  validateImageDimensions, 
  bulkDeleteImages,
  cleanupOrphanedImages,
  getFileUrl 
} from '../middleware/upload';
import path from 'path';
import fs from 'fs';
import config from '../config';

export interface ImageProcessingOptions {
  generateThumbnail?: boolean;
  optimize?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface ImageUploadResult {
  success: boolean;
  imageId?: number;
  filename?: string;
  url?: string;
  thumbnailUrl?: string;
  error?: string;
}

export interface BulkImageUploadResult {
  successful: ImageUploadResult[];
  failed: Array<{ filename: string; error: string }>;
  totalProcessed: number;
}

export class ImageService {
  // Process and save single property image
  static async processAndSavePropertyImage(
    propertyId: number,
    file: Express.Multer.File,
    options: ImageProcessingOptions = {}
  ): Promise<ImageUploadResult> {
    try {
      // Validate property exists
      const property = await Property.findByPk(propertyId);
      if (!property) {
        return { success: false, error: 'Property not found' };
      }

      // Validate image dimensions
      const validation = await validateImageDimensions(file.path);
      if (!validation.valid) {
        // Clean up uploaded file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        return { success: false, error: validation.message };
      }

      const {
        generateThumbnail: shouldGenerateThumbnail = true,
        optimize = true,
        maxWidth = 1200,
        maxHeight = 800,
        quality = 85
      } = options;

      let processedFilename = file.filename;
      let thumbnailFilename: string | undefined;

      // Process and optimize image if requested
      if (optimize) {
        const optimizedPath = file.path.replace(/(\.[^.]+)$/, '_optimized$1');
        await processImage(file.path, optimizedPath, {
          width: maxWidth,
          height: maxHeight,
          quality,
          format: 'jpeg'
        });

        // Replace original with optimized version
        fs.unlinkSync(file.path);
        fs.renameSync(optimizedPath, file.path);
      }

      // Generate thumbnail if requested
      if (shouldGenerateThumbnail) {
        thumbnailFilename = file.filename.replace(/(\.[^.]+)$/, '_thumb$1');
        const thumbnailPath = path.join(path.dirname(file.path), thumbnailFilename);
        await generateThumbnail(file.path, thumbnailPath);
      }

      // Save to database
      const propertyImage = await PropertyImage.create({
        property_id: propertyId,
        image_url: file.filename,
        alt_text: `Property image for ${property.title}`,
        display_order: await this.getNextDisplayOrder(propertyId)
      });

      return {
        success: true,
        imageId: propertyImage.id,
        filename: processedFilename,
        url: getFileUrl(processedFilename, 'property'),
        thumbnailUrl: thumbnailFilename ? getFileUrl(thumbnailFilename, 'property') : undefined
      };

    } catch (error) {
      // Clean up uploaded file on error
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      console.error('Error processing property image:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process image' 
      };
    }
  }

  // Process bulk property images
  static async processBulkPropertyImages(
    propertyId: number,
    files: Express.Multer.File[],
    options: ImageProcessingOptions = {}
  ): Promise<BulkImageUploadResult> {
    const successful: ImageUploadResult[] = [];
    const failed: Array<{ filename: string; error: string }> = [];

    // Validate property exists
    const property = await Property.findByPk(propertyId);
    if (!property) {
      return {
        successful: [],
        failed: files.map(file => ({ 
          filename: file.originalname, 
          error: 'Property not found' 
        })),
        totalProcessed: files.length
      };
    }

    // Process each file
    for (const file of files) {
      try {
        const result = await this.processAndSavePropertyImage(propertyId, file, options);
        
        if (result.success) {
          successful.push(result);
        } else {
          failed.push({ 
            filename: file.originalname, 
            error: result.error || 'Unknown error' 
          });
        }
      } catch (error) {
        failed.push({ 
          filename: file.originalname, 
          error: error instanceof Error ? error.message : 'Processing failed' 
        });
      }
    }

    return {
      successful,
      failed,
      totalProcessed: files.length
    };
  }

  // Get next display order for property images
  private static async getNextDisplayOrder(propertyId: number): Promise<number> {
    const lastImage = await PropertyImage.findOne({
      where: { property_id: propertyId },
      order: [['display_order', 'DESC']]
    });

    return lastImage ? lastImage.display_order + 1 : 1;
  }

  // Update image display order
  static async updateImageOrder(
    imageId: number, 
    newOrder: number, 
    userId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const image = await PropertyImage.findByPk(imageId, {
        include: [{ model: Property, where: { user_id: userId } }]
      });

      if (!image) {
        return { success: false, error: 'Image not found or access denied' };
      }

      await image.update({ display_order: newOrder });
      return { success: true };

    } catch (error) {
      console.error('Error updating image order:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update order' 
      };
    }
  }

  // Delete property image
  static async deletePropertyImage(
    imageId: number, 
    userId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const image = await PropertyImage.findByPk(imageId, {
        include: [{ model: Property, where: { user_id: userId } }]
      });

      if (!image) {
        return { success: false, error: 'Image not found or access denied' };
      }

      // Get file paths
      const propertyImagesDir = path.join(process.cwd(), config.upload.uploadPath, 'properties');
      const imagePath = path.join(propertyImagesDir, image.image_url);
      const thumbnailPath = imagePath.replace(/(\.[^.]+)$/, '_thumb$1');

      // Delete from database first
      await image.destroy();

      // Delete files
      const filesToDelete = [imagePath];
      if (fs.existsSync(thumbnailPath)) {
        filesToDelete.push(thumbnailPath);
      }

      const deleteResult = await bulkDeleteImages(filesToDelete);
      
      if (deleteResult.failed.length > 0) {
        console.warn('Some image files could not be deleted:', deleteResult.failed);
      }

      return { success: true };

    } catch (error) {
      console.error('Error deleting property image:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete image' 
      };
    }
  }

  // Delete all images for a property
  static async deleteAllPropertyImages(
    propertyId: number, 
    userId: number
  ): Promise<{ success: boolean; deletedCount: number; error?: string }> {
    try {
      // Verify property ownership
      const property = await Property.findOne({
        where: { id: propertyId, user_id: userId }
      });

      if (!property) {
        return { success: false, deletedCount: 0, error: 'Property not found or access denied' };
      }

      // Get all images for the property
      const images = await PropertyImage.findAll({
        where: { property_id: propertyId }
      });

      if (images.length === 0) {
        return { success: true, deletedCount: 0 };
      }

      // Collect file paths
      const propertyImagesDir = path.join(process.cwd(), config.upload.uploadPath, 'properties');
      const filesToDelete: string[] = [];

      for (const image of images) {
        const imagePath = path.join(propertyImagesDir, image.image_url);
        const thumbnailPath = imagePath.replace(/(\.[^.]+)$/, '_thumb$1');
        
        filesToDelete.push(imagePath);
        if (fs.existsSync(thumbnailPath)) {
          filesToDelete.push(thumbnailPath);
        }
      }

      // Delete from database
      const deletedCount = await PropertyImage.destroy({
        where: { property_id: propertyId }
      });

      // Delete files
      const deleteResult = await bulkDeleteImages(filesToDelete);
      
      if (deleteResult.failed.length > 0) {
        console.warn('Some image files could not be deleted:', deleteResult.failed);
      }

      return { success: true, deletedCount };

    } catch (error) {
      console.error('Error deleting property images:', error);
      return { 
        success: false, 
        deletedCount: 0,
        error: error instanceof Error ? error.message : 'Failed to delete images' 
      };
    }
  }

  // Get property images with URLs
  static async getPropertyImages(propertyId: number): Promise<Array<{
    id: number;
    url: string;
    thumbnailUrl?: string;
    altText: string;
    displayOrder: number;
  }>> {
    const images = await PropertyImage.findAll({
      where: { property_id: propertyId },
      order: [['display_order', 'ASC']]
    });

    return images.map(image => {
      const url = getFileUrl(image.image_url, 'property');
      const thumbnailFilename = image.image_url.replace(/(\.[^.]+)$/, '_thumb$1');
      const thumbnailPath = path.join(process.cwd(), config.upload.uploadPath, 'properties', thumbnailFilename);
      
      return {
        id: image.id,
        url,
        thumbnailUrl: fs.existsSync(thumbnailPath) ? getFileUrl(thumbnailFilename, 'property') : undefined,
        altText: image.alt_text || '',
        displayOrder: image.display_order
      };
    });
  }

  // Cleanup orphaned images
  static async cleanupOrphanedImages(): Promise<{
    cleaned: string[];
    errors: string[];
    totalCleaned: number;
  }> {
    try {
      // Get all referenced image filenames from database
      const referencedImages = await PropertyImage.findAll({
        attributes: ['image_url']
      });

      const referencedFilenames = referencedImages.map(img => img.image_url);
      
      // Also include thumbnail filenames
      const referencedThumbnails = referencedFilenames.map(filename => 
        filename.replace(/(\.[^.]+)$/, '_thumb$1')
      );

      const allReferencedFiles = [...referencedFilenames, ...referencedThumbnails];

      // Clean up property images directory
      const propertyImagesDir = path.join(process.cwd(), config.upload.uploadPath, 'properties');
      const result = await cleanupOrphanedImages(allReferencedFiles, propertyImagesDir);

      return {
        cleaned: result.cleaned,
        errors: result.errors,
        totalCleaned: result.cleaned.length
      };

    } catch (error) {
      console.error('Error during orphaned images cleanup:', error);
      return {
        cleaned: [],
        errors: [error instanceof Error ? error.message : 'Unknown cleanup error'],
        totalCleaned: 0
      };
    }
  }

  // Get storage statistics
  static async getStorageStats(): Promise<{
    totalImages: number;
    totalSize: number;
    averageSize: number;
    oldestImage: Date | null;
    newestImage: Date | null;
  }> {
    try {
      const images = await PropertyImage.findAll({
        attributes: ['image_url', 'created_at'],
        order: [['created_at', 'ASC']]
      });

      const propertyImagesDir = path.join(process.cwd(), config.upload.uploadPath, 'properties');
      let totalSize = 0;

      for (const image of images) {
        const imagePath = path.join(propertyImagesDir, image.image_url);
        if (fs.existsSync(imagePath)) {
          const stats = fs.statSync(imagePath);
          totalSize += stats.size;
        }
      }

      return {
        totalImages: images.length,
        totalSize,
        averageSize: images.length > 0 ? totalSize / images.length : 0,
        oldestImage: images.length > 0 ? images[0].created_at : null,
        newestImage: images.length > 0 ? images[images.length - 1].created_at : null
      };

    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalImages: 0,
        totalSize: 0,
        averageSize: 0,
        oldestImage: null,
        newestImage: null
      };
    }
  }
}