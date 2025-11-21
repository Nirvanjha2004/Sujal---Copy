# Landing Page Icons S3 Migration Summary

## Overview
Extended the landing page S3 migration to include the icons directory that was previously excluded.

## Changes Made

### 1. Updated Migration Script (`src/scripts/migrate-landing-images-to-s3.ts`)
- Modified to ONLY upload icons (images and ProjectImages already uploaded)
- Changed console message to indicate "ICONS migration"
- Removed images and ProjectImages directories from the migration scope
- Now only processes: `frontend/public/landingpage/icons/`

### 2. Updated .gitignore
Added icons directory to be excluded from Git:
```gitignore
# Landing page images (stored in S3)
frontend/public/landingpage/images/
frontend/public/landingpage/ProjectImages/
frontend/public/landingpage/icons/
# Keep README.md files for documentation
!frontend/public/landingpage/images/README.md
!frontend/public/landingpage/ProjectImages/README.md
!frontend/public/landingpage/icons/README.md
```

### 3. S3 Structure
Icons will be uploaded to S3 with the following structure:
- Local: `frontend/public/landingpage/icons/overview.png`
- S3 Key: `landing-page/icons/overview.png`
- S3 URL: `https://sujal-real-estate.s3.ap-south-1.amazonaws.com/landing-page/icons/overview.png`

## Icons to be Migrated
The following 7 icon files will be uploaded:
1. aboutmyproperty.png
2. checkArticles.png
3. genuineReviews.png
4. overview.png
5. propertyrates.png
6. readLatestNews.png
7. userGuide.png

## How to Run the Migration

### Option 1: Using npm script
```bash
npm run migrate:landing-images
```

### Option 2: Using ts-node directly
```bash
npx ts-node src/scripts/migrate-landing-images-to-s3.ts
```

### Option 3: Using the helper script
```bash
node migrate-icons-only.js
```

## Using Icons in Components

To reference icons from S3 in your React components:

```typescript
import { getS3ImageUrl } from '@/shared/utils/s3ImageUtils';

// In your component
const iconUrl = getS3ImageUrl('icons/overview.png');

// Or with full path
const iconUrl = getS3ImageUrl('landing-page/icons/overview.png');
```

## Environment Variables Required
Ensure these are set in your `.env` file:
```
AWS_S3_BUCKET=sujal-real-estate
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

## Verification
After migration, verify icons are accessible:
1. Check S3 bucket at: `landing-page/icons/`
2. Test URL format: `https://sujal-real-estate.s3.ap-south-1.amazonaws.com/landing-page/icons/[filename]`
3. Ensure public read access is enabled on the bucket

## Next Steps
1. Run the migration script
2. Verify all 7 icons are uploaded successfully
3. Update any components that reference these icons to use S3 URLs
4. Commit the .gitignore changes
5. Remove local icon files from the repository (they'll be ignored going forward)

## Rollback
If needed, icons can be restored from S3 or from Git history before the .gitignore change.
