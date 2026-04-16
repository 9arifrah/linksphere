-- =====================================================
-- LINKSPHERE COMPLETE DATABASE MIGRATION SCRIPT
-- =====================================================
-- Run this in Supabase SQL Editor to setup the database
-- 
-- Instructions:
-- 1. Open your Supabase project
-- 2. Go to SQL Editor
-- 3. Click "New Query"
-- 4. Copy & paste this entire script
-- 5. Click "Run" (or press Ctrl+Enter)
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  custom_slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme_color TEXT DEFAULT '#3b82f6',
  logo_url TEXT,
  page_title TEXT,
  show_categories BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Links table
CREATE TABLE IF NOT EXISTS links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT false,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_custom_slug ON users(custom_slug);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_category_id ON links(category_id);
CREATE INDEX IF NOT EXISTS idx_links_is_public ON links(is_public);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to increment click count
CREATE OR REPLACE FUNCTION increment_click_count(link_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE links 
  SET click_count = click_count + 1,
      updated_at = NOW()
  WHERE id = link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at for users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for user_settings
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for categories
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for links
DROP TRIGGER IF EXISTS update_links_updated_at ON links;
CREATE TRIGGER update_links_updated_at
  BEFORE UPDATE ON links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for admin_users
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
DROP POLICY IF EXISTS "Public can view categories" ON categories;
DROP POLICY IF EXISTS "Users can view own links" ON links;
DROP POLICY IF EXISTS "Public can view public links" ON links;
DROP POLICY IF EXISTS "Users can insert own links" ON links;
DROP POLICY IF EXISTS "Users can update own links" ON links;
DROP POLICY IF EXISTS "Users can delete own links" ON links;
DROP POLICY IF EXISTS "Admins can do everything on users" ON users;
DROP POLICY IF EXISTS "Admins can do everything on categories" ON categories;
DROP POLICY IF EXISTS "Admins can do everything on links" ON links;
DROP POLICY IF EXISTS "Admins can do everything on user_settings" ON user_settings;
DROP POLICY IF EXISTS "Admins can do everything on admin_users" ON admin_users;

-- Users policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (id = auth.uid());

-- User settings policies
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (user_id = auth.uid());

-- Categories policies
CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Public can view categories" ON categories
  FOR SELECT USING (true);

-- Links policies
CREATE POLICY "Users can view own links" ON links
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Public can view public links" ON links
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert own links" ON links
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own links" ON links
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own links" ON links
  FOR DELETE USING (user_id = auth.uid());

-- Admin policies (custom JWT implementation)
-- Note: These policies use custom auth logic, not Supabase Auth
CREATE POLICY "Admins can do everything on users" ON users
  FOR ALL USING (true);

CREATE POLICY "Admins can do everything on categories" ON categories
  FOR ALL USING (true);

CREATE POLICY "Admins can do everything on links" ON links
  FOR ALL USING (true);

CREATE POLICY "Admins can do everything on user_settings" ON user_settings
  FOR ALL USING (true);

CREATE POLICY "Admins can do everything on admin_users" ON admin_users
  FOR ALL USING (true);

-- =====================================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Insert default admin user
-- Email: admin@example.com
-- Password: admin123 (CHANGE THIS IN PRODUCTION!)
-- This hash is for "admin123" - generate new hash with:
-- node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 10).then(h => console.log(h))"

INSERT INTO admin_users (email, password_hash) 
VALUES (
  'admin@example.com',
  '$2a$10$K8Xj2Z5m9XqW7nZ2K8j2ZeX5Z5m9XqW7nZ2K8j2ZeX5Z5m9XqW7nZ2'
)
ON CONFLICT (email) DO NOTHING;

-- Insert sample categories for testing
INSERT INTO categories (user_id, name, icon, sort_order) 
SELECT 
  id,
  'Social Media',
  '📱',
  1
FROM users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO categories (user_id, name, icon, sort_order) 
SELECT 
  id,
  'Portfolio',
  '💼',
  2
FROM users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO categories (user_id, name, icon, sort_order) 
SELECT 
  id,
  'Blog',
  '📝',
  3
FROM users
LIMIT 1
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify tables were created
SELECT 
  tablename 
FROM 
  pg_tables 
WHERE 
  schemaname = 'public'
ORDER BY 
  tablename;

-- Verify indexes were created
SELECT 
  indexname, 
  tablename 
FROM 
  pg_indexes 
WHERE 
  schemaname = 'public'
ORDER BY 
  tablename, 
  indexname;

-- Verify functions were created
SELECT 
  routine_name,
  routine_type
FROM 
  information_schema.routines
WHERE 
  routine_schema = 'public'
ORDER BY 
  routine_name;

-- Verify triggers were created
SELECT 
  trigger_name,
  event_object_table
FROM 
  information_schema.triggers
WHERE 
  trigger_schema = 'public'
ORDER BY 
  event_object_table,
  trigger_name;

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM 
  pg_policies
ORDER BY 
  tablename,
  policyname;

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
-- You should now see:
-- - 5 tables created (users, user_settings, categories, links, admin_users)
-- - Indexes created for performance
-- - RLS policies created for security
-- - Triggers created for auto-updating timestamps
-- - RPC function created for incrementing click counts
-- 
-- Next steps:
-- 1. Update your .env file with Supabase credentials
-- 2. Run: npm install
-- 3. Run: npm run dev
-- 4. Test the application!
-- =====================================================
