-- ================================================
-- Reset or Create Super Admin User for Multi-User System
-- ================================================
-- This script works with the multi-user schema where:
-- - users table contains user data
-- - admin_users table contains mapping of which users are admins

-- ================================================
-- Step 1: Check/Update admin_users table schema
-- ================================================

-- Check if admin_users table has user_id column, if not add it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' 
    AND column_name = 'email'
  ) THEN
    -- Old schema detected, drop and recreate
    DROP TABLE IF EXISTS admin_users CASCADE;
    
    -- Create new admin_users table with user_id reference
    CREATE TABLE IF NOT EXISTS admin_users (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    RAISE NOTICE 'admin_users table recreated with new schema';
  ELSE
    -- Ensure table exists with correct schema
    CREATE TABLE IF NOT EXISTS admin_users (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    RAISE NOTICE 'admin_users table schema is correct';
  END IF;
END $$;

-- ================================================
-- Step 2: Create or update user in users table
-- ================================================

-- Password: admin123 (stored as plain text for now)
-- Email: zacky@mail.com
-- ID: 550e8400-e29b-41d4-a716-446655440000

INSERT INTO users (id, email, password_hash, display_name, custom_slug, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'zacky@mail.com',
  'admin123',
  'Super Admin',
  'admin',
  NOW()
)
ON CONFLICT (email)
DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  display_name = EXCLUDED.display_name,
  custom_slug = EXCLUDED.custom_slug;

-- ================================================
-- Step 3: Add user to admin_users to make them admin
-- ================================================

INSERT INTO admin_users (user_id)
VALUES ('550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT (user_id)
DO NOTHING;

-- ================================================
-- Step 4: Create user settings
-- ================================================

INSERT INTO user_settings (user_id, theme_color, show_categories, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '#2563eb',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (user_id)
DO UPDATE SET
  theme_color = EXCLUDED.theme_color,
  show_categories = EXCLUDED.show_categories,
  updated_at = NOW();

-- ================================================
-- Step 5: Verify the setup
-- ================================================

-- Verify user exists
SELECT 
  id, 
  email, 
  display_name, 
  custom_slug 
FROM users 
WHERE email = 'zacky@mail.com';

-- Verify user is admin
SELECT 
  u.id, 
  u.email, 
  u.display_name, 
  u.custom_slug, 
  CASE 
    WHEN au.user_id IS NOT NULL THEN 'YES' 
    ELSE 'NO' 
  END as is_admin
FROM users u
LEFT JOIN admin_users au ON u.id = au.user_id
WHERE u.email = 'zacky@mail.com';

-- Verify user settings
SELECT 
  us.user_id,
  u.email,
  us.theme_color,
  us.show_categories
FROM user_settings us
JOIN users u ON us.user_id = u.id
WHERE u.email = 'zacky@mail.com';

-- ================================================
-- Result Summary
-- ================================================
-- If successful, you should see:
-- 1. User with email zacky@mail.com in users table
-- 2. User ID in admin_users table (is_admin = YES)
-- 3. User settings created
--
-- Login credentials:
-- - Email: zacky@mail.com
-- - Password: admin123
-- - Admin Panel URL: http://localhost:3000/admin/login
-- - User Dashboard URL: http://localhost:3000/login
-- - Public Page URL: http://localhost:3000/u/admin
-- ================================================