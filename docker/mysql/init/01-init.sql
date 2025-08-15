-- Initialize Percy Tech Database
-- This script runs automatically when the MySQL container starts for the first time

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `percytech_dev` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Create database for testing
CREATE DATABASE IF NOT EXISTS `percytech_test` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Grant privileges to the application user
GRANT ALL PRIVILEGES ON `percytech_dev`.* TO 'percytech'@'%';
GRANT ALL PRIVILEGES ON `percytech_test`.* TO 'percytech'@'%';

-- Create a read-only user for reporting/analytics if needed
CREATE USER IF NOT EXISTS 'percytech_readonly'@'%' IDENTIFIED BY 'readonly_password';
GRANT SELECT ON `percytech_dev`.* TO 'percytech_readonly'@'%';
GRANT SELECT ON `percytech_test`.* TO 'percytech_readonly'@'%';

-- Flush privileges to ensure all changes take effect
FLUSH PRIVILEGES;

-- Log the initialization
SELECT 'Percy Tech Database initialization completed' as message;
