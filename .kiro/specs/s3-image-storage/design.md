# Design Document: AWS S3 Image Storage Integration

## Overview

This design document outlines the architecture for migrating from local file storage to AWS S3 cloud storage for all property and project images. The solution uses a backend-proxied approach where uploads go through the backend for validation and processing, while downloads happen directly from S3 for optimal performance.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│    Frontend     │
│   (React App)   │
└────────┬────────┘
         │
         │ 1. Upload Request (multipart/form-data)
         │ 4. Receive S3 URLs
         │ 6. Display images (direct from S3)
         ▼
┌─────────────────┐
│    Backend      │
│   (Node.js)     │
│                 │
│  ┌───────────┐  │
│  │ Upload    │  │ 2. Validate & Process
│  │ Service   │  │
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │ S3        │  │ 3. Upload to S3
│  │ Service   │  │
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │ Database  │  │ 5. Store S3 URLs
│  └───────────┘  │
└────────┬────────┘
         │
         │ 3. Upload images
         │ 5. Store metadata
         ▼
┌─────────────────┐      ┌──────────────┐
│   AWS S3        │◄─────│  CloudFront  │ (Optional CDN)
│   Bucket        │      │     CDN      │
└─────────────────┘      └──────────────┘
         │
         │ 6. Serve images directly
         ▼
┌─────────────────┐
│   End Users     │
│   (Browsers)    │
└─────────────────┘
```

### Component Diagram

```
Backend Components:
├── config/
│   └── aws.ts                    # AWS S3 configuration
├── services/
│   ├── s3Service.ts              # S3 upload/delete operations
│   ├── imageProcessingService.ts # Image optimization & resizing
│   └── migrationService.ts       # Local to S3 migration
├── controllers/
│   └── uploadController.ts       # Updated to use S3
├── utils/
│   ├── imageValidator.ts         # File validation
│   └── urlGenerator.ts           # S3 URL generation
└── scripts/
    └── migrateToS3.ts            # Migration script

Frontend Components:
├── services/
│   └── propertyImageService.ts   # Updated to handle S3 URLs
└── components/
    └── PropertyImageUpload.tsx   # No changes needed
```

## Components and Interfaces

### 1. AWS S3 Configuration (`src/config/aws.ts`)

```typescript
import { S3Client } from '@aws-sdk/client-s3';

export interface S3Config {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  cdnUrl?: string;
}

export const s3Config: S3Config = {
  region: process.env.AWS_REGION || 'us-east-1',
  bucket: process.env.AWS_S3_BUCKET || '',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  cdnUrl: process.env.AWS_CLOUDFRONT_URL,
};

export const s3Client = new S3Client({
  region: s3Config.region,
  credentials: {
    accessKeyId: s3Config.accessKeyId,
    secretAccessKey: s3Config.secretAccessKey,
  },
});
```

### 2. S3 Service (`src/services/s3Service.ts`)

```typescript
export interface UploadOptions {
  folder: 'properties' | 'projects' | 'avatars';
  entityId: number;
  filename: string;
  buffer: Buffer;
  mimetype: string;
  isPublic?: boolean;
}

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
  size: number;
}

export class S3Service {
  async uploadImage(options: UploadOptions): Promise<UploadResult>
  async deleteImage(key: string): Promise<void>
  async deleteMultipleImages(keys: string[]): Promise<void>
  async generateSignedUrl(key: string, expiresIn: number): Promise<string>
  async copyImage(sourceKey: string, destKey: string): Promise<void>
  async listImages(prefix: string): Promise<string[]>
  async getImageMetadata(key: string): Promise<ImageMetadata>
}
```

### 3. Image Processing Service (`src/services/imageProcessingService.ts`)

```typescript
export interface ImageSizes {
  thumbnail: Buffer;  // 300px
  medium: Buffer;     // 800px
  large: Buffer;      // 1600px
  original: Buffer;
}

export interface ProcessingOptions {
  quality: number;
  format: 'jpeg' | 'png' | 'webp';
  generateSizes: boolean;
}

export class ImageProcessingService {
  async processImage(buffer: Buffer, options: ProcessingOptions): Promise<ImageSizes>
  async optimizeImage(buffer: Buffer): Promise<Buffer>
  async generateThumbnail(buffer: Buffer, width: number): Promise<Buffer>
  async convertToWebP(buffer: Buffer): Promise<Buffer>
  async validateImage(buffer: Buffer): Promise<boolean>
}
```

### 4. Migration Service (`src/services/migrationService.ts`)

```typescript
export interface MigrationResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ file: string; error: string }>;
}

export class MigrationService {
  async migrateAllImages(): Promise<MigrationResult>
  async migratePropertyImages(propertyId: number): Promise<void>
  async migrateProjectImages(projectId: number): Promise<void>
  async verifyMigration(): Promise<boolean>
  async rollbackMigration(): Promise<void>
}
```

## Data Models

### Updated Property Image Model

```typescript
interface PropertyImage {
  id: number;
  property_id: number;
  image_url: string;           // S3 URL: https://bucket.s3.region.amazonaws.com/...
  thumbnail_url?: string;      // S3 URL for thumbnail
  medium_url?: string;         // S3 URL for medium size
  s3_key: string;              // S3 object key: properties/123/image-abc.jpg
  s3_bucket: string;           // Bucket name
  file_size: number;           // Size in bytes
  mime_type: string;           // image/jpeg, image/png, etc.
  width: number;               // Original width
  height: number;              // Original height
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
  created_at: Date;
  updated_at: Date;
}
```

### S3 Upload Metadata

```typescript
interface S3UploadMetadata {
  uploadedBy: number;          // User ID
  uploadedAt: string;          // ISO timestamp
  originalFilename: string;
  contentType: string;
  entityType: 'property' | 'project';
  entityId: number;
}
```

## S3 Bucket Structure

```
bucket-name/
├── properties/
│   ├── property-123/
│   │   ├── original/
│   │   │   ├── image-abc123.jpg
│   │   │   └── image-def456.jpg
│   │   ├── large/
│   │   │   ├── image-abc123.jpg
│   │   │   └── image-def456.jpg
│   │   ├── medium/
│   │   │   ├── image-abc123.jpg
│   │   │   └── image-def456.jpg
│   │   └── thumbnails/
│   │       ├── image-abc123.jpg
│   │       └── image-def456.jpg
│   └── property-456/
│       └── ...
├── projects/
│   ├── project-789/
│   │   ├── original/
│   │   ├── large/
│   │   ├── medium/
│   │   └── thumbnails/
│   └── ...
└── avatars/
    ├── user-1/
    └── ...
```

## API Endpoints

### Upload Endpoints (Updated)

```
POST /api/v1/upload/property/:propertyId/images
- Accepts: multipart/form-data
- Validates: file type, size, dimensions
- Processes: optimization, resizing
- Uploads: to S3
- Returns: S3 URLs and metadata

POST /api/v1/upload/property/:propertyId/images/bulk
- Accepts: multiple files
- Processes: concurrently
- Returns: array of S3 URLs

DELETE /api/v1/upload/property/:propertyId/images/:imageId
- Deletes: from S3 and database
- Returns: success status
```

### Admin Endpoints (New)

```
GET /api/v1/admin/storage/stats
- Returns: S3 usage statistics

POST /api/v1/admin/storage/cleanup-orphaned
- Identifies: orphaned S3 objects
- Deletes: unused images
- Returns: cleanup report

POST /api/v1/admin/storage/migrate
- Triggers: migration from local to S3
- Returns: migration progress
```

## Error Handling

### Error Types

```typescript
enum S3ErrorType {
  UPLOAD_FAILED = 'S3_UPLOAD_FAILED',
  DELETE_FAILED = 'S3_DELETE_FAILED',
  INVALID_CREDENTIALS = 'S3_INVALID_CREDENTIALS',
  BUCKET_NOT_FOUND = 'S3_BUCKET_NOT_FOUND',
  PERMISSION_DENIED = 'S3_PERMISSION_DENIED',
  NETWORK_ERROR = 'S3_NETWORK_ERROR',
  PROCESSING_ERROR = 'IMAGE_PROCESSING_ERROR',
}

interface S3Error {
  type: S3ErrorType;
  message: string;
  details?: any;
  retryable: boolean;
}
```

### Error Handling Strategy

1. **Network Errors**: Retry up to 3 times with exponential backoff
2. **Permission Errors**: Log and return 403 to user
3. **Processing Errors**: Upload original if processing fails
4. **Validation Errors**: Return 400 with clear message
5. **Critical Errors**: Alert administrators via logging service

## Testing Strategy

### Unit Tests

```typescript
// S3 Service Tests
describe('S3Service', () => {
  test('should upload image to S3');
  test('should delete image from S3');
  test('should generate signed URL');
  test('should handle upload failures');
  test('should retry on network errors');
});

// Image Processing Tests
describe('ImageProcessingService', () => {
  test('should optimize image');
  test('should generate thumbnails');
  test('should convert to WebP');
  test('should validate image format');
});

// Migration Tests
describe('MigrationService', () => {
  test('should migrate all images');
  test('should handle migration failures');
  test('should verify migration');
});
```

### Integration Tests

```typescript
describe('Image Upload Integration', () => {
  test('should upload image through API to S3');
  test('should process and store multiple sizes');
  test('should update database with S3 URLs');
  test('should delete image from S3 and database');
});
```

### Manual Testing Checklist

- [ ] Upload single image
- [ ] Upload multiple images
- [ ] Delete image
- [ ] View images in browser
- [ ] Test with invalid file types
- [ ] Test with oversized files
- [ ] Test with slow network
- [ ] Test migration script
- [ ] Verify S3 bucket structure
- [ ] Test signed URLs for private images

## Security Considerations

### 1. AWS Credentials

- Store in environment variables (never in code)
- Use IAM roles in production (not access keys)
- Rotate credentials regularly
- Use least-privilege IAM policies

### 2. S3 Bucket Security

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::bucket-name/properties/*/original/*"
    }
  ]
}
```

### 3. File Validation

- Validate MIME types
- Check file signatures (magic numbers)
- Limit file sizes
- Scan for malware (optional)

### 4. Access Control

- Verify user owns property before upload
- Generate signed URLs for private content
- Set appropriate expiration times
- Log all S3 operations

## Performance Optimization

### 1. Concurrent Uploads

- Process multiple images in parallel
- Use Promise.all() for batch operations
- Limit concurrency to avoid overwhelming S3

### 2. Image Optimization

- Compress images before upload
- Generate multiple sizes
- Use WebP format when supported
- Set appropriate quality levels

### 3. Caching

```typescript
// S3 Upload with Cache Headers
const uploadParams = {
  CacheControl: 'public, max-age=31536000', // 1 year
  ContentType: mimetype,
  Metadata: {
    'uploaded-by': userId.toString(),
    'uploaded-at': new Date().toISOString(),
  },
};
```

### 4. CDN Integration (Optional)

- Configure CloudFront distribution
- Use CloudFront URLs instead of S3 URLs
- Implement cache invalidation
- Enable compression

## Migration Strategy

### Phase 1: Preparation

1. Set up AWS S3 bucket
2. Configure IAM policies
3. Test S3 connectivity
4. Deploy S3 service code

### Phase 2: Parallel Operation

1. Upload new images to S3
2. Keep local storage for existing images
3. Update database with S3 URLs
4. Test thoroughly

### Phase 3: Migration

1. Run migration script for existing images
2. Verify all images migrated successfully
3. Update all database records
4. Archive local images (don't delete yet)

### Phase 4: Cleanup

1. Monitor for issues (1-2 weeks)
2. Delete local images after verification
3. Remove local storage code
4. Update documentation

## Rollback Plan

If issues occur:

1. **Immediate**: Switch upload endpoint back to local storage
2. **Database**: Revert image URLs to local paths
3. **S3**: Keep S3 images as backup
4. **Investigation**: Analyze logs and fix issues
5. **Retry**: Attempt migration again after fixes

## Monitoring and Alerts

### Metrics to Track

- Upload success/failure rate
- Average upload time
- S3 storage usage
- Bandwidth usage
- Error rates by type
- Image processing time

### Alerts

- S3 upload failures > 5% in 5 minutes
- S3 storage > 80% of quota
- AWS credentials expiring soon
- Orphaned images detected
- Migration failures

## Cost Estimation

### Monthly Costs (Estimated)

```
Assumptions:
- 10,000 properties
- 5 images per property (average)
- 2MB per original image
- 3 additional sizes per image

Storage:
- Original: 10,000 × 5 × 2MB = 100GB
- Processed: 100GB × 3 = 300GB
- Total: 400GB × $0.023/GB = $9.20/month

Requests:
- Uploads: 50,000 × $0.005/1000 = $0.25/month
- Downloads: 1M × $0.0004/1000 = $0.40/month

Data Transfer:
- 100GB out × $0.09/GB = $9.00/month

Total: ~$19/month (without CDN)
With CloudFront CDN: ~$25/month
```

## Future Enhancements

1. **CloudFront CDN**: Add CDN for faster global delivery
2. **Image Recognition**: Auto-tag images with AI
3. **Smart Cropping**: Auto-crop images for thumbnails
4. **Video Support**: Extend to support property videos
5. **Progressive Loading**: Implement blur-up technique
6. **Lazy Loading**: Load images on scroll
7. **WebP Conversion**: Auto-convert to WebP for modern browsers
8. **Backup Strategy**: Implement S3 versioning and cross-region replication
