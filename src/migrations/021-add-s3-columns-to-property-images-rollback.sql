-- Rollback Migration: Remove S3-related columns from property_images table
-- Description: Removes S3 columns added in migration 021
-- Date: 2024

-- Drop indexes first
DROP INDEX IF EXISTS idx_property_images_s3_key ON property_images;
DROP INDEX IF EXISTS idx_property_images_is_primary ON property_images;

-- Drop S3-related columns
ALTER TABLE property_images 
DROP COLUMN IF EXISTS s3_key,
DROP COLUMN IF EXISTS s3_bucket,
DROP COLUMN IF EXISTS thumbnail_url,
DROP COLUMN IF EXISTS medium_url,
DROP COLUMN IF EXISTS large_url,
DROP COLUMN IF EXISTS file_size,
DROP COLUMN IF EXISTS mime_type,
DROP COLUMN IF EXISTS width,
DROP COLUMN IF EXISTS height,
DROP COLUMN IF EXISTS is_primary;
