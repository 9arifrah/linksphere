-- ====================================================================
-- RESET ALL DATA & CREATE SUPER ADMIN
-- ====================================================================
-- ⚠️ WARNING: This will DELETE ALL DATA in the database!
-- Only run this if you want to start fresh with a clean database.
-- ====================================================================

-- Step 1: Delete all existing data (in correct order due to foreign keys)
-- Cascade delete will handle related data, but we'll be explicit for clarity

DELETE FROM admin_users;
DELETE FROM user_settings;
DELETE FROM links;
DELETE FROM categories;
DELETE FROM users;

-- Step 2: Create Super Admin user
-- Email: admin@linksphere.com
-- Password: Admin123!
-- Hash: $2b$10$jfXeGKglcQ/62xfQDu1.cOg3YqT.HuFSaYD38ONm5cpztTnr7Ew2i
-- Note: Admin status is managed via admin_users table, not is_admin column

INSERT INTO users (
  id,
  email,
  password_hash,
  display_name,
  custom_slug,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',  -- Fixed UUID for admin
  'admin@linksphere.com',
  '$2b$10$jfXeGKglcQ/62xfQDu1.cOg3YqT.HuFSaYD38ONm5cpztTnr7Ew2i',  -- Hash for "Admin123!"
  'Super Admin',
  'admin',
  NOW()
);

-- Step 3: Grant admin access in admin_users table
INSERT INTO admin_users (
  user_id,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  NOW()
);

-- Step 4: Create default user settings for admin
INSERT INTO user_settings (
  user_id,
  profile_description,
  page_title,
  logo_url,
  theme_color,
  show_categories,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Administrator LinkSphere',
  'LinkSphere - Admin Dashboard',
  NULL,
  '#2563eb',
  TRUE,
  NOW(),
  NOW()
);

-- ====================================================================
-- VERIFICATION QUERIES
-- ====================================================================

-- Verify admin user was created
SELECT 
  'Admin User Created' as status,
  id,
  email,
  display_name,
  custom_slug,
  created_at
FROM users 
WHERE email = 'admin@linksphere.com';

-- Verify admin access granted
SELECT 
  'Admin Access Granted' as status,
  user_id,
  created_at
FROM admin_users
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Verify user settings created
SELECT 
  'User Settings Created' as status,
  user_id,
  page_title,
  theme_color
FROM user_settings
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- Show total counts after reset
SELECT 
  'Total Counts After Reset' as section,
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM admin_users) as admin_users_count,
  (SELECT COUNT(*) FROM user_settings) as user_settings_count,
  (SELECT COUNT(*) FROM links) as links_count,
  (SELECT COUNT(*) FROM categories) as categories_count;

-- ====================================================================
-- LOGIN CREDENTIALS
-- ====================================================================
-- Email:    admin@linksphere.com
-- Password: Admin123!
-- Role:     Super Admin
-- ====================================================================