-- CMS Database Schema
-- Run this file to create all tables: mysql -u root -p cms_db < schema.sql

CREATE DATABASE IF NOT EXISTS cms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cms_db;

-- Users (admin accounts)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'editor') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- Theme Settings (key-value pairs)
CREATE TABLE IF NOT EXISTS theme_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_theme_key (setting_key)
) ENGINE=InnoDB;

-- Pages
CREATE TABLE IF NOT EXISTS pages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content LONGTEXT,
  meta_title VARCHAR(255) DEFAULT '',
  meta_description TEXT DEFAULT (''),
  is_published TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pages_slug (slug),
  INDEX idx_pages_published (is_published)
) ENGINE=InnoDB;

-- Service Categories
CREATE TABLE IF NOT EXISTS service_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id INT DEFAULT NULL,
  description TEXT DEFAULT (''),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES service_categories(id) ON DELETE SET NULL,
  INDEX idx_svc_cat_parent (parent_id)
) ENGINE=InnoDB;

-- Services
CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description LONGTEXT,
  category_id INT DEFAULT NULL,
  pricing_info TEXT DEFAULT (''),
  service_type VARCHAR(100) DEFAULT '',
  is_published TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE SET NULL,
  INDEX idx_services_category (category_id),
  INDEX idx_services_published (is_published)
) ENGINE=InnoDB;

-- Service Images
CREATE TABLE IF NOT EXISTS service_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  INDEX idx_svc_images_service (service_id)
) ENGINE=InnoDB;

-- Product Categories
CREATE TABLE IF NOT EXISTS product_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id INT DEFAULT NULL,
  description TEXT DEFAULT (''),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL,
  INDEX idx_prod_cat_parent (parent_id)
) ENGINE=InnoDB;

-- Products
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description LONGTEXT,
  category_id INT DEFAULT NULL,
  price DECIMAL(12,2) DEFAULT 0.00,
  is_published TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL,
  INDEX idx_products_category (category_id),
  INDEX idx_products_published (is_published)
) ENGINE=InnoDB;

-- Product Images
CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_prod_images_product (product_id)
) ENGINE=InnoDB;

-- Project Categories
CREATE TABLE IF NOT EXISTS project_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT (''),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description LONGTEXT,
  category_id INT DEFAULT NULL,
  featured_image VARCHAR(500) DEFAULT '',
  link_url VARCHAR(500) DEFAULT '',
  is_published TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES project_categories(id) ON DELETE SET NULL,
  INDEX idx_projects_category (category_id),
  INDEX idx_projects_published (is_published)
) ENGINE=InnoDB;

-- Project Images
CREATE TABLE IF NOT EXISTS project_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  caption VARCHAR(500) DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_proj_images_project (project_id)
) ENGINE=InnoDB;

-- Quotations
CREATE TABLE IF NOT EXISTS quotations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quotation_number VARCHAR(50) NOT NULL UNIQUE,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) DEFAULT '',
  client_company VARCHAR(255) DEFAULT '',
  notes TEXT,
  subtotal DECIMAL(12,2) DEFAULT 0.00,
  total DECIMAL(12,2) DEFAULT 0.00,
  valid_until DATE DEFAULT NULL,
  status ENUM('draft', 'sent', 'offered', 'accepted', 'rejected', 'paid', 'expired') DEFAULT 'draft',
  payment_link VARCHAR(500) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_quotations_number (quotation_number),
  INDEX idx_quotations_status (status)
) ENGINE=InnoDB;

-- Quotation Items
CREATE TABLE IF NOT EXISTS quotation_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quotation_id INT NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(12,2) DEFAULT 0.00,
  total DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
  INDEX idx_qi_quotation (quotation_id)
) ENGINE=InnoDB;

-- Payment Settings
CREATE TABLE IF NOT EXISTS payment_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider VARCHAR(50) NOT NULL,
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_payment_provider_key (provider, setting_key),
  INDEX idx_payment_provider (provider)
) ENGINE=InnoDB;

-- Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'EUR',
  status VARCHAR(50) DEFAULT 'pending',
  quotation_id INT DEFAULT NULL,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE SET NULL,
  INDEX idx_pt_transaction (transaction_id),
  INDEX idx_pt_status (status),
  INDEX idx_pt_provider (provider)
) ENGINE=InnoDB;

-- Partners
CREATE TABLE IF NOT EXISTS partners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500) DEFAULT '',
  url VARCHAR(500) DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Contact Departments
CREATE TABLE IF NOT EXISTS contact_departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Contact Options (configurable multi-option selection fields)
CREATE TABLE IF NOT EXISTS contact_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  field_name VARCHAR(255) NOT NULL,
  option_value VARCHAR(255) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_co_field (field_name)
) ENGINE=InnoDB;

-- Contact Form Submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT '',
  department_id INT DEFAULT NULL,
  subject VARCHAR(255) DEFAULT '',
  message TEXT NOT NULL,
  selected_options JSON,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES contact_departments(id) ON DELETE SET NULL,
  INDEX idx_cs_read (is_read),
  INDEX idx_cs_department (department_id)
) ENGINE=InnoDB;

-- FAQ Categories
CREATE TABLE IF NOT EXISTS faq_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category_id INT DEFAULT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES faq_categories(id) ON DELETE SET NULL,
  INDEX idx_faqs_category (category_id),
  INDEX idx_faqs_order (sort_order)
) ENGINE=InnoDB;

-- Cookie Settings
CREATE TABLE IF NOT EXISTS cookie_settings (
  id INT PRIMARY KEY DEFAULT 1,
  bar_text TEXT DEFAULT (''),
  accept_button_text VARCHAR(100) DEFAULT 'Accept',
  cancel_button_text VARCHAR(100) DEFAULT 'Decline',
  is_enabled TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Cookie Categories
CREATE TABLE IF NOT EXISTS cookie_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT (''),
  is_required TINYINT(1) DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Sliders
CREATE TABLE IF NOT EXISTS sliders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_url VARCHAR(500) DEFAULT '',
  title VARCHAR(255) DEFAULT '',
  subtitle VARCHAR(500) DEFAULT '',
  link_url VARCHAR(500) DEFAULT '',
  sort_order INT DEFAULT 0,
  is_published TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sliders_published (is_published),
  INDEX idx_sliders_order (sort_order)
) ENGINE=InnoDB;

-- SEO Settings
CREATE TABLE IF NOT EXISTS seo_settings (
  id INT PRIMARY KEY DEFAULT 1,
  google_analytics_id VARCHAR(100) DEFAULT '',
  meta_keywords TEXT DEFAULT (''),
  meta_description TEXT DEFAULT (''),
  og_title VARCHAR(255) DEFAULT '',
  og_description TEXT DEFAULT (''),
  og_image VARCHAR(500) DEFAULT '',
  twitter_card VARCHAR(50) DEFAULT 'summary_large_image',
  twitter_site VARCHAR(100) DEFAULT '',
  robots_txt TEXT,
  ads_txt TEXT,
  favicon_url VARCHAR(500) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- SMTP Settings
CREATE TABLE IF NOT EXISTS smtp_settings (
  id INT PRIMARY KEY DEFAULT 1,
  host VARCHAR(255) DEFAULT '',
  port INT DEFAULT 587,
  username VARCHAR(255) DEFAULT '',
  password VARCHAR(255) DEFAULT '',
  from_email VARCHAR(255) DEFAULT '',
  from_name VARCHAR(255) DEFAULT '',
  encryption ENUM('tls', 'ssl', 'none') DEFAULT 'tls',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insert default theme settings
INSERT IGNORE INTO theme_settings (setting_key, setting_value) VALUES
  ('primary_color', '#2563eb'),
  ('secondary_color', '#1e40af'),
  ('accent_color', '#f59e0b'),
  ('header_style', 'default'),
  ('footer_style', 'default'),
  ('font_family', 'Inter, sans-serif'),
  ('logo_url', ''),
  ('favicon_url', '');

-- Insert default SEO settings
INSERT IGNORE INTO seo_settings (id, robots_txt) VALUES (1, 'User-agent: *\nAllow: /\n\nSitemap: /sitemap.xml');

-- Insert default cookie settings
INSERT IGNORE INTO cookie_settings (id, bar_text, accept_button_text, cancel_button_text, is_enabled)
VALUES (1, 'We use cookies to improve your experience. By continuing to browse, you agree to our use of cookies.', 'Accept', 'Decline', 0);
