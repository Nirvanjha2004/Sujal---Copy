-- Update property status enum to include all status values
ALTER TABLE properties 
MODIFY COLUMN status ENUM('new', 'resale', 'under_construction', 'active', 'sold', 'rented', 'inactive', 'pending') NOT NULL;
