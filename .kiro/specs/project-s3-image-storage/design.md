# Design Document: AWS S3 Image Storage for Projects

## Overview

This design document outlines the implementation of AWS S3 image storage for project images, mirroring the existing property image implementation. The solution leverages the existing S3Service and ImageProcessingService infrastructure, requiring minimal new code while ensuring consistency across the platform.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│    Frontend     │
│   (React App)   │
│  ProjectImage   │
│    Upload       │
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
│  │ Project   │  │ 2. Validate & Process
│  │Controller │  │
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │ImageSvc   │  │ 3. Process & Upload
│  │   S3      │  │    (Reuse existing)
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │ S3Service │  │ 3. Upload to S3
│  │ (Existing)│  │    (Reuse existing)
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │ Database  │  │ 5. Store S3 URLs
│  │project_   │  │    (New table)
│  │images     │  │
│  └───────────┘  │
└────────┬────────┘
         │
         │ 3. Upload images
         ▼
┌─────────────────┐
│   AWS S3        │
│   Bucket        │
│  projects/      │ ← New folder structure
└─────────────────┘
```

### Component Reuse Strategy

The implementation will **reuse existing components**:

1. **S3Service** - Already supports `folder: 'projects'` parameter
2. **ImageProcessingService** - Generic image processing, no changes needed
3. **Upload patterns** - Follow the same flow as PropertyImage

**New components needed**:
1. **ProjectImage model** - Database model for project_images table
2. **Project image methods** - Add to existing ImageServiceS3 or create ProjectImageServiceS3
3. **Database migration** - Create project_images table
4. **Project controller updates** - Update existing project image upload endpoints

## Components and Interfaces

### 1. ProjectImage Model (`src/models/ProjectImage.ts`)

```typescript
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class ProjectImage extends Model {
  public id!: number;
  public project_id!: number;
  public image_url!: string;
  public thumbnail_url!: string;
  public medium_url!: string;
  public large_url!: string;
  public s3_key!: string;
  public s3_bucket!: string;
  public file_size!: number;
  public mime_type!: string;
  public width!: number;
  public height!: number;
  public alt_text?: string;
  public caption?: string;
  public display_order!: number;
  public is_primary!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ProjectImage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    thumbnail_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    medium_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    large_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    s3_key: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    s3_bucket: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mime_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    alt_text: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    caption: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    display_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'project_images',
    timestamps: true,
    underscored: true,
  }
);
```

### 2. Project Image Service Extension

**Option A: Extend ImageServiceS3** (Recommended)

Add project-specific methods to the existing `ImageServiceS3` class:

```typescript
// In src/services/imageServiceS3.ts

/**
 * Process and save single project image to S3
 */
static async processAndSaveProjectImage(
  projectId: number,
  file: Express.Multer.File,
  options: ImageProcessingOptions = {}
): Promise<ImageUploadResult> {
  // Implementation mirrors processAndSavePropertyImage
  // but uses ProjectImage model and 'projects' folder
}

/**
 * Process bulk project images
 */
static async processBulkProjectImages(
  projectId: number,
  files: Express.Multer.File[],
  options: ImageProcessingOptions = {}
): Promise<BulkImageUploadResult> {
  // Implementation mirrors processBulkPropertyImages
}

/**
 * Delete project image from S3 and database
 */
static async deleteProjectImage(
  imageId: number,
  userId: number
): Promise<{ success: boolean; error?: string }> {
  // Implementation mirrors deletePropertyImage
  // but uses ProjectImage model
}

/**
 * Get project images
 */
static async getProjectImages(projectId: number): Promise<any[]> {
  // Implementation mirrors getPropertyImages
}
```

### 3. Project Controller Updates

Update `src/controllers/projectController.ts` to use ImageServiceS3:

```typescript
import { ImageServiceS3 } from '../services/imageServiceS3';

// Upload project images
static async uploadProjectImages(req: AuthenticatedRequest, res: Response) {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId;
    const files = req.files as Express.Multer.File[];

    // Verify user owns the project
    const project = await Project.findByPk(projectId);
    if (!project || project.builder_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Process and upload images
    const result = await ImageServiceS3.processBulkProjectImages(
      parseInt(projectId),
      files,
      {
        generateThumbnail: true,
        optimize: true,
        quality: 85
      }
    );

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error uploading project images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload images'
    });
  }
}

// Delete project image
static async deleteProjectImage(req: AuthenticatedRequest, res: Response) {
  try {
    const { imageId } = req.params;
    const userId = req.user?.userId;

    const result = await ImageServiceS3.deleteProjectImage(
      parseInt(imageId),
      userId
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error deleting project image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image'
    });
  }
}
```

## Data Models

### Project Images Table Schema

```sql
CREATE TABLE project_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  medium_url VARCHAR(500),
  large_url VARCHAR(500),
  s3_key VARCHAR(500),
  s3_bucket VARCHAR(100),
  file_size INT,
  mime_type VARCHAR(50),
  width INT,
  height INT,
  alt_text VARCHAR(255),
  caption TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_project_id (project_id),
  INDEX idx_display_order (display_order),
  INDEX idx_is_primary (is_primary),
  INDEX idx_s3_key (s3_key),
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## S3 Bucket Structure

The existing S3 bucket will be extended with a `projects/` folder:

```
bucket-name/
├── properties/          ← Existing
│   └── property-123/
│       ├── original/
│       ├── large/
│       ├── medium/
│       └── thumbnails/
├── projects/            ← NEW
│   └── project-789/
│       ├── original/
│       │   ├── uuid-1.jpg
│       │   └── uuid-2.jpg
│       ├── large/
│       │   ├── uuid-1.jpg
│       │   └── uuid-2.jpg
│       ├── medium/
│       │   ├── uuid-1.jpg
│       │   └── uuid-2.jpg
│       └── thumbnails/
│           ├── uuid-1.jpg
│           └── uuid-2.jpg
└── avatars/             ← Existing
```

## API Endpoints

### Existing Endpoints (Update Implementation)

```
POST /api/v1/projects/:projectId/images
- Update to use ImageServiceS3
- Process images and upload to S3
- Store S3 URLs in project_images table

DELETE /api/v1/projects/:projectId/images/:imageId
- Update to use ImageServiceS3
- Delete from S3 and database
- Verify user owns project
```

### New Endpoints (Optional)

```
GET /api/v1/projects/:projectId/images
- Get all images for a project
- Return S3 URLs ordered by display_order

PATCH /api/v1/projects/:projectId/images/:imageId/order
- Update image display order
- Verify user owns project

PATCH /api/v1/projects/:projectId/images/:imageId/primary
- Set image as primary
- Unset other images as primary
```

## Error Handling

Reuse existing error handling patterns from PropertyImage:

```typescript
enum ProjectImageErrorType {
  PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
  ACCESS_DENIED = 'ACCESS_DENIED',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  DELETE_FAILED = 'DELETE_FAILED',
  INVALID_IMAGE = 'INVALID_IMAGE',
  S3_ERROR = 'S3_ERROR',
}
```

Error handling strategy:
1. **Validation errors**: Return 400 with clear message
2. **Permission errors**: Return 403 with access denied
3. **S3 errors**: Retry up to 3 times, then return 500
4. **Processing errors**: Upload original if processing fails
5. **Database errors**: Rollback S3 upload if database save fails

## Testing Strategy

### Unit Tests

```typescript
describe('ProjectImage S3 Integration', () => {
  describe('processAndSaveProjectImage', () => {
    test('should upload project image to S3');
    test('should generate all size variants');
    test('should save to database with S3 URLs');
    test('should handle upload failures');
    test('should verify project ownership');
  });

  describe('deleteProjectImage', () => {
    test('should delete from S3 and database');
    test('should delete all size variants');
    test('should verify project ownership');
    test('should handle deletion failures');
  });

  describe('processBulkProjectImages', () => {
    test('should process multiple images concurrently');
    test('should handle partial failures');
    test('should return success and failure counts');
  });
});
```

### Integration Tests

```typescript
describe('Project Image Upload API', () => {
  test('should upload images through API to S3');
  test('should return S3 URLs in response');
  test('should reject unauthorized uploads');
  test('should delete images through API');
});
```

### Manual Testing Checklist

- [ ] Upload single project image
- [ ] Upload multiple project images
- [ ] Delete project image
- [ ] View images in project details
- [ ] Test with invalid file types
- [ ] Test with oversized files
- [ ] Verify S3 folder structure
- [ ] Test access control (non-owner)
- [ ] Test migration script

## Security Considerations

### 1. Access Control

```typescript
// Verify user owns project before upload/delete
const project = await Project.findByPk(projectId);
if (!project || project.builder_id !== userId) {
  throw new Error('Access denied');
}
```

### 2. File Validation

Reuse existing validation from ImageProcessingService:
- Validate MIME types (image/jpeg, image/png, image/webp)
- Check file signatures (magic numbers)
- Limit file sizes (10MB per image)
- Validate image dimensions

### 3. S3 Security

- Use same bucket and credentials as properties
- Public read access for project images
- Private write access through backend only
- No direct frontend-to-S3 uploads

## Performance Optimization

### 1. Concurrent Processing

```typescript
// Process images in batches of 3
const CONCURRENT_LIMIT = 3;
for (let i = 0; i < files.length; i += CONCURRENT_LIMIT) {
  const batch = files.slice(i, i + CONCURRENT_LIMIT);
  await Promise.all(batch.map(file => processImage(file)));
}
```

### 2. Image Optimization

- Compress images before upload (quality: 85)
- Generate thumbnail (300px), medium (800px), large (1600px)
- Use efficient image formats (JPEG for photos)
- Set cache headers (1 year)

### 3. Database Optimization

- Index on project_id for fast lookups
- Index on display_order for sorting
- Index on s3_key for cleanup operations
- Cascade delete on project deletion

## Migration Strategy

### Phase 1: Database Setup

1. Create project_images table
2. Add indexes
3. Test on development database

### Phase 2: Code Implementation

1. Create ProjectImage model
2. Add methods to ImageServiceS3
3. Update project controller
4. Update project routes (if needed)

### Phase 3: Migration Script

1. Create migration script for existing local images
2. Upload to S3 with proper folder structure
3. Update database with S3 URLs
4. Archive local images

### Phase 4: Testing & Deployment

1. Test thoroughly on staging
2. Run migration on staging data
3. Deploy to production
4. Run production migration
5. Monitor for issues

## Migration Script Design

```typescript
// src/scripts/migrateProjectImagesToS3.ts

async function migrateProjectImages() {
  // 1. Find all projects with local images
  const projects = await Project.findAll({
    // Query projects with images in public/uploads/projects
  });

  // 2. For each project
  for (const project of projects) {
    // 3. Find local image files
    const localImages = findLocalImages(project.id);

    // 4. Upload each image to S3
    for (const imagePath of localImages) {
      const buffer = await readFile(imagePath);
      
      // Process and upload
      const result = await ImageServiceS3.processAndSaveProjectImage(
        project.id,
        {
          buffer,
          originalname: path.basename(imagePath),
          mimetype: 'image/jpeg',
        } as any,
        { generateThumbnail: true, optimize: true }
      );

      console.log(`Migrated: ${imagePath} -> ${result.url}`);
    }
  }

  console.log('Migration complete');
}
```

## Rollback Plan

If issues occur:

1. **Immediate**: Revert controller to use local storage
2. **Database**: Keep project_images table (no data loss)
3. **S3**: Keep uploaded images as backup
4. **Investigation**: Analyze logs and fix issues
5. **Retry**: Attempt migration again after fixes

## Monitoring and Alerts

Reuse existing monitoring for property images:

- Track upload success/failure rates
- Monitor S3 storage usage
- Alert on high error rates
- Log all S3 operations

Add project-specific metrics:
- Project image count
- Average images per project
- Project image storage usage

## Cost Estimation

Assuming 1,000 projects with 5 images each:

```
Storage:
- Original: 1,000 × 5 × 2MB = 10GB
- Processed: 10GB × 3 = 30GB
- Total: 40GB × $0.023/GB = $0.92/month

Requests:
- Uploads: 5,000 × $0.005/1000 = $0.025/month
- Downloads: 50K × $0.0004/1000 = $0.02/month

Total: ~$1/month (minimal additional cost)
```

## Future Enhancements

1. **Video Support**: Extend to support project videos
2. **360° Images**: Support panoramic project images
3. **Image Tagging**: Auto-tag images (exterior, interior, amenities)
4. **Smart Ordering**: AI-based image ordering
5. **Watermarking**: Add builder watermarks to images
6. **Image Analytics**: Track which images get most views

## Implementation Checklist

- [ ] Create project_images table migration
- [ ] Create ProjectImage model
- [ ] Add project image methods to ImageServiceS3
- [ ] Update project controller
- [ ] Update project routes (if needed)
- [ ] Create migration script
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Test on staging
- [ ] Deploy to production
- [ ] Run migration
- [ ] Monitor and verify
