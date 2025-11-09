-- Rollback Migration: Remove S3-related columns from property_images table
-- Description: Removes S3 columns added in migration 021
-- Date: 2024
-- NOTE: This is a rollback migration and should not be run as a forward migration
-- It will fail if the columns don't exist, which is expected behavior

-- This migration does nothing - it's a placeholder to prevent execution errors
-- The actual rollback should be done manually if needed
SELECT 'Rollback migration - skipping' as message;
