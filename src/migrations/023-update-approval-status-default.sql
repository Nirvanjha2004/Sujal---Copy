-- Update existing projects with pending approval_status to approved
UPDATE projects 
SET approval_status = 'approved' 
WHERE approval_status = 'pending';

-- Alter the default value for future inserts
ALTER TABLE projects 
MODIFY COLUMN approval_status VARCHAR(50) NOT NULL DEFAULT 'approved';
