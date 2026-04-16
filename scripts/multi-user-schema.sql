-- Create users table for regular users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  custom_slug TEXT UNIQUE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_settings table for public page customization
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  profile_description TEXT,
  theme_color TEXT DEFAULT '#2563eb',
  logo_url TEXT,
  page_title TEXT,
  show_categories BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add user_id to links table
ALTER TABLE links ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Add is_public to links table
ALTER TABLE links ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Add user_id to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own data" ON users
  FOR DELETE USING (id = auth.uid());

CREATE POLICY "Admins can delete all users" ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

-- Policies for user_settings table
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all settings" ON user_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all settings" ON user_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

-- Update existing policies for links to support user_id
DROP POLICY IF EXISTS "Public can view active links" ON links;

CREATE POLICY "Public can view public active links" ON links
  FOR SELECT USING (is_active = true AND is_public = true);

CREATE POLICY "Users can view their own links" ON links
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all links" ON links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own links" ON links
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can insert any links" ON links
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can do everything on links" ON links;

CREATE POLICY "Users can update their own links" ON links
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can update all links" ON links
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own links" ON links
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Admins can delete all links" ON links
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

-- Update policies for categories to support user_id
DROP POLICY IF EXISTS "Public can view categories" ON categories;

CREATE POLICY "Public can view global categories" ON categories
  FOR SELECT USING (user_id IS NULL);

CREATE POLICY "Users can view their own categories" ON categories
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all categories" ON categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can do everything on categories" ON categories;

CREATE POLICY "Users can insert their own categories" ON categories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can insert any categories" ON categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own categories" ON categories
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can update all categories" ON categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own categories" ON categories
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Admins can delete all categories" ON categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION generate_unique_slug(base_name TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9\s-]', '', 'g'));
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := regexp_replace(slug, '-+', '-', 'g');
  slug := trim(both '-' from slug);
  
  -- Check if slug exists, if so add number
  WHILE EXISTS (SELECT 1 FROM users WHERE custom_slug = slug) LOOP
    counter := counter + 1;
    slug := base_name || '-' || counter;
    slug := lower(regexp_replace(slug, '[^a-zA-Z0-9\s-]', '', 'g'));
    slug := regexp_replace(slug, '\s+', '-', 'g');
  END LOOP;
  
  RETURN slug;
END;
$$ LANGUAGE plpgsql;