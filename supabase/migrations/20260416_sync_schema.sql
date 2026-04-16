-- =====================================================
-- LINKSPHERE SCHEMA SYNC MIGRATION
-- Date: 2026-04-16
-- Description: Sinkronisasi schema database Supabase
--   dengan kode aplikasi terkini
-- =====================================================

-- =====================================================
-- 1. USERS TABLE: Add updated_at column
-- =====================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =====================================================
-- 2. USER_SETTINGS TABLE: Add id column as proper PK
--    Current: user_id is PK
--    Target: id is PK, user_id is UNIQUE
-- =====================================================
-- Add id column with auto-generated UUIDs for existing rows
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();

-- Ensure all existing rows have unique UUIDs (in case DEFAULT didn't apply)
UPDATE user_settings SET id = gen_random_uuid() WHERE id IS NULL;

-- Make id NOT NULL
ALTER TABLE user_settings ALTER COLUMN id SET NOT NULL;

-- Drop existing primary key constraint on user_id
-- (constraint name may vary, so we find it dynamically)
DO $$
DECLARE
  pk_constraint_name TEXT;
BEGIN
  SELECT tc.constraint_name INTO pk_constraint_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  WHERE tc.table_name = 'user_settings'
    AND tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
    AND kcu.column_name = 'user_id';
  
  IF pk_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE user_settings DROP CONSTRAINT %I', pk_constraint_name);
  END IF;
END $$;

-- Also drop the separate UNIQUE constraint on user_id if it exists
-- (it may have been created when the original UNIQUE(user_id) was set up)
ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_key;

-- Set id as the new primary key
ALTER TABLE user_settings ADD PRIMARY KEY (id);

-- Ensure user_id has a UNIQUE constraint
ALTER TABLE user_settings ADD UNIQUE (user_id);

-- =====================================================
-- 3. LINKS TABLE: Add missing columns & fix defaults
-- =====================================================
-- Add description column
ALTER TABLE links ADD COLUMN IF NOT EXISTS description TEXT;

-- Add qr_code column
ALTER TABLE links ADD COLUMN IF NOT EXISTS qr_code TEXT;

-- Add short_code column (unique, nullable)
ALTER TABLE links ADD COLUMN IF NOT EXISTS short_code TEXT;

-- Add UNIQUE constraint on short_code (only if not already exists)
-- Use IF NOT EXISTS via DO block to avoid errors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'links' AND c.conname = 'links_short_code_key'
  ) THEN
    ALTER TABLE links ADD CONSTRAINT links_short_code_key UNIQUE (short_code);
  END IF;
END $$;

-- Fix is_public default to false (links are private by default)
ALTER TABLE links ALTER COLUMN is_public SET DEFAULT false;

-- Ensure is_active default is true
ALTER TABLE links ALTER COLUMN is_active SET DEFAULT true;

-- =====================================================
-- 4. CATEGORIES TABLE: Add updated_at column
-- =====================================================
ALTER TABLE categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =====================================================
-- 5. INDEXES: Create missing performance indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_custom_slug ON users(custom_slug);
CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_category_id ON links(category_id);
CREATE INDEX IF NOT EXISTS idx_links_is_public ON links(is_public);
CREATE INDEX IF NOT EXISTS idx_links_is_active ON links(is_active);
CREATE INDEX IF NOT EXISTS idx_links_qr_code ON links(qr_code) WHERE qr_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code) WHERE short_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- =====================================================
-- 6. FUNCTIONS: Create or replace database functions
-- =====================================================

-- Function to increment click count (thread-safe)
CREATE OR REPLACE FUNCTION increment_click_count(link_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE links 
  SET click_count = click_count + 1,
      updated_at = NOW()
  WHERE id = link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique slug from display name
CREATE OR REPLACE FUNCTION generate_unique_slug(base_name TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
  counter INTEGER := 0;
BEGIN
  slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9\s-]', '', 'g'));
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := regexp_replace(slug, '-+', '-', 'g');
  slug := trim(both '-' from slug);
  
  WHILE EXISTS (SELECT 1 FROM users WHERE custom_slug = slug) LOOP
    counter := counter + 1;
    slug := base_name || '-' || counter;
    slug := lower(regexp_replace(slug, '[^a-zA-Z0-9\s-]', '', 'g'));
    slug := regexp_replace(slug, '\s+', '-', 'g');
  END LOOP;
  
  RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. TRIGGERS: Auto-update updated_at on all tables
-- =====================================================

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_links_updated_at ON links;
CREATE TRIGGER update_links_updated_at
  BEFORE UPDATE ON links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. ROW LEVEL SECURITY: Enable on appropriate tables
--    Note: admin_users stays DISABLED per fix-admin-access.sql
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
-- admin_users: intentionally left DISABLED for API access

-- =====================================================
-- 9. RLS POLICIES: Recreate policies for custom JWT auth
--    Using permissive policies since auth is handled at
--    the application layer (custom JWT, not Supabase Auth)
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can delete their own data" ON users;
DROP POLICY IF EXISTS "Admins can do everything on users" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Admins can delete all users" ON users;

DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Admins can do everything on user_settings" ON user_settings;
DROP POLICY IF EXISTS "Admins can manage all settings" ON user_settings;
DROP POLICY IF EXISTS "Admins can view all settings" ON user_settings;

DROP POLICY IF EXISTS "Users can view own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
DROP POLICY IF EXISTS "Public can view categories" ON categories;
DROP POLICY IF EXISTS "Public can view global categories" ON categories;
DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
DROP POLICY IF EXISTS "Admins can insert any categories" ON categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
DROP POLICY IF EXISTS "Admins can update all categories" ON categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete all categories" ON categories;
DROP POLICY IF EXISTS "Admins can view all categories" ON categories;
DROP POLICY IF EXISTS "Admins can do everything on categories" ON categories;

DROP POLICY IF EXISTS "Users can view own links" ON links;
DROP POLICY IF EXISTS "Public can view public links" ON links;
DROP POLICY IF EXISTS "Public can view public active links" ON links;
DROP POLICY IF EXISTS "Public can view active links" ON links;
DROP POLICY IF EXISTS "Users can insert own links" ON links;
DROP POLICY IF EXISTS "Users can update own links" ON links;
DROP POLICY IF EXISTS "Users can delete own links" ON links;
DROP POLICY IF EXISTS "Admins can do everything on links" ON links;
DROP POLICY IF EXISTS "Users can view their own links" ON links;
DROP POLICY IF EXISTS "Admins can view all links" ON links;
DROP POLICY IF EXISTS "Admins can insert any links" ON links;
DROP POLICY IF EXISTS "Users can update their own links" ON links;
DROP POLICY IF EXISTS "Admins can update all links" ON links;
DROP POLICY IF EXISTS "Users can delete their own links" ON links;
DROP POLICY IF EXISTS "Admins can delete all links" ON links;

DROP POLICY IF EXISTS "Admins can do everything on admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow all access to admin_users" ON admin_users;

-- Create permissive policies (app-layer auth handles authorization)
-- Users table
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (true);
CREATE POLICY "Users can delete own data" ON users FOR DELETE USING (true);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (true);

-- User settings table
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (true);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (true);
CREATE POLICY "Users can delete own settings" ON user_settings FOR DELETE USING (true);

-- Categories table
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Users can insert categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update categories" ON categories FOR UPDATE USING (true);
CREATE POLICY "Users can delete categories" ON categories FOR DELETE USING (true);

-- Links table
CREATE POLICY "Public can view public links" ON links FOR SELECT USING (true);
CREATE POLICY "Users can insert links" ON links FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update links" ON links FOR UPDATE USING (true);
CREATE POLICY "Users can delete links" ON links FOR DELETE USING (true);

-- admin_users: keep RLS disabled for API access
-- (already disabled via fix-admin-access.sql)

-- =====================================================
-- 10. FOREIGN KEY: Ensure category_id FK exists on links
-- =====================================================
-- Add foreign key constraint on links.category_id if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_name = 'links_category_id_fkey'
      AND tc.table_name = 'links'
      AND tc.table_schema = 'public'
  ) THEN
    ALTER TABLE links ADD CONSTRAINT links_category_id_fkey
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Ensure foreign key on links.user_id exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_name = 'links_user_id_fkey'
      AND tc.table_name = 'links'
      AND tc.table_schema = 'public'
  ) THEN
    ALTER TABLE links ADD CONSTRAINT links_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ensure foreign key on categories.user_id exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_name = 'categories_user_id_fkey'
      AND tc.table_name = 'categories'
      AND tc.table_schema = 'public'
  ) THEN
    ALTER TABLE categories ADD CONSTRAINT categories_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ensure foreign key on admin_users.user_id exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_name = 'admin_users_user_id_fkey'
      AND tc.table_name = 'admin_users'
      AND tc.table_schema = 'public'
  ) THEN
    ALTER TABLE admin_users ADD CONSTRAINT admin_users_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Ensure foreign key on user_settings.user_id exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_name = 'user_settings_user_id_fkey'
      AND tc.table_name = 'user_settings'
      AND tc.table_schema = 'public'
  ) THEN
    ALTER TABLE user_settings ADD CONSTRAINT user_settings_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Changes applied:
-- 1. users: added updated_at column
-- 2. user_settings: added id column as PK, user_id now UNIQUE
-- 3. links: added description, qr_code, short_code columns
-- 4. links: fixed is_public default to false
-- 5. links: fixed is_active default to true
-- 6. categories: added updated_at column
-- 7. Added all missing indexes
-- 8. Created increment_click_count, update_updated_at_column, generate_unique_slug functions
-- 9. Created updated_at triggers on all tables
-- 10. Enabled RLS on all tables except admin_users
-- 11. Recreated permissive RLS policies (app-layer auth)
-- 12. Verified/created all foreign key constraints
-- =====================================================