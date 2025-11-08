-- Update property_type ENUM to include villa and plot types
-- This migration adds the missing property types that are used in the frontend

ALTER TABLE properties 
MODIFY COLUMN property_type ENUM('apartment', 'house', 'villa', 'plot', 'commercial', 'land') NOT NULL;