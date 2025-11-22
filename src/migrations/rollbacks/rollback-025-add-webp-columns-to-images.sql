-- Rollback Migration: Remove WebP URL columns from property_images and project_images tables
-- Description: Removes WebP format URL columns added in migration 025
-- Date: 2024
-- NOTE: This is a rollback file and should be run manually if needed
-- Usage: Execute this file directly against the database if you need to rollback migration 025

-- Drop indexes for property_images WebP columns
ALTER TABLE property_images DROP INDEX idx_property_images_webp_thumbnail;
ALTER TABLE property_images DROP INDEX idx_property_images_webp_medium;
ALTER TABLE property_images DROP INDEX idx_property_images_webp_large;

-- Drop indexes for project_images WebP columns
ALTER TABLE project_images DROP INDEX idx_project_images_webp_thumbnail;
ALTER TABLE project_images DROP INDEX idx_project_images_webp_medium;
ALTER TABLE project_images DROP INDEX idx_project_images_webp_large;

-- Remove WebP URL columns from property_images table
ALTER TABLE property_images
DROP COLUMN thumbnail_webp_url,
DROP COLUMN medium_webp_url,
DROP COLUMN large_webp_url;

-- Remove WebP URL columns from project_images table
ALTER TABLE project_images
DROP COLUMN thumbnail_webp_url,
DROP COLUMN medium_webp_url,
DROP COLUMN large_webp_url;

-- Restore original table comments
ALTER TABLE property_images COMMENT = 'Stores property images with support for both local and S3 storage';
ALTER TABLE project_images COMMENT = 'Stores project images with S3 storage support';

-- Remove migration record
DELETE FROM migrations WHERE filename = '025-add-webp-columns-to-images.sql';
