# Implementation Plan

- [x] 1. Set up frontend environment configuration for S3





  - Add S3 environment variables to `frontend/.env` and `frontend/.env.example`
  - Configure VITE_AWS_S3_BUCKET, VITE_AWS_REGION, and optional VITE_AWS_CLOUDFRONT_URL
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 2. Create S3 image utility functions for frontend





  - Create `frontend/src/shared/utils/s3ImageUtils.ts` with URL generation functions
  - Implement `getS3ImageUrl()` function to convert relative paths to S3 URLs
  - Implement `getS3BaseUrl()` to get bucket or CDN URL
  - Implement `isS3Configured()` to check if S3 is properly configured
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 3. Create migration script to upload landing page images to S3





  - Create `scripts/migrate-landing-images-to-s3.ts` migration script
  - Implement file reading from `frontend/public/landingpage/images/` directory
  - Implement recursive file reading from `frontend/public/landingpage/ProjectImages/` directory
  - Implement S3 upload with proper content-type and cache headers
  - Implement retry logic for failed uploads (3 retries with exponential backoff)
  - Generate migration report with success/failure counts and file details
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 8.1, 8.2, 8.3_

- [x] 4. Run migration script and verify uploads





  - Execute migration script to upload all landing page images to S3
  - Verify all images uploaded successfully to S3 bucket
  - Check S3 folder structure matches design (landing-page/images/, landing-page/projects/)
  - Test image URLs in browser to ensure public accessibility
  - Review migration report for any failed uploads
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.4_

- [x] 5. Update RealEstateLandingPage2 component to use S3 URLs





  - Import `getS3ImageUrl` utility function in RealEstateLandingPage2.tsx
  - Replace topbanner import with S3 URL using `getS3ImageUrl("images/topbanner.png")`
  - Update propertyImages object to use S3 URLs for all property type images
  - Update featuredProjects array to use S3 URLs for all project images
  - Update redBanner and other banner image references to use S3 URLs
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6. Update other components using landing page images





  - Search for any other components referencing `/landingpage/` paths
  - Update all components to use `getS3ImageUrl()` utility function
  - Ensure consistent S3 URL usage across the application
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 7. Update .gitignore to exclude landing page images





  - Add `frontend/public/landingpage/images/` to .gitignore
  - Add `frontend/public/landingpage/ProjectImages/` to .gitignore
  - Keep README.md files if they exist for documentation
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 8. Test landing page with S3 images locally
  - Start frontend development server
  - Navigate to landing page and verify all images load correctly
  - Check browser console for any image loading errors
  - Verify image quality matches original local images
  - Test responsive behavior and image loading on different screen sizes
  - _Requirements: 1.4, 2.1, 2.2, 8.4, 10.3_

- [ ] 9. Create documentation for S3 image management
  - Create `docs/S3_LANDING_PAGE_IMAGES.md` documentation file
  - Document how to add new landing page images to S3
  - Document how to update existing images in S3
  - Document S3 folder structure and naming conventions
  - Include troubleshooting guide for common issues
  - Document rollback procedure if needed
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 10. Deploy to staging and validate
  - Deploy frontend to staging environment with S3 URLs
  - Verify all landing page images load correctly on staging
  - Test page load performance and compare with previous version
  - Check for any console errors or broken images
  - Test from different geographic locations if possible
  - _Requirements: 1.4, 2.1, 2.2, 2.3, 2.4_

- [ ] 11. Remove local landing page images from repository
  - Delete images from `frontend/public/landingpage/images/` (keep README if exists)
  - Delete images from `frontend/public/landingpage/ProjectImages/`
  - Commit changes to Git
  - Verify repository size reduction
  - Verify deployment time improvement on next deploy
  - _Requirements: 1.1, 9.4_
