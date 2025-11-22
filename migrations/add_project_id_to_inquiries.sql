-- Migration: Add project_id support to inquiries table
-- This allows inquiries to be associated with either properties or projects

-- Add project_id column
ALTER TABLE inquiries ADD COLUMN project_id INTEGER NULL;

-- Add index for project_id
CREATE INDEX idx_inquiries_project_id ON inquiries(project_id);

-- Add foreign key constraint
ALTER TABLE inquiries ADD CONSTRAINT fk_inquiries_project_id 
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Make property_id nullable (it was previously required)
ALTER TABLE inquiries MODIFY COLUMN property_id INTEGER NULL;

-- Add check constraint to ensure either property_id or project_id is provided
ALTER TABLE inquiries ADD CONSTRAINT chk_inquiries_reference 
  CHECK (
    (property_id IS NOT NULL AND project_id IS NULL) OR 
    (property_id IS NULL AND project_id IS NOT NULL)
  );