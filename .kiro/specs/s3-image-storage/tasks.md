# Implementation Plan: AWS S3 Image Storage Integration

- [x] 1. AWS Infrastructure Setup


  - Create AWS S3 bucket with appropriate naming convention
  - Configure bucket policies for public read access on specific folders
  - Set up IAM user with S3 access permissions
  - Generate access keys and store securely
  - Configure CORS settings for browser uploads
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Backend Configuration and Dependencies



  - [x] 2.1 Install AWS SDK dependencies

    - Install @aws-sdk/client-s3 package
    - Install @aws-sdk/s3-request-presigner package
    - Install sharp for image processing
    - Update package.json with new dependencies
    - _Requirements: 1.1_


  - [x] 2.2 Create AWS configuration module

    - Create src/config/aws.ts with S3 client configuration
    - Add environment variables for AWS credentials
    - Implement configuration validation
    - Add error handling for missing credentials
    - _Requirements: 1.1, 1.2, 1.4_


  - [x] 2.3 Update environment variables

    - Add AWS_REGION to .env
    - Add AWS_S3_BUCKET to .env
    - Add AWS_ACCESS_KEY_ID to .env
    - Add AWS_SECRET_ACCESS_KEY to .env
    - Add AWS_CLOUDFRONT_URL to .env (optional)
    - Update .env.example with new variables
    - _Requirements: 1.1, 1.4_

- [x] 3. Core S3 Service Implementation



  - [x] 3.1 Create S3 service class

    - Create src/services/s3Service.ts
    - Implement uploadImage method with PutObjectCommand
    - Implement deleteImage method with DeleteObjectCommand
    - Implement deleteMultipleImages method with batch operations
    - Implement generateSignedUrl method for private images
    - Add error handling and retry logic
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1, 4.2_

  - [x] 3.2 Implement image key generation


    - Create utility for generating S3 keys with folder structure
    - Implement unique filename generation with UUID
    - Add support for different entity types (property, project, avatar)
    - Ensure keys follow naming convention
    - _Requirements: 1.3, 2.3_


  - [ ] 3.3 Add S3 metadata handling
    - Implement metadata attachment for uploads
    - Store user ID, timestamp, and entity information
    - Add content-type and cache-control headers
    - _Requirements: 2.3, 8.1, 8.2_

- [x] 4. Image Processing Service



  - [x] 4.1 Create image processing service

    - Create src/services/imageProcessingService.ts
    - Implement image optimization with sharp
    - Add JPEG/PNG compression
    - Implement quality adjustment
    - _Requirements: 6.1, 6.2_


  - [ ] 4.2 Implement multi-size generation
    - Generate thumbnail (300px width)
    - Generate medium (800px width)
    - Generate large (1600px width)
    - Maintain aspect ratios
    - Store original image
    - _Requirements: 2.6, 6.2, 6.3_


  - [ ] 4.3 Add image validation
    - Validate file types (JPEG, PNG, WebP)
    - Check file size limits
    - Validate image dimensions
    - Verify image integrity
    - _Requirements: 2.1, 6.4_

  - [ ]* 4.4 Implement WebP conversion
    - Add WebP format support
    - Convert images to WebP for modern browsers
    - Maintain fallback to original format
    - _Requirements: 6.2_

- [x] 5. Update Upload Controller



  - [x] 5.1 Modify uploadPropertyImage endpoint


    - Update to use S3Service instead of local storage
    - Process image with ImageProcessingService
    - Upload all sizes to S3
    - Store S3 URLs in database
    - Return S3 URLs to frontend
    - _Requirements: 2.1, 2.2, 2.3, 2.6_


  - [ ] 5.2 Modify uploadPropertyImages endpoint (bulk)
    - Update to process multiple images concurrently
    - Use Promise.all for parallel S3 uploads
    - Track progress for each image
    - Handle partial failures gracefully
    - _Requirements: 2.5, 2.6_


  - [ ] 5.3 Update deletePropertyImage endpoint
    - Delete image from S3 using S3Service
    - Delete all sizes (original, large, medium, thumbnail)
    - Remove database record
    - Handle S3 deletion failures

    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 5.4 Add error handling
    - Implement specific error types for S3 operations
    - Add retry logic for transient failures
    - Return clear error messages to frontend
    - Log errors for monitoring
    - _Requirements: 2.4, 7.1, 7.2, 7.4_

- [x] 6. Database Schema Updates




  - [x] 6.1 Add S3-related columns to property_images table

    - Add s3_key column (VARCHAR 500)
    - Add s3_bucket column (VARCHAR 100)
    - Add thumbnail_url column (VARCHAR 500)
    - Add medium_url column (VARCHAR 500)
    - Add file_size column (INTEGER)
    - Add mime_type column (VARCHAR 50)
    - Add width column (INTEGER)
    - Add height column (INTEGER)
    - _Requirements: 2.3, 10.2_


  - [ ] 6.2 Create migration script
    - Write SQL migration to add new columns
    - Set default values for existing records
    - Add indexes for s3_key lookups
    - Test migration on development database
    - _Requirements: 5.1, 5.2, 10.2_


  - [ ] 6.3 Update database models
    - Update Property model to include new image fields
    - Update PropertyImage interface in TypeScript
    - Update Project model similarly
    - _Requirements: 10.2, 10.4_

- [ ] 7. Migration Service for Existing Images
  - [ ] 7.1 Create migration service
    - Create src/services/migrationService.ts
    - Implement migrateAllImages method
    - Implement migratePropertyImages method
    - Implement migrateProjectImages method
    - Add progress tracking and reporting
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 7.2 Create migration script
    - Create src/scripts/migrateToS3.ts
    - Read all images from local storage
    - Upload to S3 with proper folder structure
    - Update database with S3 URLs
    - Generate migration report
    - Handle errors and continue processing
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 7.3 Add migration verification
    - Verify all images uploaded successfully
    - Check database records updated
    - Compare local and S3 file counts
    - Generate verification report
    - _Requirements: 5.4_

  - [ ] 7.4 Create rollback mechanism
    - Implement rollback to local URLs
    - Restore database to pre-migration state
    - Keep S3 images as backup
    - _Requirements: 5.5_

- [ ] 8. Admin Tools and Monitoring
  - [ ] 8.1 Create storage statistics endpoint
    - Implement GET /api/v1/admin/storage/stats
    - Calculate total S3 storage used
    - Count total images by type
    - Calculate bandwidth usage
    - Return statistics in JSON format
    - _Requirements: 7.5_

  - [ ] 8.2 Create orphaned images cleanup tool
    - Implement POST /api/v1/admin/storage/cleanup-orphaned
    - Identify S3 images not in database
    - Identify database records without S3 images
    - Delete orphaned S3 objects
    - Generate cleanup report
    - _Requirements: 4.4_

  - [ ] 8.3 Add error logging and monitoring
    - Log all S3 operations with details
    - Categorize errors by type
    - Implement error rate tracking
    - Add alerts for high error rates
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 9. Frontend Updates
  - [ ] 9.1 Update propertyImageService
    - Ensure service handles S3 URLs correctly
    - Update URL validation to accept S3 URLs
    - Add fallback for missing images
    - No major changes needed (backward compatible)
    - _Requirements: 3.1, 3.2, 3.3, 10.1, 10.4_

  - [ ] 9.2 Update image display components
    - Verify PropertyCard displays S3 images
    - Verify ProjectDetailsPage displays S3 images
    - Add error handling for failed image loads
    - Implement fallback placeholder images
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 9.3 Add responsive image loading
    - Use thumbnail URLs for list views
    - Use medium URLs for grid views
    - Use large URLs for detail views
    - Implement lazy loading
    - _Requirements: 3.5, 3.6, 8.4_

- [ ] 10. Testing and Validation
  - [ ]* 10.1 Write unit tests for S3Service
    - Test uploadImage method
    - Test deleteImage method
    - Test generateSignedUrl method
    - Test error handling and retries
    - Mock AWS SDK calls
    - _Requirements: 2.1, 2.2, 2.3, 4.1_

  - [ ]* 10.2 Write unit tests for ImageProcessingService
    - Test image optimization
    - Test thumbnail generation
    - Test multi-size generation
    - Test image validation
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 10.3 Write integration tests
    - Test end-to-end upload flow
    - Test end-to-end delete flow
    - Test bulk upload
    - Test migration process
    - _Requirements: 2.1, 2.5, 4.1, 5.1_

  - [ ] 10.4 Perform manual testing
    - Upload single image via UI
    - Upload multiple images via UI
    - Delete image via UI
    - View images in different contexts
    - Test with various image formats
    - Test with large files
    - Test error scenarios
    - _Requirements: 2.1, 2.5, 3.1, 4.1_

- [ ] 11. Documentation and Deployment
  - [ ] 11.1 Update API documentation
    - Document new S3-related endpoints
    - Update upload endpoint documentation
    - Document admin endpoints
    - Add S3 URL format examples
    - _Requirements: 10.1, 10.4_

  - [ ] 11.2 Create deployment guide
    - Document AWS setup steps
    - Document environment variable configuration
    - Document migration process
    - Add troubleshooting section
    - _Requirements: 1.1, 5.1_

  - [ ] 11.3 Update README
    - Add S3 configuration section
    - Document new environment variables
    - Add migration instructions
    - Update architecture diagrams
    - _Requirements: 1.1, 5.1_

  - [ ] 11.4 Deploy to staging
    - Deploy backend changes
    - Run database migrations
    - Configure AWS credentials
    - Test thoroughly
    - _Requirements: 1.1, 5.1_

  - [ ] 11.5 Run migration on staging
    - Execute migration script
    - Verify all images migrated
    - Test image display
    - Monitor for errors
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 11.6 Deploy to production
    - Deploy backend changes
    - Run database migrations
    - Configure production AWS credentials
    - Monitor closely
    - _Requirements: 1.1_

  - [ ] 11.7 Run production migration
    - Schedule during low-traffic period
    - Execute migration script
    - Monitor progress
    - Verify completion
    - Archive local images
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 12. Post-Deployment Monitoring
  - [ ] 12.1 Monitor S3 operations
    - Track upload success rates
    - Monitor error rates
    - Check S3 storage usage
    - Verify image loading performance
    - _Requirements: 7.1, 7.2, 7.5, 8.3_

  - [ ] 12.2 Optimize based on metrics
    - Adjust image quality settings if needed
    - Optimize image sizes based on usage
    - Fine-tune caching headers
    - Consider CDN if needed
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 12.3 Clean up local storage
    - Verify S3 migration successful (wait 1-2 weeks)
    - Archive local images to backup
    - Remove local storage code
    - Update documentation
    - _Requirements: 5.5_
