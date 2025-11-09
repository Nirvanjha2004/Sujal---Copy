import { PropertyImage } from '../models/PropertyImage';
import { Property } from '../models/Property';
import s3Service from './s3Service';
import imageProcessingService from './imageProcessingService';
import fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

/**
 * Image processing options
 */
export interface ImageProcessingOptions {
  generateThumbnail?: boolean;
  optimize?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Image upload result
 */
export interface ImageUploadResult {
  success: boolean;
  imageId?: number;
  filename?: string;
  url?: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  error?: string;
}

/**
 * Bulk image upload result
 */
export interface BulkImageUploadResult {
  successful: ImageUploadResult[];
  failed: Array<{ filename: string; error: string }>;
  totalProcessed: number;
}

/**
 * Storage statistics
 */
export interface StorageStats {
  totalImages: number;
  totalSize: number;
  averageSize: number;
  oldestImage: Date | null;
  newestImage: Date | null;
}

/**
 * Cleanup result
 */
export interface CleanupResult {
  totalCleaned: number;
  cleaned: string[];
  errors: Array<{ key: string; error: string }>;
}

/**
 * S3-Integrated Image Service
 * Handles image upload, processing, and management using AWS S3
 */
export class ImageServiceS3 {
  /**
   * Process and save single property image to S3
   */
  static async processAndSavePropertyImage(
    propertyId: number,
    file: Express.Multer.File,
    options: ImageProcessingOptions = {}
  ): Promise<ImageUploadResult> {
    try {
      // Validate property exists
      const property = await Property.findByPk(propertyId);
      if (!property) {
        // Clean up uploaded file
        await this.cleanupLocalFile(file.path);
        return { success: false, error: 'Property not found' };
      }

      // Read file buffer
      const buffer = await readFile(file.path);

      // Validate image
      const validation = await imageProcessingService.validateImage(buffer);
      if (!validation.isValid) {
        await this.cleanupLocalFile(file.path);
        return { success: false, error: validation.error || 'Invalid image' };
      }

      const {
        generateThumbnail: shouldGenerateSizes = true,
        quality = 85
      } = options;

      // Process image and generate all sizes
      const processedImages = await imageProcessingService.processImage(buffer, {
        quality,
        format: 'jpeg',
        generateSizes: shouldGenerateSizes,
      });

      // Upload all sizes to S3
      const uploadResults = await Promise.all([
        s3Service.uploadImage({
          folder: 'properties',
          entityId: propertyId,
          filename: file.originalname,
          buffer: processedImages.original,
          mimetype: file.mimetype,
          size: 'original',
        }),
        s3Service.uploadImage({
          folder: 'properties',
          entityId: propertyId,
          filename: file.originalname,
          buffer: processedImages.large,
          mimetype: file.mimetype,
          size: 'large',
        }),
        s3Service.uploadImage({
          folder: 'properties',
          entityId: propertyId,
          filename: file.originalname,
          buffer: processedImages.medium,
          mimetype: file.mimetype,
          size: 'medium',
        }),
        s3Service.uploadImage({
          folder: 'properties',
          entityId: propertyId,
          filename: file.originalname,
          buffer: processedImages.thumbnail,
          mimetype: file.mimetype,
          size: 'thumbnail',
        }),
      ]);

      const [originalUpload, largeUpload, mediumUpload, thumbnailUpload] = uploadResults;

      // Get image metadata
      const metadata = await imageProcessingService.getMetadata(buffer);

      // Save to database with S3 URLs
      const propertyImage = await PropertyImage.create({
        property_id: propertyId,
        image_url: originalUpload.url,
        s3_key: originalUpload.key,
        s3_bucket: originalUpload.bucket,
        thumbnail_url: thumbnailUpload.url,
        medium_url: mediumUpload.url,
        large_url: largeUpload.url,
        file_size: originalUpload.size,
        mime_type: file.mimetype,
        width: metadata.width || 0,
        height: metadata.height || 0,
        alt_text: `Property image for ${property.title}`,
        display_order: await this.getNextDisplayOrder(propertyId),
        is_primary: false,
      });

      // Clean up local file
      await this.cleanupLocalFile(file.path);

      return {
        success: true,
        imageId: propertyImage.id,
        filename: file.originalname,
        url: originalUpload.url,
        thumbnailUrl: thumbnailUpload.url,
        mediumUrl: mediumUpload.url,
        largeUrl: largeUpload.url,
      };

    } catch (error) {
      // Clean up local file on error
      await this.cleanupLocalFile(file.path);

      console.error('Error processing property image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process image'
      };
    }
  }

  /**
   * Process bulk property images
   */
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
      // Clean up all files
      await Promise.all(files.map(file => this.cleanupLocalFile(file.path)));
      
      return {
        successful: [],
        failed: files.map(file => ({
          filename: file.originalname,
          error: 'Property not found'
        })),
        totalProcessed: files.length
      };
    }

    // Process each file concurrently (with limit)
    const CONCURRENT_LIMIT = 3;
    for (let i = 0; i < files.length; i += CONCURRENT_LIMIT) {
      const batch = files.slice(i, i + CONCURRENT_LIMIT);
      const results = await Promise.all(
        batch.map(file => this.processAndSavePropertyImage(propertyId, file, options))
      );

      results.forEach((result, index) => {
        if (result.success) {
          successful.push(result);
        } else {
          failed.push({
            filename: batch[index].originalname,
            error: result.error || 'Unknown error'
          });
        }
      });
    }

    return {
      successful,
      failed,
      totalProcessed: files.length
    };
  }

  /**
   * Delete property image from S3 and database
   */
  static async deletePropertyImage(imageId: number, userId: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Find image
      const image = await PropertyImage.findByPk(imageId, {
        include: [{ model: Property, as: 'property' }]
      });

      if (!image) {
        return { success: false, error: 'Image not found' };
      }

      // Verify user owns the property
      const property = image.property as any;
      if (property && property.user_id !== userId) {
        return { success: false, error: 'Access denied' };
      }

      // Delete all size variants from S3
      const keysToDelete: string[] = [];
      
      if (image.s3_key) {
        const variants = s3Service.getSizeVariants(image.s3_key);
        keysToDelete.push(
          variants.original,
          variants.large,
          variants.medium,
          variants.thumbnail
        );
      }

      if (keysToDelete.length > 0) {
        await s3Service.deleteMultipleImages(keysToDelete);
      }

      // Delete from database
      await image.destroy();

      return { success: true };

    } catch (error) {
      console.error('Error deleting property image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete image'
      };
    }
  }

  /**
   * Update image display order
   */
  static async updateImageOrder(
    imageId: number,
    displayOrder: number,
    userId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Find image
      const image = await PropertyImage.findByPk(imageId, {
        include: [{ model: Property, as: 'property' }]
      });

      if (!image) {
        return { success: false, error: 'Image not found' };
      }

      // Verify user owns the property
      const property = image.property as any;
      if (property && property.user_id !== userId) {
        return { success: false, error: 'Access denied' };
      }

      // Update display order
      image.display_order = displayOrder;
      await image.save();

      return { success: true };

    } catch (error) {
      console.error('Error updating image order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update image order'
      };
    }
  }

  /**
   * Get property images
   */
  static async getPropertyImages(propertyId: number): Promise<any[]> {
    try {
      const images = await PropertyImage.findAll({
        where: { property_id: propertyId },
        order: [['display_order', 'ASC'], ['created_at', 'ASC']]
      });

      return images.map(img => ({
        id: img.id,
        url: img.image_url,
        thumbnailUrl: img.thumbnail_url,
        mediumUrl: img.medium_url,
        largeUrl: img.large_url,
        altText: img.alt_text,
        displayOrder: img.display_order,
        isPrimary: img.is_primary,
        width: img.width,
        height: img.height,
        fileSize: img.file_size,
        mimeType: img.mime_type,
        createdAt: img.created_at
      }));

    } catch (error) {
      console.error('Error getting property images:', error);
      return [];
    }
  }

  /**
   * Get storage statistics
   */
  static async getStorageStats(): Promise<StorageStats> {
    try {
      const images = await PropertyImage.findAll({
        attributes: ['file_size', 'created_at'],
        order: [['created_at', 'ASC']]
      });

      const totalImages = images.length;
      const totalSize = images.reduce((sum, img) => sum + (img.file_size || 0), 0);
      const averageSize = totalImages > 0 ? totalSize / totalImages : 0;
      const oldestImage = images.length > 0 ? images[0].created_at : null;
      const newestImage = images.length > 0 ? images[images.length - 1].created_at : null;

      return {
        totalImages,
        totalSize,
        averageSize,
        oldestImage,
        newestImage
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

  /**
   * Cleanup orphaned images from S3
   */
  static async cleanupOrphanedImages(): Promise<CleanupResult> {
    try {
      const cleaned: string[] = [];
      const errors: Array<{ key: string; error: string }> = [];

      // Get all S3 keys from database
      const dbImages = await PropertyImage.findAll({
        attributes: ['s3_key']
      });
      const dbKeys = new Set(dbImages.map(img => img.s3_key).filter(Boolean));

      // List all images in S3
      const s3Keys = await s3Service.listImages('properties/');

      // Find orphaned keys (in S3 but not in database)
      const orphanedKeys = s3Keys.filter(key => !dbKeys.has(key));

      // Delete orphaned images
      if (orphanedKeys.length > 0) {
        try {
          await s3Service.deleteMultipleImages(orphanedKeys);
          cleaned.push(...orphanedKeys);
        } catch (error) {
          orphanedKeys.forEach(key => {
            errors.push({
              key,
              error: error instanceof Error ? error.message : 'Failed to delete'
            });
          });
        }
      }

      return {
        totalCleaned: cleaned.length,
        cleaned,
        errors
      };

    } catch (error) {
      console.error('Error cleaning up orphaned images:', error);
      return {
        totalCleaned: 0,
        cleaned: [],
        errors: [{ key: 'general', error: error instanceof Error ? error.message : 'Unknown error' }]
      };
    }
  }

  /**
   * Get next display order for property images
   */
  private static async getNextDisplayOrder(propertyId: number): Promise<number> {
    const maxOrder = await PropertyImage.max('display_order', {
      where: { property_id: propertyId }
    }) as number | null;
    return (maxOrder || 0) + 1;
  }

  /**
   * Process and save single project image to S3
   */
  static async processAndSaveProjectImage(
    projectId: number,
    file: Express.Multer.File,
    options: ImageProcessingOptions = {}
  ): Promise<ImageUploadResult> {
    try {
      // Import ProjectImage dynamically to avoid circular dependency
      const { ProjectImage } = await import('../models/ProjectImage');
      const { Project } = await import('../models/Project');

      // Validate project exists
      const project = await Project.findByPk(projectId);
      if (!project) {
        // Clean up uploaded file
        await this.cleanupLocalFile(file.path);
        return { success: false, error: 'Project not found' };
      }

      // Read file buffer
      const buffer = await readFile(file.path);

      // Validate image
      const validation = await imageProcessingService.validateImage(buffer);
      if (!validation.isValid) {
        await this.cleanupLocalFile(file.path);
        return { success: false, error: validation.error || 'Invalid image' };
      }

      const {
        generateThumbnail: shouldGenerateSizes = true,
        quality = 85
      } = options;

      // Process image and generate all sizes
      const processedImages = await imageProcessingService.processImage(buffer, {
        quality,
        format: 'jpeg',
        generateSizes: shouldGenerateSizes,
      });

      // Upload all sizes to S3
      const uploadResults = await Promise.all([
        s3Service.uploadImage({
          folder: 'projects',
          entityId: projectId,
          filename: file.originalname,
          buffer: processedImages.original,
          mimetype: file.mimetype,
          size: 'original',
        }),
        s3Service.uploadImage({
          folder: 'projects',
          entityId: projectId,
          filename: file.originalname,
          buffer: processedImages.large,
          mimetype: file.mimetype,
          size: 'large',
        }),
        s3Service.uploadImage({
          folder: 'projects',
          entityId: projectId,
          filename: file.originalname,
          buffer: processedImages.medium,
          mimetype: file.mimetype,
          size: 'medium',
        }),
        s3Service.uploadImage({
          folder: 'projects',
          entityId: projectId,
          filename: file.originalname,
          buffer: processedImages.thumbnail,
          mimetype: file.mimetype,
          size: 'thumbnail',
        }),
      ]);

      const [originalUpload, largeUpload, mediumUpload, thumbnailUpload] = uploadResults;

      // Get image metadata
      const metadata = await imageProcessingService.getMetadata(buffer);

      // Save to database with S3 URLs
      const projectImage = await ProjectImage.create({
        project_id: projectId,
        image_url: originalUpload.url,
        s3_key: originalUpload.key,
        s3_bucket: originalUpload.bucket,
        thumbnail_url: thumbnailUpload.url,
        medium_url: mediumUpload.url,
        large_url: largeUpload.url,
        file_size: originalUpload.size,
        mime_type: file.mimetype,
        width: metadata.width || 0,
        height: metadata.height || 0,
        alt_text: `Project image for ${project.name}`,
        display_order: await this.getNextProjectDisplayOrder(projectId),
        is_primary: false,
      });

      // Clean up local file
      await this.cleanupLocalFile(file.path);

      return {
        success: true,
        imageId: projectImage.id,
        filename: file.originalname,
        url: originalUpload.url,
        thumbnailUrl: thumbnailUpload.url,
        mediumUrl: mediumUpload.url,
        largeUrl: largeUpload.url,
      };

    } catch (error) {
      // Clean up local file on error
      await this.cleanupLocalFile(file.path);

      console.error('Error processing project image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process image'
      };
    }
  }

  /**
   * Process bulk project images
   */
  static async processBulkProjectImages(
    projectId: number,
    files: Express.Multer.File[],
    options: ImageProcessingOptions = {}
  ): Promise<BulkImageUploadResult> {
    const successful: ImageUploadResult[] = [];
    const failed: Array<{ filename: string; error: string }> = [];

    // Import ProjectImage dynamically
    const { Project } = await import('../models/Project');

    // Validate project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      // Clean up all files
      await Promise.all(files.map(file => this.cleanupLocalFile(file.path)));
      
      return {
        successful: [],
        failed: files.map(file => ({
          filename: file.originalname,
          error: 'Project not found'
        })),
        totalProcessed: files.length
      };
    }

    // Process each file concurrently (with limit)
    const CONCURRENT_LIMIT = 3;
    for (let i = 0; i < files.length; i += CONCURRENT_LIMIT) {
      const batch = files.slice(i, i + CONCURRENT_LIMIT);
      const results = await Promise.all(
        batch.map(file => this.processAndSaveProjectImage(projectId, file, options))
      );

      results.forEach((result, index) => {
        if (result.success) {
          successful.push(result);
        } else {
          failed.push({
            filename: batch[index].originalname,
            error: result.error || 'Unknown error'
          });
        }
      });
    }

    return {
      successful,
      failed,
      totalProcessed: files.length
    };
  }

  /**
   * Delete project image from S3 and database
   */
  static async deleteProjectImage(imageId: number, userId: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Import ProjectImage dynamically
      const { ProjectImage } = await import('../models/ProjectImage');
      const { Project } = await import('../models/Project');

      // Find image
      const image = await ProjectImage.findByPk(imageId, {
        include: [{ model: Project, as: 'project' }]
      });

      if (!image) {
        return { success: false, error: 'Image not found' };
      }

      // Verify user owns the project
      const project = image.project as any;
      if (project && project.builder_id !== userId) {
        return { success: false, error: 'Access denied' };
      }

      // Delete all size variants from S3
      const keysToDelete: string[] = [];
      
      if (image.s3_key) {
        const variants = s3Service.getSizeVariants(image.s3_key);
        keysToDelete.push(
          variants.original,
          variants.large,
          variants.medium,
          variants.thumbnail
        );
      }

      if (keysToDelete.length > 0) {
        await s3Service.deleteMultipleImages(keysToDelete);
      }

      // Delete from database
      await image.destroy();

      return { success: true };

    } catch (error) {
      console.error('Error deleting project image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete image'
      };
    }
  }

  /**
   * Get project images
   */
  static async getProjectImages(projectId: number): Promise<any[]> {
    try {
      // Import ProjectImage dynamically
      const { ProjectImage } = await import('../models/ProjectImage');

      const images = await ProjectImage.findAll({
        where: { project_id: projectId },
        order: [['display_order', 'ASC'], ['created_at', 'ASC']]
      });

      return images.map(img => ({
        id: img.id,
        url: img.image_url,
        thumbnailUrl: img.thumbnail_url,
        mediumUrl: img.medium_url,
        largeUrl: img.large_url,
        altText: img.alt_text,
        caption: img.caption,
        imageType: img.image_type,
        displayOrder: img.display_order,
        isPrimary: img.is_primary,
        width: img.width,
        height: img.height,
        fileSize: img.file_size,
        mimeType: img.mime_type,
        createdAt: img.created_at
      }));

    } catch (error) {
      console.error('Error getting project images:', error);
      return [];
    }
  }

  /**
   * Get next display order for project images
   */
  private static async getNextProjectDisplayOrder(projectId: number): Promise<number> {
    const { ProjectImage } = await import('../models/ProjectImage');
    const maxOrder = await ProjectImage.max('display_order', {
      where: { project_id: projectId }
    }) as number | null;
    return (maxOrder || 0) + 1;
  }

  /**
   * Clean up local file
   */
  private static async cleanupLocalFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch (error) {
      console.error('Error cleaning up local file:', error);
    }
  }
}
