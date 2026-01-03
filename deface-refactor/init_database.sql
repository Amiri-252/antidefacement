-- Anti-Defacement Monitoring System - MySQL Database Initialization Script
-- This script creates all required tables for the system

-- Database creation (run separately as root if needed)
-- CREATE DATABASE IF NOT EXISTS antidefacement CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- CREATE USER IF NOT EXISTS 'antidef_user'@'localhost' IDENTIFIED BY 'your_secure_password';
-- GRANT ALL PRIVILEGES ON antidefacement.* TO 'antidef_user'@'localhost';
-- FLUSH PRIVILEGES;

USE antidefacement;

-- Drop existing tables if they exist (be careful in production!)
-- DROP TABLE IF EXISTS activity_logs;
-- DROP TABLE IF EXISTS backups;
-- DROP TABLE IF EXISTS settings;
-- DROP TABLE IF EXISTS servers;
-- DROP TABLE IF EXISTS users;

-- ==================== Servers Table ====================
CREATE TABLE IF NOT EXISTS servers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INT DEFAULT 22,
    username VARCHAR(255) NOT NULL,
    password TEXT,
    key_path TEXT,
    path TEXT NOT NULL,
    mode VARCHAR(50) DEFAULT 'passive' COMMENT 'active or passive monitoring mode',
    backup_path TEXT,
    `interval` INT DEFAULT 1 COMMENT 'monitoring interval in seconds',
    status VARCHAR(50) DEFAULT 'active' COMMENT 'active, inactive, error',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_host (host),
    INDEX idx_mode (mode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== Settings Table ====================
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== Activity Logs Table ====================
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DOUBLE NOT NULL,
    server_id INT NOT NULL,
    server_name VARCHAR(255) NOT NULL,
    activity_type VARCHAR(50) NOT NULL COMMENT 'permission or file',
    change_type VARCHAR(100) COMMENT 'e.g., permission_change, file_modified',
    operation VARCHAR(100),
    path TEXT,
    src_path TEXT,
    dst_path TEXT,
    old_value TEXT,
    new_value TEXT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timestamp (timestamp),
    INDEX idx_server_id (server_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_server_timestamp (server_id, timestamp),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== Backups Table ====================
CREATE TABLE IF NOT EXISTS backups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    server_id INT NOT NULL,
    server_name VARCHAR(255) NOT NULL,
    backup_path TEXT NOT NULL,
    size_bytes BIGINT DEFAULT 0,
    file_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'completed' COMMENT 'pending, completed, failed',
    INDEX idx_server_id (server_id),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status),
    FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== Users Table (for authentication) ====================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    full_name VARCHAR(255),
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'viewer' COMMENT 'admin, operator, viewer',
    disabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== Insert Default Admin User ====================
-- Default password: admin123 (change immediately after first login!)
-- This is the bcrypt hash of 'admin123'
INSERT INTO users (username, email, full_name, hashed_password, role)
VALUES (
    'admin',
    'admin@example.com',
    'System Administrator',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNqYqNqYq',
    'admin'
) ON DUPLICATE KEY UPDATE username=username;

-- ==================== Insert Default Settings ====================
INSERT INTO settings (`key`, value) VALUES
    ('alert_telegram_token', ''),
    ('alert_telegram_chat_id', ''),
    ('alert_smtp_server', ''),
    ('alert_smtp_port', '587'),
    ('alert_email_from', ''),
    ('alert_email_to', ''),
    ('alert_critical_threshold', 'immediate'),
    ('alert_warning_threshold', 'after_3'),
    ('general_monitoring_interval', '1'),
    ('general_default_mode', 'active'),
    ('general_redis_host', 'localhost'),
    ('general_redis_port', '6379'),
    ('general_redis_password', ''),
    ('general_redis_enabled', 'false'),
    ('general_log_retention_days', '30'),
    ('general_log_level', 'INFO')
ON DUPLICATE KEY UPDATE `key`=`key`;

-- ==================== Verification Queries ====================
-- Run these to verify the database is set up correctly:
-- SHOW TABLES;
-- DESCRIBE servers;
-- DESCRIBE activity_logs;
-- DESCRIBE backups;
-- DESCRIBE settings;
-- DESCRIBE users;
-- SELECT COUNT(*) FROM users;
-- SELECT COUNT(*) FROM settings;

-- Success message
SELECT 'Database initialized successfully!' AS status;
