# Landing Page S3 Migration Guide

This guide explains how to migrate landing page images from the Git repository to AWS S3.

## Overview

The migration script uploads all landing page images from `frontend/public/landingpage/` to AWS S3, organizing them in a logical folder structure for better management and faster deployments.

## Prerequisites

Before running the migration, ensure:

1. **AWS Credentials Configured**: Your `.env` file must have valid AWS credentials:
   ```bash
   AWS_REGION=ap-south-1
   AWS_S3_BUCKET=real-estate-portal-images-dev
   AWS_ACCESS_KEY_ID=your-access-key-id
   AWS_SECRET_ACCESS_KEY=your-secret-access-key
   AWS_CLOUDFRONT_URL=  # Optional
   ```

2. **S3 Bucket Exists**: The bucket specified in `AWS_S3_BUCKET` must exist and be accessible.

3. **Bucket Permissions**: The bucket must have:
   - Public read access for the `landing-page/` prefix
   - Write access for your AWS credentials
   - Proper CORS configuration

4. **Images Present**: The following directories should contain images:
   - `frontend/public/landingpage/images/` - Property type images and banners
   - `frontend/public/landingpage/ProjectImages/` - Featured project images

## S3 Folder Structure

The migration creates the following structure in S3:

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
        │   └── ...
        ├── dsrvalar/
        │   └── ...
        └── amanora/
            └── ...
```

## Running the Migration

### Using npm script (Recommended)

```bash
npm run migrate:landing-images
```

### Using ts-node directly

```bash
npx ts-node src/scripts/migrate-landing-images-to-s3.ts
```

## Migration Process

The script performs the following steps:

1. **Validation**: Checks that AWS credentials are configured and directories exist
2. **File Discovery**: Recursively scans both image directories
3. **Upload**: For each file:
   - Generates appropriate S3 key based on local path
   - Uploads with proper content-type header
   - Sets cache headers (1 year max-age)
   - Adds metadata (upload timestamp, original path, migration batch)
   - Implements retry logic (3 attempts with exponential backoff)
4. **Reporting**: Generates detailed migration report with:
   - Success/failure counts
   - Total size uploaded
   - Duration
   - List of uploaded files with URLs
   - List of failed uploads with error messages

## Migration Report

After completion, you'll see a detailed report:

```
================================================================================
📋 MIGRATION REPORT
================================================================================

⏱️  Duration: 45.23 seconds
📊 Total Files: 158
✅ Successful: 158
❌ Failed: 0
💾 Total Size: 125.45 MB

🎯 Success Rate: 100.00%

✅ SUCCESSFULLY UPLOADED FILES:
--------------------------------------------------------------------------------
1. landing-page/images/1.png
   Local: frontend/public/landingpage/images/1.png
   Size: 245.67 KB
   URL: https://bucket.s3.region.amazonaws.com/landing-page/images/1.png

...

================================================================================
🎉 Migration completed successfully!
```

## Retry Logic

The script implements robust retry logic:

- **Maximum Retries**: 3 attempts per file
- **Backoff Strategy**: Exponential (1s, 2s, 4s)
- **Error Handling**: Continues with next file if one fails
- **Detailed Logging**: Shows retry attempts and reasons

## Troubleshooting

### Error: Missing AWS environment variables

**Solution**: Ensure all required AWS variables are set in your `.env` file:
```bash
AWS_REGION=ap-south-1
AWS_S3_BUCKET=real-estate-portal-images-dev
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

### Error: Directory not found

**Solution**: Verify the directories exist:
```bash
ls frontend/public/landingpage/images/
ls frontend/public/landingpage/ProjectImages/
```

### Error: Access Denied

**Solution**: Check your AWS credentials have write permissions to the S3 bucket:
```bash
aws s3 ls s3://your-bucket-name/
```

### Error: Upload timeout or network issues

**Solution**: The script automatically retries failed uploads. If issues persist:
- Check your internet connection
- Verify AWS service status
- Try running the script again (it will skip already uploaded files if you modify it)

### Some files failed to upload

**Solution**: Review the failed uploads section in the report. Common causes:
- Invalid file format
- Corrupted files
- Network interruptions
- Insufficient permissions

You can manually upload failed files using AWS CLI:
```bash
aws s3 cp frontend/public/landingpage/images/file.png s3://bucket/landing-page/images/file.png --content-type image/png --cache-control "public, max-age=31536000"
```

## Post-Migration Steps

After successful migration:

1. **Verify Uploads**: Check S3 console or use AWS CLI:
   ```bash
   aws s3 ls s3://your-bucket-name/landing-page/ --recursive
   ```

2. **Test Image URLs**: Open a few URLs in your browser to verify public access

3. **Update Frontend**: Update components to use S3 URLs (see next task in implementation plan)

4. **Update .gitignore**: Add landing page directories to prevent future commits

5. **Test Locally**: Verify landing page loads correctly with S3 images

6. **Deploy to Staging**: Test in staging environment

7. **Remove Local Images**: After confirming everything works, remove local images from repository

## Adding New Images

After migration, add new landing page images directly to S3:

### Using AWS CLI

```bash
# Upload a new property type image
aws s3 cp new-image.png s3://bucket/landing-page/images/new-image.png \
  --content-type image/png \
  --cache-control "public, max-age=31536000" \
  --metadata uploaded-at=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Upload a new project image
aws s3 cp project-image.jpg s3://bucket/landing-page/projects/project-name/image.jpg \
  --content-type image/jpeg \
  --cache-control "public, max-age=31536000"
```

### Using AWS Console

1. Navigate to your S3 bucket
2. Go to `landing-page/images/` or `landing-page/projects/`
3. Click "Upload"
4. Select files and upload
5. Set permissions to public read
6. Set metadata: Cache-Control = `public, max-age=31536000`

### Update Component

After uploading, update the component to reference the new image:

```typescript
import { getS3ImageUrl } from '@/shared/utils/s3ImageUtils';

const newImage = getS3ImageUrl("images/new-image.png");
```

## Updating Existing Images

To update an existing image:

1. Upload the new version with the same filename to S3
2. If using CloudFront CDN, invalidate the cache:
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id YOUR_DISTRIBUTION_ID \
     --paths "/landing-page/images/image-name.png"
   ```
3. Clear browser cache or use hard refresh (Ctrl+F5)

## Rollback Procedure

If you need to rollback to local images:

1. **Revert Frontend Code**: Change components back to use local paths
2. **Keep Images in Git**: Images are still in Git history
3. **Restore Files**: 
   ```bash
   git checkout HEAD -- frontend/public/landingpage/
   ```
4. **Deploy**: Deploy the reverted version

## Performance Considerations

- **Cache Headers**: Images are cached for 1 year (31536000 seconds)
- **CDN**: Configure CloudFront for global distribution
- **Image Optimization**: Consider converting to WebP format for better compression
- **Lazy Loading**: Implement lazy loading for below-the-fold images

## Cost Estimation

Approximate AWS costs for landing page images:

- **Storage**: ~150 images × 1MB average = 150MB ≈ $0.003/month
- **Requests**: ~1000 GET requests/month ≈ $0.0004/month
- **Data Transfer**: ~10GB/month ≈ $0.90/month

**Total**: ~$1/month (may vary based on traffic)

## Security

- **Public Access**: Landing page images are publicly readable
- **Write Access**: Only backend with AWS credentials can write
- **No Frontend Credentials**: Frontend doesn't need AWS credentials
- **CORS**: Configured to allow requests from your domain

## Monitoring

Monitor S3 usage:

```bash
# List all landing page images
aws s3 ls s3://bucket/landing-page/ --recursive --human-readable

# Get total size
aws s3 ls s3://bucket/landing-page/ --recursive --summarize

# Check specific image
aws s3api head-object --bucket bucket --key landing-page/images/1.png
```

## Support

For issues or questions:
1. Check this documentation
2. Review migration report for specific errors
3. Check AWS CloudWatch logs
4. Verify S3 bucket permissions and CORS configuration
