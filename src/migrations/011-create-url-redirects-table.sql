-- Create URL redirects table for SEO redirect management
CREATE TABLE IF NOT EXISTS url_redirects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    from_path VARCHAR(500) NOT NULL UNIQUE,
    to_path VARCHAR(500) NOT NULL,
    status_code INT NOT NULL DEFAULT 301,
    is_active BOOLEAN DEFAULT TRUE,
    description VARCHAR(255),
    hit_count INT DEFAULT 0,
    last_used TIMESTAMP NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_from_path (from_path),
    INDEX idx_is_active (is_active),
    INDEX idx_status_code (status_code),
    INDEX idx_hit_count (hit_count),
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    
    CONSTRAINT chk_status_code CHECK (status_code IN (301, 302, 307, 308))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;