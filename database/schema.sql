CREATE DATABASE IF NOT EXISTS logo_portal
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE logo_portal;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NULL,
  contact_name VARCHAR(255) NULL,
  phone VARCHAR(50) NULL,
  preferred_locale VARCHAR(8) NOT NULL DEFAULT 'en',
  is_admin TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at DATETIME NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS quotes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quote_number VARCHAR(32) NOT NULL UNIQUE,
  user_id BIGINT UNSIGNED NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'submitted',
  project_type VARCHAR(64) NULL,
  indicative_price DECIMAL(12,2) NULL,
  indicative_price_label VARCHAR(64) NULL,
  locale VARCHAR(8) NOT NULL DEFAULT 'en',
  customer_notes TEXT NULL,
  form_payload JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  quoted_at DATETIME NULL,
  CONSTRAINT fk_quotes_user FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_quotes_user_created (user_id, created_at),
  INDEX idx_quotes_status_created (status, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS quote_files (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quote_id BIGINT UNSIGNED NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(128) NOT NULL,
  file_size BIGINT UNSIGNED NOT NULL,
  file_path VARCHAR(512) NOT NULL,
  file_role VARCHAR(32) NOT NULL DEFAULT 'other',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_quote_files_quote FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
  INDEX idx_quote_files_quote (quote_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(128) NOT NULL UNIQUE,
  name_en VARCHAR(255) NOT NULL,
  name_de VARCHAR(255) NOT NULL,
  description_en TEXT NULL,
  description_de TEXT NULL,
  category VARCHAR(64) NOT NULL,
  material VARCHAR(128) NULL,
  base_price DECIMAL(12,2) NULL,
  image_url VARCHAR(512) NULL,
  specs_json JSON NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_category_active (category, active),
  INDEX idx_products_sort (sort_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS gallery_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title_en VARCHAR(255) NOT NULL,
  title_de VARCHAR(255) NOT NULL,
  description_en TEXT NULL,
  description_de TEXT NULL,
  image_url VARCHAR(512) NOT NULL,
  category VARCHAR(64) NULL,
  published TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_gallery_category_published (category, published),
  INDEX idx_gallery_sort (sort_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS starting_price_rules (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  project_type VARCHAR(64) NULL,
  material VARCHAR(128) NULL,
  min_width_mm INT NULL,
  max_width_mm INT NULL,
  min_height_mm INT NULL,
  max_height_mm INT NULL,
  starting_price DECIMAL(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'EUR',
  active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_spr_lookup (active, project_type, material, sort_order)
) ENGINE=InnoDB;
