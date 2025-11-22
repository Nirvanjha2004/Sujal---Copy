import {
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, s3Config, getS3BaseUrl } from '../config/aws';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload options for S3 service
 */
export interface UploadOptions {
  folder: 'properties' | 'projects' | 'avatars';
  entityId: number;
  filename: string;
  buffer: Buffer;
  mimetype: string;
  isPublic?: boolean;
  size?: 'original' | 'large' | 'medium' | 'thumbnail';
}

/**
 * Upload result from S3
 */
export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
  size: number;
}

/**
 * Upload result for both JPEG and WebP formats
 */
export interface UploadResultWithWebP {
  jpeg: UploadResult;
  webp: UploadResult;
}

/**
 * Image metadata from S3
 */
export interface ImageMetadata {
  key: string;
  size: number;
  lastModified: Date;
  contentType: string;
}

/**
 * S3 Service for handling all S3 operations
 */
export class S3Service {
  private acceleratedClient: S3Client | null = null;

  /**
   * Get S3 client with Transfer Acceleration enabled
   * Uses accelerated endpoint for faster uploads from distant locations
   */
  private getAcceleratedClient(): S3Client {
    if (!this.acceleratedClient) {
      this.acceleratedClient = new S3Client({
        region: s3Config.region,
        credentials: {
          accessKeyId: s3Config.accessKeyId,
          secretAccessKey: s3Config.secretAccessKey,
        },
        useAccelerateEndpoint: true, // Enable Transfer Acceleration
      });
    }
    return this.acceleratedClient;
  }

  /**
   * Upload an image to S3
   * Uses Transfer Acceleration for faster uploads when available
   */
  async uploadImage(options: UploadOptions): Promise<UploadResult> {
    try {
      const key = this.generateS3Key(options);

      const command = new PutObjectCommand({
        Bucket: s3Config.bucket,
        Key: key,
        Body: options.buffer,
        ContentType: options.mimetype,
        CacheControl: 'public, max-age=31536000, immutable', // 1 year with immutable directive
        Metadata: {
          'uploaded-at': new Date().toISOString(),
          'entity-type': options.folder,
          'entity-id': options.entityId.toString(),
          'original-filename': options.filename,
        },
      });

      // Use accelerated client for uploads (faster from distant locations)
      const client = this.getAcceleratedClient();
      await client.send(command);

      const url = this.getPublicUrl(key);

      return {
        url,
        key,
        bucket: s3Config.bucket,
        size: options.buffer.length,
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error(`Failed to upload image to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload an image with both JPEG and WebP formats
   * Uploads all size variants (thumbnail, medium, large) in both formats
   * Sets appropriate Cache-Control headers (max-age=31536000, immutable)
   * Sets appropriate Content-Type headers for WebP
   */
  async uploadImageWithWebP(
    jpegBuffer: Buffer,
    webpBuffer: Buffer,
    options: Omit<UploadOptions, 'buffer' | 'mimetype'> & { mimetype?: string }
  ): Promise<UploadResultWithWebP> {
    try {
      // Upload JPEG version
      const jpegResult = await this.uploadImage({
        ...options,
        buffer: jpegBuffer,
        mimetype: options.mimetype || 'image/jpeg',
      });

      // Generate WebP key by replacing extension
      const webpFilename = options.filename.replace(/\.(jpg|jpeg|png)$/i, '.webp');

      // Upload WebP version with appropriate Content-Type
      const webpResult = await this.uploadImage({
        ...options,
        filename: webpFilename,
        buffer: webpBuffer,
        mimetype: 'image/webp',
      });

      return {
        jpeg: jpegResult,
        webp: webpResult,
      };
    } catch (error) {
      console.error('S3 upload with WebP error:', error);
      throw new Error(`Failed to upload image with WebP to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload all size variants (thumbnail, medium, large) for both JPEG and WebP formats
   * This is a convenience method that uploads 6 files total (3 sizes × 2 formats)
   */
  async uploadAllSizeVariantsWithWebP(
    jpegSizes: { thumbnail: Buffer; medium: Buffer; large: Buffer },
    webpSizes: { thumbnail: Buffer; medium: Buffer; large: Buffer },
    baseOptions: Omit<UploadOptions, 'buffer' | 'mimetype' | 'size'>
  ): Promise<{
    thumbnail: UploadResultWithWebP;
    medium: UploadResultWithWebP;
    large: UploadResultWithWebP;
  }> {
    try {
      // Upload all sizes in parallel for better performance
      const [thumbnail, medium, large] = await Promise.all([
        this.uploadImageWithWebP(jpegSizes.thumbnail, webpSizes.thumbnail, {
          ...baseOptions,
          size: 'thumbnail',
        }),
        this.uploadImageWithWebP(jpegSizes.medium, webpSizes.medium, {
          ...baseOptions,
          size: 'medium',
        }),
        this.uploadImageWithWebP(jpegSizes.large, webpSizes.large, {
          ...baseOptions,
          size: 'large',
        }),
      ]);

      return {
        thumbnail,
        medium,
        large,
      };
    } catch (error) {
      console.error('S3 upload all size variants with WebP error:', error);
      throw new Error(`Failed to upload all size variants with WebP to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete an image from S3
   */
  async deleteImage(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: s3Config.bucket,
        Key: key,
      });

      await s3Client.send(command);
      console.log(`Deleted S3 object: ${key}`);
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error(`Failed to delete image from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete multiple images from S3
   */
  async deleteMultipleImages(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    try {
      const command = new DeleteObjectsCommand({
        Bucket: s3Config.bucket,
        Delete: {
          Objects: keys.map(key => ({ Key: key })),
          Quiet: false,
        },
      });

      const result = await s3Client.send(command);

      if (result.Deleted) {
        console.log(`Deleted ${result.Deleted.length} S3 objects`);
      }

      if (result.Errors && result.Errors.length > 0) {
        console.error('Some deletions failed:', result.Errors);
      }
    } catch (error) {
      console.error('S3 batch delete error:', error);
      throw new Error(`Failed to delete images from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a signed URL for private images
   */
  async generateSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: s3Config.bucket,
        Key: key,
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      console.error('S3 signed URL error:', error);
      throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Copy an image within S3
   */
  async copyImage(sourceKey: string, destKey: string): Promise<void> {
    try {
      const command = new CopyObjectCommand({
        Bucket: s3Config.bucket,
        Key: destKey,
        CopySource: `${s3Config.bucket}/${sourceKey}`,
      });

      await s3Client.send(command);
      console.log(`Copied S3 object from ${sourceKey} to ${destKey}`);
    } catch (error) {
      console.error('S3 copy error:', error);
      throw new Error(`Failed to copy image in S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List images with a specific prefix
   */
  async listImages(prefix: string): Promise<string[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: s3Config.bucket,
        Prefix: prefix,
      });

      const response = await s3Client.send(command);

      if (!response.Contents) {
        return [];
      }

      return response.Contents
        .filter(obj => obj.Key)
        .map(obj => obj.Key!);
    } catch (error) {
      console.error('S3 list error:', error);
      throw new Error(`Failed to list images from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get image metadata from S3
   */
  async getImageMetadata(key: string): Promise<ImageMetadata> {
    try {
      const command = new HeadObjectCommand({
        Bucket: s3Config.bucket,
        Key: key,
      });

      const response = await s3Client.send(command);

      return {
        key,
        size: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        contentType: response.ContentType || 'application/octet-stream',
      };
    } catch (error) {
      console.error('S3 metadata error:', error);
      throw new Error(`Failed to get image metadata from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if an image exists in S3
   */
  async imageExists(key: string): Promise<boolean> {
    try {
      await this.getImageMetadata(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate S3 key (path) for an image
   */
  private generateS3Key(options: UploadOptions): string {
    const { folder, entityId, filename, size = 'original' } = options;

    // Extract file extension
    const ext = filename.split('.').pop() || 'jpg';

    // Generate unique filename
    const uniqueFilename = `${uuidv4()}.${ext}`;

    // Construct key: folder/entity-id/size/unique-filename
    // Example: properties/123/original/abc-123.jpg
    return `${folder}/${folder.slice(0, -1)}-${entityId}/${size}/${uniqueFilename}`;
  }

  /**
   * Get public URL for an S3 object
   */
  private getPublicUrl(key: string): string {
    const baseUrl = getS3BaseUrl();
    return `${baseUrl}/${key}`;
  }

  /**
   * Extract S3 key from URL
   */
  extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      // Remove leading slash
      return urlObj.pathname.substring(1);
    } catch (error) {
      console.error('Invalid URL:', url);
      return null;
    }
  }

  /**
   * Get all size variants for an image
   */
  getSizeVariants(originalKey: string): {
    original: string;
    large: string;
    medium: string;
    thumbnail: string;
  } {
    // Extract parts from original key
    // Example: properties/property-123/original/abc-123.jpg
    const parts = originalKey.split('/');
    const filename = parts[parts.length - 1];
    const basePath = parts.slice(0, -2).join('/');

    return {
      original: originalKey,
      large: `${basePath}/large/${filename}`,
      medium: `${basePath}/medium/${filename}`,
      thumbnail: `${basePath}/thumbnails/${filename}`,
    };
  }
}

// Export singleton instance
export default new S3Service();
