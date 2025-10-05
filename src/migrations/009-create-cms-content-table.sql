-- Create CMS content table
CREATE TABLE IF NOT EXISTS cms_content (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('banner', 'announcement', 'page', 'widget') NOT NULL COMMENT 'Type of content',
    `key` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique identifier for the content',
    title VARCHAR(255) NOT NULL COMMENT 'Title of the content',
    content TEXT NOT NULL COMMENT 'Main content (HTML/Markdown supported)',
    metadata JSON NULL COMMENT 'Additional metadata (images, links, etc.)',
    target_audience ENUM('all', 'buyers', 'sellers', 'agents', 'builders') NOT NULL DEFAULT 'all' COMMENT 'Target audience for the content',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Whether the content is active',
    start_date DATETIME NULL COMMENT 'Start date for scheduled content',
    end_date DATETIME NULL COMMENT 'End date for scheduled content',
    priority INT NOT NULL DEFAULT 0 COMMENT 'Priority for ordering (higher = more important)',
    created_by INT NOT NULL COMMENT 'ID of the admin who created this content',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type (type),
    INDEX idx_key (`key`),
    INDEX idx_target_audience (target_audience),
    INDEX idx_is_active (is_active),
    INDEX idx_priority (priority),
    INDEX idx_date_range (start_date, end_date),
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);