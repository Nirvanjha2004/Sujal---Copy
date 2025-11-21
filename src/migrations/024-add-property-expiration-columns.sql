-- Add expiration handling fields to properties table
ALTER TABLE properties 
ADD COLUMN expires_at TIMESTAMP NULL,
ADD COLUMN auto_renew BOOLEAN DEFAULT FALSE,
ADD COLUMN renewal_period_days INT DEFAULT 30,
ADD INDEX idx_expires_at (expires_at);

-- Update existing properties to have a default expiration of 90 days from creation
UPDATE properties 
SET expires_at = DATE_ADD(created_at, INTERVAL 90 DAY)
WHERE expires_at IS NULL;
