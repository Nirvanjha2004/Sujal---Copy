# Implementation Plan: AWS S3 Image Storage for Projects

- [x] 1. Database Schema Setup



  - Create migration file for project_images table
  - Add columns: id, project_id, image_url, thumbnail_url, medium_url, large_url, s3_key, s3_bucket, file_size, mime_type, width, height, alt_text, caption, display_order, is_primary, created_at, updated_at
  - Add indexes on project_id, display_order, is_primary, s3_key
  - Add foreign key constraint to projects table with CASCADE delete
  - Test migration on development database
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 2. Create ProjectImage Model



  - Create src/models/ProjectImage.ts file
  - Define ProjectImage class extending Sequelize Model
  - Configure all table columns with proper types
  - Set up timestamps and underscored naming
  - Configure association with Project model
  - Export ProjectImage model
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 3. Extend ImageServiceS3 for Projects



  - [x] 3.1 Add processAndSaveProjectImage method


    - Import ProjectImage model
    - Validate project exists
    - Read and validate image buffer
    - Process image with ImageProcessingService (generate all sizes)
    - Upload all sizes to S3 with folder: 'projects'
    - Save to database with S3 URLs and metadata
    - Clean up local file
    - Return upload result
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 7.1, 7.2, 7.3_

  - [x] 3.2 Add processBulkProjectImages method

    - Validate project exists
    - Process images in batches of 3 concurrently
    - Track successful and failed uploads
    - Return bulk upload result with counts
    - Clean up local files
    - _Requirements: 2.5, 2.6, 7.1, 7.2_

  - [x] 3.3 Add deleteProjectImage method

    - Find project image by ID
    - Verify user owns the project (check builder_id)
    - Get all size variant keys from s3_key
    - Delete all variants from S3 using deleteMultipleImages
    - Delete database record
    - Return success/error result
    - _Requirements: 5.1, 5.2, 5.4, 5.5, 9.2, 9.3, 9.4_

  - [x] 3.4 Add getProjectImages method

    - Query ProjectImage by project_id
    - Order by display_order and created_at
    - Return formatted image data with all URLs
    - _Requirements: 4.1, 4.6_

  - [ ]* 3.5 Add updateProjectImageOrder method
    - Find project image by ID
    - Verify user owns the project
    - Update display_order field
    - Save to database
    - Return success/error result
    - _Requirements: 4.6_

  - [ ]* 3.6 Add setProjectPrimaryImage method
    - Find project image by ID
    - Verify user owns the project
    - Unset is_primary for all other project images
    - Set is_primary to true for selected image
    - Save to database
    - Return success/error result
    - _Requirements: 3.6_

- [x] 4. Update Project Controller



  - [x] 4.1 Update uploadProjectImages endpoint


    - Import ImageServiceS3
    - Extract projectId and userId from request
    - Verify project exists and user is builder
    - Extract files from req.files
    - Call ImageServiceS3.processBulkProjectImages
    - Return success response with upload results
    - Handle errors with appropriate status codes
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 2.7, 9.2_

  - [x] 4.2 Update deleteProjectImage endpoint


    - Extract imageId and userId from request
    - Call ImageServiceS3.deleteProjectImage
    - Return success/error response
    - Handle errors with appropriate status codes
    - _Requirements: 5.1, 5.2, 5.4, 5.5, 9.3_

  - [ ]* 4.3 Add getProjectImages endpoint (optional)
    - Extract projectId from request
    - Call ImageServiceS3.getProjectImages
    - Return images array ordered by display_order
    - Handle errors with appropriate status codes
    - _Requirements: 4.1, 4.6_

  - [ ]* 4.4 Add updateProjectImageOrder endpoint (optional)
    - Extract imageId, displayOrder, and userId
    - Validate displayOrder is positive number
    - Call ImageServiceS3.updateProjectImageOrder
    - Return success/error response
    - _Requirements: 4.6_

- [x] 5. Update Project Routes



  - Verify existing routes in src/routes/projectRoutes.ts
  - Ensure POST /:projectId/images route exists
  - Ensure DELETE /:projectId/images/:imageId route exists
  - Update multer configuration if needed (should already be correct)
  - Add GET /:projectId/images route if implementing optional endpoint
  - Add PATCH /:projectId/images/:imageId/order route if implementing optional endpoint
  - _Requirements: 2.1, 5.1, 10.1_

- [ ] 6. Create Migration Script for Existing Images

  - [ ] 6.1 Create migration script file
    - Create src/scripts/migrateProjectImagesToS3.ts
    - Import required services and models
    - Set up logging and progress tracking
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 6.2 Implement image discovery logic
    - Scan public/uploads/projects directory
    - Find all project image files
    - Group images by project ID
    - Log total images found
    - _Requirements: 6.1, 6.2_

  - [ ] 6.3 Implement upload and database update logic
    - For each project with local images
    - Read image file buffer
    - Process and upload to S3 using ImageServiceS3
    - Update or create database records with S3 URLs
    - Track successful and failed migrations
    - Log progress for each image
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 6.4 Add error handling and reporting
    - Catch and log errors for each image
    - Continue processing on individual failures
    - Generate migration report with counts
    - List failed images with error messages
    - _Requirements: 6.3, 6.4_

  - [ ] 6.5 Add archive functionality
    - After successful migration, move local images to archive folder
    - Do not delete original files immediately
    - Log archive operations
    - _Requirements: 6.5_

- [x] 7. Frontend Updates




  - [x] 7.1 Verify ProjectImageUpload component


    - Check that component handles S3 URLs correctly
    - Verify image display uses image_url from response
    - Ensure error handling for failed uploads
    - No code changes should be needed (already compatible)
    - _Requirements: 4.1, 4.2, 4.3, 10.4_

  - [x] 7.2 Update project service if needed

    - Verify projectService.uploadProjectImages sends FormData correctly
    - Verify projectService.deleteProjectImage works with new endpoint
    - Ensure response handling matches new S3 URL structure
    - _Requirements: 4.1, 4.2, 10.4_

  - [x] 7.3 Test image display in project pages

    - Verify ProjectDetailsPage displays S3 images
    - Verify ProjectsPage displays thumbnail images
    - Add fallback placeholder for failed image loads
    - Test responsive image loading
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 8. Testing

  - [ ]* 8.1 Write unit tests for ProjectImage model
    - Test model creation
    - Test associations with Project
    - Test validation rules
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 8.2 Write unit tests for ImageServiceS3 project methods
    - Test processAndSaveProjectImage
    - Test processBulkProjectImages
    - Test deleteProjectImage
    - Test getProjectImages
    - Mock S3Service and ImageProcessingService
    - _Requirements: 2.1, 2.2, 2.3, 5.1, 5.2_

  - [ ]* 8.3 Write integration tests for project image endpoints
    - Test POST /api/v1/projects/:projectId/images
    - Test DELETE /api/v1/projects/:projectId/images/:imageId
    - Test access control (non-owner cannot upload/delete)
    - Test with various image formats and sizes
    - _Requirements: 2.1, 2.7, 5.1, 5.5, 9.2, 9.3, 9.4_

  - [ ] 8.4 Perform manual testing
    - Upload single project image via UI
    - Upload multiple project images via UI
    - Delete project image via UI
    - View images in project details page
    - Test with JPEG, PNG, WebP formats
    - Test with large files (near 10MB limit)
    - Test with invalid file types
    - Test access control (try uploading to another user's project)
    - Verify S3 folder structure in AWS console
    - _Requirements: 2.1, 2.5, 4.1, 5.1, 9.1, 9.2, 9.3_

- [ ] 9. Migration Execution

  - [ ] 9.1 Test migration script on development
    - Run migration script on development database
    - Verify all images uploaded to S3
    - Verify database records created/updated
    - Check S3 folder structure
    - Verify images display correctly in UI
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 9.2 Run migration on staging
    - Deploy code to staging environment
    - Run database migration (create table)
    - Execute image migration script
    - Monitor progress and errors
    - Verify all images migrated successfully
    - Test image display in staging UI
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 9.3 Prepare production migration
    - Document migration steps
    - Schedule migration during low-traffic period
    - Prepare rollback plan
    - Set up monitoring and alerts
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 9.4 Execute production migration
    - Deploy code to production
    - Run database migration
    - Execute image migration script
    - Monitor progress closely
    - Verify images display correctly
    - Archive local images after verification period
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 10. Documentation and Monitoring

  - [ ] 10.1 Update API documentation
    - Document project image upload endpoint
    - Document project image delete endpoint
    - Add S3 URL format examples
    - Document error responses
    - _Requirements: 10.1, 10.4_

  - [ ] 10.2 Update README and guides
    - Add project image S3 configuration notes
    - Document migration process
    - Add troubleshooting section
    - Update architecture diagrams if needed
    - _Requirements: 10.1, 10.4_

  - [ ] 10.3 Set up monitoring
    - Monitor project image upload success rates
    - Track S3 storage usage for projects folder
    - Set up alerts for high error rates
    - Monitor image loading performance
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 10.4 Create admin tools (optional)
    - Add project images to storage statistics endpoint
    - Update cleanup orphaned images to include projects
    - Add project-specific image analytics
    - _Requirements: 8.5_

- [ ] 11. Cleanup and Optimization

  - [ ] 11.1 Remove local storage code (after verification)
    - Wait 1-2 weeks after production migration
    - Verify no issues with S3 images
    - Remove multer disk storage configuration for projects
    - Remove local file cleanup code
    - Update documentation
    - _Requirements: 6.5, 10.2_

  - [ ] 11.2 Optimize performance
    - Review image loading performance
    - Adjust image quality settings if needed
    - Consider CDN integration for projects
    - Optimize database queries
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ] 11.3 Archive local images
    - Create backup of local project images
    - Move to archive storage
    - Document archive location
    - Set up retention policy
    - _Requirements: 6.5_
