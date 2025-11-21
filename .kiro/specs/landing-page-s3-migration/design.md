# Design Document

## Overview

This design outlines the migration of static landing page images from the Git repository (`frontend/public/landingpage`) to AWS S3. The migration will significantly reduce repository size, speed up deployments to Vercel, and improve image delivery performance through S3's global infrastructure.

### Current State
- Landing page images stored in `frontend/public/landingpage/images/` (~9 images: banners, property type images)
- Project images stored in `frontend/public/landingpage/ProjectImages/` (~150+ images across 4 project folders)
- Images committed to Git and deployed with the application
- Components reference images using relative paths (e.g., `/landingpage/images/1.png`)
- Slow deployment times due to large image files

### Target State
- All landing page images stored in AWS S3
- Images organized in logical folder structure: `landing-page/images/` and `landing-page/projects/`
- Components reference images using S3 URLs
- Frontend utility function to generate S3 URLs
- Migration script to automate upload process
- `.gitignore` updated to exclude landing page images
- Fast deployments with minimal repository size

## Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Migration Phase                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Local Images                Migration Script                │
│  (frontend/public/)    ──────────────────►   AWS S3          │
│                                                               │
│  - landingpage/images/                    - landing-page/    │
│  - landingpage/ProjectImages/               images/          │
│                                             projects/         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Runtime Phase                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend Component                                           │
│         │                                                     │
│         ▼                                                     │
│  getS3ImageUrl()                                             │
│         │                                                     │
│         ▼                                                     │
│  S3 URL (https://bucket.s3.region.amazonaws.com/...)        │
│         │                                                     │
│         ▼                                                     │
│  Browser loads image from S3                                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### S3 Folder Structure

```
s3://your-bucket-name/
└── landing-page/
    ├── images/
    │   ├── 1.png                    (property type images)
    │   ├── 2.png
    │   ├── 3.png
    │   ├── 4.png
    │   ├── topbanner.png            (hero banner)
    │   ├── redBanner.png            (promotional banner)
    │   ├── SaleBanner.png
    │   └── sellorrent.png
    └── projects/
        ├── shalimar/
        │   ├── C4 (3).jpg
        │   ├── c1.jpg
        │   └── ...
        ├── casagrand/
        │   ├── ENTRANCE LOBBY.jpg
        │   └── ...
        ├── dsrvalar/
        │   ├── DSR Valar Brochure _page-0014.jpg
        │   └── ...
        └── amanora/
            ├── Gateway II Main Brochure Final_page-0017.jpg
            └── ...
```

## Components and Interfaces

### 1. Migration Script (`scripts/migrate-landing-images-to-s3.ts`)

**Purpose:** Automate the upload of landing page images to S3

**Key Functions:**
```typescript
interface MigrationResult {
  success: boolean;
  uploaded: string[];
  failed: Array<{ file: string; error: string }>;
  totalSize: number;
}

async function migrateImagesToS3(): Promise<MigrationResult>
async function uploadFile(localPath: string, s3Key: string): Promise<void>
async function validateUpload(s3Key: string): Promise<boolean>
function generateMigrationReport(result: MigrationResult): void
```

**Process:**
1. Read all files from `frontend/public/landingpage/images/`
2. Read all files from `frontend/public/landingpage/ProjectImages/` (recursive)
3. For each file:
   - Generate S3 key maintaining folder structure
   - Upload to S3 with appropriate content-type
   - Set cache headers (max-age=31536000)
   - Verify upload success
4. Generate migration report with success/failure counts

### 2. Frontend Utility (`frontend/src/shared/utils/s3ImageUtils.ts`)

**Purpose:** Provide consistent S3 URL generation across the frontend

**Interface:**
```typescript
interface S3ImageConfig {
  bucket: string;
  region: string;
  cdnUrl?: string;
}

/**
 * Get S3 URL for a landing page image
 * @param path - Relative path (e.g., 'images/1.png' or 'projects/shalimar/C4 (3).jpg')
 * @returns Full S3 URL
 */
function getS3ImageUrl(path: string): string

/**
 * Get S3 base URL (bucket or CDN)
 */
function getS3BaseUrl(): string

/**
 * Check if S3 is configured
 */
function isS3Configured(): boolean
```

**Implementation:**
```typescript
export function getS3ImageUrl(path: string): string {
  const baseUrl = getS3BaseUrl();
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Remove 'landingpage/' prefix if present
  const s3Path = cleanPath.replace(/^landingpage\//, '');
  
  return `${baseUrl}/landing-page/${s3Path}`;
}

export function getS3BaseUrl(): string {
  const cdnUrl = import.meta.env.VITE_AWS_CLOUDFRONT_URL;
  if (cdnUrl) {
    return cdnUrl;
  }
  
  const bucket = import.meta.env.VITE_AWS_S3_BUCKET;
  const region = import.meta.env.VITE_AWS_REGION;
  
  if (!bucket || !region) {
    console.warn('S3 configuration missing, using fallback');
    return '';
  }
  
  return `https://${bucket}.s3.${region}.amazonaws.com`;
}

export function isS3Configured(): boolean {
  return !!(import.meta.env.VITE_AWS_S3_BUCKET && import.meta.env.VITE_AWS_REGION);
}
```

### 3. Component Updates

**RealEstateLandingPage2.tsx:**

**Before:**
```typescript
const propertyImages = {
  apartment: "/landingpage/images/1.png",
  house: "/landingpage/images/2.png",
  villa: "/landingpage/images/3.png",
  plot: "/landingpage/images/4.png",
};

const featuredProjects = [
  {
    image: "/landingpage/ProjectImages/shalimar/C4 (3).jpg",
    // ...
  }
];
```

**After:**
```typescript
import { getS3ImageUrl } from '@/shared/utils/s3ImageUtils';

const propertyImages = {
  apartment: getS3ImageUrl("images/1.png"),
  house: getS3ImageUrl("images/2.png"),
  villa: getS3ImageUrl("images/3.png"),
  plot: getS3ImageUrl("images/4.png"),
};

const featuredProjects = [
  {
    image: getS3ImageUrl("projects/shalimar/C4 (3).jpg"),
    // ...
  }
];

// For topbanner import
import topbanner from './topbanner.png'; // Remove this
// Replace with:
const topbanner = getS3ImageUrl("images/topbanner.png");
```

### 4. Environment Configuration

**Frontend Environment Variables (`frontend/.env`):**
```bash
# AWS S3 Configuration for Landing Page Images
VITE_AWS_S3_BUCKET=real-estate-portal-images-dev
VITE_AWS_REGION=ap-south-1
VITE_AWS_CLOUDFRONT_URL=  # Optional CDN URL
```

**Backend Environment Variables (`.env`):**
```bash
# Existing AWS configuration (already configured)
AWS_REGION=ap-south-1
AWS_S3_BUCKET=real-estate-portal-images-dev
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_CLOUDFRONT_URL=  # Optional
```

## Data Models

### Migration Report Structure

```typescript
interface MigrationReport {
  timestamp: string;
  totalFiles: number;
  successCount: number;
  failureCount: number;
  totalSize: number;
  uploaded: Array<{
    localPath: string;
    s3Key: string;
    size: number;
    url: string;
  }>;
  failed: Array<{
    localPath: string;
    error: string;
  }>;
  duration: number; // milliseconds
}
```

### S3 Upload Metadata

```typescript
interface S3UploadMetadata {
  'uploaded-at': string;
  'original-path': string;
  'migration-batch': string;
  'content-type': string;
}
```

## Error Handling

### Migration Script Errors

1. **File Read Errors:**
   - Log error and continue with next file
   - Include in failed files list
   - Don't stop entire migration

2. **S3 Upload Errors:**
   - Retry up to 3 times with exponential backoff
   - Log detailed error message
   - Continue with next file

3. **Network Errors:**
   - Implement retry logic
   - Provide clear error messages
   - Allow resuming from last successful upload

### Frontend Runtime Errors

1. **Missing S3 Configuration:**
   - Fall back to local paths during development
   - Log warning in console
   - Provide clear error message in production

2. **Image Load Failures:**
   - Use standard browser error handling
   - Consider fallback placeholder image
   - Log errors for monitoring

3. **Invalid Paths:**
   - Validate path format
   - Return empty string or placeholder
   - Log warning

## Testing Strategy

### Migration Script Testing

1. **Unit Tests:**
   - Test S3 key generation
   - Test file path parsing
   - Test error handling logic

2. **Integration Tests:**
   - Test upload to S3 (using test bucket)
   - Test metadata setting
   - Test batch upload functionality

3. **Manual Testing:**
   - Run migration script on development
   - Verify all files uploaded correctly
   - Check S3 folder structure
   - Validate image accessibility

### Frontend Testing

1. **Unit Tests:**
   - Test `getS3ImageUrl()` function
   - Test URL generation with different inputs
   - Test fallback behavior

2. **Integration Tests:**
   - Test component rendering with S3 URLs
   - Test image loading
   - Test error states

3. **Visual Testing:**
   - Compare landing page before/after migration
   - Verify all images load correctly
   - Check responsive behavior
   - Test on different browsers

### End-to-End Testing

1. **Deployment Testing:**
   - Deploy to staging with S3 URLs
   - Verify all images load
   - Check page load performance
   - Test from different geographic locations

2. **Performance Testing:**
   - Measure page load time before/after
   - Check image load times
   - Verify caching behavior
   - Test with slow network conditions

## Implementation Phases

### Phase 1: Setup and Configuration
- Add frontend environment variables
- Create S3 utility functions
- Update `.gitignore`

### Phase 2: Migration Script
- Create migration script
- Test on development bucket
- Run migration for all images
- Verify uploads

### Phase 3: Component Updates
- Update `RealEstateLandingPage2.tsx`
- Update any other components using landing page images
- Test locally with S3 URLs

### Phase 4: Testing and Validation
- Visual testing
- Performance testing
- Cross-browser testing
- Staging deployment

### Phase 5: Production Deployment
- Run migration on production S3 bucket
- Deploy frontend with S3 URLs
- Monitor for errors
- Remove local images from repository

## Security Considerations

### S3 Bucket Policy

Landing page images should be publicly accessible:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadLandingPageImages",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/landing-page/*"
    }
  ]
}
```

### CORS Configuration

Ensure S3 bucket has proper CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### Access Control

- Migration script uses backend AWS credentials (write access)
- Frontend only needs public read access (no credentials needed)
- Images are public but not writable from frontend

## Performance Optimizations

### Caching Strategy

1. **S3 Cache Headers:**
   - `Cache-Control: public, max-age=31536000` (1 year)
   - Images are immutable (use versioned filenames if needed)

2. **Browser Caching:**
   - Leverage long cache times
   - Use CDN (CloudFront) for global distribution

3. **Image Optimization:**
   - Consider WebP format for better compression
   - Implement responsive images with srcset
   - Lazy load images below the fold

### Load Performance

1. **Preload Critical Images:**
   ```html
   <link rel="preload" as="image" href="s3-url/topbanner.png">
   ```

2. **Lazy Loading:**
   ```typescript
   <img loading="lazy" src={getS3ImageUrl("...")} />
   ```

3. **CDN Distribution:**
   - Configure CloudFront for global edge caching
   - Reduce latency for international users

## Rollback Plan

### If Issues Occur

1. **Immediate Rollback:**
   - Revert frontend code to use local paths
   - Deploy previous version
   - Images still in Git history

2. **Partial Rollback:**
   - Keep some images on S3
   - Revert problematic images to local
   - Gradual migration approach

3. **Full Rollback:**
   - Restore all images to `frontend/public/`
   - Remove S3 utility functions
   - Remove environment variables

## Monitoring and Maintenance

### Metrics to Track

1. **Migration Metrics:**
   - Number of files uploaded
   - Total size migrated
   - Upload success rate
   - Migration duration

2. **Runtime Metrics:**
   - Image load times
   - Failed image loads
   - S3 request count
   - Bandwidth usage

3. **Cost Metrics:**
   - S3 storage costs
   - Data transfer costs
   - Request costs

### Ongoing Maintenance

1. **Adding New Images:**
   - Upload directly to S3 using AWS Console or CLI
   - Update component with new S3 path
   - Don't commit images to Git

2. **Updating Images:**
   - Upload new version to S3
   - Use same filename or update component
   - Consider cache invalidation if using CDN

3. **Removing Images:**
   - Delete from S3
   - Remove references from components
   - Clean up unused images periodically

## Documentation

### Developer Guide

1. **How to Add New Landing Page Images:**
   ```bash
   # Upload to S3
   aws s3 cp new-image.png s3://bucket-name/landing-page/images/
   
   # Update component
   const newImage = getS3ImageUrl("images/new-image.png");
   ```

2. **How to Update Existing Images:**
   ```bash
   # Replace in S3
   aws s3 cp updated-image.png s3://bucket-name/landing-page/images/old-image.png
   
   # If using CloudFront, invalidate cache
   aws cloudfront create-invalidation --distribution-id ID --paths "/landing-page/images/old-image.png"
   ```

3. **Troubleshooting:**
   - Check S3 bucket policy for public read access
   - Verify CORS configuration
   - Check environment variables
   - Inspect browser console for errors

### Migration Runbook

1. **Pre-Migration Checklist:**
   - [ ] AWS credentials configured
   - [ ] S3 bucket exists and accessible
   - [ ] Bucket policy allows public read
   - [ ] CORS configured
   - [ ] Frontend environment variables set

2. **Migration Steps:**
   - [ ] Run migration script
   - [ ] Verify all files uploaded
   - [ ] Test image URLs in browser
   - [ ] Update frontend components
   - [ ] Test locally
   - [ ] Deploy to staging
   - [ ] Test staging
   - [ ] Deploy to production
   - [ ] Update `.gitignore`
   - [ ] Remove local images (optional)

3. **Post-Migration Checklist:**
   - [ ] All images loading correctly
   - [ ] No console errors
   - [ ] Page load performance acceptable
   - [ ] Repository size reduced
   - [ ] Deployment time improved
