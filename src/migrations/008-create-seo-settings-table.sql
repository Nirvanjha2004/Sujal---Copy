-- Create SEO settings table
CREATE TABLE IF NOT EXISTS seo_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entity_type ENUM('property', 'page', 'global') NOT NULL COMMENT 'Type of entity this SEO setting applies to',
    entity_id INT NULL COMMENT 'ID of the specific entity (e.g., property ID)',
    page_type VARCHAR(100) NULL COMMENT 'Type of page (e.g., home, search, property-detail)',
    title VARCHAR(255) NULL COMMENT 'SEO title tag',
    description TEXT NULL COMMENT 'SEO meta description',
    keywords TEXT NULL COMMENT 'SEO meta keywords',
    og_title VARCHAR(255) NULL COMMENT 'Open Graph title',
    og_description TEXT NULL COMMENT 'Open Graph description',
    og_image VARCHAR(500) NULL COMMENT 'Open Graph image URL',
    canonical_url VARCHAR(500) NULL COMMENT 'Canonical URL for the page',
    meta_robots VARCHAR(100) DEFAULT 'index,follow' COMMENT 'Meta robots directive',
    schema_markup JSON NULL COMMENT 'JSON-LD schema markup',
    custom_meta JSON NULL COMMENT 'Additional custom meta tags',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_entity_type_id (entity_type, entity_id),
    INDEX idx_page_type (page_type),
    INDEX idx_is_active (is_active)
);