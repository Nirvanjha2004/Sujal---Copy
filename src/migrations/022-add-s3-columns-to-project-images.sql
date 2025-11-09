-- Add S3-related columns to project_images table
ALTER TABLE project_images
  ADD COLUMN thumbnail_url VARCHAR(500) AFTER image_url,
  ADD COLUMN medium_url VARCHAR(500) AFTER thumbnail_url,
  ADD COLUMN large_url VARCHAR(500) AFTER medium_url,
  ADD COLUMN s3_key VARCHAR(500) AFTER large_url,
  ADD COLUMN s3_bucket VARCHAR(100) AFTER s3_key,
  ADD COLUMN file_size INT AFTER s3_bucket,
  ADD COLUMN mime_type VARCHAR(50) AFTER file_size,
  ADD COLUMN width INT AFTER mime_type,
  ADD COLUMN height INT AFTER width,
  ADD COLUMN caption TEXT AFTER alt_text;

-- Add indexes for S3 operations
ALTER TABLE project_images
  ADD INDEX idx_s3_key (s3_key),
  ADD INDEX idx_display_order (display_order),
  ADD INDEX idx_is_primary (is_primary);
