-- Migration: Add S3-related columns to property_images table
-- Description: Adds columns for storing S3 URLs, keys, and image metadata
-- Date: 2024

-- Add S3-related columns
ALTER TABLE property_images 
ADD COLUMN s3_key VARCHAR(500) NULL COMMENT 'S3 object key',
ADD COLUMN s3_bucket VARCHAR(100) NULL COMMENT 'S3 bucket name',
ADD COLUMN thumbnail_url VARCHAR(500) NULL COMMENT 'S3 URL for thumbnail (300px)',
ADD COLUMN medium_url VARCHAR(500) NULL COMMENT 'S3 URL for medium size (800px)',
ADD COLUMN large_url VARCHAR(500) NULL COMMENT 'S3 URL for large size (1600px)',
ADD COLUMN file_size INT NULL COMMENT 'File size in bytes',
ADD COLUMN mime_type VARCHAR(50) NULL COMMENT 'MIME type (image/jpeg, image/png, etc.)',
ADD COLUMN width INT NULL COMMENT 'Image width in pixels',
ADD COLUMN height INT NULL COMMENT 'Image height in pixels',
ADD COLUMN is_primary BOOLEAN DEFAULT FALSE COMMENT 'Is this the primary/featured image';

-- Add index on s3_key for faster lookups
CREATE INDEX idx_property_images_s3_key ON property_images(s3_key);

-- Add index on is_primary for faster primary image queries
CREATE INDEX idx_property_images_is_primary ON property_images(is_primary);

-- Update existing records to set is_primary = false if NULL
UPDATE property_images SET is_primary = FALSE WHERE is_primary IS NULL;

-- Add comment to table
ALTER TABLE property_images COMMENT = 'Stores property images with support for both local and S3 storage';
