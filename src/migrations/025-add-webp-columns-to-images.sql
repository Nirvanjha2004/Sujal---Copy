-- Migration: Add WebP URL columns to property_images and project_images tables
-- Description: Adds columns for storing WebP format URLs for thumbnail, medium, and large sizes
-- Date: 2024
-- Requirements: 7.4 (Image Format Optimization)

-- Add WebP URL columns to property_images table
ALTER TABLE property_images
ADD COLUMN thumbnail_webp_url VARCHAR(500) NULL COMMENT 'S3 URL for WebP thumbnail (300px)' AFTER thumbnail_url,
ADD COLUMN medium_webp_url VARCHAR(500) NULL COMMENT 'S3 URL for WebP medium size (800px)' AFTER medium_url,
ADD COLUMN large_webp_url VARCHAR(500) NULL COMMENT 'S3 URL for WebP large size (1600px)' AFTER large_url;

-- Add WebP URL columns to project_images table
ALTER TABLE project_images
ADD COLUMN thumbnail_webp_url VARCHAR(500) NULL COMMENT 'S3 URL for WebP thumbnail (300px)' AFTER thumbnail_url,
ADD COLUMN medium_webp_url VARCHAR(500) NULL COMMENT 'S3 URL for WebP medium size (800px)' AFTER medium_url,
ADD COLUMN large_webp_url VARCHAR(500) NULL COMMENT 'S3 URL for WebP large size (1600px)' AFTER large_url;

-- Add indexes for faster queries on WebP columns for property_images
CREATE INDEX idx_property_images_webp_thumbnail ON property_images(thumbnail_webp_url);
CREATE INDEX idx_property_images_webp_medium ON property_images(medium_webp_url);
CREATE INDEX idx_property_images_webp_large ON property_images(large_webp_url);

-- Add indexes for faster queries on WebP columns for project_images
CREATE INDEX idx_project_images_webp_thumbnail ON project_images(thumbnail_webp_url);
CREATE INDEX idx_project_images_webp_medium ON project_images(medium_webp_url);
CREATE INDEX idx_project_images_webp_large ON project_images(large_webp_url);

-- Add comments to tables
ALTER TABLE property_images COMMENT = 'Stores property images with support for both JPEG and WebP formats in multiple sizes';
ALTER TABLE project_images COMMENT = 'Stores project images with support for both JPEG and WebP formats in multiple sizes';
